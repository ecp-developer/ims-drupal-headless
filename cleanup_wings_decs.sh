#!/bin/bash
# Script to clean up Wings and DECs taxonomies - remove all terms and verify fields

echo "======================================"
echo "Cleaning Wings and DECs Taxonomies"
echo "======================================"
echo ""

echo "Step 1: Deleting all Wings terms..."
drush php:eval "
\$terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties(['vid' => 'wings']);
\$count = count(\$terms);
foreach (\$terms as \$term) {
  \$term->delete();
}
echo 'Deleted ' . \$count . ' Wings terms' . PHP_EOL;
"

echo ""
echo "Step 2: Deleting all DECs terms..."
drush php:eval "
\$terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties(['vid' => 'decs']);
\$count = count(\$terms);
foreach (\$terms as \$term) {
  \$term->delete();
}
echo 'Deleted ' . \$count . ' DECs terms' . PHP_EOL;
"

echo ""
echo "======================================"
echo "Verifying Fields"
echo "======================================"
echo ""

echo "Wings taxonomy fields:"
drush field:list taxonomy_term:wings

echo ""
echo "DECs taxonomy fields:"
drush field:list taxonomy_term:decs

echo ""
echo "======================================"
echo "✅ Cleanup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Create feed types in Drupal UI"
echo "2. Import fresh data from JSON files"
