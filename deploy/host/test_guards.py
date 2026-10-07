import copy
import gzip
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import archive
import deploy

SHA='a'*40
class GuardTests(unittest.TestCase):
 def api(self,path,conclusion='success',event=None):
  if path=='/commits/main':return {'sha':SHA}
  e=event or ('push' if 'ci.yml' in path else 'workflow_run')
  return {'workflow_runs':[{'head_sha':SHA,'head_branch':'main','event':e,'run_number':2,'conclusion':conclusion}]}
 def test_current_main_and_successful_push_publication_required(self):
  with patch.object(deploy,'api',side_effect=lambda repo,path,token:self.api(path)):
   deploy.verify_main('dashboard',SHA,'dummy')
 def test_pr_ci_success_is_not_main_validation(self):
  with patch.object(deploy,'api',side_effect=lambda repo,path,token:self.api(path,event='pull_request')):
   with self.assertRaises(ValueError):deploy.verify_main('dashboard',SHA,'dummy')
 def test_red_cancelled_missing_checks_refuse(self):
  for conclusion in ['failure','cancelled',None]:
   with patch.object(deploy,'api',side_effect=lambda repo,path,token:self.api(path,conclusion)):
    with self.assertRaises(ValueError):deploy.verify_main('dashboard',SHA,'dummy')
 def test_stale_sha_refused(self):
  with patch.object(deploy,'api',return_value={'sha':'b'*40}):
   with self.assertRaises(ValueError):deploy.verify_main('dashboard',SHA,'dummy')
 def test_mount_network_and_port_drift_refused_before_compose_up(self):
  config={'services':{'dashboard':{'container_name':'ddna-observatorio-candidate','networks':{'frontend':{}},'volumes':[]}},'networks':{'frontend':{'name':'ddna_frontend'}},'volumes':{}}
  old={'Mounts':[],'NetworkSettings':{'Networks':{'ddna_frontend':{}}},'HostConfig':{'PortBindings':{}}}
  deploy.desired_compatible(config,'dashboard',old)
  for mutate in [lambda c:c['services']['dashboard'].update({'ports':[{'target':3000,'published':'80'}]}),lambda c:c['networks']['frontend'].update({'name':'other'}),lambda c:c['services']['dashboard'].update({'volumes':[{'type':'bind','source':'/other','target':'/app'}]})]:
   changed=copy.deepcopy(config);mutate(changed)
   with self.assertRaises(ValueError):deploy.desired_compatible(changed,'dashboard',old)
 def test_missing_rollback_image_checks_archive_before_loading(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(archive,'STATE',Path(tmp)),patch.object(archive.subprocess,'run') as run:
   folder=Path(tmp)/'image-backups';folder.mkdir();image='sha256:'+'c'*64;p=folder/('c'*64+'.tar.gz')
   with gzip.open(p,'wb') as f:f.write(b'image export fixture')
   (folder/('c'*64+'.json')).write_text(json.dumps({'image':image,'sha256':archive.file_hash(p)}))
   run.return_value.returncode=1;archive.restore_if_missing(image)
   self.assertEqual(run.call_args_list[1].args[0][:3],['docker','image','load'])
 def test_corrupted_archive_never_loaded(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(archive,'STATE',Path(tmp)),patch.object(archive.subprocess,'run') as run:
   folder=Path(tmp)/'image-backups';folder.mkdir();image='sha256:'+'c'*64;p=folder/('c'*64+'.tar.gz');p.write_bytes(b'corrupt')
   (folder/('c'*64+'.json')).write_text(json.dumps({'image':image,'sha256':'bad'}));run.return_value.returncode=1
   with self.assertRaises(RuntimeError):archive.restore_if_missing(image)
   self.assertEqual(run.call_count,1)
