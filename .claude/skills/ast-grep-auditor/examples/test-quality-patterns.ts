// Pattern: Test case quality requirements
// Source: ast-grep-auditor SKILL.md lines 176-204

// ✅ MINIMUM: 3 shouldCatch + 3 shouldPass per rule

const testCases = {
  shouldCatch: [
    // 1. Obvious violation (straightforward case)
    {
      code: 'console.log("debug message")',
      reason: 'Direct console.log usage - most common violation'
    },

    // 2. Edge case (nested, multi-line, unusual syntax)
    {
      code: `
        if (condition) {
          console.log(
            "multi-line",
            "message"
          )
        }
      `,
      reason: 'Nested, multi-line console.log - tests pattern depth'
    },

    // 3. Real-world pattern from codebase
    {
      code: 'const result = data?.map(item => console.log(item))',
      reason: 'console.log in arrow function - actual violation found'
    }
  ],

  shouldPass: [
    // 1. Recommended pattern (what to use instead)
    {
      code: 'logger.info("debug message")',
      reason: 'Using logger utility - correct approach'
    },

    // 2. Legitimate exclusion (test files, stories, utilities)
    {
      code: 'console.log("test output")',
      file: 'src/utils/test-helper.ts',
      reason: 'Test utilities allowed to use console'
    },

    // 3. Similar but valid code
    {
      code: 'if (process.env.NODE_ENV === "development") { debug() }',
      reason: 'Environment checks for debugging - legitimate pattern'
    }
  ]
}

// ❌ INSUFFICIENT: Too few test cases
const insufficientTests = {
  shouldCatch: [
    { code: 'console.log("x")' }  // ❌ Only 1 case
  ],
  shouldPass: [
    { code: 'logger.info("x")' }  // ❌ Only 1 case
  ]
}

// ❌ LOW QUALITY: Generic test cases
const lowQualityTests = {
  shouldCatch: [
    { code: 'console.log("test")' },
    { code: 'console.log("test2")' },
    { code: 'console.log("test3")' }  // ❌ All too similar
  ]
}

// ✅ HIGH QUALITY: Diverse, real-world test cases
const highQualityTests = {
  shouldCatch: [
    'console.log("debug")',                         // Simple
    'obj.map(x => console.log(x))',                 // Arrow function
    'try { } catch(e) { console.log(e) }',          // Error handling
    'console.log(\`Template ${var}\`)',             // Template literal
    'condition && console.log("conditional")',      // Short-circuit
  ],
  shouldPass: [
    'logger.info("message")',                       // Correct pattern
    'console.log("x") // test file',                // Legitimate context
    'if (isDev) customLog()',                       // Valid alternative
    'debugger',                                     // Similar but different
  ]
}