#!/usr/bin/env python3
"""
Load SQL chunks to Supabase via REST API.
Bypasses JSON parsing issues in the MCP tool by using direct HTTP POST.
"""
import os
import re
import json
import requests

# Supabase config
SUPABASE_URL = "https://ppyyqrvirjqmfpqaqnxy.supabase.co"
# Get from environment or hardcode for now
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Chunk directory
CHUNKS_DIR = r"E:\Backup Luca\DDNA\dashboard\etl\output\chunks\fixed"

def get_service_key():
    """Try to get the service role key."""
    if SUPABASE_SERVICE_KEY:
        return SUPABASE_SERVICE_KEY
    
    # Check .env.local for the key
    env_path = r"E:\Backup Luca\DDNA\dashboard\.env.local"
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if "SUPABASE_SERVICE_ROLE_KEY" in line or "SERVICE_ROLE_KEY" in line:
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        return parts[1].strip()
    
    # Check .env file
    env_path2 = r"E:\Backup Luca\DDNA\dashboard\.env"
    if os.path.exists(env_path2):
        with open(env_path2, 'r') as f:
            for line in f:
                if "SUPABASE_SERVICE_ROLE_KEY" in line or "SERVICE_ROLE_KEY" in line:
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        return parts[1].strip()
    
    return None


def clean_sql_value(match):
    """Fix SQL-escaped values in JSON strings."""
    val = match.group(1)
    # Replace '' with '
    val = val.replace("''", "'")
    # Replace chr(39) with '
    val = val.replace("chr(39)", "'")
    return f'"{val}"'


def extract_insert_values(sql_content):
    """Extract VALUES from a chunk file and return as list of dicts."""
    # Remove comments
    lines = [l for l in sql_content.split('\n') if not l.strip().startswith('--')]
    content = '\n'.join(lines)
    
    # Find all INSERT statements
    insert_pattern = r"INSERT INTO indicadores.*?VALUES\s*\((.*?)\)\s*ON CONFLICT"
    matches = re.findall(insert_pattern, content, re.DOTALL | re.IGNORECASE)
    
    records = []
    for match in matches:
        # Parse the VALUES part
        parts = parse_values(match)
        if parts and len(parts) >= 8:
            record = {
                'id': parts[0].strip().strip("'"),
                'indicador_nombre': parts[1].strip().strip("'"),
                'categoria': parts[2].strip().strip("'"),
                'valor': float(parts[3].strip()),
                'unidad': parts[4].strip().strip("'"),
                'periodo': parts[5].strip().strip("'"),
                'region': parts[6].strip().strip("'"),
                'desglose': parts[7].strip(),  # Will parse JSON later
                'fuente': parts[8].strip().strip("'") if len(parts) > 8 else 'etl'
            }
            
            # Clean up desglose JSON
            desglose_str = record['desglose']
            # Remove ::jsonb cast
            desglose_str = re.sub(r"::jsonb$", "", desglose_str).strip()
            # Handle chr(39) escapes
            desglose_str = desglose_str.replace("chr(39)", "'")
            # Handle '' escapes  
            desglose_str = desglose_str.replace("''", "'")
            # Remove leading/trailing quotes if present
            desglose_str = desglose_str.strip()
            if desglose_str.startswith("'") and desglose_str.endswith("'"):
                desglose_str = desglose_str[1:-1]
            
            try:
                record['desglose'] = json.loads(desglose_str)
            except json.JSONDecodeError as e:
                print(f"  JSON parse error: {e} in: {desglose_str[:100]}")
                # Try to fix common issues
                try:
                    # Replace single quotes that aren't escaped
                    fixed = desglose_str.replace("'", '"')
                    record['desglose'] = json.loads(fixed)
                except:
                    record['desglose'] = {"error": "parse_failed", "raw": desglose_str}
            
            records.append(record)
    
    return records


