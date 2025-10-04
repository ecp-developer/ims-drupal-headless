#!/bin/bash
# Simple field verification

echo "======================================"
echo "Wings Taxonomy Fields"
echo "======================================"

drush php:eval "\$fields = \Drupal::service('entity_field.manager')->getFieldDefinitions('taxonomy_term', 'wings'); foreach (\$fields as \$name => \$field) { if (substr(\$name, 0, 6) === 'field_') { echo \$name . ' - ' . \$field->getLabel() . PHP_EOL; } }"

echo ""
echo "======================================"
echo "DECs Taxonomy Fields"
echo "======================================"

drush php:eval "\$fields = \Drupal::service('entity_field.manager')->getFieldDefinitions('taxonomy_term', 'decs'); foreach (\$fields as \$name => \$field) { if (substr(\$name, 0, 6) === 'field_') { echo \$name . ' - ' . \$field->getLabel() . PHP_EOL; } }"

echo ""
echo "Done!"
