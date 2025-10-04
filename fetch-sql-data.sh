#!/bin/bash
# Fetch SQL Server data and save to files accessible by Drupal

API_BASE="http://localhost:3001/api"
OUTPUT_DIR="./web/sites/default/files/sql-feeds"

# Create output directory
mkdir -p $OUTPUT_DIR

# Fetch offices
echo "Fetching offices..."
curl -s "$API_BASE/offices" > "$OUTPUT_DIR/offices.json"

# Fetch wings
echo "Fetching wings..."
curl -s "$API_BASE/wings" > "$OUTPUT_DIR/wings.json"

# Fetch decs
echo "Fetching decs..."
curl -s "$API_BASE/dec-mst" > "$OUTPUT_DIR/decs.json"

# Filter duplicates using Python
echo "Filtering duplicates..."
python3 filter_duplicates.py

echo ""
echo "Done! Files saved to $OUTPUT_DIR"
ls -lh $OUTPUT_DIR