def parse_values(values_str):
    """Parse a VALUES tuple, handling nested quotes properly."""
    parts = []
    current = ""
    in_string = False
    paren_depth = 0
    escape_next = False
    
    i = 0
    while i < len(values_str):
        char = values_str[i]
        
        if escape_next:
            current += char
            escape_next = False
            i += 1
            continue
        
        if char == '\\':
            escape_next = True
            current += char
            i += 1
            continue
        
        if char == "'" and not in_string:
            in_string = True
            current += char
            i += 1
            continue
        
        if char == "'" and in_string:
            # Check for escaped quote ''
            if i + 1 < len(values_str) and values_str[i + 1] == "'":
                current += "'"
                i += 2
                continue
            else:
                in_string = False
                current += char
                i += 1
                continue
        
        if char == '(' and not in_string:
            paren_depth += 1
            current += char
            i += 1
            continue
        
        if char == ')' and not in_string:
            paren_depth -= 1
            current += char
            if paren_depth == 0:
                parts.append(current.strip())
                current = ""
                # Skip comma and space
                while i + 1 < len(values_str) and values_str[i + 1] in ' ,':
                    i += 1
                i += 1
                continue
            i += 1
            continue
        
        if char == ',' and not in_string and paren_depth == 1:
            parts.append(current.strip())
            current = ""
            i += 1
            continue
        
        current += char
        i += 1
    
    if current.strip():
        parts.append(current.strip())
    
    return parts


def load_to_supabase(records, batch_size=50):
    """Load records to Supabase via REST API."""
    service_key = get_service_key()
    if not service_key:
        print("ERROR: Could not find SERVICE_ROLE_KEY")
        return 0
    
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    loaded = 0
    errors = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        
        # Build UPSERT query for this batch
        values_parts = []
        for r in batch:
            desglose_json = json.dumps(r['desglose'], ensure_ascii=False)
            values_parts.append(f"('{r['id']}', '{r['indicador_nombre']}', '{r['categoria']}', {r['valor']}, '{r['unidad']}', '{r['periodo']}', '{r['region']}', '{desglose_json}'::jsonb, '{r['fuente']}')")
        
        query = f"""
        INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente)
        VALUES {', '.join(values_parts)}
        ON CONFLICT (id) DO UPDATE SET 
            valor = EXCLUDED.valor, 
            desglose = EXCLUDED.desglose;
        """
        
        try:
            resp = requests.post(url, headers=headers, json={"query": query}, timeout=120)
            if resp.status_code in (200, 201):
                loaded += len(batch)
                print(f"  Loaded batch {i//batch_size + 1}: {len(batch)} records (total: {loaded})")
            else:
                print(f"  Error in batch {i//batch_size + 1}: {resp.status_code} - {resp.text[:200]}")
                errors += len(batch)
        except Exception as e:
            print(f"  Exception in batch {i//batch_size + 1}: {e}")
            errors += len(batch)
    
    return loaded, errors


def main():
    print(f"Supabase URL: {SUPABASE_URL}")
    
    service_key = get_service_key()
    if not service_key:
        print("ERROR: Could not find SERVICE_ROLE_KEY in environment or .env files")
        print("Please set SUPABASE_SERVICE_ROLE_KEY environment variable")
        return
    
    print(f"Service key found: {service_key[:20]}...")
    
    # Get all chunk files
    chunk_files = []
    for f in os.listdir(CHUNKS_DIR):
        if f.startswith('chunk_') and f.endswith('.sql'):
            chunk_files.append(os.path.join(CHUNKS_DIR, f))
    
    chunk_files.sort()
    print(f"Found {len(chunk_files)} chunk files")
    
    total_records = 0
    all_records = []
    
    # Extract all records from chunks
    for chunk_file in chunk_files:
        chunk_num = re.search(r'chunk_(\d+)', chunk_file).group(1)
        print(f"\nProcessing chunk_{chunk_num}...")
        
        with open(chunk_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        records = extract_insert_values(content)
        print(f"  Extracted {len(records)} records")
        all_records.extend(records)
        total_records += len(records)
    
    print(f"\nTotal records extracted: {total_records}")
    
    # Load to Supabase
    print("\nLoading to Supabase...")
    loaded, errors = load_to_supabase(all_records)
    print(f"\nDone! Loaded: {loaded}, Errors: {errors}")


if __name__ == "__main__":
    main()
