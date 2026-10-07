#!/usr/bin/env python3
"""SSH restricted request; never pass registry credentials as command arguments."""
import json
import os
import re
import subprocess
from pathlib import Path

def main():
 revision = os.environ['SELECTED_REVISION']; image = os.environ['RELEASE_IMAGE']
 if not re.fullmatch(r'[a-f0-9]{40}', revision): raise ValueError('Invalid SHA')
 manifest = json.loads(subprocess.check_output(['docker', 'buildx', 'imagetools', 'inspect', image + ':' + revision, '--format', '{{json .Manifest}}'], text=True))
 digest = manifest.get('digest', manifest.get('Digest', ''))
 if not re.fullmatch(r'sha256:[a-f0-9]{64}', digest): raise ValueError('Invalid registry digest')
 key = Path(os.environ['RUNNER_TEMP']) / 'ddna-key'; known = Path(__file__).with_name('known_hosts')
 key.write_text(os.environ['VPS_SSH_PRIVATE_KEY'] + '\n');key.chmod(0o600)
 try:
  payload = json.dumps({'token': os.environ['GH_TOKEN'], 'actor': os.environ['GITHUB_ACTOR']})
  subprocess.run(['ssh', '-T', '-p', '22', '-i', str(key), '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'UserKnownHostsFile=' + str(known), '-o', 'ConnectTimeout=15', 'deploy@179.199.132.207', 'release-v2 ' + revision + ' ' + digest], input=payload, text=True, check=True, timeout=1800)
 finally: key.unlink(missing_ok=True)

if __name__ == '__main__': main()
