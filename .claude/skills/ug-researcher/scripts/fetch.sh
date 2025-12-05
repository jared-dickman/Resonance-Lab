#!/bin/bash
# Fetch Ultimate Guitar tab via Jina Reader API
# Usage: ./fetch.sh <UG_URL> [output_file]

set -e

URL="$1"
OUTPUT="${2:-/tmp/ug-content.md}"

if [ -z "$URL" ]; then
  echo "Usage: ./fetch.sh <UG_URL> [output_file]"
  echo "Example: ./fetch.sh 'https://tabs.ultimate-guitar.com/tab/johnny-cash/folsom-prison-blues-chords-202632'"
  exit 1
fi

echo "🎸 Fetching: $URL"
curl -sL "https://r.jina.ai/$URL" -H "Accept: text/markdown" > "$OUTPUT"
echo "✅ Saved to: $OUTPUT"
echo "📊 Size: $(wc -c < "$OUTPUT") bytes"
