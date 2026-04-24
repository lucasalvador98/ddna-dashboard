import os
import json

# Mapping of escaped sequences to actual chars
ESCAPE_MAP = {
    '\\u00e1': 'á', '\\u00e9': 'é', '\\u00ed': 'í', '\\u00f3': 'ó', '\\u00fa': 'ú',
    '\\u00c1': 'Á', '\\u00c9': 'É', '\\u00cd': 'Í', '\\u00d3': 'Ó', '\\u00da': 'Ú',
    '\\u00f1': 'ñ', '\\u00d1': 'Ñ',
    '\\u00fc': 'ü', '\\u00dc': 'Ü',
    '\\u00e7': 'ç', '\\u00c7': 'Ç',
}

def fix_unicode(text):
    for esc, char in ESCAPE_MAP.items():
        text = text.replace(esc, char)
    return text

chunks_dir = 'etl/output/chunks'
os.makedirs(f'{chunks_dir}/fixed', exist_ok=True)

chunk_files = sorted([f for f in os.listdir(chunks_dir) if f.endswith('.sql') and f > 'chunk_0000.sql'])
print(f'Processing {len(chunk_files)} chunks...')

for cf in chunk_files:
    with open(f'{chunks_dir}/{cf}', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix unicode escapes
    fixed_content = fix_unicode(content)
    
    out_path = f'{chunks_dir}/fixed/{cf}'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    if 'educacion' in fixed_content[:500]:
        # Verify first educacion record
        pos = fixed_content.find("'Educacion")
        if pos > 0:
            sample = fixed_content[pos:pos+100]
            print(f'{cf}: {sample[:80]}...')

print('\nDone! Fixed chunks saved to etl/output/chunks/fixed/')