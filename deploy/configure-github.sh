#!/usr/bin/env bash
# Administrative GitHub proposal; defaults to no changes.
set -euo pipefail
repo=lucasalvador98/ddna-dashboard
component=dashboard
if [[ ${1:-} != --apply ]]; then
  echo "DRY RUN: Actions policy, production environment (main only), main protection, existing SSH key secret for $repo. No changes."
  exit 0
fi
gh api --method PUT "repos/$repo/actions/permissions" -F enabled=true -f allowed_actions=selected >/dev/null
gh api --method PUT "repos/$repo/actions/permissions/selected-actions" --input deploy/actions-policy.json >/dev/null
gh api --method PUT "repos/$repo/actions/permissions/workflow" -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false >/dev/null
gh api --method PUT "repos/$repo/environments/production" --input deploy/environment-policy.json >/dev/null
existing=$(gh api "repos/$repo/environments/production/deployment-branch-policies" --jq '[.branch_policies[] | select(.name=="main" and .type=="branch")] | length')
if [[ $existing == 0 ]]; then
  gh api --method POST "repos/$repo/environments/production/deployment-branch-policies" -f name=main -f type=branch >/dev/null
fi
gh api --method PUT "repos/$repo/branches/main/protection" --input deploy/main-protection.json >/dev/null
# Preserve existing secret names/keys; this is a reviewed future load, not rotation.
ssh -T -o BatchMode=yes ddna-hostinger "cat /home/deploy/ddna-infra/secrets/github-preview-$component" | gh secret set VPS_SSH_PRIVATE_KEY --repo "$repo" --env production
gh api --method PUT "repos/$repo/environments/image-build" --input deploy/environment-policy.json >/dev/null
existing=$(gh api "repos/$repo/environments/image-build/deployment-branch-policies" --jq '[.branch_policies[] | select(.name=="main" and .type=="branch")] | length')
if [[ $existing == 0 ]]; then
  gh api --method POST "repos/$repo/environments/image-build/deployment-branch-policies" -f name=main -f type=branch >/dev/null
fi
gh variable set NEXT_PUBLIC_SUPABASE_URL --body 'http://179.199.132.207:8000' --repo "$repo" --env image-build
ssh -T -o BatchMode=yes ddna-hostinger 'cat /home/deploy/ddna-infra/secrets/github-preview-dashboard-anon-key' | gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo "$repo" --env image-build
