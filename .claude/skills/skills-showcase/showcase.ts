// ============================================================================
// TYPES
// ============================================================================

interface Skill {
  name: string
  description: string
  icon: string
  category: string
  autoTrigger: boolean
  keywords: string[]
}

// ============================================================================
// DATA
// ============================================================================

const skills: Skill[] = [
  {
    name: 'API Generator',
    description:
      'Generates complete feature implementation with 18 files matching blog-posts architecture - domain, service, repository, transformers, DTOs, hooks, actions, MSW handlers',
    icon: '🎯',
    category: 'generation',
    autoTrigger: true,
    keywords: ['api', 'endpoint', 'feature', 'domain', 'service', 'rest', 'backend'],
  },
  {
    name: 'BDD Implementation Generator',
    description:
      'Generates complete BDD test infrastructure (fixtures, locators, flows, assertions, intercepts, POMs, step definitions) following exact 7-layer codebase patterns',
    icon: '🧪',
    category: 'generation',
    autoTrigger: false,
    keywords: ['bdd', 'cucumber', 'playwright', 'testing', 'e2e'],
  },
  {
    name: 'Gherkin Generator',
    description:
      'Expert Gherkin/Cucumber scenario generator. Analyzes existing tests, generates comprehensive scenarios (happy + loading + error), enforces @smoke tagging rules',
    icon: '📝',
    category: 'generation',
    autoTrigger: false,
    keywords: ['gherkin', 'cucumber', 'scenario', 'feature', 'bdd'],
  },
  {
    name: 'Fixture Forge',
    description:
      'Auto-invoked when creating test fixtures. Ensures type-safe, reusable fixtures shared across Vitest, Storybook, and Playwright with programmatic traceability',
    icon: '🏭',
    category: 'testing',
    autoTrigger: true,
    keywords: ['fixture', 'test data', 'mock', 'MSW', 'type-safe'],
  },
  {
    name: 'Dumb User BDD',
    description:
      'Generates missing E2E edge case scenarios. Identifies gaps in error handling, auth, race conditions, and network failures not covered by existing BDD tests',
    icon: '🤔',
    category: 'testing',
    autoTrigger: true,
    keywords: ['bdd', 'edge case', 'error', 'race condition', 'e2e'],
  },
  {
    name: 'Dumb User Unit',
    description:
      'Generates missing edge-case scenarios for Vitest unit tests. Identifies gaps in error handling, null/undefined cases, boundary conditions, and type violations',
    icon: '🧠',
    category: 'testing',
    autoTrigger: true,
    keywords: ['vitest', 'unit test', 'edge case', 'null', 'boundary'],
  },
  {
    name: 'Dumb User Storybook',
    description:
      'Generates missing visual/interaction edge cases for Storybook component tests. Identifies gaps in empty, error, loading, overflow, and permission states',
    icon: '📚',
    category: 'testing',
    autoTrigger: true,
    keywords: ['storybook', 'component', 'visual', 'interaction', 'states'],
  },
  {
    name: 'BDD Example Enforcer',
    description:
      'Auto-validates BDD tests against canonical patterns. Triggers on BDD/Cucumber/step definition keywords. Enforces 7-layer architecture with zero tolerance',
    icon: '✅',
    category: 'quality',
    autoTrigger: true,
    keywords: ['bdd', 'validation', 'enforcement', 'patterns', 'architecture'],
  },
  {
    name: 'AST-Grep Auditor',
    description:
      'World-class ast-grep expert. Audits rules for pattern precision, security. Auto-fixes violations. Recommends ESLint for JSX. Defense-in-depth validation',
    icon: '🔍',
    category: 'quality',
    autoTrigger: true,
    keywords: ['ast-grep', 'audit', 'security', 'validation', 'linting'],
  },
  {
    name: 'Commit Maestro',
    description:
      'Ensures perfect commits by running all validations (TypeScript, ESLint, tests, ast-grep), splitting large commits, and using human-friendly conventional commit messages',
    icon: '✨',
    category: 'workflow',
    autoTrigger: false,
    keywords: ['commit', 'git', 'validation', 'conventional commits'],
  },
  {
    name: 'PR Creator',
    description:
      'Auto-invoked when creating pull requests. Crafts engaging PR descriptions with executive summaries, silly ASCII art, and beautiful markdown formatting',
    icon: '🎨',
    category: 'workflow',
    autoTrigger: true,
    keywords: ['pull request', 'pr', 'description', 'ascii art'],
  },
  {
    name: 'GitHub Checks Watcher',
    description:
      'Monitors GitHub checks after commits, celebrates successes, auto-fixes simple failures (linting, types, tests), escalates complex issues to user',
    icon: '👀',
    category: 'workflow',
    autoTrigger: false,
    keywords: ['github', 'ci', 'checks', 'monitoring', 'auto-fix'],
  },
  {
    name: 'Skill Forge',
    description:
      'Creates Claude Code skills with validation and best practices. Reads project rules, enforces constitution (DRY, single responsibility, fail fast)',
    icon: '⚒️',
    category: 'meta',
    autoTrigger: true,
    keywords: ['skill', 'create', 'automation', 'development'],
  },
  {
    name: 'Skill Prophet',
    description:
      'Detects repetitive patterns (2-3x) and suggests new skills. Verifies with roadmap-keeper. Triggers liberally to maximize automation opportunities',
    icon: '🔮',
    category: 'meta',
    autoTrigger: true,
    keywords: ['pattern', 'automation', 'suggestion', 'repetition'],
  },
  {
    name: 'Automation Prophet',
    description:
      'Detects patterns (2-3x), suggests best automation type (skill/rule/slash) with context. Aggressive detection for maximum automation',
    icon: '🤖',
    category: 'meta',
    autoTrigger: true,
    keywords: ['automation', 'pattern', 'suggestion', 'workflow'],
  },
  {
    name: 'Roadmap Keeper',
    description:
      'Maintains skills roadmap by detecting new/modified/removed skills and updating documentation automatically. Single source of truth for skill inventory',
    icon: '🗺️',
    category: 'meta',
    autoTrigger: true,
    keywords: ['roadmap', 'documentation', 'tracking', 'inventory'],
  },
  {
    name: 'Context Guardian',
    description:
      'Agent self-invokes at 80% context capacity for graceful handoffs with knowledge dumps. Prevents information loss during context compaction',
    icon: '🛡️',
    category: 'meta',
    autoTrigger: false,
    keywords: ['context', 'handoff', 'memory', 'capacity'],
  },
  {
    name: 'Skill Drift Detector',
    description:
      'Detects when skill examples diverge from production code patterns. Architectural alignment validation, not syntax enforcement',
    icon: '📊',
    category: 'meta',
    autoTrigger: false,
    keywords: ['drift', 'validation', 'examples', 'patterns'],
  },
  {
    name: 'Rule Forge',
    description:
      'Creates ast-grep rules with validation and CI integration. Pattern testing, documentation, and quality checks built-in',
    icon: '📜',
    category: 'automation',
    autoTrigger: false,
    keywords: ['ast-grep', 'rule', 'linting', 'validation'],
  },
  {
    name: 'Slash Forge',
    description:
      'Creates slash commands for workflows and prompts. Prompt expansion and terminal workflow automation',
    icon: '⚡',
    category: 'automation',
    autoTrigger: false,
    keywords: ['slash', 'command', 'prompt', 'workflow'],
  },
  {
    name: 'TanStack Query Enforcer',
    description:
      'Ensures features have complete TanStack Query architecture (keys/options/hooks/queries). Validates gold standard implementation patterns',
    icon: '🔄',
    category: 'quality',
    autoTrigger: false,
    keywords: ['tanstack', 'query', 'react-query', 'architecture'],
  },
  {
    name: 'Rules Loader',
    description:
      'Two-phase rule loader. Phase 1 reads summaries (~50 lines), Phase 2 reads critical full files (max 12). Returns verbatim excerpts. Deterministic',
    icon: '📖',
    category: 'workflow',
    autoTrigger: true,
    keywords: ['rules', 'documentation', 'standards', 'loading'],
  },
  {
    name: 'BDD Debugger',
    description:
      'Self-healing BDD debugger - auto-fixes environment, intercepts, selectors, assertions. Checks infrastructure before debugging test code',
    icon: '🔧',
    category: 'testing',
    autoTrigger: false,
    keywords: ['bdd', 'debug', 'self-healing', 'auto-fix', 'playwright'],
  },
  {
    name: 'BDD Fix',
    description:
      'Auto-triggered when BDD tests fail. Analyzes traces, diagnoses root cause using empirical MCP validation, fixes fixtures/POMs, validates with 10-run zero-flake verification',
    icon: '🩹',
    category: 'testing',
    autoTrigger: false,
    keywords: ['bdd', 'fix', 'debugging', 'playwright', 'cucumber'],
  },
  {
    name: 'UI TestID Injector',
    description:
      'Automatically adds data-testid attributes to React components based on generated test fixtures. Maps TestIds to UI elements ensuring tests can find components',
    icon: '💉',
    category: 'testing',
    autoTrigger: false,
    keywords: ['testid', 'ui', 'components', 'testing', 'fixtures'],
  },
  {
    name: 'Fixture Type Fixer',
    description:
      "Auto-invoked when fixture files are created/edited. Converts `: Type` to `satisfies Type` preserving literal types and compile-time safety",
    icon: '🔨',
    category: 'testing',
    autoTrigger: true,
    keywords: ['fixture', 'satisfies', 'types', 'type-safe', 'validation'],
  },
]

