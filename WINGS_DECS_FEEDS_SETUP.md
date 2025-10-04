# Wings and DECs Feed Setup Guide with Hierarchical Relationships

## Data Structure:
- **Offices** (root level) - Already imported ✅
- **Wings** → References Office (via OfficeID)
- **DECs** → References Wing (via WingID)

## Step 1: Create Reference Fields

Run these commands in the Drupal container:

```bash
ddev ssh

# Create Office reference field for Wings
drush php:eval "
\$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => 'field_office_ref', 'entity_type' => 'taxonomy_term', 'type' => 'entity_reference', 'settings' => ['target_type' => 'taxonomy_term']]);
\$storage->save();
\$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'wings', 'label' => 'Office', 'settings' => ['handler' => 'default:taxonomy_term', 'handler_settings' => ['target_bundles' => ['offices' => 'offices']]]]);
\$field->save();
echo 'Created field_office_ref';
"

# Create Wing reference field for DECs
drush php:eval "
\$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => 'field_wing_ref', 'entity_type' => 'taxonomy_term', 'type' => 'entity_reference', 'settings' => ['target_type' => 'taxonomy_term']]);
\$storage->save();
\$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'decs', 'label' => 'Wing', 'settings' => ['handler' => 'default:taxonomy_term', 'handler_settings' => ['target_bundles' => ['wings' => 'wings']]]]);
\$field->save();
echo 'Created field_wing_ref';
"

exit
```

## Step 2: Create Feed Type for Wings

### A. Basic Configuration

**Go to:** Structure → Feeds → Feed types → Add feed type

**Feed Type Settings:**
- **Label:** `Wing Import from SQL Server`
- **Description:** `Imports wing data from SQL Server API with office references`
- Click "Save and add mappings"

### B. Configure Fetcher
- **Fetcher:** Download from url
- **URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`

### C. Configure Parser
- **Parser:** JSONPath
- **Context:** `$.data[*]`
- **Display errors:** ✓ Check (for debugging)

### D. Configure Processor
- **Processor:** Taxonomy term
- **Vocabulary:** wings
- **Update existing terms:** Replace existing terms
- **Authorize:** Check if needed

### E. Configure Mappings

**Important:** We need to reference offices by their Office ID. To do this, we'll use a Tamper plugin or map by the Office ID field.

| Source | Target | Unique | Configuration |
|--------|--------|--------|---------------|
| `Id` | field_wing_id | | Wing's internal ID |
| `WingCode` | field_wing_code | | Wing code |
| `Name` | Name | ✅ | Wing name (unique) |
| `OfficeID` | field_office_ref | | **See Note Below** |

**⚠️ IMPORTANT NOTE for OfficeID Mapping:**

The `field_office_ref` is an entity reference field. To map `OfficeID` from JSON to this field, you need to:

**Option 1: Use Entity Lookup Plugin (Recommended)**
1. After adding the mapping `OfficeID` → `field_office_ref`
2. Click "Configure" on that mapping
3. Look for "Reference by" or similar setting
4. Set it to reference by: `field_office_id` (the field we created on offices taxonomy)
5. This will match the JSON's OfficeID (583) with the Office term that has field_office_id = 583

**Option 2: If Entity Lookup Not Available**
You may need to install the Feeds Tamper module:
```bash
ddev ssh
composer require drupal/feeds_tamper
drush en feeds_tamper -y
```

Then configure a tamper plugin to convert OfficeID to the term ID.

**Option 3: Manual Pre-processing (Simplest for now)**
Import wings without the office reference first, then add references later manually or via a custom script.

### Wings JSON Data Sample:
```json
{
  "Id": 5,
  "Name": "Law",
  "WingCode": 3180,
  "OfficeID": 583  ← References Office term
}
```

## Step 3: Create Feed Type for DECs

### A. Basic Configuration

**Go to:** Structure → Feeds → Feed types → Add feed type

**Feed Type Settings:**
- **Label:** `DEC Import from SQL Server`
- **Description:** `Imports DEC data from SQL Server API with wing references`
- Click "Save and add mappings"

### B. Configure Fetcher
- **Fetcher:** Download from url
- **URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`

