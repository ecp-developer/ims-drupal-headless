# API Structure Analysis for Wings and DECs

## 📊 Offices API (Already Imported ✅)

**Endpoint:** `http://localhost:3001/api/offices`

**Key Fields:**
```json
{
  "intOfficeID": 583,
  "strOfficeName": "ECP Secretariat",
  "strOfficeDescription": "ECP Secretariat Office",
  "OfficeCode": 100,
  "IS_ACT": true
}
```

**Drupal Mapping:**
- `strOfficeName` → Name (taxonomy term name)
- `OfficeCode` → field_office_code
- `intOfficeID` → field_office_id

---

## 🪽 Wings API

**Endpoint:** `http://localhost:3001/api/wings`

**Structure:**
```json
{
  "success": true,
  "count": 90,
  "data": [
    {
      "Id": 5,
      "Name": "Law",
      "ShortName": "Law",
      "FocalPerson": "Tariq hussain",
      "ContactNo": "051-9203894",
      "OfficeID": 583,              ← Links to Offices
      "IS_ACT": true,
      "HODName": "Muhammad Arshad",
      "WingCode": 3180,
      "CreateDate": "2023-04-10T08:10:58.835Z",
      "UpdatedAt": "2025-07-02T13:54:34.120Z",
      "Version": 2
    }
  ]
}
```

**Total Records:** 90 wings

**Key Fields:**
- `Id` - Wing's unique ID (integer)
- `Name` - Wing name (string) - **Use as taxonomy term name**
- `ShortName` - Abbreviated name
- `WingCode` - Wing code (integer)
- `OfficeID` - Reference to parent Office (integer) ⚠️ **Important for hierarchy**
- `HODName` - Head of Department name
- `FocalPerson` - Contact person
- `ContactNo` - Phone number
- `IS_ACT` - Active status (boolean)

**Drupal Feed Mappings:**
| Source Field | Target Field | Type | Unique | Notes |
|-------------|--------------|------|--------|-------|
| `Name` | Name | String | ✅ | Term name |
| `Id` | field_wing_id | Integer | | SQL Server ID |
| `WingCode` | field_wing_code | Integer | | Wing code |
| `ShortName` | field_wing_short_name | String | | Optional |
| `HODName` | field_hod_name | String | | Optional |
| `FocalPerson` | field_focal_person | String | | Optional |
| `ContactNo` | field_contact_no | String | | Optional |
| `OfficeID` | field_office_ref | Entity Ref | | References offices taxonomy |

---

## 🗳️ DECs API

**Endpoint:** `http://localhost:3001/api/dec-mst`

**Structure:**
```json
{
  "success": true,
  "count": 336,
  "data": [
    {
      "intAutoID": 4,
      "WingID": 134,                ← Links to Wings
      "DECName": "DEC Bannu",
      "DECAcronym": "DEC Bannu",
      "DECAddress": "Some Address",
      "Location": "Some Location",
      "IS_ACT": true,
      "DECCode": 7041,
      "HODName": "Saeed Akhtar",
      "DateAdded": "2024-10-02T12:43:46.387Z",
      "Version": 1
    }
  ]
}
```

**Total Records:** 336 DECs

**Key Fields:**
- `intAutoID` - DEC's unique ID (integer)
- `DECName` - DEC name (string) - **Use as taxonomy term name**
- `DECAcronym` - Acronym/short name
- `DECCode` - DEC code (integer)
- `WingID` - Reference to parent Wing (integer) ⚠️ **Important for hierarchy**
- `DECAddress` - Physical address
- `Location` - Location details
- `HODName` - Head of Department
- `IS_ACT` - Active status (boolean)

**Drupal Feed Mappings:**
| Source Field | Target Field | Type | Unique | Notes |
|-------------|--------------|------|--------|-------|
| `DECName` | Name | String | ✅ | Term name |
| `intAutoID` | field_dec_id | Integer | | SQL Server ID |
| `DECCode` | field_dec_code | Integer | | DEC code |
| `DECAcronym` | field_dec_acronym | String | | Optional |
| `DECAddress` | field_dec_address | String | | Optional |
| `Location` | field_location | String | | Optional |
| `HODName` | field_hod_name | String | | Optional |
| `WingID` | field_wing_ref | Entity Ref | | References wings taxonomy |

---

## 🔗 Hierarchical Relationship

```
Offices (5 records)
    ├─ Office ID: 583 (ECP Secretariat)
    │   └─ Wings (OfficeID: 583)
    │       ├─ Wing ID: 5 (Law)
    │       ├─ Wing ID: 6 (IT Wing)
    │       │   └─ DECs (WingID: 6)
    │       │       ├─ DEC ID: 4 (DEC Bannu)
    │       │       └─ DEC ID: 5 (DEC Lakki Marwat)
    │       └─ Wing ID: 134
    │           └─ DECs (WingID: 134)
    ├─ Office ID: 584 (PEC Balochistan)
    ├─ Office ID: 585 (PEC Khyber Pakhtunkhwa)
    ├─ Office ID: 586 (PEC Punjab)
    └─ Office ID: 587 (PEC Sindh)
```

