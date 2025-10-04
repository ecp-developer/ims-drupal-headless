# Feeds Import Checklist

## Prerequisites ✅
- [x] Feeds module installed
- [x] feeds_ex module installed (JSONPath parser)
- [x] Offices taxonomy created with fields
- [x] Wings taxonomy created with fields
- [x] DECs taxonomy created with fields
- [x] Docker API running persistently
- [x] JSON data files fetched (90 Wings, 336 DECs)

## Import Progress

### 1. Offices (COMPLETED ✅)
- [x] Feed type created: "Office Import from SQL Server"
- [x] 5 offices imported successfully
- [x] Data verified in taxonomy

### 2. Wings (TODO 📝)
Follow: `WINGS_FEED_SETUP.md`

- [ ] Create feed type: "Wing Import from SQL Server"
- [ ] Configure HTTP Fetcher
- [ ] Configure JSONPath Parser (context: `$.data[*]`)
- [ ] Set processor to Wings vocabulary
- [ ] Add 7 mappings (Name as unique)
- [ ] Create feed with URL: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`
- [ ] Run import (expect 90 terms)
- [ ] Verify data in taxonomy

### 3. DECs (TODO 📝)
Follow: `DECS_FEED_SETUP.md`

- [ ] Create feed type: "DEC Import from SQL Server"
- [ ] Configure HTTP Fetcher
- [ ] Configure JSONPath Parser (context: `$.data[*]`)
- [ ] Set processor to DECs vocabulary
- [ ] Add 7 mappings (DECName as unique)
- [ ] Create feed with URL: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`
- [ ] Run import (expect 336 terms)
- [ ] Verify data in taxonomy

## Data Sources

### Local JSON Files (Ready to Use)
- Offices: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/offices.json`
- Wings: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/wings.json`
- DECs: `https://ims-drupal-headless.ddev.site/sites/default/files/sql-feeds/decs.json`

### Docker API (Running Persistently)
- Health: `http://localhost:3001/api/health`
- Offices: `http://localhost:3001/api/offices`
- Wings: `http://localhost:3001/api/wings`
- DECs: `http://localhost:3001/api/dec-mst`

## Docker API Management

**Check Status:**
```bash
wsl docker ps | grep ims-sql-api
```

**View Logs:**
```bash
wsl docker logs ims-sql-api
```

**Stop API:**
```bash
cd /home/syedsana/ims-drupal-headless
wsl docker-compose -f docker-compose.api.yml stop
```

**Start API:**
```bash
cd /home/syedsana/ims-drupal-headless
wsl docker-compose -f docker-compose.api.yml start
```

**Restart API:**
```bash
cd /home/syedsana/ims-drupal-headless
wsl docker-compose -f docker-compose.api.yml restart
```

## Refresh Data from SQL Server

**Re-fetch all data:**
```bash
cd /home/syedsana/ims-drupal-headless
wsl bash fetch-sql-data.sh
```

This will:
1. Fetch latest data from SQL Server via Docker API
2. Filter duplicates automatically
3. Save to Drupal files directory
4. Show summary (Wings: 90 → X unique, DECs: 336 → X unique)

## Field Mappings Reference

### Wings Fields
| JSONPath | Target Field | Type |
|----------|-------------|------|
| Name | Name | Text (unique) |
| Id | field_wing_id | Integer |
| WingCode | field_wing_code | Text |
| ShortName | field_wing_short_name | Text |
| HODName | field_hod_name | Text |
| FocalPerson | field_focal_person | Text |
| ContactNo | field_contact_no | Text |

### DECs Fields
| JSONPath | Target Field | Type |
|----------|-------------|------|
| DECName | Name | Text (unique) |
| intAutoID | field_dec_id | Integer |
| DECCode | field_dec_code | Text |
| DECAcronym | field_dec_acronym | Text |
| DECAddress | field_dec_address | Text |
| Location | field_location | Text |
| HODName | field_hod_name | Text |

## Troubleshooting

### Import Fails
1. Check JSON file is accessible in browser
2. Verify JSONPath context is `$.data[*]`
3. Confirm field machine names match exactly
4. Check Drupal logs: Reports → Recent log messages

### Docker API Not Responding
```bash
# Check if container is running
wsl docker ps

# If not running, start it
cd /home/syedsana/ims-drupal-headless
wsl docker-compose -f docker-compose.api.yml up -d

# Check logs for errors
wsl docker logs ims-sql-api --tail 50
```

### SQL Server Connection Issues
- Verify SQL Server is running at 192.168.18.144:1433
- Check credentials in docker-compose.api.yml
- Test connection: `Test-NetConnection -ComputerName 192.168.18.144 -Port 1433`

## Next Steps After Import

1. **Add Hierarchical References**
   - Wings → Offices (via OfficeID)
   - DECs → Wings (via WingID)
   - Use Feeds Tamper or custom script

2. **Set Up Periodic Sync** (Optional)
   - Configure cron for automatic imports
   - Set import period in feed type settings

3. **Verify Complete Structure**
   - Test taxonomy hierarchy
   - Validate all relationships
   - Check data integrity

## Quick Links

- Drupal Site: https://ims-drupal-headless.ddev.site
- Feeds Admin: https://ims-drupal-headless.ddev.site/admin/structure/feeds
- Taxonomy Admin: https://ims-drupal-headless.ddev.site/admin/structure/taxonomy
- Wings Guide: `WINGS_FEED_SETUP.md`
- DECs Guide: `DECS_FEED_SETUP.md`
