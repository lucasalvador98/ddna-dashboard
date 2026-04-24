$chunksDir = "E:/Backup Luca/DDNA/dashboard/etl/output/chunks/fixed"
$projectId = "ppyyqrvirjqmfpqaqnxy"

# Process chunks 2-26 (25 chunks)
$chunks = 2..26 | ForEach-Object { $_.ToString().PadLeft(4, '0') }

foreach ($chunkNum in $chunks) {
    $file = "chunk_$chunkNum.sql"
    $filePath = Join-Path $chunksDir $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing $file..." -ForegroundColor Green
        # File exists, would execute here
    } else {
        Write-Host "⚠️  $file not found" -ForegroundColor Yellow
    }
}

Write-Host "Batch 1 (chunks 2-26) ready for execution" -ForegroundColor Cyan
