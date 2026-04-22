#!/usr/bin/env python3
"""Split the big ETL SQL file into smaller chunks of ~50 INSERTs each."""
import re, os

SRC = r"C:\Users\20409409009\Desktop\ddna-dashboard\etl\output\ddna_all_data_20260422_120653.sql"
OUT_DIR = r"C:\Users\20409409009\Desktop\ddna-dashboard\etl\output\chunks"
CHUNK_SIZE = 50

os.makedirs(OUT_DIR, exist_ok=True)

with open(SRC, "r", encoding="utf-8") as f:
    content = f.read()

# Extract each complete INSERT statement using regex
pattern = r"INSERT INTO indicadores.*?(?=INSERT INTO indicadores|$)"
statements = re.findall(pattern, content, re.DOTALL)
total = len(statements)
print(f"Total INSERTs: {total}")

for i in range(0, total, CHUNK_SIZE):
    chunk = statements[i : i + CHUNK_SIZE]
    chunk_num = i // CHUNK_SIZE
    out_path = os.path.join(OUT_DIR, f"chunk_{chunk_num:04d}.sql")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"-- Chunk {chunk_num:04d}: INSERTs {i+1} to {min(i+CHUNK_SIZE, total)} of {total}\n")
        f.write("\n".join(chunk))
    size = os.path.getsize(out_path)
    print(f"Wrote chunk_{chunk_num:04d}.sql ({len(chunk)} INSERTs, {size // 1024} KB)")

print(f"\nDone! {total // CHUNK_SIZE + (1 if total % CHUNK_SIZE else 0)} chunks created.")