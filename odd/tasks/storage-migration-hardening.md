# Feature: storage-migration-hardening

> **STATUS: PAUSED** (2026-09-23, explicit user decision). T1-T2 done and verified;
> T3 (plan presentation) delivered; the real transfer is gated on a future explicit
> decision by the user. Resuming requires the user's go-ahead for the real transfer
> and the 3-NULL-rows decision.

## Objective

Make `scripts/migrate-storage.mjs` safe to run unattended: it must not silently
skip, silently truncate, or silently succeed on a corrupt transfer, and it must
report exactly what it will do before doing it.

## Problem

The Storage migration from Supabase Cloud to the self-hosted bucket has **never
run**. Verified against both databases:

- Self-hosted bucket `ddna-repositorio`: `SELECT count(*) FROM storage.objects
  WHERE bucket_id='ddna-repositorio'` -> **0**. Not one file was copied.
- Self-hosted `repositorio` table: 16 rows; **13 still have `url_storage`
  pointing at Cloud**; 3 have `url_storage` NULL.
- `scripts/migrate-storage.mjs` is untracked, so it never reached the VPS.

The script is written but has defects that make an unattended run unsafe:

1. **No integrity verification.** It downloads and uploads without comparing size
   or hash, so a truncated or corrupt upload is logged as `✅`. The earlier
   formularios data migration WAS byte-verified against md5 anchors; this script
   loses that rigor.
2. **`list('', { limit: 100 })`** — root prefix only, no pagination. Silently
   misses subfolders and silently truncates past 100 files.
3. **Hardcoded fallbacks.** `CLOUD_SUPABASE_URL || 'https://ppyyqrvirjqmfpqaqnxy.supabase.co'`
   and `NEXT_PUBLIC_SUPABASE_URL || 'http://179.199.132.207:8000'`. A missing env
   var silently targets a default instead of failing loudly.
4. **`.not('url_storage','is',null)`** skips the 3 NULL rows, which then stay
   without a URL forever, silently.
5. **No rollback and no run record.** A mid-run failure leaves a partially
   migrated bucket plus a partially rewritten DB, with no record of where it
   stopped and no non-zero exit signal.

## Decision

Harden the script in place. Do not rewrite the approach: the existing shape
(list -> skip-if-exists -> download -> upload -> rewrite `url_storage`) is
correct and idempotent. The fix is verification, completeness, and loud failure.

## Scope

In scope:

- `scripts/migrate-storage.mjs` only.

Out of scope:

- Any Supabase schema or migration change.
- Rotating the leaked Cloud JWT (separate workstream, user-owned dashboard action).
- The real (non-dry-run) transfer — that is a separate, explicitly gated step.
- The other 5 modified scripts and `docker-compose.etl.yml` (user's uncommitted
  work, a different workstream).
- The 4 hardcoded Cloud Storage URLs in `src/` — they use a public bucket and do
  not require a key, so they are not part of this fix.

## Constraints

- Must stay idempotent: re-running must not re-upload or duplicate.
- Must **never delete** anything from the Cloud bucket.
- `--dry-run` must print an exact, reviewable plan and perform **zero** writes
  (no upload, no DB update).
- Must fail loudly and exit non-zero on missing or ambiguous configuration.
- Must exit non-zero if any file fails.

## Required behaviour (acceptance criteria)

1. **Config guard.** Both URLs and both service keys are required. No fallbacks.
   Abort if `CLOUD_SUPABASE_URL` and the self-hosted URL resolve to the same
   origin (guards against migrating a project onto itself).
2. **Complete listing.** Enumerate every object in the bucket recursively, with
   pagination, so nested prefixes are not missed and nothing is truncated.
3. **Integrity verification.** For each file, verify the transferred bytes
   actually match the source before reporting success. Size mismatch is a
   failure. Report the verification method used.
4. **NULL `url_storage` rows.** The 3 rows with NULL must be handled explicitly:
   if a matching object exists in the bucket, link it; if not, report the row as
   needing a human decision. Never invent a URL.
5. **Run record.** Emit a per-file outcome (migrated / skipped / failed) plus the
   DB rows updated, in a form a re-run can be reasoned about from.
6. **Dry-run fidelity.** `--dry-run` prints the same plan (files to move, rows to
   update, NULL rows) and writes nothing.

## Tasks

- [x] **T1** — Harden `scripts/migrate-storage.mjs` per the acceptance criteria
      above. Edit surface: `scripts/migrate-storage.mjs` only. Done 2026-09-23 via
      gentle-ai-worker: config guard with no fallbacks + same-origin abort; recursive
      paginated listing (`listAllObjects`); post-upload integrity verification
      (size + SHA-256 via re-download, lines 204-232); NULL-row handling with basename
      map (lines 262-300); per-file run record with non-zero exit on failure. Verified:
      `node --check` passes; config-guard failure proof exits 1 naming the 4 missing vars.
- [x] **T2** — Run `node scripts/migrate-storage.mjs --dry-run` and capture the
      exact plan it prints. Verify: zero writes occurred (bucket count still 0,
      no `url_storage` changed). Done 2026-09-23; independently verified by
      gentle-ai-verify: before/after counts identical (0 objects / 13 cloud / 3 NULL /
      16 total), exit 0. Writes are statically guarded (upload line 194 behind
      DRY_RUN at 168; updates at 282/306 behind guards at 277/301).
- [x] **T3** — Present the dry-run plan to the user and stop. The real transfer
      is a separate gated decision, not part of this feature. Done 2026-09-23
      (plan delivered: 13 files / 13 url_storage rewrites / 3 NULL rows need
      human decision). **Feature PAUSED by user decision before the real transfer.**
- [ ] **T4** — Commit the hardened script as a work unit (pending explicit
      go-ahead; a second session has been operating git on this worktree).

## Evidence

Recorded per task as it completes.

## Risks

- A second session was observed operating git on this same worktree
  (reflog 2026-09-23 12:22). Do not commit while that session is active.
- The Cloud project must stay alive: the VPS app's repository download links
  still depend on the Cloud bucket, because 0 files exist in the self-hosted
  bucket. Nothing in this feature may delete or disable the Cloud side.
