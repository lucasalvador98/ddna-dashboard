import os
import glob

project_id = "ppyyqrvirjqmfpqaqnxy"
chunks_dir = "etl/output/chunks/fixed"

# Get all chunk files sorted
chunk_files = sorted(glob.glob(f"{chunks_dir}/chunk_*.sql"))

# Filter only chunks 0002-0133
chunk_files = [f for f in chunk_files if "chunk_0001" not in f and "_clean" not in f and "_fixed" not in os.path.basename(f).replace("chunk_0001", "")]

print(f"Found {len(chunk_files)} chunk files to execute")
print("First 5 files:", chunk_files[:5])
print("Last 5 files:", chunk_files[-5:])
