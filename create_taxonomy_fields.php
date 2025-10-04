<?php

/**
 * Script to create custom fields for taxonomy vocabularies.
 * Run with: drush php:script create_taxonomy_fields.php
 */

use Drupal\field\Entity\FieldStorageConfig;
use Drupal\field\Entity\FieldConfig;

// Create field storage and field for Offices taxonomy
$fields = [
  // Offices fields
  [
    'entity_type' => 'taxonomy_term',
    'bundle' => 'offices',
    'field_name' => 'field_office_code',
    'field_label' => 'Office Code',
    'field_type' => 'integer',
  ],
  [
    'entity_type' => 'taxonomy_term',
    'bundle' => 'offices',
    'field_name' => 'field_office_id',
    'field_label' => 'Office ID',
    'field_type' => 'integer',
  ],
  // Wings fields
  [
    'entity_type' => 'taxonomy_term',
    'bundle' => 'wings',
    'field_name' => 'field_wing_code',
    'field_label' => 'Wing Code',
    'field_type' => 'integer',
  ],
  [
    'entity_type' => 'taxonomy_term',
    'bundle' => 'wings',
    'field_name' => 'field_wing_id',
    'field_label' => 'Wing ID',
    'field_type' => 'integer',
  ],
  // DECs fields
  [
    'entity_type' => 'taxonomy_term',
    'bundle' => 'decs',
    'field_name' => 'field_dec_code',
    'field_label' => 'DEC Code',
    'field_type' => 'integer',
  ],
  [
    'entity_type' => 'taxonomy_term',
    'bundle' => 'decs',
    'field_name' => 'field_dec_id',
    'field_label' => 'DEC ID',
    'field_type' => 'integer',
  ],
];

foreach ($fields as $field_info) {
  $field_name = $field_info['field_name'];
  $entity_type = $field_info['entity_type'];
  $bundle = $field_info['bundle'];
  
  // Check if field storage exists
  $field_storage = FieldStorageConfig::loadByName($entity_type, $field_name);
  
  if (!$field_storage) {
    // Create field storage
    $field_storage = FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => $entity_type,
      'type' => $field_info['field_type'],
      'cardinality' => 1,
    ]);
    $field_storage->save();
    echo "Created field storage: {$field_name}\n";
  } else {
    echo "Field storage already exists: {$field_name}\n";
  }
  
  // Check if field instance exists
  $field = FieldConfig::loadByName($entity_type, $bundle, $field_name);
  
  if (!$field) {
    // Create field instance
    $field = FieldConfig::create([
      'field_storage' => $field_storage,
      'bundle' => $bundle,
      'label' => $field_info['field_label'],
      'required' => FALSE,
    ]);
    $field->save();
    echo "Created field: {$field_name} on {$bundle}\n";
  } else {
    echo "Field already exists: {$field_name} on {$bundle}\n";
  }
}

echo "\nAll fields created successfully!\n";
