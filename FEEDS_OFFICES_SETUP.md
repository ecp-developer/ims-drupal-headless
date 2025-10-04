# Feeds Setup Guide: Import Offices from SQL Server API

## API Structure Analysis

Your offices API (`http://localhost:3001/api/offices`) returns:

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "intOfficeID": 583,
      "strOfficeName": "ECP Secretariat",
      "strOfficeDescription": "ECP Secretariat Office",
      "OfficeCode": 100,
      "IS_ACT": true,
      "IS_DELETED": false,
      // ... other fields
    }
  ]
}
```

**Key Fields to Import:**
- `intOfficeID` → Unique identifier
- `strOfficeName` → Office name (will be taxonomy term name)
- `OfficeCode` → Office code (custom field)
- `strOfficeDescription` → Description (optional)

## Step-by-Step Setup

### Step 1: Create Taxonomy Vocabulary

```bash
ddev ssh
drush vocabulary:create offices "Offices" "Office locations from SQL Server"
```

If already created, verify it exists:
```bash
drush ev "print_r(\Drupal::entityTypeManager()->getStorage('taxonomy_vocabulary')->loadMultiple());"
```

### Step 2: Add Custom Field for Office Code

```bash
# Add office code field to offices taxonomy
drush field:create taxonomy_term.offices.field_office_code \
  --field-type=integer \
  --field-label="Office Code"

# Add office ID field (to track SQL Server ID)
drush field:create taxonomy_term.offices.field_office_id \
  --field-type=integer \
  --field-label="Office ID"

# Add description field (if not exists)
drush field:create taxonomy_term.offices.field_office_description \
  --field-type=string_long \
  --field-label="Office Description"
```

### Step 3: Create Feed Type in Drupal UI

1. **Go to**: `Structure → Feeds → Feed types → Add feed type`

2. **Basic Settings:**
   - Label: `Office Import from SQL Server`
   - Description: `Imports office data from SQL Server API`
   - Click "Save and add mappings"

### Step 4: Configure Fetcher

1. Click "Edit" on the "Fetcher" section
2. Select: **HTTP Fetcher**
3. Configure:
   - **Default feed source**: `http://localhost:3001/api/offices`
   - **Request method**: GET
   - **Timeout**: 30 seconds
4. Click "Save"

### Step 5: Configure Parser

1. Click "Edit" on the "Parser" section
2. Select: **JSON Parser** (from feeds_ex module)
3. Configure:
   - **Context**: `$.data.*`
     - This tells Feeds to look inside the "data" array
   - **Display errors**: Check this for debugging
4. Click "Save"

### Step 6: Configure Processor

1. Click "Edit" on the "Processor" section
2. Select: **Taxonomy term**
3. Configure:
   - **Vocabulary**: Select "offices"
   - **Update existing terms**: **Replace existing terms**
   - **Skip hash check**: Uncheck (to detect changes)
   - **Authorize**: Check if needed
4. Click "Save"

### Step 7: Configure Mappings

Click "Add mapping" for each field:

| # | Source Field | Target Field | Unique | Notes |
|---|--------------|--------------|--------|-------|
| 1 | `intOfficeID` | **Term ID** | ✅ | Primary unique identifier |
| 2 | `strOfficeName` | **Name** | | Term name (required) |
| 3 | `OfficeCode` | **field_office_code** | | Office code |
| 4 | `intOfficeID` | **field_office_id** | | SQL Server ID for reference |
| 5 | `strOfficeDescription` | **field_office_description** | | Description |

**For each mapping:**
1. Click "Add mapping"
2. In "Source" dropdown: Select the JSON field (e.g., `intOfficeID`)
3. In "Target" dropdown: Select the Drupal field
4. Check "Unique" for `intOfficeID` mapping to Term ID
5. Click "Save"

**Important Mapping Details:**

**Mapping 1 - Unique Identifier:**
- Source: `intOfficeID`
- Target: `Term ID`
- ✅ Check "Unique target"
- This prevents duplicates and enables updates

**Mapping 2 - Office Name:**
- Source: `strOfficeName`
- Target: `Name`
- This is the taxonomy term name (required)

**Mapping 3 - Office Code:**
- Source: `OfficeCode`
- Target: `field_office_code`
- Custom field we created

### Step 8: Set Import Schedule

