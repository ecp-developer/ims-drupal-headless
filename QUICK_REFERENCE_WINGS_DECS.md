# Quick Reference: Wings & DECs Feed Mappings

## 🪽 Wings Feed Mappings

| # | Source (JSON) | → | Target (Drupal) | Unique? |
|---|---------------|---|-----------------|---------|
| 1 | `Name` | → | Name | ✅ |
| 2 | `Id` | → | field_wing_id | |
| 3 | `WingCode` | → | field_wing_code | |
| 4 | `ShortName` | → | field_wing_short_name | |
| 5 | `HODName` | → | field_hod_name | |
| 6 | `FocalPerson` | → | field_focal_person | |
| 7 | `ContactNo` | → | field_contact_no | |

**Feed URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`  
**Parser Context:** `$.data[*]`  
**Expected Records:** 90

---

## 🗳️ DECs Feed Mappings

| # | Source (JSON) | → | Target (Drupal) | Unique? |
|---|---------------|---|-----------------|---------|
| 1 | `DECName` | → | Name | ✅ |
| 2 | `intAutoID` | → | field_dec_id | |
| 3 | `DECCode` | → | field_dec_code | |
| 4 | `DECAcronym` | → | field_dec_acronym | |
| 5 | `DECAddress` | → | field_dec_address | |
| 6 | `Location` | → | field_location | |
| 7 | `HODName` | → | field_hod_name | |

**Feed URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`  
**Parser Context:** `$.data[*]`  
**Expected Records:** 336

---

## 🔧 Configuration Template

**For Both Feed Types:**
- **Fetcher:** Download from url
- **Parser:** JSONPath
- **Context:** `$.data[*]`
- **Processor:** Taxonomy term
- **Update existing:** Replace existing terms
- **Unique field:** Name (first mapping)

---

## ⚡ Quick Commands

```bash
# Refresh data from SQL Server
cd ~/ims-drupal-headless
./fetch-sql-data.sh

# Verify field creation
ddev ssh
drush field:list taxonomy_term:wings
drush field:list taxonomy_term:decs

# Manual import via drush
drush feeds:import wing_import_from_sql_server
drush feeds:import dec_import_from_sql_server
```

---

## ✅ Import Checklist

- [ ] Created Wings feed type
- [ ] Added 7 mappings for Wings
- [ ] Created Wings feed instance
- [ ] Imported Wings (90 records)
- [ ] Created DECs feed type
- [ ] Added 7 mappings for DECs
- [ ] Created DECs feed instance
- [ ] Imported DECs (336 records)
- [ ] Verified data in Structure → Taxonomy

---

## 🎯 Next: Use in Content Types

After import, add these references to your content types:

```bash
# Example: Add office/wing/dec references to item_master
ddev ssh

# Add office reference
drush field:create node.item_master.field_office \
  --field-type=entity_reference \
  --field-label="Office" \
  --target-type=taxonomy_term \
  --handler-settings-target_bundles=offices

# Add wing reference
drush field:create node.item_master.field_wing \
  --field-type=entity_reference \
  --field-label="Wing" \
  --target-type=taxonomy_term \
  --handler-settings-target_bundles=wings

# Add DEC reference
drush field:create node.item_master.field_dec \
  --field-type=entity_reference \
  --field-label="DEC" \
  --target-type=taxonomy_term \
  --handler-settings-target_bundles=decs
```

Then update your React forms to load and display these options!
