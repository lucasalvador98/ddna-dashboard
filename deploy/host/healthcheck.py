"""Read-only component-specific readiness. Data freshness is not deployment health."""
import json
import time
import urllib.request
class Redirect(urllib.request.HTTPRedirectHandler):
 def http_error_308(self, req, fp, code, msg, headers):
  return self.http_error_302(req, fp, 307, msg, headers)


def fetch(path, timeout=8):
 request = urllib.request.Request('http://127.0.0.1' + path, headers={'Host': '179.199.132.207'})
 with urllib.request.build_opener(Redirect()).open(request, timeout=timeout) as response:
  if response.status != 200: raise RuntimeError('HTTP readiness failed')
  return response.read()

def wait(component, image, inspect, timeout=150):
 deadline = time.monotonic() + timeout
 def checked(path):
  remaining = deadline - time.monotonic()
  if remaining <= 0:raise RuntimeError('Readiness deadline')
  return fetch(path, timeout=min(8, remaining))
 while time.monotonic() < deadline:
  try:
   current = inspect(component)
   if current['Image'] != image or current['State'].get('Health', {}).get('Status') != 'healthy':
    raise RuntimeError('Container health pending')
   if component == 'wordpress':
    if b'ddna-theme' not in checked('/'): raise RuntimeError('WordPress theme missing')
    checked('/wp-login.php')
   else:
    checked('/observatorio/')
    checked('/observatorio/login')
    health = json.loads(checked('/observatorio/api/health'))
    if health.get('checks', {}).get('supabase') != 'connected': raise RuntimeError('Supabase unavailable')
    # starting/degraded are accepted only with a demonstrated backend connection.
    if health.get('status') not in ('healthy', 'degraded', 'starting', 'ok'): raise RuntimeError('Unknown health response')
   return
  except (OSError, ValueError, RuntimeError):
   time.sleep(min(2, max(0, deadline - time.monotonic())))
 raise RuntimeError('Readiness timeout')