1. Go back to the feed type page
2. Click "Edit" next to "Periodic import"
3. Set import frequency:
   - **As often as possible** (runs on every cron)
   - **Every 1 hour**
   - **Every 6 hours**
   - **Every 1 day** (recommended for reference data)
4. Click "Save"

### Step 9: Create and Run Feed

1. Go to: `Content → Feeds → Add feed`
2. Select: "Office Import from SQL Server"
3. **Title**: "Offices SQL Import"
4. **URL**: Should be pre-filled with `http://localhost:3001/api/offices`
5. Click "Save"
6. Click "Import" button
7. Watch the import process

**Expected Result:**
```
Created 5 Offices.
Updated 0 Offices.
Failed importing 0 Offices.
```

### Step 10: Verify Import

Check if offices were imported:

```bash
ddev ssh
drush php:eval "
  \$terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties(['vid' => 'offices']);
  foreach (\$terms as \$term) {
    echo \$term->id() . ': ' . \$term->getName() . ' (Code: ' . \$term->get('field_office_code')->value . ')' . PHP_EOL;
  }
"
```

Or visit: `Structure → Taxonomy → Offices → List terms`

### Step 11: Access via JSON:API

Test the imported data:

```bash
curl https://ims-drupal-headless.ddev.site/jsonapi/taxonomy_term/offices
```

In your React app:
```typescript
// In your service file
async getOffices() {
  const response = await axios.get(
    `${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/offices`
  );
  return response.data.data.map((term: any) => ({
    id: term.id,
    name: term.attributes.name,
    officeCode: term.attributes.field_office_code,
    officeId: term.attributes.field_office_id
  }));
}
```

## Troubleshooting

### Issue 1: "Cannot reach URL"
**Solution:** Ensure SQL API is running and accessible from Drupal container:
```bash
ddev ssh
curl http://host.docker.internal:3001/api/offices
```
If fails, use `host.docker.internal` instead of `localhost` in feed URL.

### Issue 2: "No items to import"
**Solution:** Check JSON Parser context:
- If API returns `{ data: [...] }`, use context: `$.data.*`
- If API returns `[...]` directly, use context: `$.*`

### Issue 3: "Mapping target not found"
**Solution:** Ensure custom fields are created:
```bash
drush field:list taxonomy_term:offices
```

### Issue 4: Duplicates being created
**Solution:** 
- Ensure "Term ID" is mapped with "Unique target" checked
- Or use "Name" as unique target if IDs conflict

### Issue 5: Import shows no changes
**Solution:**
- Uncheck "Skip hash check" in processor settings
- Or manually delete terms and re-import

## Automatic Updates

Feeds will automatically:
- ✅ Update existing offices when data changes in SQL Server
- ✅ Add new offices when added in SQL Server
- ⚠️ NOT delete offices removed from SQL Server (by default)

To enable deletion of removed items:
1. Edit processor settings
2. Enable "Delete non-existent items"

## Manual Import via Drush

Run import manually:
```bash
ddev ssh
# Import specific feed
drush feeds:import office_import_from_sql_server

# Import all feeds
drush feeds:import-all
```

## Next Steps

1. ✅ Set up Wings import (similar process with `/api/wings`)
2. ✅ Set up DECs import (similar process with `/api/dec-mst`)
3. Add entity reference fields to content types
4. Update React forms to load taxonomy data

## JSON Parser Context Cheat Sheet

For your API structure `{ success: true, data: [...] }`:

- **Context for array items**: `$.data.*`
- **Each item field**: Just use the field name (e.g., `intOfficeID`)

### Example Context Mapping:

```
API Response:
{
  "success": true,
  "data": [
    { "intOfficeID": 583, "strOfficeName": "ECP" }
  ]
}

Parser Context: $.data.*
Source Fields: intOfficeID, strOfficeName
```

## Summary

✅ **What you did:**
1. Created "offices" taxonomy vocabulary
2. Added custom fields for office_code and office_id
3. Created feed type with HTTP Fetcher + JSON Parser
4. Mapped JSON fields to taxonomy fields
5. Set unique identifier to prevent duplicates
6. Configured automatic import schedule
7. Ran first import successfully

✅ **What happens now:**
- Offices automatically sync from SQL Server every day (or your chosen schedule)
- Updates happen automatically
- Data available via JSON:API for your React app
- No custom sync code needed!

