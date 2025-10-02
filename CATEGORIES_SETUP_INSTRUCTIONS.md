# Category Management Setup Instructions

## Problem
The Category Management module is trying to fetch categories from Drupal, but the 'categories' taxonomy vocabulary doesn't exist yet in Drupal.

## Solution - Create the Categories Vocabulary in Drupal

### Step 1: Access Drupal Admin
1. Open your browser and go to: `https://ims-drupal-headless.ddev.site/admin`
2. Log in with your admin credentials

### Step 2: Create the Vocabulary
1. Navigate to: **Structure → Taxonomy** (`/admin/structure/taxonomy`)
2. Click **"+ Add vocabulary"** button
3. Fill in the form:
   - **Name**: `Categories`
   - **Machine name**: `categories` (must be exactly this)
   - **Description**: `IMS product and item categories`
4. Click **Save**

### Step 3: Add Some Test Categories
1. Click **"Add terms"** next to the Categories vocabulary
2. Create a few test categories with hierarchy:
   
   **Parent Categories:**
   - Name: Electronics
   - Weight: 0
   - Status: Published
   
   - Name: Office Supplies
   - Weight: 1
   - Status: Published
   
   **Child Categories (with parent):**
   - Name: Computers
   - Parent: Electronics
   - Weight: 0
   - Status: Published
   
   - Name: Printers
   - Parent: Electronics
   - Weight: 1
   - Status: Published
   
   - Name: Paper Products
   - Parent: Office Supplies
   - Weight: 0
   - Status: Published

### Step 4: Configure JSON:API Access
1. Navigate to: **Configuration → Web Services → JSON:API** (`/admin/config/services/jsonapi`)
2. Ensure **"Accept all JSON:API create, read, update, and delete operations"** is enabled
3. Or specifically enable: `taxonomy_term--categories`

### Step 5: Set Permissions
1. Navigate to: **People → Permissions** (`/admin/people/permissions`)
2. For your role (probably "Administrator" or "Authenticated user"):
   - Check: **"View published taxonomy terms"**
   - Check: **"Create terms in Categories"**
   - Check: **"Edit terms in Categories"**
   - Check: **"Delete terms in Categories"**
3. Click **Save permissions**

### Step 6: Test in Browser
1. Open browser console (F12)
2. Try this URL directly in browser: `https://ims-drupal-headless.ddev.site/jsonapi/taxonomy_term/categories`
3. You should see JSON response with your categories

### Step 7: Refresh Frontend
1. Go back to your React app: `http://localhost:5173`
2. Click **Category Management** in sidebar
3. Click **All Categories** tab
4. You should now see your categories!

## Alternative: Quick Test via DDEV

If you want to create the vocabulary via command line:

```bash
# SSH into DDEV container
ddev ssh

# Create the vocabulary
drush php-eval "\\Drupal\\taxonomy\\Entity\\Vocabulary::create(['vid' => 'categories', 'name' => 'Categories', 'description' => 'IMS product and item categories'])->save();"

# Create a test term
drush php-eval "\\Drupal\\taxonomy\\Entity\\Term::create(['vid' => 'categories', 'name' => 'Electronics', 'status' => 1])->save();"

# Verify
drush ev "print_r(\\Drupal\\taxonomy\\Entity\\Vocabulary::load('categories'));"
```

## Troubleshooting

### If you still see no categories:

1. **Check browser console for errors**
   - Open DevTools (F12) → Console tab
   - Look for red error messages
   - Common errors:
     - `404 Not Found` → Vocabulary doesn't exist
     - `403 Forbidden` → Permission issue
     - `CORS error` → CORS configuration needed

2. **Check Drupal logs**
   ```bash
   ddev ssh
   drush watchdog:show --type=jsonapi --tail
   ```

3. **Verify vocabulary machine name**
   - Go to `/admin/structure/taxonomy`
   - Click **Edit** on Categories vocabulary
   - Ensure **Machine name** is exactly: `categories`

4. **Clear Drupal cache**
   ```bash
   ddev drush cr
   ```

5. **Check if terms exist**
   ```bash
   ddev drush sqlq "SELECT * FROM taxonomy_term_field_data WHERE vid = 'categories';"
   ```

## Expected Result

Once setup is complete, you should see:
- Categories listed in a hierarchical tree
- Expand/collapse arrows next to parent categories
- Edit dropdown menu with View/Edit/Delete options
- Published/Unpublished status badges
- Professional Drupal-style interface
