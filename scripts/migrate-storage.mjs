#!/usr/bin/env node
/**
 * migrate-storage.mjs
 *
 * Migrates files from Supabase Cloud bucket → Self-hosted bucket.
 * Updates url_storage in repositorio table to point to new self-hosted URLs.
 *
 * Usage: node scripts/migrate-storage.mjs [--dry-run]
 *
 * Requires env vars from .env.local:
 *   CLOUD_SUPABASE_URL                — cloud Supabase URL
 *   CLOUD_SUPABASE_SERVICE_ROLE_KEY   — cloud service role key
 *   NEXT_PUBLIC_SUPABASE_URL          — self-hosted URL
 *   SUPABASE_SERVICE_ROLE_KEY         — self-hosted service role key
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

// ── Config guard ────────────────────────────────────────────────────
const REQUIRED = [
  { key: 'CLOUD_SUPABASE_URL', val: process.env.CLOUD_SUPABASE_URL },
  { key: 'CLOUD_SUPABASE_SERVICE_ROLE_KEY', val: process.env.CLOUD_SUPABASE_SERVICE_ROLE_KEY },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', val: process.env.SUPABASE_SERVICE_ROLE_KEY },
];

const missing = REQUIRED.filter(r => !r.val).map(r => r.key);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

function normalizeOrigin(raw) {
  const u = new URL(raw);
  return `${u.protocol}//${u.host}`;
}

const CLOUD_URL = normalizeOrigin(process.env.CLOUD_SUPABASE_URL);
const CLOUD_KEY = process.env.CLOUD_SUPABASE_SERVICE_ROLE_KEY;
const SELF_HOSTED_URL = normalizeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SELF_HOSTED_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (CLOUD_URL === SELF_HOSTED_URL) {
  console.error(`❌ Cloud and self-hosted URLs resolve to the same origin: ${CLOUD_URL}`);
  process.exit(1);
}

const BUCKET = 'ddna-repositorio';
const DRY_RUN = process.argv.includes('--dry-run');

const cloud = createClient(CLOUD_URL, CLOUD_KEY);
const selfHosted = createClient(SELF_HOSTED_URL, SELF_HOSTED_KEY);

// ── Helpers ─────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function buildSelfHostedUrl(objectPath) {
  const encoded = objectPath.split('/').map(s => encodeURIComponent(s)).join('/');
  return `${SELF_HOSTED_URL}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

async function toBuffer(data) {
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (data && typeof data.arrayBuffer === 'function') {
    return Buffer.from(await data.arrayBuffer());
  }
  throw new Error('Unsupported data type for buffer conversion');
}

async function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Recursively list every object in a bucket, paginating with limit/offset.
 * Folder entries have id === null and/or metadata === null.
 */
