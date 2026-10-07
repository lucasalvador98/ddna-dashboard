#!/usr/bin/env python3
"""Fail closed: current main tip plus successful latest CI/publication runs."""
import json
import os
import re
import urllib.request

def api(path):
 request = urllib.request.Request('https://api.github.com/repos/' + os.environ['GITHUB_REPOSITORY'] + path, headers={'Authorization': 'Bearer ' + os.environ['GH_TOKEN'], 'Accept': 'application/vnd.github+json'})
 with urllib.request.urlopen(request, timeout=20) as response: return json.load(response)

def main():
 revision = os.environ['SELECTED_REVISION']
 if os.environ['GITHUB_REF'] != 'refs/heads/main' or not re.fullmatch(r'[a-f0-9]{40}', revision): raise ValueError('Dispatch on main using a full SHA only')
 if api('/commits/main')['sha'] != revision: raise ValueError('Selected revision must be current main tip')
 for workflow, event in [('ci.yml', 'push'), ('publish.yml', 'workflow_run')]:
  runs = api('/actions/workflows/' + workflow + '/runs?head_sha=' + revision + '&per_page=20')['workflow_runs']
  runs = [r for r in runs if r['head_sha'] == revision and r['head_branch'] == 'main' and r['event'] == event]
  if not runs or max(runs, key=lambda r: r['run_number'])['conclusion'] != 'success': raise ValueError('Latest CI or image publication not successful')
 print('Revision/main/checks verified: ' + revision)

if __name__ == '__main__': main()
