"""Fixed topology; the receiver never accepts paths, services or URLs from SSH."""
from pathlib import Path
ROOT = Path('/home/deploy/ddna-infra')
STATE = ROOT / 'cicd/v2-state'
LOCK = ROOT / 'cicd/deploy.lock'
COMPOSE = [ROOT / p for p in ('compose.private.yml', 'compose.preview.yml', 'compose.preview-public.yml')]
ORIGIN = 'http://179.199.132.207'
COMPONENTS = {
 'wordpress': {'repo': 'LautyUCC/PrensaDDNA', 'image': 'ghcr.io/lautyucc/prensaddna', 'container': 'ddna-wordpress-app'},
 'dashboard': {'repo': 'lucasalvador98/ddna-dashboard', 'image': 'ghcr.io/lucasalvador98/ddna-dashboard', 'container': 'ddna-observatorio-candidate'},
}