### C. Configure Parser
- **Parser:** JSONPath
- **Context:** `$.data[*]`
- **Display errors:** ✓ Check

### D. Configure Processor
- **Processor:** Taxonomy term
- **Vocabulary:** decs
- **Update existing terms:** Replace existing terms

### E. Configure Mappings

| Source | Target | Unique | Notes |
|--------|--------|--------|-------|
| `intAutoID` | field_dec_id | | DEC's internal ID |
| `DECCode` | field_dec_code | | DEC code |
| `DECName` | Name | ✅ | DEC name (unique) |
| `WingID` | field_wing_ref | | **See Note Below** |

**⚠️ IMPORTANT NOTE for WingID Mapping:**

Same as Wings, you need to reference by the wing's ID field:
1. Map `WingID` → `field_wing_ref`
2. Configure to reference by: `field_wing_id`
3. This will match JSON's WingID (134) with Wing term that has field_wing_id = 134

### DECs JSON Data Sample:
```json
{
  "intAutoID": 4,
  "WingID": 134,  ← References Wing term
  "DECName": "DEC Bannu",
  "DECCode": 7041
}
```

## Step 4: Import Order (Important!)

Import in this order due to dependencies:

1. ✅ **Offices** (already done)
2. **Wings** (depends on Offices)
3. **DECs** (depends on Wings)

```bash
# Refresh data first
cd ~/ims-drupal-headless
./fetch-sql-data.sh
```

Then in Drupal:
1. **Content → Feeds → Wing Import → Import**
2. **Content → Feeds → DEC Import → Import**

## Step 5: Verify Relationships

Check if relationships work:

```bash
ddev ssh
drush php:eval "
  \$wings = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties(['vid' => 'wings']);
  foreach (\$wings as \$wing) {
    \$office = \$wing->get('field_office_ref')->entity;
    echo \$wing->getName() . ' → Office: ' . (\$office ? \$office->getName() : 'None') . PHP_EOL;
  }
"
```

## Troubleshooting Entity References

### Issue: OfficeID/WingID not linking properly

**Solution 1: Install Feeds Tamper**
```bash
composer require drupal/feeds_tamper
drush en feeds_tamper -y
```

Then add a "Find entity by property" tamper:
- Field: OfficeID
- Entity type: taxonomy_term
- Bundle: offices
- Property: field_office_id
- Value: OfficeID

**Solution 2: Use a Custom Module**

Create a custom feeds mapper that handles the lookup.

**Solution 3: Import Without References First**

1. Import Wings without OfficeID mapping
2. Import DECs without WingID mapping
3. Run a custom script afterward to add relationships:

```bash
drush php:eval "
  // Link Wings to Offices
  \$wings = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties(['vid' => 'wings']);
  foreach (\$wings as \$wing) {
    \$office_id = \$wing->get('field_wing_id')->value; // Assuming you stored OfficeID here temporarily
    \$offices = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'offices',
      'field_office_id' => \$office_id
    ]);
    if (\$office = reset(\$offices)) {
      \$wing->set('field_office_ref', \$office->id());
      \$wing->save();
    }
  }
"
```

## Summary Checklist

- [ ] Create field_office_ref on wings taxonomy
- [ ] Create field_wing_ref on decs taxonomy
- [ ] Create Wing Import feed type
- [ ] Configure JSONPath parser with context $.data[*]
- [ ] Add mappings for Wings (Name, WingCode, OfficeID)
- [ ] Configure entity reference mapping for OfficeID
- [ ] Create DEC Import feed type
- [ ] Add mappings for DECs (DECName, DECCode, WingID)
- [ ] Configure entity reference mapping for WingID
- [ ] Run fetch-sql-data.sh to refresh JSON files
- [ ] Import Wings
- [ ] Import DECs
- [ ] Verify relationships work

## Next Steps

Once imported, you can:
1. Use these taxonomies in content types with entity references
2. Query hierarchically (Office → Wings → DECs)
3. Display in forms as cascading dropdowns
4. Access via JSON:API with includes
