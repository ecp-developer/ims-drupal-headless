#!/bin/bash
# Verify and display all fields for Wings and DECs taxonomies

echo "======================================"
echo "Wings Taxonomy Fields"
echo "======================================"

ddev exec drush php:eval '
$fields = \Drupal::service("entity_field.manager")->getFieldDefinitions("taxonomy_term", "wings");
foreach ($fields as $field_name => $field) {
  if (strpos($field_name, "field_") === 0) {
    echo $field_name . " - " . $field->getLabel() . " (" . $field->getType() . ")" . PHP_EOL;
  }
}
'

echo ""
echo "======================================"
echo "DECs Taxonomy Fields"
echo "======================================"

ddev exec drush php:eval '
$fields = \Drupal::service("entity_field.manager")->getFieldDefinitions("taxonomy_term", "decs");
foreach ($fields as $field_name => $field) {
  if (strpos($field_name, "field_") === 0) {
    echo $field_name . " - " . $field->getLabel() . " (" . $field->getType() . ")" . PHP_EOL;
  }
}
'

echo ""
echo "======================================"
echo "Field Count Summary"
echo "======================================"

ddev exec drush php:eval '
$wings_fields = \Drupal::service("entity_field.manager")->getFieldDefinitions("taxonomy_term", "wings");
$decs_fields = \Drupal::service("entity_field.manager")->getFieldDefinitions("taxonomy_term", "decs");

$wings_count = 0;
$decs_count = 0;

foreach ($wings_fields as $field_name => $field) {
  if (strpos($field_name, "field_") === 0) {
    $wings_count++;
  }
}

foreach ($decs_fields as $field_name => $field) {
  if (strpos($field_name, "field_") === 0) {
    $decs_count++;
  }
}

echo "Wings has " . $wings_count . " custom fields" . PHP_EOL;
echo "DECs has " . $decs_count . " custom fields" . PHP_EOL;
'
