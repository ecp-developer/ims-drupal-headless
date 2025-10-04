#!/bin/bash
# Create entity reference fields for Wings and DECs hierarchies

cd /var/www/html

echo "Creating entity reference field for Wings → Offices..."
drush php:eval "
\$storage = \Drupal\field\Entity\FieldStorageConfig::create([
  'field_name' => 'field_office_ref',
  'entity_type' => 'taxonomy_term',
  'type' => 'entity_reference',
  'settings' => [
    'target_type' => 'taxonomy_term',
  ],
]);
\$storage->save();

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
echo 'Created field_office_ref on wings';
"

echo ""
echo "Creating entity reference field for DECs → Wings..."
drush php:eval "
\$storage = \Drupal\field\Entity\FieldStorageConfig::create([
  'field_name' => 'field_wing_ref',
  'entity_type' => 'taxonomy_term',
  'type' => 'entity_reference',
  'settings' => [
    'target_type' => 'taxonomy_term',
  ],
]);
\$storage->save();

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
echo 'Created field_wing_ref on decs';
"

echo ""
echo "All reference fields created successfully!"
