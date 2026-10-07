"""Rollback only the selected application image; never restore data or uploads."""
def restore(component, previous_image, apply, wait, record):
 record['status'] = 'rollback-started'
 apply(component, previous_image)
 wait(component, previous_image)
 record['status'] = 'rolled-back'

if __name__ == '__main__':
 import fcntl
 import json
 import os
 from pathlib import Path
 import re
 import sys
 import time
 import archive
 import deploy
 import healthcheck
 from policy import COMPONENTS, LOCK, STATE
 os.umask(0o077)
 if len(sys.argv) != 3 or sys.argv[1] != '--confirm':raise SystemExit('Explicit --confirm <protected release log> required')
 receipt = Path(sys.argv[2]).resolve()
 if receipt.parent != STATE.resolve() or not receipt.name.startswith('release-'):raise SystemExit('Only a protected release receipt is accepted')
 record = json.loads(receipt.read_text());component = record['component'];previous = record['previousImage']
 if component not in COMPONENTS or not re.fullmatch(r'sha256:[a-f0-9]{64}', previous):raise SystemExit('Invalid rollback target')
 with LOCK.open('a') as lock:
  fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
  before = deploy.inventory();old = deploy.inspect(component)
  if old['Image'] not in (record.get('image'), previous):raise SystemExit('Receipt is not the active release; refuse out-of-order rollback')
  archive.restore_if_missing(previous)
  result = {'component':component,'receipt':str(receipt),'previousImage':previous,'status':'rollback-started'}
  try:
   restore(component, previous, deploy.apply, lambda c,i:healthcheck.wait(c,i,deploy.inspect), result)
   deploy.compatible(old,deploy.inspect(component));deploy.protected(before,deploy.inventory(),component)
  except BaseException:
   result['status']='rollback-failed';raise
  finally:deploy.atomic_json(STATE / ('rollback-' + str(time.time_ns()) + '.json'), result)
 print(json.dumps(result))
