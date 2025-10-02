# How to Fix the Taxonomy Dropdowns

## Issue Found ✅
The taxonomies exist in Drupal:
- `country` - Country
- `city` - City

But the frontend couldn't access them because the Vite proxy wasn't configured for `/jsonapi/*` endpoints.

## Fix Applied ✅
Updated `vite.config.ts` to add:
```typescript
'/jsonapi': {
  target: 'https://ims-drupal-headless.ddev.site',
  changeOrigin: true,
  secure: false
},
'/session': {
  target: 'https://ims-drupal-headless.ddev.site',
  changeOrigin: true,
  secure: false
}
```

## Next Steps

### 1. Restart Dev Server
```bash
cd frontend
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Test Again
1. Open browser to `http://localhost:5173`
2. Click **"Taxonomy Test"** in sidebar
3. You should see ✅ for:
   - `/jsonapi/taxonomy_term/country`
   - `/jsonapi/taxonomy_term/city`

### 3. Check Vendor Form
1. Click **"Vendor Management"** → **"Add New Vendor"**
2. Check the Country and City dropdowns
3. They should now be populated!

### 4. Create Test Data (If Empty)
If the dropdowns are still empty, you need to create taxonomy terms:

**Create Countries:**
```bash
ddev drush php-eval "
  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
  \$countries = ['Pakistan', 'USA', 'UK', 'Canada', 'Australia'];
  foreach (\$countries as \$name) {
    \$term = \$storage->create([
      'vid' => 'country',
      'name' => \$name,
    ]);
    \$term->save();
    echo 'Created: ' . \$name . PHP_EOL;
  }
"
```

**Create Cities:**
```bash
ddev drush php-eval "
  \$storage = \Drupal::entityTypeManager()->getStorage('taxonomy_term');
  \$cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad'];
  foreach (\$cities as \$name) {
    \$term = \$storage->create([
      'vid' => 'city',
      'name' => \$name,
    ]);
    \$term->save();
    echo 'Created: ' . \$name . PHP_EOL;
  }
"
```

## Summary
- ✅ Taxonomies exist in Drupal
- ✅ Vite proxy configured
- ✅ Endpoints fixed in VendorForm
- 🔄 Need to restart dev server
- 📝 May need to add taxonomy terms if empty
