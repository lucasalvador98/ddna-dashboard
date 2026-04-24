const fs = require('fs');
const path = require('path');

const chunksDir = 'E:/Backup Luca/DDNA/dashboard/etl/output/chunks/fixed';
const projectId = 'ppyyqrvirjqmfpqaqnxy';

// Generate list of chunks 0002-0133
const chunks = [];
for (let i = 2; i <= 133; i++) {
    const num = i.toString().padStart(4, '0');
    chunks.push(`chunk_${num}.sql`);
}

console.log('CHUNK_EXECUTION_SUMMARY');
console.log('='.repeat(50));
console.log(`Total chunks to execute: ${chunks.length}`);
console.log(`Project ID: ${projectId}`);
console.log(`Directory: ${chunksDir}`);
console.log('');
console.log('Files:');
chunks.forEach((f, i) => {
    if (i < 5 || i >= chunks.length - 5) {
        console.log(`  ${f}`);
    } else if (i === 5) {
        console.log(`  ... (${chunks.length - 10} more) ...`);
    }
});
console.log('');
console.log('READY_FOR_EXECUTION');
console.log('Use the supabase_execute_sql tool with each file content');
