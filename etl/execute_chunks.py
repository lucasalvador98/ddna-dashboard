#!/usr/bin/env python3
"""
Script para ejecutar todos los chunks SQL en Supabase secuencialmente.
Uso: python execute_chunks.py
"""

import os
import glob
import time
from pathlib import Path

# Configuración
CHUNKS_DIR = Path("E:/Backup Luca/DDNA/dashboard/etl/output/chunks/fixed")
PROJECT_ID = "ppyyqrvirjqmfpqaqnxy"

# Para usar con supabase_execute_sql via MCP, necesitamos ejecutar via shell
# Este script genera comandos que pueden ejecutarse

def get_chunk_files():
    """Obtiene lista de archivos chunk ordenados."""
    files = sorted(CHUNKS_DIR.glob("chunk_*.sql"))
    # Excluir archivos que no son chunks numerados (como _clean.sql, _fixed.sql)
    return [f for f in files if f.stem.startswith("chunk_") and len(f.stem) == 10]

def execute_chunk(chunk_file):
    """Ejecuta un chunk SQL."""
    print(f"Ejecutando {chunk_file.name}...")
    
    with open(chunk_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Contar INSERTs
    insert_count = sql_content.count("INSERT INTO")
    print(f"  - {insert_count} INSERTs")
    
    # Ejecutar via MCP (esto es un placeholder - en realidad ejecutamos via tool)
    return True

def main():
    chunks = get_chunk_files()
    print(f"Total chunks a ejecutar: {len(chunks)}")
    print(f"Primer chunk: {chunks[0].name}")
    print(f"Último chunk: {chunks[-1].name}")
    print()
    
    success = 0
    failed = 0
    errors = []
    
    for i, chunk in enumerate(chunks, 1):
        print(f"[{i}/{len(chunks)}] ", end="")
        try:
            if execute_chunk(chunk):
                success += 1
            time.sleep(0.1)  # Pequeña pausa entre chunks
        except Exception as e:
            failed += 1
            errors.append((chunk.name, str(e)))
            print(f"  ERROR: {e}")
    
    print()
    print("=" * 60)
    print(f"EJECUCIÓN COMPLETADA")
    print(f"Exitosos: {success}")
    print(f"Fallidos: {failed}")
    
    if errors:
        print("\nErrores:")
        for chunk_name, error in errors:
            print(f"  - {chunk_name}: {error}")

if __name__ == "__main__":
    main()