// ============================================================================
// STATE
// ============================================================================

let currentCategory = 'all'
let searchTerm = ''

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

function renderSkillCard(skill: Skill): string {
  const keywordsHtml = skill.keywords
    .slice(0, 3)
    .map((k) => `<span class="keyword">${k}</span>`)
    .join('')

  const moreKeywords =
    skill.keywords.length > 3 ? `<span class="keyword">+${skill.keywords.length - 3} more</span>` : ''

  return `
    <div class="skill-card" onclick='openModal(${JSON.stringify(skill).replace(/'/g, "&#39;")})'>
      <div class="skill-header">
        <div class="skill-icon">${skill.icon}</div>
        <div class="skill-category">${skill.category}</div>
      </div>
      <h3 class="skill-title">${skill.name}</h3>
      <p class="skill-description">${skill.description}</p>
      <div class="skill-meta">
        <div class="${skill.autoTrigger ? 'auto-trigger' : 'manual-trigger'}">
          ${skill.autoTrigger ? '⚡ Auto-Trigger' : '🎯 Manual'}
        </div>
      </div>
      <div class="skill-keywords">
        ${keywordsHtml}
        ${moreKeywords}
      </div>
    </div>
  `
}

function renderSkills(): void {
  const grid = document.getElementById('skillsGrid')
  const noResults = document.getElementById('noResults')

  if (!grid || !noResults) return

  const filtered = filterSkills()

  if (filtered.length === 0) {
    grid.style.display = 'none'
    noResults.style.display = 'block'
  } else {
    grid.style.display = 'grid'
    noResults.style.display = 'none'
    grid.innerHTML = filtered.map(renderSkillCard).join('')
  }
}

