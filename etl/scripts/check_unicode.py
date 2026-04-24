import os

with open('etl/output/chunks/chunk_0001.sql', 'rb') as f:
    raw = f.read()

# Find the position of the bad sequence
pos = raw.find(b'Escolarizaci')
print(f'Position of "Escolarizaci": {pos}')
print(f'Bytes around: {raw[pos:pos+50].hex()}')
print(f'String around: {raw[pos:pos+50]}')

# Check what encoding was used
try:
    with open('etl/output/chunks/chunk_0001.sql', 'r', encoding='utf-8') as f:
        content = f.read()
    print('\nDecoded as UTF-8 successfully')
except:
    print('\nUTF-8 failed')

try:
    with open('etl/output/chunks/chunk_0001.sql', 'r', encoding='latin-1') as f:
        content = f.read()
    print('Decoded as Latin-1')
    print('First 300 chars:', content[:300])
except Exception as e:
    print(f'Latin-1 failed: {e}')