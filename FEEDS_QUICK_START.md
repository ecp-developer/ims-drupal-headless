# Quick Start: Feeds Setup for Offices Import

## Your API Structure

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "intOfficeID": 583,
      "strOfficeName": "ECP Secretariat",
      "OfficeCode": 100,
      "strOfficeDescription": "ECP Secretariat Office"
    }
  ]
}
```

## Quick Setup Commands

```bash
# 1. Create vocabulary (if not exists)
ddev ssh
drush vocabulary:create offices "Offices" "Office locations"

# 2. Add custom fields
drush field:create taxonomy_term.offices.field_office_code \
  --field-type=integer \
  --field-label="Office Code"

drush field:create taxonomy_term.offices.field_office_id \
  --field-type=integer \
  --field-label="Office ID"

exit
```

## Drupal UI Configuration

### 1. Create Feed Type
📍 `Structure → Feeds → Feed types → Add feed type`

**Basic Info:**
- Label: `Office Import from SQL Server`
- Click "Save and add mappings"

### 2. Configure Components

#### A. Fetcher Configuration
Click "Edit" on Fetcher section:
- ✅ Select: **HTTP Fetcher**
- URL: `http://localhost:3001/api/offices`
  - (If this doesn't work, use: `http://host.docker.internal:3001/api/offices`)
- Method: GET
- Save

#### B. Parser Configuration
Click "Edit" on Parser section:
- ✅ Select: **JSON Parser**
- Context: `$.data.*` ← This is important!
- Save

#### C. Processor Configuration
Click "Edit" on Processor section:
- ✅ Select: **Taxonomy term**
- Vocabulary: **offices**
- Update existing: **Replace existing terms** ✓
- Save

### 3. Add Mappings

Click "Add mapping" button 4 times for these mappings:

| Source (from API) | → | Target (Drupal) | Unique? |
|-------------------|---|-----------------|---------|
| `intOfficeID` | → | Term ID | ✅ YES |
| `strOfficeName` | → | Name | |
| `OfficeCode` | → | field_office_code | |
| `intOfficeID` | → | field_office_id | |

**⚠️ Important:** Make sure to check "Unique target" for the `intOfficeID → Term ID` mapping!

### 4. Set Schedule (Optional)
- Click "Edit" on "Periodic import"
- Choose frequency (e.g., "Every 1 day")
- Save

### 5. Create and Run Feed
📍 `Content → Feeds → Add feed`

- Select: "Office Import from SQL Server"
- Title: "Offices SQL Import"
- URL: Pre-filled
- Click "Save"
- Click "Import" button

**Expected Result:** ✅ "Created 5 Offices"

## Verify Import

### Option 1: Drupal UI
📍 `Structure → Taxonomy → Offices → List terms`

You should see:
- ECP Secretariat
- PEC Balochistan
- PEC Khyber Pakhtunkhwa
- PEC Punjab
- PEC Sindh

### Option 2: Drush Command
```bash
ddev ssh
drush taxonomy:term:list offices
```

### Option 3: JSON:API
```bash
curl https://ims-drupal-headless.ddev.site/jsonapi/taxonomy_term/offices | jq
```

## Common Issues & Fixes

### ❌ "Cannot reach URL"
**Fix:** Change URL from `localhost` to `host.docker.internal`
```
http://host.docker.internal:3001/api/offices
```

### ❌ "No items found"
**Fix:** Check JSON Parser context is set to: `$.data.*`

### ❌ "Field not found: field_office_code"
**Fix:** Run the drush field:create command again

### ❌ Duplicates being created
**Fix:** Ensure "Term ID" mapping has "Unique target" checked

## Next: Add to Content Type

Once offices are imported, add entity reference field:

```bash
ddev ssh
drush field:create node.item_master.field_office \
  --field-type=entity_reference \
  --field-label="Office" \
  --target-type=taxonomy_term \
  --settings-handler=default:taxonomy_term \
  --settings-handler_settings-target_bundles=offices
```

Then in your React form:
```typescript
const [offices, setOffices] = useState([]);

useEffect(() => {
  axios.get(`${DRUPAL_BASE_URL}/jsonapi/taxonomy_term/offices`)
    .then(res => setOffices(res.data.data));
}, []);

// In JSX
<select name="office">
  {offices.map(office => (
    <option key={office.id} value={office.id}>
      {office.attributes.name}
    </option>
  ))}
</select>
```

## Automation

Feeds will automatically run on cron. To trigger manually:

```bash
ddev ssh
drush cron  # Runs all scheduled imports
# OR
drush feeds:import office_import_from_sql_server  # Run specific feed
```

## Summary Checklist

- [ ] Create offices vocabulary
- [ ] Add custom fields (office_code, office_id)
- [ ] Create feed type
- [ ] Configure HTTP Fetcher with API URL
- [ ] Configure JSON Parser with context `$.data.*`
- [ ] Configure Taxonomy term processor
- [ ] Add 4 mappings (intOfficeID as unique)
- [ ] Create feed instance
- [ ] Run import
- [ ] Verify 5 offices imported
- [ ] Test JSON:API endpoint

Once working, repeat for `wings` and `decs`!
