#!/bin/bash
# Run validation on all examples
# Usage: ./run-all.sh

set -e
cd "$(dirname "$0")/.."

echo "🎸 UG Parser Validation Suite"
echo "=============================="
echo ""

for md in examples/*.md; do
  name=$(basename "$md" .md)
  echo "Testing: $name"
  npx tsx scripts/validate.ts "$name"
  echo ""
done

echo "=============================="
echo "✅ All examples validated!"
