import re
import sys
import json
sys.path.insert(0, '.')

def parse_sql_values(values_str):
    """Parse VALUES string into individual records"""
    # Remove outer parentheses if present
    values_str = values_str.strip()
    if values_str.startswith('(') and values_str.endswith(')'):
        values_str = values_str[1:-1]
    
    # Split by '),(' but be careful about nested structures
    records = []
    current = ''
    paren_depth = 0
    in_string = False
    escape_next = False
    
    for char in values_str:
        if escape_next:
            escape_next = False
            current += char
        elif char == '\\':
            escape_next = True
            current += char
        elif char == '"' and not escape_next:
            in_string = not in_string
            current += char
        elif char == "'" and not escape_next:
            # Handle single quotes in JSON
            in_string = not in_string
            current += char
        elif char == '(' and not in_string:
            paren_depth += 1
            current += char
        elif char == ')' and not in_string:
            paren_depth -= 1
            current += char
            if paren_depth == 0:
                records.append(current)
                current = ''
        elif char == ',' and paren_depth == 0 and not in_string:
            records.append(current)
            current = ''
        else:
            current += char
    
    if current:
        records.append(current)
    
    return records

def extract_records_from_sql(filename):
    """Extract INSERT records from SQL file"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the DATA section
    lines = content.split('\n')
    in_data_section = False
    values_content = []
    
    for line in lines:
        stripped = line.strip()
        if '-- Datos de indicadores' in stripped:
            in_data_section = True
            continue
        if in_data_section:
            if stripped.startswith('--'):
                continue
            if stripped and not stripped.startswith('INSERT INTO indicadores'):
                # This is likely a VALUES line or continuation
                values_content.append(stripped)
            elif stripped.startswith('INSERT INTO indicadores') and 'VALUES' in stripped:
                # Extract VALUES part
                match = re.search(r'VALUES\s+(.*)', stripped)
                if match:
                    values_content.append(match.group(1))
            elif stripped.endswith(';'):
                # End of statement
                if values_content:
                    values_content[-1] = values_content[-1].rstrip(';')
                break
    
    # Join and parse
    full_values = ' '.join(values_content)
    return parse_sql_values(full_values)

def create_insert_sql(record):
    """Create individual INSERT statement from a record"""
    # Record format: 'uuid', 'text', 'demografia', number, 'hab', '2022', 'Córdoba', {'...'}::jsonb, 'etl'
    # We need to handle the ::jsonb cast properly
    return f"INSERT INTO indicadores (id, indicador_nombre, categoria, valor, unidad, periodo, region, desglose, fuente) VALUES {record} ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, desglose = EXCLUDED.desglose;"

def main():
    print("Extracting records from demografia SQL file...")
    records = extract_records_from_sql('etl/output/demografia_20260427_111431.sql')
    print(f"Found {len(records)} records to process")
    
    if len(records) == 0:
        print("No records found!")
        return
    
    # Process in batches to avoid too long SQL statements
    batch_size = 50
    total_inserted = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1} ({len(batch)} records)...")
        
        # Create individual INSERT statements for each record
        insert_statements = []
        for record in batch:
            insert_statements.append(create_insert_sql(record))
        
        # Combine into a single transaction
        combined_sql = "BEGIN;\n" + "\n".join(insert_statements) + "\nCOMMIT;"
        
        # For now, just print the first statement to verify
        if i == 0:
            print("Sample INSERT statement:")
            print(insert_statements[0][:200] + "..." if len(insert_statements[0]) > 200 else insert_statements[0])
            
            # Also show what we're trying to do
            print("\nFirst few records:")
            for j in range(min(3, len(batch))):
                print(f"  {j+1}: {batch[j][:100]}..." if len(batch[j]) > 100 else f"  {j+1}: {batch[j]}")
    
    print(f"\nTo insert {len(records)} records, you would need to execute the generated SQL.")
    print("Since we can't execute files directly via Supabase MCP, you have two options:")
    print("1. Copy the SQL from etl/output/demografia_20260427_111431.sql and execute it in Supabase SQL Editor")
    print("2. Use the chunked approach above to generate individual INSERT statements")

if __name__ == '__main__':
    main()
