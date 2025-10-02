# Cleanup Old Vendor Components

## Files to Delete (Old/Deprecated)

### Components to Remove:
```bash
cd /home/syedsana/ims-drupal-headless/frontend/src/components

# Remove old vendor components
rm -f VendorManagement.tsx
rm -f VendorManagement_fixed.tsx  
rm -f VendorTest.tsx
rm -f FieldDiscovery.tsx
```

### Services to Remove:
```bash
cd /home/syedsana/ims-drupal-headless/frontend/src/services

# Keep vendorService-new.ts, remove old one
rm -f vendorService.ts
```

### Optional - Remove Types (if not used elsewhere):
```bash
cd /home/syedsana/ims-drupal-headless/frontend/src/types

# Only if vendor.ts is not used by other code
# Check first: grep -r "from.*types/vendor" ../
rm -f vendor.ts
```

## What's Been Kept (New System):

### ✅ Active Components:
- `DashboardVendors.tsx` - Vendor dashboard with stats
- `VendorList.tsx` - List/search interface  
- `VendorForm.tsx` - Create/Edit form
- `TaxonomyTest.tsx` - Debugging tool (can remove later)

### ✅ Active Services:
- `vendorService-new.ts` - Complete CRUD service with data transformation

### ✅ Active Styles:
- `DashboardVendors.css`
- `VendorList.css`
- `VendorForm.css`

## App.tsx Changes Applied:

### Removed Imports:
- ❌ `VendorManagement`
- ❌ `VendorTest`  
- ❌ `FieldDiscovery`

### Removed Routes:
- ❌ `/vendors` case (old combined view)

### Kept Routes:
- ✅ `/vendor-dashboard` - New dashboard
- ✅ `/vendor-list` - New list view
- ✅ `/vendor-create` - Create form
- ✅ `/vendor-edit` - Edit form
- ✅ `/taxonomy-test` - Debug tool

## Run Cleanup:

```bash
# One command to remove all old files
cd /home/syedsana/ims-drupal-headless/frontend/src && \
rm -f components/VendorManagement.tsx \
      components/VendorManagement_fixed.tsx \
      components/VendorTest.tsx \
      components/FieldDiscovery.tsx \
      services/vendorService.ts

echo "✅ Cleanup complete!"
```

## After Cleanup:

1. ✅ App.tsx updated (imports removed)
2. ✅ No compilation errors
3. ✅ Only new vendor system active
4. ✅ Cleaner codebase

## Note:
The old `vendorService.ts` and new `vendorService-new.ts` can coexist temporarily. Once you're confident the new system works, you can:
1. Rename `vendorService-new.ts` → `vendorService.ts`
2. Update all imports from `vendorService-new` to `vendorService`
