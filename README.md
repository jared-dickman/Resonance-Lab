# Resonance Lab

A comprehensive music learning and composition platform featuring real-time chord analysis, interactive visualizations, and AI-powered tools for musicians.

## 🚀 Quick Start with Codespaces (Recommended)

The fastest way to start developing is using GitHub Codespaces - zero setup required!

### Launch Development Environment

1. Click the **Code** button above
2. Select **Codespaces** tab
3. Click **Create codespace on [branch]**
4. Wait ~60 seconds for environment to load
5. Start coding!

**First time setup?** See [Codespaces Setup Guide](.devcontainer/SETUP.md) for detailed instructions.

### Start Development Server

```bash
cd frontend
npm run dev
```

Your dev server will be available at the forwarded port 3000. Click the notification to open it in your browser.

## 📋 Prerequisites

### For Codespaces Development (Recommended)
- GitHub account with Codespaces access
- Repository access
- That's it! Everything else is pre-configured.

### For Local Development (Alternative)
- Node.js 20.x or higher
- Go 1.21 or higher
- Docker & Docker Compose
- npm or yarn

## 🏗️ Architecture

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS
- **State:** TanStack Query
- **UI Components:** Radix UI
- **Audio:** Tone.js, Pizzicato
- **Visualization:** React Three Fiber, D3.js, VexFlow

### Backend
- **Language:** Go
- **API:** REST
- **Deployment:** Docker on Hostinger VPS

### Database
- **Provider:** Supabase (PostgreSQL)
- **Features:** Real-time subscriptions, Row-level security

## 🔧 Development Workflow

### With Codespaces (Recommended)
```bash
# 1. Open Codespace (via GitHub UI)
# 2. Environment is ready - start coding!
cd frontend && npm run dev

# 3. Make changes and test locally (port 3000)

# 4. Commit and push
git add .
git commit -m "feat: add new feature"
git push

# 5. Vercel automatically deploys preview
# Check PR for preview URL: <branch-name>.vercel.app
```

### Local Development
```bash
# Install dependencies
npm ci
cd frontend && npm ci

# Start development server
cd frontend
npm run dev

# In another terminal, start backend (optional)
cd scraper
go build -o main .
ADDR=:8081 ./main
```

## 📦 Project Structure

```
Resonance-Lab/
├── frontend/              # Next.js application
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   └── public/          # Static assets
├── scraper/             # Go backend API
│   ├── cmd/            # Command-line tools
│   ├── internal/       # Internal packages
│   └── main.go         # API server entry point
├── .devcontainer/       # Codespaces configuration
│   ├── devcontainer.json
│   └── SETUP.md        # Detailed setup guide
├── .github/            # GitHub Actions workflows
├── songs/              # Song data storage
└── docker-compose.yml  # Production deployment config
```

## 🧪 Testing & Quality

### Run Linting
```bash
npm run lint          # Check for issues
npm run lint:check    # CI mode
```

### Run Type Checking
```bash
npm run typecheck
```

### Run Formatting
```bash
npm run format        # Format all files
npm run format:check  # Check formatting (CI)
```

### Run All Checks
```bash
npm run check:all     # Lint + Format + ast-grep scan
```

## 🚢 Deployment

### Preview Deployments (Automatic)
- **Trigger:** Every commit to feature branches
- **Frontend:** Vercel preview URL (`<branch>.vercel.app`)
- **Backend:** Shared dev instance (`dev.srv1015344.hstgr.cloud/api`)
- **Database:** Shared dev Supabase instance

### Production Deployment (Automatic)
- **Trigger:** Merge to `main` branch
- **Frontend:** Vercel production (`resonance-lab.vercel.app`)
- **Backend:** VPS Docker deployment
- **Database:** Production Supabase instance

See [DEV-ENVIRONMENT-SPEC.md](DEV-ENVIRONMENT-SPEC.md) for full deployment architecture.

## 🔐 Environment Variables

### Required for Codespaces

Set these in **Settings → Secrets and variables → Codespaces**:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Required for Local Development

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
# Edit .env with your credentials
```

See [.devcontainer/SETUP.md](.devcontainer/SETUP.md) for detailed instructions.

## 🤝 Contributing

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

3. **Run quality checks**
   ```bash
   npm run check:all
   ```

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update README"
   ```

5. **Push and create PR**
   ```bash
   git push -u origin feature/your-feature-name
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 📚 Documentation

- [Dev Environment Spec](DEV-ENVIRONMENT-SPEC.md) - Architecture and deployment
- [Codespaces Setup](.devcontainer/SETUP.md) - Detailed Codespaces guide
- [Frontend README](frontend/README.md) - Frontend-specific docs
- [Backend README](scraper/README.md) - Backend API docs

## 🐛 Troubleshooting

### Codespaces Issues
See [.devcontainer/SETUP.md](.devcontainer/SETUP.md#troubleshooting)

### Local Development Issues

**Dependencies won't install:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Type errors:**
```bash
cd frontend
rm -rf .next
npm run typecheck
```

## 📄 License

[Add license information]

## 👥 Team

- **Project Owner:** Jared Dickman
- [Add team members]

## 🔗 Links

- **Production:** [Add production URL]
- **Staging:** `dev.srv1015344.hstgr.cloud`
- **Repository:** https://github.com/jared-dickman/Resonance-Lab

---

**Happy coding! 🎵**
