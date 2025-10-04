# DECs Feed Setup Guide

## Step 1: Create DECs Feed Type

1. **Navigate to Feeds**
   - Go to: `Structure` → `Feeds` → `Add feed type`
   - URL: https://ims-drupal-headless.ddev.site/admin/structure/feeds/add

2. **Basic Settings**
   - **Label**: `DEC Import from SQL Server`
   - **Machine name**: `dec_import_from_sql_server`
   - **Description**: `Import DECs taxonomy from SQL Server API`
   - **Import period**: `Never` (manual import)
   - Click **Save and continue**

## Step 2: Configure Fetcher

1. **Select Fetcher**
   - Choose: `HTTP Fetcher`
   - Click **Save and continue**

2. **Configure HTTP Fetcher**
   - **Feed URL**: Leave empty (we'll provide it per feed)
   - Click **Save and continue**

## Step 3: Configure Parser

1. **Select Parser**
   - Choose: `JSONPath Parser`
   - Click **Save and continue**

2. **Configure JSONPath Parser**
   - **Context**: `$.data[*]`
   - **Display errors**: Check this box
   - Click **Save and continue**

## Step 4: Configure Processor

1. **Select Processor**
   - Choose: `Taxonomy term`
   - Click **Save and continue**

2. **Configure Processor Settings**
   - **Vocabulary**: Select `DECs`
   - **Update existing terms**: `Update existing terms`
   - **Text format**: `Plain text`
   - Click **Save and continue**

## Step 5: Configure Mappings

Add these mappings (Source → Target):

| # | Source (JSONPath) | Target Field | Unique |
|---|-------------------|--------------|--------|
| 1 | `DECName` | Name | ✓ Yes |
| 2 | `intAutoID` | field_dec_id | |
| 3 | `DECCode` | field_dec_code | |
| 4 | `DECAcronym` | field_dec_acronym | |
| 5 | `DECAddress` | field_dec_address | |
| 6 | `Location` | field_location | |
| 7 | `HODName` | field_hod_name | |

**Important**: Mark "Name" (DECName) as **Unique target** to prevent duplicates!

### How to Add Each Mapping:
1. Click **Add mapping**
2. **Select a source**: Choose `JSONPath expression`
3. Enter the JSONPath (e.g., `DECName`)
4. **Select a target**: Choose the corresponding field
5. For the DECName field, check **Unique target**
6. Click **Save**

## Step 6: Create and Run Feed

1. **Create Feed**
   - Go to: `Content` → `Feeds` → `Add DEC Import from SQL Server`
   - **Title**: `DECs from SQL Server`
   - **Feed URL**: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`
   - Click **Save**

2. **Import Data**
   - Click **Import** button
   - Wait for the import to complete
   - Expected result: **336 DECs imported**

## Verify Import

1. Go to: `Structure` → `Taxonomy` → `DECs`
2. You should see 336 DEC terms
3. Click on a term to verify all fields are populated:
   - DEC ID
   - DEC Code
   - DEC Acronym
   - DEC Address
   - Location
   - HOD Name

## Sample Data Structure

The JSON data looks like this:
```json
{
  "success": true,
  "count": 336,
  "data": [
    {
      "intAutoID": 4,
      "DECName": "DEC Abbottabad",
      "DECCode": "DEC-01",
      "DECAcronym": "ABT",
      "DECAddress": "123 Main Street",
      "Location": "Abbottabad",
      "HODName": "John Doe",
      "WingID": 134
    }
  ]
}
```

## Troubleshooting

**If import fails:**
1. Check the JSON file is accessible: https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json
2. Verify the JSONPath context: `$.data[*]`
3. Check that all field machine names match exactly
4. Review the import logs for specific errors

**Check current data:**
```bash
wsl bash -c "cd /home/syedsana/ims-drupal-headless/web/sites/default/files/sql-feeds && cat decs.json | head -c 1000"
```

**Re-fetch data from SQL Server:**
```bash
cd /home/syedsana/ims-drupal-headless
bash fetch-sql-data.sh
```

## Next Steps

After DECs are imported successfully:
1. Add hierarchical relationships (Wings → Offices, DECs → Wings)
2. Set up automatic periodic sync (optional)
3. Test the complete taxonomy structure

## Quick Reference

**Field Mapping Summary:**
- `intAutoID` → field_dec_id
- `DECCode` → field_dec_code
- `DECAcronym` → field_dec_acronym
- `DECAddress` → field_dec_address
- `Location` → field_location
- `HODName` → field_hod_name
- `WingID` → field_wing_ref (add later for hierarchy)
