# SQL Views Setup Guide

## Problem
The WingsInformation table has duplicate Wing entries because it stores employee-to-wing relationships. Each row represents an employee assigned to a wing, causing the same Wing information to repeat multiple times.

## Solution
Create SQL Server views that return only unique Wings and DECs by grouping on the identifying fields.

## Step 1: Create Wings View

Run this SQL in SQL Server Management Studio (SSMS) or Azure Data Studio:

```sql
CREATE VIEW vw_UniqueWings AS
SELECT 
    MIN(Id) as Id,                    -- Take first ID
    Name,
    WingCode,
    ShortName,
    MAX(HODName) as HODName,          -- Take latest HOD name
    MAX(FocalPerson) as FocalPerson,  -- Take focal person
    MAX(ContactNo) as ContactNo,      -- Take contact number
    OfficeID,
    MAX(IS_ACT) as IS_ACT,
    MAX(ModifyDate) as ModifyDate     -- Track last modification
FROM WingsInformation
WHERE IS_ACT = 1                      -- Only active wings
GROUP BY Name, WingCode, ShortName, OfficeID;
GO
```

**Test the view:**
```sql
SELECT * FROM vw_UniqueWings ORDER BY Name;
SELECT COUNT(*) as UniqueWings FROM vw_UniqueWings;
```

## Step 2: Create DECs View

```sql
CREATE VIEW vw_UniqueDECs AS
SELECT 
    intAutoID,
    DECName,
    DECCode,
    DECAcronym,
    DECAddress,
    Location,
    HODName,
    WingID,
    IS_ACT,
    ModifyDate
FROM DEC_MST
WHERE IS_ACT = 1;                     -- Only active DECs
GO
```

**Test the view:**
```sql
SELECT * FROM vw_UniqueDECs ORDER BY DECName;
SELECT COUNT(*) as UniqueDECs FROM vw_UniqueDECs;
```

## Step 3: Update API Routes (Already Done ✅)

The API routes have been updated to use the views:
- `wings.js` now queries `vw_UniqueWings`
- `dec-mst.js` now queries `vw_UniqueDECs`

## Step 4: Rebuild Docker Container

After creating the views, rebuild the Docker container to pick up the route changes:

```bash
cd /home/syedsana/ims-drupal-headless
docker-compose -f docker-compose.api.yml down
docker-compose -f docker-compose.api.yml up -d --build
```

## Step 5: Fetch Fresh Data

```bash
cd /home/syedsana/ims-drupal-headless
bash fetch-sql-data.sh
```

You should now see:
- **Fewer Wings** (only unique ones, not 90)
- **Unique DECs** (336 or fewer)

## Expected Results

### Before (with duplicates):
```
Wings: 90 records (includes duplicates like multiple "Admin" entries)
DECs: 336 records
```

### After (unique only):
```
Wings: ~30-50 unique records (actual unique wings)
DECs: 336 records (or fewer if there were duplicates)
```

## Verify the Views

### Check for Wing Duplicates Before View:
```sql
SELECT Name, COUNT(*) as Count
FROM WingsInformation
WHERE IS_ACT = 1
GROUP BY Name
HAVING COUNT(*) > 1
ORDER BY Count DESC;
```

### Check View Returns Unique Wings:
```sql
SELECT Name, COUNT(*) as Count
FROM vw_UniqueWings
GROUP BY Name
HAVING COUNT(*) > 1;
-- Should return 0 rows (no duplicates)
```

## Understanding the Grouping Logic

The view uses `GROUP BY Name, WingCode, ShortName, OfficeID` because:
- **Name**: Wing name (e.g., "Admin", "Finance")
- **WingCode**: Wing code identifier
- **ShortName**: Short name/abbreviation
- **OfficeID**: Office the wing belongs to

For aggregated fields:
- `MIN(Id)`: Takes the first ID (for uniqueness)
- `MAX(HODName)`: Takes the last HOD name (assuming latest is correct)
- `MAX(FocalPerson)`: Takes the latest focal person
- `MAX(ContactNo)`: Takes the latest contact number

## If DECs Also Have Duplicates

If you find DECs have duplicates too, replace the DECs view with this grouped version:

```sql
DROP VIEW vw_UniqueDECs;
GO

CREATE VIEW vw_UniqueDECs AS
SELECT 
    MIN(intAutoID) as intAutoID,
    DECName,
    DECCode,
    DECAcronym,
    MAX(DECAddress) as DECAddress,
    MAX(Location) as Location,
    MAX(HODName) as HODName,
    WingID,
    MAX(IS_ACT) as IS_ACT,
    MAX(ModifyDate) as ModifyDate
FROM DEC_MST
WHERE IS_ACT = 1
GROUP BY DECName, DECCode, DECAcronym, WingID;
GO
```

## Troubleshooting

### Error: "Invalid object name 'vw_UniqueWings'"
- The view hasn't been created yet
- Run the CREATE VIEW statement in SQL Server
- Check you're in the correct database: `USE ims-drupal-db;`

### Error: "There is already an object named 'vw_UniqueWings'"
- The view already exists
- Drop it first: `DROP VIEW vw_UniqueWings;`
- Then recreate it

### Still Getting Duplicates
- Check the GROUP BY fields match your duplicate criteria
- Verify with: `SELECT Name, COUNT(*) FROM vw_UniqueWings GROUP BY Name HAVING COUNT(*) > 1;`
- Adjust the GROUP BY clause if needed

## Maintenance

### Update View Definition
```sql
-- Drop the old view
DROP VIEW vw_UniqueWings;
GO

-- Create new version
CREATE VIEW vw_UniqueWings AS
-- ... your updated definition
GO
```

### Check View Performance
```sql
-- Check execution time
SET STATISTICS TIME ON;
SELECT * FROM vw_UniqueWings;
SET STATISTICS TIME OFF;
```

## Files Updated
- ✅ `sql-views/create_wings_view.sql` - Wings view creation script
- ✅ `sql-views/create_decs_view.sql` - DECs view creation script  
- ✅ `frontend/src/api/routes/wings.js` - Updated to use view
- ✅ `frontend/src/api/routes/dec-mst.js` - Updated to use view

## Next Steps

1. **Create the views** in SQL Server using the scripts above
2. **Rebuild Docker container** to use the new API routes
3. **Fetch fresh data** with `bash fetch-sql-data.sh`
4. **Proceed with Drupal import** following the existing guides

The data will now be truly unique! 🎉
