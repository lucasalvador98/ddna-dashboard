#!/bin/bash
PROJECT_ID="ppyyqrvirjqmfpqaqnxy"
CHUNKS_DIR="etl/output/chunks/fixed"

# Execute chunks 0002-0133
for i in $(seq -w 2 133); do
    FILE="${CHUNKS_DIR}/chunk_0${i}.sql"
    if [ -f "$FILE" ]; then
        echo "Processing chunk_0${i}.sql..."
        # We'll need to execute via MCP tool
    fi
done
