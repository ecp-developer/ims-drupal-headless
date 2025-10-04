# Step-by-Step Guide: Create Wings and DECs Feeds

## ✅ Prerequisites Complete
- Wings taxonomy vocabulary: Created
- DECs taxonomy vocabulary: Created  
- All required fields: Created
- JSON data files: Ready at `/sites/default/files/sql-feeds/`

---

## 📝 Part 1: Create Wings Feed Type

### Step 1: Navigate to Feed Types
Go to: **Structure → Feeds → Feed types → Add feed type**

### Step 2: Basic Settings
- **Label:** `Wing Import from SQL Server`
- **Description:** `Imports 90 wings from SQL Server API with office references`
- Click **"Save and add mappings"**

### Step 3: Configure Fetcher
1. The fetcher should already be set to **"Download from url"**
2. Click **"Edit"** next to Fetcher
3. Leave it as **"Download from url"**
4. Click **"Save"**

### Step 4: Configure Parser
1. Click **"Edit"** next to Parser
2. Select: **"JSONPath"** (from the dropdown)
3. **Context:** Enter `$.data[*]`
4. **Display errors:** ✓ Check this box
5. Click **"Save"**

### Step 5: Configure Processor
1. Click **"Edit"** next to Processor
2. Select: **"Taxonomy term"**
3. **Vocabulary:** Select **"wings"**
4. **Update existing terms:** Select **"Replace existing terms"**
5. Click **"Save"**

### Step 6: Add Mappings

Click **"Add mapping"** for each of these:

#### Mapping 1: Wing Name
- **Source:** `Name`
- **Target:** `Name`
- **Unique target:** ✅ **Check this box**
- Click **"Save"**

#### Mapping 2: Wing ID
- **Source:** `Id`
- **Target:** `field_wing_id`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 3: Wing Code
- **Source:** `WingCode`
- **Target:** `field_wing_code`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 4: Short Name
- **Source:** `ShortName`
- **Target:** `field_wing_short_name`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 5: HOD Name
- **Source:** `HODName`
- **Target:** `field_hod_name`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 6: Focal Person
- **Source:** `FocalPerson`
- **Target:** `field_focal_person`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 7: Contact Number
- **Source:** `ContactNo`
- **Target:** `field_contact_no`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 8: Office Reference (⚠️ Skip for now)
**Note:** We'll add office references later using a script because entity reference mapping requires additional configuration.

### Step 7: Save Feed Type
Click **"Save"** at the bottom of the page.

---

## 📝 Part 2: Create DECs Feed Type

### Step 1: Navigate to Feed Types
Go to: **Structure → Feeds → Feed types → Add feed type**

### Step 2: Basic Settings
- **Label:** `DEC Import from SQL Server`
- **Description:** `Imports 336 DECs from SQL Server API with wing references`
- Click **"Save and add mappings"**

### Step 3: Configure Fetcher
1. Keep **"Download from url"**
2. Click **"Save"**

### Step 4: Configure Parser
1. Click **"Edit"** next to Parser
2. Select: **"JSONPath"**
3. **Context:** Enter `$.data[*]`
4. **Display errors:** ✓ Check this box
5. Click **"Save"**

### Step 5: Configure Processor
1. Click **"Edit"** next to Processor
2. Select: **"Taxonomy term"**
3. **Vocabulary:** Select **"decs"**
4. **Update existing terms:** Select **"Replace existing terms"**
5. Click **"Save"**

### Step 6: Add Mappings

Click **"Add mapping"** for each of these:

#### Mapping 1: DEC Name
- **Source:** `DECName`
- **Target:** `Name`
- **Unique target:** ✅ **Check this box**
- Click **"Save"**

#### Mapping 2: DEC ID
- **Source:** `intAutoID`
- **Target:** `field_dec_id`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 3: DEC Code
- **Source:** `DECCode`
- **Target:** `field_dec_code`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 4: DEC Acronym
- **Source:** `DECAcronym`
- **Target:** `field_dec_acronym`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 5: DEC Address
- **Source:** `DECAddress`
- **Target:** `field_dec_address`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 6: Location
- **Source:** `Location`
- **Target:** `field_location`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 7: HOD Name
- **Source:** `HODName`
- **Target:** `field_hod_name`
- **Unique target:** Leave unchecked
- Click **"Save"**

#### Mapping 8: Wing Reference (⚠️ Skip for now)
**Note:** We'll add wing references later using a script.

### Step 7: Save Feed Type
Click **"Save"** at the bottom of the page.

---

## 📊 Part 3: Create Feed Instances and Import

### Step 1: Create Wings Feed Instance
1. Go to: **Content → Feeds → Add feed**
2. Select: **"Wing Import from SQL Server"**
3. **Title:** `Wings SQL Import`
4. **URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`
5. Click **"Save"**

### Step 2: Import Wings
1. You should see the feed page
2. Click **"Import"** button
3. Wait for it to process
4. **Expected result:** "Created 90 Offices items."

### Step 3: Create DECs Feed Instance
1. Go to: **Content → Feeds → Add feed**
2. Select: **"DEC Import from SQL Server"**
3. **Title:** `DECs SQL Import`
4. **URL:** `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`
5. Click **"Save"**

### Step 4: Import DECs
1. Click **"Import"** button
2. Wait for it to process
3. **Expected result:** "Created 336 Offices items."

---

## 🔗 Part 4: Add Hierarchical References (After Import)

After both Wings and DECs are imported, run this script to link them:

```bash
ddev ssh

# Link Wings to Offices
drush php:eval "
\$wings = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties(['vid' => 'wings']);
\$updated = 0;
foreach (\$wings as \$wing) {
  \$office_id = \$wing->get('field_wing_id')->value;
  // Note: The JSON has OfficeID field but we need to get it from source
  // We'll create a proper script for this
}
echo 'Linked \$updated wings to offices';
"
```

**Note:** The entity reference linking requires matching the OfficeID from JSON to the actual office term. We'll need to either:
1. Use Feeds Tamper module
2. Run a post-import script
3. Manually configure in Drupal UI

---

## ✅ Verification Checklist

After imports complete:

- [ ] Go to: **Structure → Taxonomy → Wings → List terms**
  - Should see 90 wings
  - Check one wing - should have all fields filled
  
- [ ] Go to: **Structure → Taxonomy → DECs → List terms**
  - Should see 336 DECs
  - Check one DEC - should have all fields filled

- [ ] Test JSON:API:
  ```bash
  curl https://ims-drupal-headless.ddev.site/jsonapi/taxonomy_term/wings
  curl https://ims-drupal-headless.ddev.site/jsonapi/taxonomy_term/decs
  ```

---

## 🔄 To Refresh Data

Whenever SQL Server data changes:

```bash
# 1. Fetch fresh data
cd ~/ims-drupal-headless
./fetch-sql-data.sh

# 2. Re-import in Drupal
# Go to Content → Feeds → Your feed → Import
```

---

## 📝 Summary of What You'll Do

1. ✅ Fields created (done by script)
2. Create Wings feed type with 7 mappings
3. Create DECs feed type with 7 mappings
4. Create feed instances with URLs
5. Import Wings (expect 90 records)
6. Import DECs (expect 336 records)
7. Verify data in taxonomy lists

**Total time:** ~10-15 minutes
