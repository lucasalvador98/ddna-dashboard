#!/usr/bin/env python3
"""Fix duplicate UUIDs in fixed_batch_*.sql files using UUID5 based on unique fields."""

import re
import uuid as uuid_module
from pathlib import Path

def generate_unique_uuid(indicador_nombre: str, categoria: str, region: str, 
                          edad: str, metrica: str, periodo: str) -> str:
    """Generate a deterministic UUID v5 based on unique identifying fields."""
    namespace = uuid_module.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')  # URL namespace
    unique_string = f"{indicador_nombre}|{categoria}|{region}|{edad}|{metrica}|{periodo}"
    return str(uuid_module.uuid5(namespace, unique_string))

def fix_batch_file(filepath: Path) -> None:
    """Fix UUIDs in a single batch file."""
    content = filepath.read_text(encoding='utf-8')
    
    # Join multi-line statements for processing
    # But we need to process line by line, so track state
    
    # Process statement by statement - find INSERT...ON CONFLICT blocks
    blocks = re.split(r"(?=INSERT INTO indicadores)", content)
    
    fixed_blocks = []
    for block in blocks:
        if not block.strip().startswith("INSERT INTO"):
            fixed_blocks.append(block)
            continue
        
        # This is an INSERT block - extract UUID from VALUES line
        # Pattern: VALUES ('uuid', 'name', 'cat', ...)
        
        # Find VALUES line within block
        values_match = re.search(
            r"VALUES\s*\(\s*'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})'\s*,\s*'([^']+)'\s*,\s*'([^']+)'",
            block
        )
        
        if values_match:
            old_uuid = values_match.group(1)
            indicador_nombre = values_match.group(2)
            categoria = values_match.group(3)
            
            # Now find the rest: valor, unidad, periodo, region, desglose::jsonb, fuente
            # These are the next 6 fields after categoria in VALUES
            rest_match = re.search(
                r"VALUES\s*\(\s*'[a-f0-9-]+'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*('\{[^}]+\}'::jsonb)\s*,\s*'([^']+)'\)",
                block
            )
            
            if rest_match:
                # name = rest_match.group(1) - already captured
                # categoria = rest_match.group(2) - already captured
                valor = rest_match.group(3)
                unidad = rest_match.group(4)
                periodo = rest_match.group(5)
                region = rest_match.group(6)
                desglose_str = rest_match.group(7)
                fuente = rest_match.group(8)
                
                # Extract edad and metrica from desglose JSON
                edad_match = re.search(r'"edad"\s*:\s*"?([^",}]+)"?', desglose_str)
                metrica_match = re.search(r'"metrica"\s*:\s*"?([^",}]+)"?', desglose_str)
                
                edad = edad_match.group(1) if edad_match else ""
                metrica = metrica_match.group(1) if metrica_match else ""
                
                # Generate new UUID
                new_uuid = generate_unique_uuid(indicador_nombre, categoria, region, str(edad), metrica, periodo)
                
                # Replace old UUID with new one
                block = block.replace(f"'{old_uuid}'", f"'{new_uuid}'", 1)
        
        fixed_blocks.append(block)
    
    # Write back
    filepath.write_text(''.join(fixed_blocks), encoding='utf-8')

def main():
    batch_dir = Path("E:/Backup Luca/DDNA/dashboard/etl/output")
    
    # Find all fixed_batch_*.sql files
    batch_files = sorted(batch_dir.glob("fixed_batch_*.sql"))
    
    # Exclude the large test file
    batch_files = [f for f in batch_files if "first50k" not in f.name]
    
    print(f"Processing {len(batch_files)} batch files...")
    
    for filepath in batch_files:
        print(f"  Fixing {filepath.name}...", end=" ")
        try:
            fix_batch_file(filepath)
            print("OK")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
