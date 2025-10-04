#!/usr/bin/env python3
import json
import sys

def make_unique(data, key_field):
    """Remove duplicates from data array based on key_field"""
    if 'data' not in data or not isinstance(data['data'], list):
        print(f"⚠️  Warning: Invalid data structure in file")
        return data
    
    seen = set()
    unique_data = []
    duplicates = 0
    
    for item in data['data']:
        key = item.get(key_field)
        if key and key not in seen:
            seen.add(key)
            unique_data.append(item)
        elif key:
            duplicates += 1
    
    return {
        'success': data.get('success', True),
        'count': len(unique_data),
        'data': unique_data
    }, duplicates

try:
    # Read wings.json
    print("Processing wings.json...")
    with open('./web/sites/default/files/sql-feeds/wings.json', 'r') as f:
        wings = json.load(f)

    # Read decs.json
    print("Processing decs.json...")
    with open('./web/sites/default/files/sql-feeds/decs.json', 'r') as f:
        decs = json.load(f)

    # Make unique
    wings_unique, wings_dup = make_unique(wings, 'Id')
    decs_unique, decs_dup = make_unique(decs, 'intAutoID')

    # Save back
    with open('./web/sites/default/files/sql-feeds/wings.json', 'w') as f:
        json.dump(wings_unique, f, indent=2)

    with open('./web/sites/default/files/sql-feeds/decs.json', 'w') as f:
        json.dump(decs_unique, f, indent=2)

    print("")
    print("✅ Filtered duplicates:")
    print(f"   Wings: {wings.get('count', 0)} → {wings_unique['count']} unique (removed {wings_dup} duplicates)")
    print(f"   DECs: {decs.get('count', 0)} → {decs_unique['count']} unique (removed {decs_dup} duplicates)")
    
except FileNotFoundError as e:
    print(f"❌ Error: File not found - {e}")
    print("   Make sure to run ./fetch-sql-data.sh first")
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"❌ Error: Invalid JSON - {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
