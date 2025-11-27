#!/bin/bash

# Build script to combine HTML, CSS, and TypeScript into a single HTML file

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="$SCRIPT_DIR/index.html"

echo "🔨 Building skills showcase..."

# Read source files
HTML_CONTENT=$(<"$SCRIPT_DIR/showcase.html")
CSS_CONTENT=$(<"$SCRIPT_DIR/showcase.css")

# Convert TypeScript to JavaScript (strip types manually)
echo "📦 Converting TypeScript to JavaScript..."
JS_CONTENT=$(sed -E 's/: [A-Za-z<>\[\]]+//g; s/interface [A-Za-z]+ \{[^}]+\}//g' "$SCRIPT_DIR/showcase.ts")

# Replace CSS placeholder
HTML_WITH_CSS="${HTML_CONTENT/\/\* CSS will be injected here \*\//$CSS_CONTENT}"

# Replace JS placeholder
FINAL_HTML="${HTML_WITH_CSS/\/\* JS will be injected here \*\//$JS_CONTENT}"

# Write to output file
echo "$FINAL_HTML" > "$OUTPUT_FILE"

echo "✅ Build complete: $OUTPUT_FILE"
echo ""
echo "📂 To view:"
echo "   open $OUTPUT_FILE"
echo ""
echo "🌐 Or serve locally:"
echo "   cd $SCRIPT_DIR && python3 -m http.server 8080"
