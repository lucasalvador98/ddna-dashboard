#!/usr/bin/env python3
"""
Fix chr(39) SQL escaping in JSON strings within chunk files.
"""
import os
import re
import glob

CHUNKS_DIR = r"E:\Backup Luca\DDNA\dashboard\etl\output\chunks\fixed"

def fix_chr39_in_json(match):
    """Replace SQL chr(39) with proper single quote inside JSON."""
    content = match.group(0)
    # The JSON string portion between '...'::jsonb
    # Find the JSON part
    json_match = re.search(r"'(\{.*?\})'::jsonb", content, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
        # Replace chr(39) with '
        json_str = json_str.replace("chr(39)", "'")
        # Fix '' -> ' (double single quotes to single quote)
        json_str = json_str.replace("''", "'")
        # Rebuild the VALUES clause
        before = content[:content.index("'{" )]
        after = "'::jsonb, 'etl')"
        return before + "'" + json_str + "'::jsonb, 'etl')"
    return content


def fix_chunk_file(filepath):
    """Fix chr(39) issues in a chunk file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern to find VALUES with JSON containing chr(39)
    # The issue is: '... "key": "... chr(39) ..." ...'::jsonb
    # We need to replace chr(39) with ' and fix '' to '
    
    # Find all occurrences of chr(39) inside JSON strings
    # Pattern: inside a VALUES clause, the JSON field
    
    # Simpler approach: for each line with VALUES, extract and fix the JSON
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        if 'chr(39)' in line and '::jsonb' in line:
            # This line has the issue
            # Extract the JSON portion and fix it
            # Find: ' { ... } '::jsonb
            json_pattern = r"'(\{[^']*\})'::jsonb"
            
            def fix_json_in_line(m):
                json_str = m.group(1)
                # Replace chr(39) with '
                json_str = json_str.replace("chr(39)", "'")
                # Replace '' with '
                json_str = json_str.replace("''", "'")
                return "'" + json_str + "'::jsonb"
            
            line = re.sub(json_pattern, fix_json_in_line, line)
            
            # Also fix double chr(39) patterns like: '|| chr(39) || 'something'|| chr(39) || '
            # These are even more broken - they have SQL concatenation inside JSON
            if "|| chr(39) ||" in line:
                # This is a severe case - the JSON is fundamentally broken
                # Try to reconstruct
                parts = line.split("'")
                # parts[0] = VALUES (
                # parts[1] = id
                # parts[2] = , 'indicador_nombre
                # etc.
                # The JSON field will be in parts that contain {
                fixed_parts = []
                in_json = False
                json_buffer = ""
                json_start = -1
                
                for i, p in enumerate(parts):
                    if '{' in p and not in_json:
                        in_json = True
                        json_start = i
                        json_buffer = p
                    elif in_json:
                        json_buffer += "'" + p
                        if '}' in p:
                            in_json = False
                            # Fix the JSON buffer
                            json_buffer = json_buffer.replace("chr(39)", "'")
                            json_buffer = json_buffer.replace("''", "'")
                            fixed_parts.append(json_buffer)
                            json_buffer = ""
                        elif "|| chr(39) ||" in p:
                            # Still in JSON, keep buffering
                            json_buffer += "'" + p
                        else:
                            json_buffer += "'" + p
                    else:
                        fixed_parts.append(p)
                
                if json_buffer:
                    json_buffer = json_buffer.replace("chr(39)", "'")
                    json_buffer = json_buffer.replace("''", "'")
                    fixed_parts.append(json_buffer)
                
                line = "'".join(fixed_parts)
        
        fixed_lines.append(line)
    
    fixed_content = '\n'.join(fixed_lines)
    
    if fixed_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        return True
    return False


def main():
    chunk_files = sorted(glob.glob(os.path.join(CHUNKS_DIR, "chunk_*.sql")))
    print(f"Found {len(chunk_files)} chunk files")
    
    fixed_count = 0
    for f in chunk_files:
        if fix_chunk_file(f):
            print(f"FIXED: {os.path.basename(f)}")
            fixed_count += 1
        else:
            print(f"OK:    {os.path.basename(f)}")
    
    print(f"\nFixed {fixed_count} files")


if __name__ == "__main__":
    main()
