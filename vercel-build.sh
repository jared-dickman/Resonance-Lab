#!/bin/bash
# Vercel Build Script with Quality Checks
# This ensures code quality checks run even on Vercel deployments

set -e  # Exit on any error

echo "🔍 Running pre-build quality checks..."

# Go to root to run quality checks
cd ..

# Run TypeScript check
echo "📘 TypeScript type checking..."
npm run typecheck || {
  echo "❌ TypeScript errors found"
  exit 1
}

# Run ESLint
echo "🎨 ESLint checking..."
npm run lint:check || {
  echo "❌ ESLint violations found"
  exit 1
}

# Run ast-grep security scan
echo "🔒 Security scanning with ast-grep..."
npm run ast-grep:scan || {
  echo "❌ Security violations found"
  exit 1
}

# Build the application (return to frontend directory)
echo "🏗️ Building frontend..."
cd frontend
npm run build

echo "✅ Build completed successfully with all checks passed!"