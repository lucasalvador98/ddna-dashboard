const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chunksDir = 'E:/Backup Luca/DDNA/dashboard/etl/output/chunks/fixed';
const projectId = 'ppyyqrvirjqmfpqaqnxy';

// Get all chunk files from 0001 to 0133
const files = [];
for (let i = 1; i <= 133; i++) {
    const num = i.toString().padStart(4, '0');
    files.push(`chunk_${num}.sql`);
}

console.log(`Starting execution of ${files.length} chunks...`);
console.log(`Project: ${projectId}`);
console.log('');

const errors = [];
let executed = 0;

for (const file of files) {
    const filePath = path.join(chunksDir, file);
    
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${file}: File not found, skipping`);
            continue;
        }
        
        // Read file content
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Execute via Supabase (we'll output the command)
        console.log(`✅ ${file}: Ready to execute (${content.length} chars)`);
        executed++;
        
        // Progress report every 25 chunks
        if (executed % 25 === 0) {
            console.log(`\n📊 Progress: ${executed}/${files.length} chunks prepared\n`);
        }
        
    } catch (error) {
        console.error(`❌ ${file}: Error - ${error.message}`);
        errors.push({ file, error: error.message });
    }
}

console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));
console.log(`Total chunks prepared: ${executed}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
    console.log('\nErrors encountered:');
    errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
    });
}
