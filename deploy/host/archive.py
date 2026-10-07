"""Durable application-image checkpoint, independent of host cron image pruning."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
from policy import STATE

def file_hash(path):
 digest = hashlib.sha256()
 with path.open('rb') as f:
  while chunk := f.read(1024*1024):digest.update(chunk)
 return digest.hexdigest()

def ensure(image):
 directory = STATE / 'image-backups';directory.mkdir(exist_ok=True, mode=0o700)
 stem = image.removeprefix('sha256:')
 if len(stem) != 64 or any(c not in '0123456789abcdef' for c in stem): raise ValueError('Invalid image ID')
 target = directory / (stem + '.tar.gz');metadata = directory / (stem + '.json')
 if target.exists() and metadata.exists(): return str(target)
 info = json.loads(subprocess.check_output(['docker', 'image', 'inspect', image], text=True))[0]
 if shutil.disk_usage(directory).free < info['Size'] * 2 + 4 * 1024**3: raise RuntimeError('Insufficient free disk for rollback checkpoint; no pruning')
 with tempfile.TemporaryDirectory(dir=directory) as tmp:
  tar = Path(tmp) / 'image.tar';compressed = Path(tmp) / 'image.tar.gz'
  subprocess.run(['docker', 'image', 'save', '--output', str(tar), image], check=True, timeout=180, stderr=subprocess.DEVNULL)
  with compressed.open('wb') as dest:subprocess.run(['gzip', '-1', '--stdout', str(tar)], stdout=dest, stderr=subprocess.DEVNULL, check=True, timeout=180)
  digest = file_hash(compressed)
  compressed.chmod(0o600);compressed.replace(target)
  metadata.write_text(json.dumps({'image': image, 'sha256': digest}));metadata.chmod(0o600)
 return str(target)

def restore_if_missing(image):
 if subprocess.run(['docker', 'image', 'inspect', image], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:return
 directory = STATE / 'image-backups';stem = image.removeprefix('sha256:');target = directory / (stem + '.tar.gz');metadata = json.loads((directory / (stem + '.json')).read_text())
 digest = file_hash(target)
 if metadata != {'image': image, 'sha256': digest}:raise RuntimeError('Rollback archive integrity mismatch')
 subprocess.run(['docker', 'image', 'load', '--input', str(target)], check=True, timeout=180, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
 subprocess.run(['docker', 'image', 'inspect', image], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
