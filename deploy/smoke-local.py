#!/usr/bin/env python3
"""Disposable local/Actions image smoke; never uses a VPS or production credentials."""
import json
import os
import subprocess
import time
import urllib.error
import urllib.request

class Redirect(urllib.request.HTTPRedirectHandler):
 def http_error_308(self, req, fp, code, msg, headers):
  return self.http_error_302(req, fp, 307, msg, headers)

http=urllib.request.build_opener(Redirect()).open
image=os.environ.get('CI_IMAGE','ddna-ci:dashboard')
cid=subprocess.check_output(['docker','run','-d','--rm','--read-only','--tmpfs','/tmp','--tmpfs','/app/.next/cache:uid=1001,gid=1001','-p','127.0.0.1::3000',image],text=True).strip()
try:
 info=json.loads(subprocess.check_output(['docker','inspect',cid],text=True))[0]
 port=info['NetworkSettings']['Ports']['3000/tcp'][0]['HostPort'];origin='http://127.0.0.1:'+port
 end=time.monotonic()+45
 while True:
  try:
   with http(origin+'/observatorio/login',timeout=5) as r:
    assert r.status==200;html=r.read().decode();assert '/observatorio/_next/' in html;break
  except (OSError,AssertionError):
   if time.monotonic()>=end:raise RuntimeError('Local standalone /observatorio/login smoke failed')
   time.sleep(1)
 with http(origin+'/observatorio/',timeout=10) as r:assert r.status==200
 try:http(origin+'/',timeout=5)
 except urllib.error.HTTPError as e:assert e.code==404
 else:raise AssertionError('App unexpectedly serves root instead of /observatorio')
 print('Standalone image: /observatorio/login 200, /observatorio/ final200, prefixed assets, / 404. No production backend used.')
finally:
 subprocess.run(['docker','rm','--force',cid],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
