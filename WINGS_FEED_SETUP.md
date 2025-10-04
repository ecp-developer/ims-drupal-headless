# Wings Feed Setup Guide

## Step 1: Create Wings Feed Type

1. **Navigate to Feeds**
   - Go to: `Structure` → `Feeds` → `Add feed type`
   - URL: https://ims-drupal-headless.ddev.site/admin/structure/feeds/add

2. **Basic Settings**
   - **Label**: `Wing Import from SQL Server`
   - **Machine name**: `wing_import_from_sql_server`
   - **Description**: `Import Wings taxonomy from SQL Server API`
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
   - **Vocabulary**: Select `Wings`
   - **Update existing terms**: `Update existing terms`
   - **Text format**: `Plain text`
   - Click **Save and continue**

## Step 5: Configure Mappings

Add these mappings (Source → Target):

| # | Source (JSONPath) | Target Field | Unique |
|---|-------------------|--------------|--------|
| 1 | `Name` | Name | ✓ Yes |
| 2 | `Id` | field_wing_id | |
| 3 | `WingCode` | field_wing_code | |
| 4 | `ShortName` | field_wing_short_name | |
| 5 | `HODName` | field_hod_name | |
| 6 | `FocalPerson` | field_focal_person | |
| 7 | `ContactNo` | field_contact_no | |

**Important**: Mark "Name" as **Unique target** to prevent duplicates!

### How to Add Each Mapping:
1. Click **Add mapping**
2. **Select a source**: Choose `JSONPath expression`
3. Enter the JSONPath (e.g., `Name`)
4. **Select a target**: Choose the corresponding field
5. For the Name field, check **Unique target**
6. Click **Save**

## Step 6: Create and Run Feed

1. **Create Feed**
   - Go to: `Content` → `Feeds` → `Add Wing Import from SQL Server`
   - **Title**: `Wings from SQL Server`
   - **Feed URL**: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`
   - Click **Save**

2. **Import Data**
   - Click **Import** button
   - Wait for the import to complete
   - Expected result: **90 Wings imported**

## Verify Import

1. Go to: `Structure` → `Taxonomy` → `Wings`
2. You should see 90 Wing terms
3. Click on a term to verify all fields are populated:
   - Wing ID
   - Wing Code
   - Short Name
   - HOD Name
   - Focal Person
   - Contact Number

## Troubleshooting

**If import fails:**
1. Check the JSON file is accessible: https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json
2. Verify the JSONPath context: `$.data[*]`
3. Check that all field machine names match exactly
4. Review the import logs for specific errors

**Re-fetch data from SQL Server:**
```bash
cd /home/syedsana/ims-drupal-headless
bash fetch-sql-data.sh
```

## Next Step

After Wings are imported successfully, proceed to create the DECs feed following the same process with DEC-specific fields.
