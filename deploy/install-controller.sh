#!/usr/bin/env bash
# Reviewable future installation; never invokes Docker, Compose, deploy or rollback.
set -euo pipefail
if [[ ${1:-} != --apply ]]; then
  echo 'DRY RUN: install reviewed receiver in /usr/local/lib/ddna-cicd; reuse existing restricted keys; prepare state. No containers changed.'
  exit 0
fi
[[ $(id -u) == 0 ]] || { echo 'Administrator/root required for --apply' >&2; exit 1; }
source_dir=$(cd -- "$(dirname -- "$0")/host" && pwd)
python3 -m unittest discover -s "$source_dir" -p 'test_*.py'
install -d -o root -g root -m 0755 /usr/local/lib/ddna-cicd
for file in deploy.py policy.py healthcheck.py rollback.py archive.py; do
  install -o root -g root -m 0644 "$source_dir/$file" "/usr/local/lib/ddna-cicd/$file"
done
install -d -o deploy -g deploy -m 0700 /home/deploy/ddna-infra/cicd/v2-state
python3 - <<'PY'
from pathlib import Path
import os, shutil, time
path = Path('/home/deploy/.ssh/authorized_keys')
old = '/usr/bin/python3 /home/deploy/ddna-infra/cicd/deploy.py'
new = '/usr/bin/python3 /usr/local/lib/ddna-cicd/deploy.py'
text = path.read_text()
for component in ('wordpress', 'dashboard'):
    assert f'command="{old} {component}"' in text or f'command="{new} {component}"' in text, 'Existing restricted key missing; do not create credentials automatically'
backup = Path('/root/authorized_keys.before-ddna-cicd-' + str(time.time_ns()))
shutil.copyfile(path, backup); backup.chmod(0o600)
# Replace only the two forced command paths; preserve all public keys and other access.
for component in ('wordpress', 'dashboard'):
    text = text.replace(f'command="{old} {component}"', f'command="{new} {component}"')
tmp = path.with_name('authorized_keys.ddna-cicd-tmp')
tmp.write_text(text); tmp.chmod(0o600); os.chown(tmp, path.stat().st_uid, path.stat().st_gid); os.replace(tmp, path)
PY
echo 'Receiver installed; no deploy was executed. Existing controller retained at its historical path.'
