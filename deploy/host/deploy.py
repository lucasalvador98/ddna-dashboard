#!/usr/bin/env python3
"""Restricted GHCR receiver. Review/install separately; never self-installs."""
import fcntl
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.request
import healthcheck
import archive
import rollback
from policy import COMPONENTS, COMPOSE, LOCK, ROOT, STATE

def run(args, timeout=60, **kwargs):
 return subprocess.check_output(args, timeout=timeout, stderr=subprocess.DEVNULL, text=True, **kwargs)

def parse(component, command):
 if component not in COMPONENTS: raise ValueError('Unknown component')
 parts = shlex.split(command)
 if len(parts) != 3 or parts[0] != 'release-v2' or not re.fullmatch(r'[a-f0-9]{40}', parts[1]) or not re.fullmatch(r'sha256:[a-f0-9]{64}', parts[2]):
  raise ValueError('Expected release-v2 <main-sha> <digest>')
 return parts[1], parts[2]

def api(repo, path, token):
 request = urllib.request.Request('https://api.github.com/repos/' + repo + path, headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'})
 with urllib.request.urlopen(request, timeout=20) as response: return json.load(response)

def verify_main(component, revision, token):
 repo = COMPONENTS[component]['repo']
 if api(repo, '/commits/main', token)['sha'] != revision: raise ValueError('Revision is no longer main tip')
 for workflow in ('ci.yml', 'publish.yml'):
  runs = api(repo, '/actions/workflows/' + workflow + '/runs?head_sha=' + revision + '&per_page=20', token)['workflow_runs']
  runs = [r for r in runs if r['head_sha'] == revision and r['head_branch'] == 'main' and r['event'] == ('push' if workflow == 'ci.yml' else 'workflow_run')]
  if not runs or max(runs, key=lambda r: r['run_number'])['conclusion'] != 'success': raise ValueError('Latest main CI/publication is not successful')

def inventory():
 ids = run(['docker', 'ps', '-q']).split()
 return {x['Name'].lstrip('/'): x for x in json.loads(run(['docker', 'inspect', *ids]))}

def inspect(component):
 return json.loads(run(['docker', 'inspect', COMPONENTS[component]['container']]))[0]

def protected(before, after, component):
 selected = COMPONENTS[component]['container']
 if set(before) != set(after): raise RuntimeError('Container inventory changed')
 for name, old in before.items():
  if name == selected: continue
  new = after[name]
  if any(old[k] != new[k] for k in ('Id', 'Image')) or old['State']['StartedAt'] != new['State']['StartedAt']:
   raise RuntimeError('Protected service changed: ' + name)

def compatible(old, new):
 if old['Mounts'] != new['Mounts']: raise RuntimeError('Mounts changed')
 if set(old['NetworkSettings']['Networks']) != set(new['NetworkSettings']['Networks']): raise RuntimeError('Networks changed')
 if old['HostConfig']['PortBindings'] != new['HostConfig']['PortBindings']: raise RuntimeError('Ports changed')
 # Image defaults (Node version, PATH) may change; application configuration must not.
 env = lambda x: dict(v.split('=', 1) for v in x['Config']['Env'])
 a, b = env(old), env(new)
 prefixes = ('WORDPRESS_', 'NEXT_PUBLIC_', 'SUPABASE_', 'OPENAI_', 'INTERNAL_', 'WP_', 'DDNA_')
 for k, value in a.items():
  if k.startswith(prefixes) and b.get(k) != value: raise RuntimeError('Application environment changed: ' + k)

def desired_compatible(config, component, old):
 service = config['services'][component]
 if service.get('container_name') != COMPONENTS[component]['container']: raise ValueError('Unexpected container name')
 networks = {config['networks'][n].get('name', n) for n in service.get('networks', {})}
 if networks != set(old['NetworkSettings']['Networks']): raise ValueError('Compose/runtime network drift')
 desired_mounts = set()
 for volume in service.get('volumes', []):
  source = volume['source']
  if volume['type'] == 'volume': source = config['volumes'][source]['name']
  desired_mounts.add((volume['type'], source, volume['target'], not volume.get('read_only', False)))
 actual_mounts = {(m['Type'], m.get('Name') if m['Type'] == 'volume' else m['Source'], m['Destination'], m['RW']) for m in old['Mounts']}
 if desired_mounts != actual_mounts: raise ValueError('Compose/runtime mount drift')
 ports = {}
 for port in service.get('ports', []):
  key = str(port['target']) + '/' + port.get('protocol', 'tcp')
  ports.setdefault(key, []).append({'HostIp': port.get('host_ip', '0.0.0.0'), 'HostPort': str(port['published'])})
 if ports != (old['HostConfig']['PortBindings'] or {}): raise ValueError('Compose/runtime published port drift')

def atomic_json(path, data):
 with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as f:
  tmp = Path(f.name); f.write((json.dumps(data, indent=2) + '\n').encode()); f.flush(); os.fsync(f.fileno())
 tmp.chmod(0o600); os.replace(tmp, path)

def apply(component, image):
 # Both actual running images override stale historical Compose references.
 services = {name: {'image': inspect(name)['Image']} for name in COMPONENTS}
 services[component]['image'] = image
 release = STATE / ('compose-' + component + '.json')
 atomic_json(release, {'services': services})
 args = ['docker', 'compose']
 for f in [*COMPOSE, release]: args += ['-f', str(f)]
 run(args + ['config', '--quiet'])
 # Validate topology and app env before any restart; never emit expanded config.
 config = json.loads(run(args + ['config', '--format', 'json']))
 if config['name'] != 'ddna-controlled': raise ValueError('Unexpected Compose project')
 service = config['services'][component]
 old = inspect(component)
 desired_compatible(config, component, old)
 env = dict(v.split('=', 1) for v in old['Config']['Env'])
 if any(str(v) != env.get(k) for k, v in service.get('environment', {}).items()): raise ValueError('Compose/runtime environment drift')
 if component == 'dashboard' and service.get('environment', {}).get('NEXT_PUBLIC_BASE_PATH') != '/observatorio': raise ValueError('basePath drift')
 run(args + ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', component], timeout=180)

def release(component, revision, digest, token, actor):
 if not re.fullmatch(r'[A-Za-z0-9-]{1,39}', actor) or not token or len(token) > 4096: raise ValueError('Invalid credentials envelope')
 verify_main(component, revision, token)
 if shutil.disk_usage(ROOT).free < 4 * 1024**3: raise RuntimeError('Require 4 GiB free; no pruning')
 STATE.mkdir(exist_ok=True, mode=0o700)
 with LOCK.open('a') as lock:
  deadline = time.monotonic() + 60
  while True:
   try: fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB); break
   except BlockingIOError:
    if time.monotonic() >= deadline: raise RuntimeError('Deploy lock timeout')
    time.sleep(1)
  verify_main(component, revision, token)
  before = inventory()
  required = {'ddna-wordpress-app', 'ddna-wordpress-db', 'ddna-edge', 'ddna-observatorio-candidate', 'supabase-db'}
  if not required.issubset(before): raise ValueError('Required services missing')
  old = inspect(component); previous = old['Image']
  # Reject WordPress that would discard the currently published feature code.
  active_revision = old['Config'].get('Labels', {}).get('org.opencontainers.image.revision')
  if component == 'wordpress' and active_revision:
   comparison = api(COMPONENTS[component]['repo'], '/compare/' + active_revision + '...' + revision, token)
   if comparison.get('status') not in ('ahead', 'identical'):
    app_tree = lambda sha: next(t['sha'] for t in api(COMPONENTS[component]['repo'], '/git/trees/' + sha, token)['tree'] if t['path'] == 'app')
    if app_tree(active_revision) != app_tree(revision): raise ValueError('Active WordPress app tree is not integrated in main')
  record = {'component': component, 'revision': revision, 'digest': digest, 'previousImage': previous, 'previousRevision': active_revision, 'started': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'status': 'preflight'}
  log = STATE / ('release-' + component + '-' + str(time.time_ns()) + '.json')
  changed = False
  try:
   record['rollbackArchive'] = archive.ensure(previous)
   image_ref = COMPONENTS[component]['image'] + '@' + digest
   # Job-lifetime token only; no stored PAT, key, or registry credentials in release logs.
   with tempfile.TemporaryDirectory(prefix='registry-', dir=STATE) as directory:
    args = ['docker', '--config', directory]
    run(args + ['login', 'ghcr.io', '--username', actor, '--password-stdin'], input=token, timeout=30)
    run(args + ['pull', '--platform', 'linux/amd64', image_ref], timeout=300)
   image = json.loads(run(['docker', 'image', 'inspect', image_ref]))[0]
   labels = image['Config'].get('Labels') or {}
   if labels.get('org.opencontainers.image.revision') != revision or labels.get('org.opencontainers.image.source') != 'https://github.com/' + COMPONENTS[component]['repo'] or image['Architecture'] != 'amd64': raise ValueError('Image provenance mismatch')
   candidate = image['Id']; record['image'] = candidate
   verify_main(component, revision, token); protected(before, inventory(), component)
   if candidate == previous:
    healthcheck.wait(component, candidate, inspect);record['status'] = 'already-running'
   else:
    changed = True
    apply(component, candidate)
    compatible(old, inspect(component))
    healthcheck.wait(component, candidate, inspect)
    protected(before, inventory(), component)
    record['status'] = 'deployed'
  except BaseException as error:
   record['errorType'] = type(error).__name__
   if changed:
    try:
     archive.restore_if_missing(previous)
     rollback.restore(component, previous, apply, lambda c, i: healthcheck.wait(c, i, inspect), record)
     compatible(old, inspect(component));protected(before, inventory(), component)
    except BaseException as rollback_error:
     record['status'] = 'rollback-failed';record['rollbackErrorType'] = type(rollback_error).__name__
   else: record['status'] = 'refused-before-deploy'
   raise
  finally:
   record['finished'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime());atomic_json(log, record)
  print(json.dumps({k: record[k] for k in ('component', 'revision', 'digest', 'status')}))

def interrupted(signum, frame): raise RuntimeError('Deployment interrupted')

if __name__ == '__main__':
 os.umask(0o077);signal.signal(signal.SIGHUP, interrupted);signal.signal(signal.SIGTERM, interrupted)
 try:
  component = sys.argv[1] if len(sys.argv) == 2 else ''
  revision, digest = parse(component, os.environ.get('SSH_ORIGINAL_COMMAND', ''))
  raw = sys.stdin.buffer.read(8193)
  if len(raw) > 8192: raise ValueError('Envelope too large')
  request = json.loads(raw)
  if set(request) != {'token', 'actor'}: raise ValueError('Unexpected envelope fields')
  release(component, revision, digest, request['token'], request['actor'])
 except BaseException as error:
  print('Release refused or failed: ' + type(error).__name__ + '; consult protected VPS release log.', file=sys.stderr);sys.exit(1)
