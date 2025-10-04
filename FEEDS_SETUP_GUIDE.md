# Feeds Module Setup Guide for SQL Server Data Import

## Overview
This guide shows how to use the Feeds module to import SQL Server data (offices, wings, decs) into Drupal taxonomies instead of using custom sync code.

## Prerequisites

1. SQL Server data exposed through REST API:
   - http://localhost:3001/api/offices-new
   - http://localhost:3001/api/wings
   - http://localhost:3001/api/dec-mst

2. Drupal taxonomies created:
   ```bash
   ddev ssh
   drush vocabulary:create offices "Offices" "Office locations"
   drush vocabulary:create wings "Wings" "Department wings"
   drush vocabulary:create decs "DECs" "District Election Commissioners"
   ```

## Step 1: Install Feeds Module

```bash
ddev ssh
composer require drupal/feeds
drush en feeds -y
```

**Required modules:**
- Feeds (feeds)
- Feeds JSON Parser (if importing JSON) or Feeds CSV Parser

For JSON API data:
```bash
composer require drupal/feeds_ex
drush en feeds_ex -y
```

## Step 2: Create Feed Types

Go to **Structure → Feeds → Feed types → Add feed type**

### Example: Import Offices from SQL Server

#### A. Basic Settings
- **Label**: "Office Import from SQL"
- **Description**: "Imports office data from SQL Server API"
- **Import period**: Every 1 hour (or as needed)

#### B. Configure Fetcher
1. Select **HTTP Fetcher**
2. URL: `http://localhost:3001/api/offices-new`
3. Method: GET
4. Headers (if needed for authentication)

#### C. Configure Parser
1. Select **JSON Parser** (from feeds_ex)
2. Context: `$.*` (if your API returns an array)
3. If API returns `{ data: [...] }`, use: `$.data.*`

Example JSON structure mapping:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Headquarter Office",
      "officeCode": "HQ001"
    }
  ]
}
```

#### D. Configure Processor
1. Select **Taxonomy term processor**
2. Target vocabulary: **offices**
3. Update existing items: **Update existing items**
4. Unique target: **Name** or **ID**

#### E. Configure Mappings

| Source (JSON Field) | Target (Drupal Field) | Unique |
|---------------------|----------------------|--------|
| `id` | Term ID | ✓ |
| `name` | Name | |
| `officeCode` | field_office_code* | |

*Note: Create custom field `field_office_code` if you want to store the code

## Step 3: Create Feed Types for Wings and DECs

Repeat Step 2 for:

### Wings Import
- **URL**: `http://localhost:3001/api/wings`
- **Vocabulary**: wings
- **Fields**: id, name, wingCode

### DECs Import
- **URL**: `http://localhost:3001/api/dec-mst`
- **Vocabulary**: decs
- **Fields**: id, name, decCode

## Step 4: Add Custom Fields (Optional)

If you want to store additional data like codes:

```bash
ddev ssh

# Add office code field
drush field:create taxonomy_term.offices.field_office_code \
  --field-type=string \
  --field-label="Office Code"

# Add wing code field
drush field:create taxonomy_term.wings.field_wing_code \
  --field-type=string \
  --field-label="Wing Code"

# Add dec code field
drush field:create taxonomy_term.decs.field_dec_code \
  --field-type=string \
  --field-label="DEC Code"
```

## Step 5: Run Manual Import

Go to **Content → Feeds → Add feed**

1. Select feed type: "Office Import from SQL"
2. Click "Import"
3. View import results

Repeat for Wings and DECs.

## Step 6: Schedule Automatic Imports

The feeds will run automatically based on the "Import period" configured in Step 2.

To run manually via cron:
```bash
ddev ssh
drush cron
```

## Step 7: Using Imported Data in Content Types

Once data is imported, add entity reference fields:

### Through Drupal UI:
1. **Structure → Content types → item_master → Manage fields**
2. **Add field → Reference → Taxonomy term**
3. Select vocabulary: **offices** / **wings** / **decs**
4. Configure widget (Select list, Autocomplete)

### Field Machine Names:
- `field_office` - References offices taxonomy
- `field_wing` - References wings taxonomy
- `field_dec` - References decs taxonomy

## Step 8: Access in Frontend

Your existing `itemMasterService.ts` can fetch these references through JSON:API:

```typescript
// Get item with office reference
const response = await axios.get(
  `${DRUPAL_BASE_URL}/jsonapi/node/item_master/${id}?include=field_office,field_wing,field_dec`
);

// Access referenced terms
const office = response.data.included?.find(
  item => item.type === 'taxonomy_term--offices'
);
```

## Comparison: Feeds vs Custom Sync

### Feeds Module Advantages:
✅ Built-in UI for configuration
✅ Automatic scheduling (cron)
✅ Update existing items (prevents duplicates)
✅ Delete orphaned items
✅ Import history and logging
✅ Rollback capability
✅ No custom code maintenance

### Custom Sync Advantages:
✅ Full control over sync logic
✅ Custom validation/transformation
✅ Real-time sync on demand
✅ Custom UI in your React app
✅ Can handle complex business logic

## Recommendation

**Use Feeds Module if:**
- You want automatic periodic imports
- Data structure is straightforward
- You want Drupal's built-in admin UI
- You need import history and rollback

**Use Custom Sync if:**
- You need real-time sync triggered by users
- Complex data transformation required
- Want integrated UI in your React frontend
- Need fine-grained control over sync process

## Hybrid Approach

You can also use **both**:
1. **Feeds Module**: For automatic scheduled imports
2. **Custom Sync Tool**: For manual on-demand sync from React UI

This gives you the best of both worlds - automatic updates plus manual control when needed.

## Troubleshooting

### Issue: API returns empty array
- Check API endpoint is accessible from Drupal container
- Verify JSON structure matches parser context

### Issue: Duplicates created
- Ensure "Update existing items" is enabled
- Set correct unique identifier field (usually ID or Name)

### Issue: Fields not mapping
- Verify field machine names in Drupal
- Check JSON path in parser configuration

### Issue: Import fails silently
- Check Drupal logs: **Reports → Recent log messages**
- Enable Feeds debug mode in settings.php:
  ```php
  $config['feeds.settings']['debug'] = TRUE;
  ```

## Next Steps

1. Install Feeds module: `composer require drupal/feeds drupal/feeds_ex`
2. Create feed types for offices, wings, decs
3. Run test imports
4. Configure automatic scheduling
5. Add entity reference fields to content types
6. Update frontend forms to load taxonomy data

## Resources

- Feeds Module: https://www.drupal.org/project/feeds
- Feeds Extensible Parsers: https://www.drupal.org/project/feeds_ex
- Documentation: https://www.drupal.org/docs/contributed-modules/feeds