// ============================================================================
// FILTER FUNCTIONS
// ============================================================================

function filterSkills(): Skill[] {
  return skills.filter((skill) => {
    const matchesCategory = currentCategory === 'all' || skill.category === currentCategory
    const matchesSearch =
      searchTerm === '' ||
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })
}

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

function openModal(skill: Skill): void {
  const modal = document.getElementById('skillModal')
  const content = document.getElementById('modalContent')

  if (!modal || !content) return

  const keywordsHtml = skill.keywords.map((k) => `<span class="keyword">${k}</span>`).join('')

  content.innerHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">${skill.icon}</div>
      <h2 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${skill.name}</h2>
      <div class="${skill.autoTrigger ? 'auto-trigger' : 'manual-trigger'}" style="display: inline-flex; margin-top: 1rem;">
        ${skill.autoTrigger ? '⚡ Auto-Trigger' : '🎯 Manual Trigger'}
      </div>
    </div>

    <div style="margin: 2rem 0;">
      <h3 style="color: var(--primary); margin-bottom: 1rem;">Description</h3>
      <p style="color: var(--text-muted); line-height: 1.8;">${skill.description}</p>
    </div>

    <div style="margin: 2rem 0;">
      <h3 style="color: var(--primary); margin-bottom: 1rem;">Category</h3>
      <span class="skill-category">${skill.category}</span>
    </div>

    <div style="margin: 2rem 0;">
      <h3 style="color: var(--primary); margin-bottom: 1rem;">Keywords</h3>
      <div class="skill-keywords">
        ${keywordsHtml}
      </div>
    </div>

    <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(99, 102, 241, 0.1); border-radius: 1rem; border-left: 4px solid var(--primary);">
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        💡 <strong>What is a "skill"?</strong><br>
        Skills are AI-powered automation tools that run autonomously in your development workflow.
        ${skill.autoTrigger ? 'This skill automatically triggers based on context.' : 'This skill needs to be manually invoked when needed.'}
      </p>
    </div>
  `

  modal.classList.add('active')
}

function closeModal(): void {
  const modal = document.getElementById('skillModal')
  if (modal) {
    modal.classList.remove('active')
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initializeEventListeners(): void {
  // Search input
  const searchInput = document.getElementById('searchInput') as HTMLInputElement
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = (e.target as HTMLInputElement).value
      renderSkills()
    })
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      currentCategory = (btn as HTMLElement).dataset.category || 'all'
      renderSkills()
    })
  })

  // Modal close on backdrop click
  const modal = document.getElementById('skillModal')
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal()
      }
    })
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Make functions global for onclick handlers
;(window as any).openModal = openModal
;(window as any).closeModal = closeModal

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners()
    renderSkills()
  })
} else {
  initializeEventListeners()
  renderSkills()
}
