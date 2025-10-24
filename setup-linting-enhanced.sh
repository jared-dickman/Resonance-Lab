#!/bin/bash

set -e  # Exit on error

echo "🚀 Enhanced Code Quality Setup for Resonance Lab"
echo "================================================"

# Install all dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --save-dev \
  @ast-grep/cli \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-boundaries \
  eslint-plugin-import \
  eslint-plugin-storybook \
  prettier \
  husky \
  tsx \
  typescript

echo ""
echo "🐶 Configuring Husky git hooks..."
# Set git hooks path (Husky v9)
git config core.hooksPath .husky

# Make all hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
chmod +x .husky/post-merge 2>/dev/null || true

echo ""
echo "✅ Verifying hook permissions..."
ls -l .husky/ | grep -E "^-" | awk '{print "  ✓", $9, $1}'

# Add scripts to package.json if not already present
echo ""
echo "📝 Ensuring npm scripts are configured..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const scriptsToAdd = {
  'lint': 'eslint . --fix',
  'lint:check': 'eslint .',
  'format': 'prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"',
  'format:check': 'prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"',
  'test:ast-grep-rules': 'tsx scripts/test-ast-grep-rules.ts',
  'ast-grep:scan': 'ast-grep scan',
  'check:all': 'npm run lint:check && npm run format:check && npm run ast-grep:scan',
  'prepare': 'git config core.hooksPath .husky || true'
};

let updated = false;
for (const [key, value] of Object.entries(scriptsToAdd)) {
  if (!packageJson.scripts || packageJson.scripts[key] !== value) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts[key] = value;
    updated = true;
    console.log('  ✓ Added script:', key);
  }
}

if (updated) {
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Scripts updated in package.json');
} else {
  console.log('✅ All scripts already configured');
}
"

# Create .prettierrc if it doesn't exist
if [ ! -f .prettierrc ]; then
  echo ""
  echo "📄 Creating .prettierrc..."
  cat > .prettierrc << 'PRETTIEREOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
PRETTIEREOF
  echo "✅ .prettierrc created"
fi

# Create VS Code settings for auto-fix
echo ""
echo "🔧 Creating VS Code auto-fix settings..."
mkdir -p .vscode
cat > .vscode/settings.json << 'VSCODEEOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
VSCODEEOF
echo "✅ VS Code settings configured for auto-fix on save"

echo ""
echo "================================================"
echo "✨ Setup Complete!"
echo ""
echo "📋 Available Commands:"
echo "  npm run lint              - Auto-fix linting issues"
echo "  npm run format            - Auto-format with Prettier"
echo "  npm run ast-grep:scan     - Security vulnerability scan"
echo "  npm run test:ast-grep-rules - Test all linting rules"
echo "  npm run check:all         - Run all checks (lint + format + ast-grep)"
echo ""
echo "🔒 Git Hooks Enforced (Permanent):"
echo "  ✓ Pre-commit: Prettier + ESLint + ast-grep + security checks"
echo "  ✓ Commit-msg: Conventional commits enforcement"
echo "  ✓ Pre-push: Build verification + tests"
echo ""
echo "🧪 Verify Setup:"
echo "  npm run check:all"
echo "  npm run test:ast-grep-rules"
echo ""
echo "✅ If both pass, setup is complete and agent can start coding!"
