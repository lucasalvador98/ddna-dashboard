import re
import sys
sys.path.insert(0, '.')

def extract_values_from_sql(filename):
    """Extract INSERT VALUES from SQL file"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the DATA section
    lines = content.split('\n')
    data_start = False
    values_lines = []
    
    for line in lines:
        if '-- Datos de indicadores' in line:
            data_start = True
            continue
        if data_start and line.strip() and not line.startswith('--'):
            if line.strip().endswith(';'):
                # Remove the semicolon and add the line
                values_lines.append(line.strip()[:-1])
                break
            elif 'INSERT INTO indicadores' in line and 'VALUES' in line:
                # Extract the VALUES part
                match = re.search(r'VALUES\s+(.*)', line)
                if match:
                    values_lines.append(match.group(1))
            elif data_start:
                values_lines.append(line.strip())
    
    # Join all lines and extract the VALUES content
    full_values = ' '.join(values_lines)
    
    # Find the actual VALUES content after the keyword VALUES
    values_match = re.search(r'VALUES\s+(.*)', full_values, re.DOTALL)
    if not values_match:
        return []
    
    values_content = values_match.group(1)
    
    # Parse individual records - this is tricky due to nested structures
    # Let's use a simpler approach: find all patterns that look like UUIDs followed by data
    records = []
    
    # Pattern to match: UUID, 'text', 'demografia', number, 'hab', '2022', 'Córdoba', {'...'}::jsonb, 'etl'
    pattern = r"\([^']+'[^']+'[^']+'demografia'[^)]+\)"
    
    # Let's just split by lines and process each line that looks like a record
    lines = values_content.split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith('(') and line.endswith('),'):
            line = line[:-1]  # Remove trailing comma
        if line.startswith('(') and line.endswith(')'):
            # This looks like a record
            records.append(line)
        elif 'VALUES' in line:
            # Extract the part after VALUES
            parts = line.split('VALUES', 1)
            if len(parts) > 1:
                val_part = parts[1].strip()
                if val_part.startswith('(') and val_part.endswith('),'):
                    val_part = val_part[:-1]
                if val_part.startswith('(') and val_part.endswith(')'):
                    records.append(val_part)
    
    return records

if __name__ == '__main__':
    records = extract_values_from_sql('etl/output/demografia_20260427_111431.sql')
    print(f"Found {len(records)} potential records")
    for i, record in enumerate(record[:3]):
        print(f"Record {i}: {record[:100]}...")
