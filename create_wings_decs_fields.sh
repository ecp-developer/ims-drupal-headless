#!/bin/bash
# Create all required fields for Wings and DECs taxonomies

echo "======================================"
echo "Creating Fields for Wings Taxonomy"
echo "======================================"

# Wings basic fields
drush php:eval "
\$fields = [
  ['field_wing_short_name', 'string', 'Short Name'],
  ['field_hod_name', 'string', 'HOD Name'],
  ['field_focal_person', 'string', 'Focal Person'],
  ['field_contact_no', 'string', 'Contact Number'],
];

foreach (\$fields as \$f) {
  \$storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('taxonomy_term', \$f[0]);
  if (!\$storage) {
    \$storage = \Drupal\field\Entity\FieldStorageConfig::create([
      'field_name' => \$f[0],
      'entity_type' => 'taxonomy_term',
      'type' => \$f[1]
    ]);
    \$storage->save();
    echo 'Created storage: ' . \$f[0] . PHP_EOL;
  }
  
  \$field = \Drupal\field\Entity\FieldConfig::loadByName('taxonomy_term', 'wings', \$f[0]);
  if (!\$field) {
    \$field = \Drupal\field\Entity\FieldConfig::create([
      'field_storage' => \$storage,
      'bundle' => 'wings',
      'label' => \$f[2]
    ]);
    \$field->save();
    echo '✓ Created field: ' . \$f[0] . ' on wings' . PHP_EOL;
  } else {
    echo '- Already exists: ' . \$f[0] . PHP_EOL;
  }
}
"

echo ""
echo "Creating Office reference field for Wings..."
drush php:eval "
\$field_name = 'field_office_ref';
\$storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('taxonomy_term', \$field_name);
if (!\$storage) {
  \$storage = \Drupal\field\Entity\FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => 'taxonomy_term',
    'type' => 'entity_reference',
    'settings' => ['target_type' => 'taxonomy_term'],
  ]);
  \$storage->save();
  echo 'Created storage: ' . \$field_name . PHP_EOL;
}

\$field = \Drupal\field\Entity\FieldConfig::loadByName('taxonomy_term', 'wings', \$field_name);
if (!\$field) {
  \$field = \Drupal\field\Entity\FieldConfig::create([
    'field_storage' => \$storage,
    'bundle' => 'wings',
    'label' => 'Office',
    'settings' => [
      'handler' => 'default:taxonomy_term',
      'handler_settings' => [
        'target_bundles' => ['offices' => 'offices'],
      ],
    ],
  ]);
  \$field->save();
  echo '✓ Created field_office_ref on wings' . PHP_EOL;
} else {
  echo '- Already exists: field_office_ref' . PHP_EOL;
}
"

echo ""
echo "======================================"
echo "Creating Fields for DECs Taxonomy"
echo "======================================"

# DECs basic fields
drush php:eval "
\$fields = [
  ['field_dec_acronym', 'string', 'DEC Acronym'],
  ['field_dec_address', 'string_long', 'DEC Address'],
  ['field_location', 'string', 'Location'],
  ['field_hod_name', 'string', 'HOD Name'],
];

foreach (\$fields as \$f) {
  \$storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('taxonomy_term', \$f[0]);
  if (!\$storage) {
    \$storage = \Drupal\field\Entity\FieldStorageConfig::create([
      'field_name' => \$f[0],
      'entity_type' => 'taxonomy_term',
      'type' => \$f[1]
    ]);
    \$storage->save();
    echo 'Created storage: ' . \$f[0] . PHP_EOL;
  }
  
  \$field = \Drupal\field\Entity\FieldConfig::loadByName('taxonomy_term', 'decs', \$f[0]);
  if (!\$field) {
    \$field = \Drupal\field\Entity\FieldConfig::create([
      'field_storage' => \$storage,
      'bundle' => 'decs',
      'label' => \$f[2]
    ]);
    \$field->save();
    echo '✓ Created field: ' . \$f[0] . ' on decs' . PHP_EOL;
  } else {
    echo '- Already exists: ' . \$f[0] . PHP_EOL;
  }
}
"

echo ""
echo "Creating Wing reference field for DECs..."
drush php:eval "
\$field_name = 'field_wing_ref';
\$storage = \Drupal\field\Entity\FieldStorageConfig::loadByName('taxonomy_term', \$field_name);
if (!\$storage) {
  \$storage = \Drupal\field\Entity\FieldStorageConfig::create([
    'field_name' => \$field_name,
    'entity_type' => 'taxonomy_term',
    'type' => 'entity_reference',
    'settings' => ['target_type' => 'taxonomy_term'],
  ]);
  \$storage->save();
  echo 'Created storage: ' . \$field_name . PHP_EOL;
}

\$field = \Drupal\field\Entity\FieldConfig::loadByName('taxonomy_term', 'decs', \$field_name);
if (!\$field) {
  \$field = \Drupal\field\Entity\FieldConfig::create([
    'field_storage' => \$storage,
    'bundle' => 'decs',
    'label' => 'Wing',
    'settings' => [
      'handler' => 'default:taxonomy_term',
      'handler_settings' => [
        'target_bundles' => ['wings' => 'wings'],
      ],
    ],
  ]);
  \$field->save();
  echo '✓ Created field_wing_ref on decs' . PHP_EOL;
} else {
  echo '- Already exists: field_wing_ref' . PHP_EOL;
}
"

echo ""
echo "======================================"
echo "✅ All Fields Created Successfully!"
echo "======================================"
echo ""
echo "Wings taxonomy now has:"
echo "  - field_wing_id (already existed)"
echo "  - field_wing_code (already existed)"
echo "  - field_wing_short_name"
echo "  - field_hod_name"
echo "  - field_focal_person"
echo "  - field_contact_no"
echo "  - field_office_ref (references offices)"
echo ""
echo "DECs taxonomy now has:"
echo "  - field_dec_id (already existed)"
echo "  - field_dec_code (already existed)"
echo "  - field_dec_acronym"
echo "  - field_dec_address"
echo "  - field_location"
echo "  - field_hod_name"
echo "  - field_wing_ref (references wings)"
echo ""
echo "Next steps:"
echo "1. Create Wings feed type in Drupal UI"
echo "2. Create DECs feed type in Drupal UI"
echo "3. Import data"
