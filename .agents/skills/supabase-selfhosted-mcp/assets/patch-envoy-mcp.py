"""Patch supabase/docker Envoy lds.template.yaml to allow local /mcp access.

Aborts WITHOUT writing if expected blocks are not found exactly once.
Verified against the template deployed on srv1932068 (2026-09-07).

Run on the VPS:
    python3 patch-envoy-mcp.py
Backup first:
    cp volumes/api/envoy/lds.template.yaml /home/deploy/lds.backup.yaml
Restart after:
    cd /home/deploy/supabase/docker && sh run.sh restart api-gw
"""
import sys

FILE = "/home/deploy/supabase/docker/volumes/api/envoy/lds.template.yaml"
GATEWAY_IP = "172.16.1.1"  # docker inspect supabase-envoy --format '{{range .NetworkSettings.Networks}}{{println .Gateway}}{{end}}'

ALLOW_OLD = """                            #rbac:
                            #  rules:
                            #    action: ALLOW
                            #    policies:
                            #      allow_local:
                            #        permissions:
                            #          - any: true
                            #        principals:
                            #          - direct_remote_ip:
                            #              address_prefix: 127.0.0.1
                            #              prefix_len: 32
                            #          - direct_remote_ip:
                            #              address_prefix: ::1
                            #              prefix_len: 128
"""

ALLOW_NEW = f"""                            rbac:
                              rules:
                                action: ALLOW
                                policies:
                                  allow_local:
                                    permissions:
                                      - any: true
                                    principals:
                                      - direct_remote_ip:
                                          address_prefix: 127.0.0.1
                                          prefix_len: 32
                                      - direct_remote_ip:
                                          address_prefix: ::1
                                          prefix_len: 128
                                      - direct_remote_ip:
                                          address_prefix: {GATEWAY_IP}
                                          prefix_len: 32
"""

# Anchored to the /mcp-specific comment: the bare DENY block appears 4x
# in the file (one per route); only this one must be flipped.
DENY_CTX = """                            # Block access to /mcp by default
                            rbac:
                              rules:
                                action: DENY
                                policies:
                                  deny_all:
                                    permissions:
                                      - any: true
                                    principals:
                                      - any: true
"""

DENY_NEW = """                            # Block access to /mcp by default
                            #rbac:
                            #  rules:
                            #    action: DENY
                            #    policies:
                            #      deny_all:
                            #        permissions:
                            #          - any: true
                            #        principals:
                            #          - any: true
"""


def main() -> None:
    with open(FILE) as f:
        s = f.read()

    ca, cd = s.count(ALLOW_OLD), s.count(DENY_CTX)
    if ca != 1 or cd != 1:
        sys.exit(
            "ABORT: ALLOW matches=%d DENY_CTX matches=%d — dump the /mcp route "
            "block and re-craft the exact strings; nothing was written." % (ca, cd)
        )

    s = s.replace(ALLOW_OLD, ALLOW_NEW, 1)
    s = s.replace(DENY_CTX, DENY_NEW, 1)

    with open(FILE, "w") as f:
        f.write(s)
    print("PATCH OK — restart with: cd /home/deploy/supabase/docker && sh run.sh restart api-gw")


if __name__ == "__main__":
    main()