async function listAllObjects(client, bucket, prefix = '') {
  const objects = [];

  async function recurse(currentPrefix) {
    let offset = 0;
    const limit = 100;
    while (true) {
      const { data, error } = await client.storage.from(bucket).list(currentPrefix, { limit, offset });
      if (error) throw error;
      if (!data || data.length === 0) break;

      for (const item of data) {
        const fullPath = currentPrefix ? `${currentPrefix}/${item.name}` : item.name;
        if (item.id === null || item.metadata === null) {
          await recurse(fullPath);
        } else {
          objects.push({ path: fullPath, metadata: item.metadata });
        }
      }

      if (data.length < limit) break;
      offset += limit;
    }
  }

  await recurse(prefix);
  return objects;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Storage Migration: Cloud → Self-hosted');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Cloud:       ${CLOUD_URL}`);
  console.log(`Self-hosted: ${SELF_HOSTED_URL}`);
  console.log(`Bucket:      ${BUCKET}`);
  console.log(`Dry run:     ${DRY_RUN}`);
  console.log('');

  // 1. List all objects in both buckets
  console.log('📋 Listing objects in Self-hosted bucket...');
  let destinationObjects = [];
  try {
    destinationObjects = await listAllObjects(selfHosted, BUCKET);
  } catch (e) {
    console.error('❌ Error listing self-hosted bucket:', e.message);
    process.exit(1);
  }
  const destinationSet = new Set(destinationObjects.map(o => o.path));
  console.log(`   Found ${destinationObjects.length} objects in Self-hosted\n`);

  console.log('📋 Listing objects in Cloud bucket...');
  let cloudObjects = [];
  try {
    cloudObjects = await listAllObjects(cloud, BUCKET);
  } catch (e) {
    console.error('❌ Error listing cloud bucket:', e.message);
    process.exit(1);
  }
  console.log(`   Found ${cloudObjects.length} objects in Cloud\n`);

  // 2. Migrate each object
  const failedFiles = [];
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const object of cloudObjects) {
    const objectPath = object.path;
    process.stdout.write(`  📄 ${objectPath}... `);

    if (destinationSet.has(objectPath)) {
      console.log('⏭️  already exists in destination');
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log('🔍 would migrate');
      migrated++;
      continue;
    }

    // Download from cloud
    const { data: fileData, error: dlError } = await cloud.storage
      .from(BUCKET)
      .download(objectPath);

    if (dlError) {
      console.log(`❌ download failed: ${dlError.message}`);
      failed++;
      failedFiles.push(objectPath);
      continue;
    }

    const sourceBuffer = await toBuffer(fileData);
    const sourceSize = sourceBuffer.length;
    const sourceHash = await sha256(sourceBuffer);

    // Upload to self-hosted
    const contentType = object.metadata?.mimetype || 'application/octet-stream';
    const { error: upError } = await selfHosted.storage
      .from(BUCKET)
      .upload(objectPath, sourceBuffer, {
        contentType,
        upsert: false,
      });

    if (upError) {
      console.log(`❌ upload failed: ${upError.message}`);
      failed++;
      failedFiles.push(objectPath);
      continue;
    }

    // Integrity verification: size + SHA-256 hash
    const { data: verifyData, error: verifyError } = await selfHosted.storage
      .from(BUCKET)
      .download(objectPath);

    if (verifyError) {
      console.log(`❌ verification download failed: ${verifyError.message}`);
      failed++;
      failedFiles.push(objectPath);
      continue;
    }

    const destBuffer = await toBuffer(verifyData);
    const destSize = destBuffer.length;
    const destHash = await sha256(destBuffer);

    if (destSize !== sourceSize) {
      console.log(`❌ size mismatch (src=${sourceSize}, dst=${destSize})`);
      failed++;
      failedFiles.push(objectPath);
      continue;
    }

    if (destHash !== sourceHash) {
      console.log('❌ hash mismatch (SHA-256)');
      failed++;
      failedFiles.push(objectPath);
      continue;
    }

    console.log('✅ verified (size + SHA-256)');
    migrated++;
    await sleep(100);
  }

  console.log(`\n📊 Migration results: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  if (failedFiles.length > 0) {
    console.log(`   Failed files: ${failedFiles.join(', ')}`);
  }
  console.log('');

  // 3. Update url_storage in repositorio table
  console.log('🔄 Updating url_storage in repositorio table...');
  const { data: allRecords, error: fetchError } = await selfHosted
    .from('repositorio')
    .select('id, nombre_archivo, url_storage');

  if (fetchError) {
    console.error('❌ Error fetching records:', fetchError);
    process.exit(1);
  }

  const cloudHost = new URL(CLOUD_URL).host;
  let updatedCount = 0;
  let nullFixedCount = 0;
  const nullNeedsDecision = [];

  // Build a basename → full-path map for NULL resolution
  const basenameMap = new Map();
  for (const obj of destinationObjects) {
    const basename = obj.path.split('/').pop();
    if (!basenameMap.has(basename)) {
      basenameMap.set(basename, obj.path);
    }
  }

  for (const record of allRecords || []) {
    if (record.url_storage === null) {
      const matchingPath = basenameMap.get(record.nombre_archivo);
      if (matchingPath) {
        const newUrl = buildSelfHostedUrl(matchingPath);
        if (DRY_RUN) {
          console.log(`🔍 [dry-run] Would set url_storage for NULL row id=${record.id}, nombre_archivo=${record.nombre_archivo} → ${newUrl}`);
        } else {
          const { error: updError } = await selfHosted
            .from('repositorio')
            .update({ url_storage: newUrl })
            .eq('id', record.id);
          if (updError) {
            console.error(`  ❌ Failed to update NULL row ${record.nombre_archivo}: ${updError.message}`);
          } else {
            console.log(`  ✅ Set url_storage for NULL row ${record.nombre_archivo}`);
            nullFixedCount++;
          }
        }
      } else {
        console.log(`⚠️  NULL row id=${record.id}, nombre_archivo=${record.nombre_archivo} — no matching object in destination, needs human decision`);
        nullNeedsDecision.push(record.nombre_archivo);
      }
      continue;
    }

    // Only update if still pointing to cloud
    if (record.url_storage.includes(cloudHost)) {
      const newUrl = buildSelfHostedUrl(record.nombre_archivo);
      if (DRY_RUN) {
        console.log(`🔍 [dry-run] Would update url_storage for ${record.nombre_archivo}: ${record.url_storage} → ${newUrl}`);
      } else {
        const { error: updError } = await selfHosted
          .from('repositorio')
          .update({ url_storage: newUrl })
          .eq('id', record.id);

        if (updError) {
          console.error(`  ❌ Failed to update ${record.nombre_archivo}: ${updError.message}`);
        } else {
          updatedCount++;
        }
      }
    }
  }

  if (!DRY_RUN) {
    console.log(`   Updated ${updatedCount} cloud-pointing records`);
    console.log(`   Fixed ${nullFixedCount} NULL records`);
  }
  if (nullNeedsDecision.length > 0) {
    console.log(`   NULL rows needing human decision: ${nullNeedsDecision.join(', ')}`);
  }
  console.log('');

  // 4. Final summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Migration complete!');
  console.log('═══════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
