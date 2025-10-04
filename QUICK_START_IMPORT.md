# Quick Start: Import Wings & DECs

## 🚀 Ready to Import!

Your data is ready:
- ✅ Wings: 90 records at `wings.json`
- ✅ DECs: 336 records at `decs.json`
- ✅ Docker API running persistently
- ✅ All fields created

## 📋 Wings Import (5 minutes)

1. **Create Feed Type**: https://ims-drupal-headless.ddev.site/admin/structure/feeds/add
   - Name: `Wing Import from SQL Server`
   - Fetcher: HTTP Fetcher
   - Parser: JSONPath (context: `$.data[*]`)
   - Processor: Taxonomy term → Wings

2. **Add 7 Mappings**:
   ```
   Name → Name (✓ Unique)
   Id → field_wing_id
   WingCode → field_wing_code
   ShortName → field_wing_short_name
   HODName → field_hod_name
   FocalPerson → field_focal_person
   ContactNo → field_contact_no
   ```

3. **Import**: Content → Feeds → Add Wing Import
   - URL: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`
   - Click Import → Wait for 90 terms

## 📋 DECs Import (5 minutes)

1. **Create Feed Type**: Same process as Wings
   - Name: `DEC Import from SQL Server`
   - Parser context: `$.data[*]`
   - Processor: Taxonomy term → DECs

2. **Add 7 Mappings**:
   ```
   DECName → Name (✓ Unique)
   intAutoID → field_dec_id
   DECCode → field_dec_code
   DECAcronym → field_dec_acronym
   DECAddress → field_dec_address
   Location → field_location
   HODName → field_hod_name
   ```

3. **Import**: Content → Feeds → Add DEC Import
   - URL: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`
   - Click Import → Wait for 336 terms

## 🔄 Update Data Anytime

```bash
cd /home/syedsana/ims-drupal-headless
wsl bash fetch-sql-data.sh
```

Then go to your feeds and click "Import" again to update!

## ⚙️ Manage Docker API

```bash
# View status
wsl docker ps | grep ims-sql-api

# View logs
wsl docker logs ims-sql-api

# Restart if needed
cd /home/syedsana/ims-drupal-headless
wsl docker-compose -f docker-compose.api.yml restart
```

## 📚 Full Guides

- Detailed Wings setup: `WINGS_FEED_SETUP.md`
- Detailed DECs setup: `DECS_FEED_SETUP.md`
- Complete checklist: `FEEDS_IMPORT_CHECKLIST.md`

## ✨ That's it!

Once imported, you'll have:
- 5 Offices
- 90 Wings
- 336 DECs

All synced from SQL Server! 🎉
