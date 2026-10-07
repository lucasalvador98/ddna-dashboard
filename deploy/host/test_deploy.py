"""No SSH, production containers, registry or database access: fake Docker boundary."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import deploy
import healthcheck

SHA='a'*40
DIGEST='sha256:'+'b'*64
TOKEN='ephemeral-not-a-real-token'

def container(name, image='previous'):
 return {'Name':'/'+name,'Id':name+'-id','Image':image,'State':{'StartedAt':'before','Health':{'Status':'healthy'}},'Config':{'Env':['NEXT_PUBLIC_BASE_PATH=/observatorio'],'Labels':{'org.opencontainers.image.revision':'c'*40}},'Mounts':[{'Name':'uploads','RW':True}],'NetworkSettings':{'Networks':{'ddna_frontend':{}}},'HostConfig':{'PortBindings':{}}}

class ReleaseTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);root=Path(self.tmp.name)
  self.data={n:container(n) for n in ['ddna-wordpress-app','ddna-wordpress-db','ddna-edge','ddna-observatorio-candidate','supabase-db','supabase-auth']}
  self.actions=[];self.component='dashboard';self.fail_health=False;self.fail_rollback=False
  patches=[patch.object(deploy.archive,'ensure',return_value='protected-image-backup.tar.gz'),patch.object(deploy.archive,'restore_if_missing'),patch.object(deploy,'ROOT',root),patch.object(deploy,'STATE',root/'state'),patch.object(deploy,'LOCK',root/'lock'),patch.object(deploy,'verify_main'),patch.object(deploy,'api',return_value={'status':'ahead'}),patch.object(deploy,'inventory',side_effect=lambda:copy.deepcopy(self.data)),patch.object(deploy,'inspect',side_effect=lambda c:copy.deepcopy(self.data[deploy.COMPONENTS[c]['container']])),patch.object(deploy,'run',side_effect=self.fake_run),patch.object(deploy,'apply',side_effect=self.apply),patch.object(deploy.healthcheck,'wait',side_effect=self.health)]
  self.mocks=[p.start() for p in patches]
  for p in patches:self.addCleanup(p.stop)
 def fake_run(self,args,**kwargs):
  if args[:3]==['docker','image','inspect']:
   return json.dumps([{'Id':'candidate','Architecture':'amd64','Config':{'Labels':{'org.opencontainers.image.revision':SHA,'org.opencontainers.image.source':'https://github.com/'+deploy.COMPONENTS[self.component]['repo']}}}])
  return ''
 def apply(self,c,i):
  self.actions.append((c,i))
  if self.fail_rollback and i=='previous':raise RuntimeError('rollback failed')
  self.data[deploy.COMPONENTS[c]['container']]['Image']=i
  self.data[deploy.COMPONENTS[c]['container']]['Id']=i+'-id'
 def health(self,c,i,*args):
  if self.fail_health and i=='candidate':raise RuntimeError('not ready')
 def record(self):return json.loads(next((Path(self.tmp.name)/'state').glob('release-*.json')).read_text())
 def release(self):deploy.release(self.component,SHA,DIGEST,TOKEN,'test-actor')
 def test_only_dashboard_changes(self):
  old=copy.deepcopy(self.data);self.release();self.assertEqual(self.actions,[('dashboard','candidate')]);deploy.protected(old,self.data,'dashboard')
 def test_only_wordpress_changes(self):
  self.component='wordpress';old=copy.deepcopy(self.data);self.release();self.assertEqual(self.actions,[('wordpress','candidate')]);deploy.protected(old,self.data,'wordpress')
 def test_failed_health_restores_same_component_image(self):
  self.fail_health=True
  with self.assertRaises(RuntimeError):self.release()
  self.assertEqual(self.actions,[('dashboard','candidate'),('dashboard','previous')]);self.assertEqual(self.record()['status'],'rolled-back')
 def test_failed_rollback_is_recorded(self):
  self.fail_health=True;self.fail_rollback=True
  with self.assertRaises(RuntimeError):self.release()
  self.assertEqual(self.record()['status'],'rollback-failed')
 def test_stale_main_refused_before_docker(self):
  with patch.object(deploy,'verify_main',side_effect=ValueError('stale')):
   with self.assertRaises(ValueError):self.release()
  self.assertEqual(self.actions,[])
 def test_invalid_provenance_refused_before_recreation(self):
  with patch.object(deploy,'run',return_value=json.dumps([{'Id':'bad','Architecture':'arm64','Config':{'Labels':{}}}])):
   with self.assertRaises(ValueError):self.release()
  self.assertEqual(self.actions,[]);self.assertEqual(self.record()['status'],'refused-before-deploy')
 def test_interrupt_rolls_back(self):
  with patch.object(deploy.healthcheck,'wait',side_effect=[KeyboardInterrupt(),None]):
   with self.assertRaises(KeyboardInterrupt):self.release()
  self.assertEqual(self.record()['status'],'rolled-back')
 def test_registry_credentials_removed_and_not_logged(self):
  self.release();paths=list((Path(self.tmp.name)/'state').iterdir());self.assertFalse(any(p.name.startswith('registry-') for p in paths));self.assertNotIn(TOKEN,json.dumps(self.record()))
 def test_protected_supabase_or_mariadb_drift_is_detected(self):
  for name in ['ddna-wordpress-db','supabase-auth','ddna-edge']:
   changed=copy.deepcopy(self.data);changed[name]['State']['StartedAt']='changed'
   with self.assertRaises(RuntimeError):deploy.protected(self.data,changed,'dashboard')
 def test_mount_port_network_env_changes_are_refused(self):
  old=container('test')
  for mutate in [lambda x:x['Mounts'].clear(),lambda x:x['NetworkSettings']['Networks'].clear(),lambda x:x['HostConfig']['PortBindings'].update({'80/tcp':[]}),lambda x:x['Config']['Env'].append('NEXT_PUBLIC_BASE_PATH=/')]:
   new=copy.deepcopy(old);mutate(new)
   with self.assertRaises(RuntimeError):deploy.compatible(old,new)
 def test_order_of_env_is_not_a_change(self):
  old=container('test');old['Config']['Env'].append('NODE_ENV=production');new=copy.deepcopy(old);new['Config']['Env'].reverse();deploy.compatible(old,new)
 def test_parser_rejects_shell_injection_other_services_and_tags(self):
  self.assertEqual(deploy.parse('dashboard','release-v2 '+SHA+' '+DIGEST),(SHA,DIGEST))
  for component,command in [('db','release-v2 '+SHA+' '+DIGEST),('dashboard','release-v2 main latest'),('dashboard','release-v2 '+SHA+' '+DIGEST+'; rm -rf /'),('dashboard','rollback '+SHA+' '+DIGEST)]:
   with self.assertRaises(ValueError):deploy.parse(component,command)

class HealthTests(unittest.TestCase):
 def test_wordpress_does_not_depend_on_dashboard_health(self):
  with patch.object(healthcheck,'fetch',side_effect=[b'ddna-theme',b'login']) as fetch:
   healthcheck.wait('wordpress','previous',lambda c:container(c))
  self.assertEqual([c.args[0] for c in fetch.call_args_list],['/','/wp-login.php'])
 def test_stale_categories_with_connected_backend_are_accepted(self):
  with patch.object(healthcheck,'fetch',side_effect=[b'home',b'login',json.dumps({'status':'degraded','checks':{'supabase':'connected'}}).encode()]):healthcheck.wait('dashboard','previous',lambda c:container(c))
 def test_disconnected_backend_times_out(self):
  with patch.object(healthcheck.time,'monotonic',side_effect=[0,0,0,0,0,200,200]),patch.object(healthcheck.time,'sleep'),patch.object(healthcheck,'fetch',side_effect=[b'home',b'login',b'{"status":"degraded","checks":{"supabase":"disconnected"}}']):
   with self.assertRaises(RuntimeError):healthcheck.wait('dashboard','previous',lambda c:container(c),timeout=1)

if __name__=='__main__':unittest.main()
