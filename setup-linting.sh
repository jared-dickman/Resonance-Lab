#!/bin/bash

# Setup script for code quality tools in resonance-lab project
echo "🔧 Setting up code quality tools for resonance-lab..."

# Install necessary dependencies
echo "📦 Installing dependencies..."
npm install --save-dev \
  @ast-grep/cli \
  eslint \
  prettier \
  husky \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-boundaries \
  eslint-plugin-import \
  eslint-plugin-storybook \
  tsx

# Initialize Husky
echo "🐶 Initializing Husky..."
npx husky install

# Make Husky hooks executable
chmod +x .husky/commit-msg
chmod +x .husky/pre-commit

# Create .prettierrc if it doesn't exist
if [ ! -f .prettierrc ]; then
  echo '{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}' > .prettierrc
fi

# Add scripts to package.json
echo "📝 Adding scripts to package.json..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add lint and format scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'lint': 'eslint . --fix',
  'lint:check': 'eslint .',
  'format': 'prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"',
  'format:check': 'prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"',
  'test:ast-grep-rules': 'tsx scripts/test-ast-grep-rules.ts',
  'ast-grep:scan': 'ast-grep scan',
  'prepare': 'husky install'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Scripts added to package.json');
"

echo "✨ Setup complete! You can now run:"
echo "  npm run lint         - Lint and fix code"
echo "  npm run format       - Format code with Prettier"
echo "  npm run ast-grep:scan - Run ast-grep security checks"
echo "  npm run test:ast-grep-rules - Test all linting rules"