---
name: supabase-selfhosted-mcp
description: "Trigger: self-hosted Supabase MCP, SSH tunnel MCP, Envoy /mcp patch, supabase.ddna.com.ar MCP, enable local MCP access, MCP not responding. Set up and troubleshoot VPS self-hosted Supabase MCP access."
license: Apache-2.0
metadata:
  author: gentle-ai
  version: "1.0"
---

# Supabase Self-hosted MCP Access

## Activation Contract

Load when enabling, verifying, or troubleshooting MCP access to the self-hosted Supabase on VPS 179.199.132.207 (srv1932068, user `deploy`), or when the `supabase-selfhosted` MCP in opencode fails.

## MCP Ecosystem (VPS 179.199.132.207)

| MCP Server | Purpose | Can do | Cannot do |
|---|---|---|---|
| **supabase-selfhosted** | Database queries, migrations, RLS, SQL | Query tables, run SQL, manage schema, deploy edge functions | Docker management, VPS infrastructure, deploys |
| **hostinger** (Hostinger API) | VPS infrastructure management | Restart/build Docker projects, manage firewall, VPS lifecycle, snapshots | Git pull, execute arbitrary commands, manage cron directly |

**They complement each other.** Use supabase-selfhosted for DB work, hostinger for infrastructure.

## Hard Rules

- NEVER expose `/mcp` via Traefik or to the Internet: the self-hosted MCP has no OAuth. SSH-tunnel-only access.
- Back up before patching: `cp volumes/api/envoy/lds.template.yaml /home/deploy/lds.backup.yaml`.
- Patch only via the assert-guarded script in `assets/patch-envoy-mcp.py`. Never hand-edit, never force-write.
- opencode config is not hot-reloaded: restart opencode after `opencode.json` changes.

## Decision Gates

| Symptom | Action |
|---|---|
| First-time enable | Run Execution Steps 1-6 |
| MCP not responding in opencode | Check SSH tunnel window is open, then restart opencode |
| Patch assert fails | Dump the `/mcp` route block (`awk 'NR>=560 && NR<=640 {printf "%d:%s\n", NR, $0}'`) and re-craft exact strings |
| Config broken after patch | Restore `/home/deploy/lds.backup.yaml`, restart `api-gw` |

## Execution Steps

1. VPS gateway is Envoy (container `supabase-envoy`), NOT Kong. Get bridge IP: `docker inspect supabase-envoy --format '{{range .NetworkSettings.Networks}}{{println .Gateway}}{{end}}'` (currently `172.16.1.1`).
2. Back up, then run `assets/patch-envoy-mcp.py` on the VPS. It flips the `/mcp` route only: comments the DENY rbac (unique via comment `# Block access to /mcp by default`; the bare DENY block appears 4x, one per route), uncomments the ALLOW block (this template has NO `172.18.0.1` placeholder; it ends at `::1`), and adds the bridge IP.
3. Restart: `cd /home/deploy/supabase/docker && sh run.sh restart api-gw`; confirm `docker ps` shows `supabase-envoy` Up.
4. Tunnel from local machine: `ssh -L 8080:localhost:8000 deploy@179.199.132.207`. Keep the window open; port 8080 must be free locally.
5. Test: POST `http://localhost:8080/mcp` with initialize body, headers `Accept: application/json, text/event-stream` and `MCP-Protocol-Version: 2025-06-18`. Expect 200 and `serverInfo.name == "supabase"`.
6. In `~/.config/opencode/opencode.json`: `mcp.supabase-selfhosted = {"type":"remote","url":"http://localhost:8080/mcp","enabled":true}`. Keep the managed-Pro entry; both coexist. Restart opencode.

The tunnel must stay open while using this MCP. Closing it only disables this MCP — app, website, and Pro MCP are unaffected.

## Output Contract

Report: steps done, patch assert results, curl HTTP status, tunnel state. If any assert or test fails, stop and report the dumped block/output — do not improvise writes.

## References

- `assets/patch-envoy-mcp.py` — assert-guarded Envoy `/mcp` patch (exact working version).