---

## 📋 Required Drupal Fields

### For Wings Taxonomy (vocabulary: wings)

**Already Created:**
- ✅ field_wing_id (Integer)
- ✅ field_wing_code (Integer)

**To Create:**
```bash
drush php:eval "\$fields = [
  ['field_wing_short_name', 'string', 'Short Name'],
  ['field_hod_name', 'string', 'HOD Name'],
  ['field_focal_person', 'string', 'Focal Person'],
  ['field_contact_no', 'string', 'Contact Number'],
];
foreach (\$fields as \$f) {
  \$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => \$f[0], 'entity_type' => 'taxonomy_term', 'type' => \$f[1]]);
  \$storage->save();
  \$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'wings', 'label' => \$f[2]]);
  \$field->save();
  echo 'Created ' . \$f[0] . PHP_EOL;
}"
```

**Entity Reference (Already shown how to create):**
- field_office_ref (Entity Reference → taxonomy_term → offices)

### For DECs Taxonomy (vocabulary: decs)

**Already Created:**
- ✅ field_dec_id (Integer)
- ✅ field_dec_code (Integer)

**To Create:**
```bash
drush php:eval "\$fields = [
  ['field_dec_acronym', 'string', 'DEC Acronym'],
  ['field_dec_address', 'string_long', 'DEC Address'],
  ['field_location', 'string', 'Location'],
  ['field_hod_name', 'string', 'HOD Name'],
];
foreach (\$fields as \$f) {
  \$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => \$f[0], 'entity_type' => 'taxonomy_term', 'type' => \$f[1]]);
  \$storage->save();
  \$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'decs', 'label' => \$f[2]]);
  \$field->save();
  echo 'Created ' . \$f[0] . PHP_EOL;
}"
```

**Entity Reference (Already shown how to create):**
- field_wing_ref (Entity Reference → taxonomy_term → wings)

---

## 🚀 Quick Setup Commands

### Step 1: Create All Fields for Wings
```bash
ddev ssh

# Basic fields
drush php:eval "\$fields = [['field_wing_short_name', 'string', 'Short Name'], ['field_hod_name', 'string', 'HOD Name'], ['field_focal_person', 'string', 'Focal Person'], ['field_contact_no', 'string', 'Contact Number']]; foreach (\$fields as \$f) { \$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => \$f[0], 'entity_type' => 'taxonomy_term', 'type' => \$f[1]]); \$storage->save(); \$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'wings', 'label' => \$f[2]]); \$field->save(); echo 'Created ' . \$f[0] . PHP_EOL; }"

# Office reference
drush php:eval "\$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => 'field_office_ref', 'entity_type' => 'taxonomy_term', 'type' => 'entity_reference', 'settings' => ['target_type' => 'taxonomy_term']]); \$storage->save(); \$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'wings', 'label' => 'Office', 'settings' => ['handler' => 'default:taxonomy_term', 'handler_settings' => ['target_bundles' => ['offices' => 'offices']]]]); \$field->save(); echo 'Created field_office_ref';"
```

### Step 2: Create All Fields for DECs
```bash
# Basic fields
drush php:eval "\$fields = [['field_dec_acronym', 'string', 'DEC Acronym'], ['field_dec_address', 'string_long', 'DEC Address'], ['field_location', 'string', 'Location'], ['field_hod_name', 'string', 'HOD Name']]; foreach (\$fields as \$f) { \$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => \$f[0], 'entity_type' => 'taxonomy_term', 'type' => \$f[1]]); \$storage->save(); \$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'decs', 'label' => \$f[2]]); \$field->save(); echo 'Created ' . \$f[0] . PHP_EOL; }"

# Wing reference
drush php:eval "\$storage = \Drupal\field\Entity\FieldStorageConfig::create(['field_name' => 'field_wing_ref', 'entity_type' => 'taxonomy_term', 'type' => 'entity_reference', 'settings' => ['target_type' => 'taxonomy_term']]); \$storage->save(); \$field = \Drupal\field\Entity\FieldConfig::create(['field_storage' => \$storage, 'bundle' => 'decs', 'label' => 'Wing', 'settings' => ['handler' => 'default:taxonomy_term', 'handler_settings' => ['target_bundles' => ['wings' => 'wings']]]]); \$field->save(); echo 'Created field_wing_ref';"
```

---

## 📝 Feed Configuration Summary

### Wings Feed
- **URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`
- **Context:** `$.data[*]`
- **Records:** 90
- **Unique Field:** Name
- **Parent Reference:** OfficeID → field_office_ref

### DECs Feed
- **URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`
- **Context:** `$.data[*]`
- **Records:** 336
- **Unique Field:** DECName → Name
- **Parent Reference:** WingID → field_wing_ref

---

## ✅ Next Actions

1. Run the field creation commands above
2. Create Wings feed type in Drupal UI
3. Create DECs feed type in Drupal UI
4. Import Wings (should import 90 records)
5. Import DECs (should import 336 records)
6. Verify hierarchy works via JSON:API
