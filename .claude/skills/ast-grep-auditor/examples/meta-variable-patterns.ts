// Pattern: Meta-variable usage and constraints
// Source: ast-grep-auditor SKILL.md lines 35-62

// ✅ CORRECT: Meta-variables as sole content of AST node
const validPatterns = [
  '$VAR',                    // Single identifier
  '$OBJ.$METHOD',            // Object method
  '$OBJ.$METHOD($$$ARGS)',   // Method call with variadic args
  'function $NAME() { $$$ }' // Function with any body
]

// ✅ CORRECT: Meta-variable naming
const validNames = [
  '$VAR',      // Uppercase only
  '$_TEMP',    // Underscore prefix = not captured, reusable with different values
  '$$$ARGS',   // Triple $ = zero or more nodes (multi-node wildcard)
]

// ❌ WRONG: Meta-variables in invalid contexts
const invalidPatterns = [
  'obj.on$EVENT',           // ❌ Partial string (not sole content)
  '"Hello $WORLD"',         // ❌ Inside string_content
  '$jq',                    // ❌ Lowercase not permitted
  'use$HOOK',               // ❌ Prefix/suffix mixing
  'io_uring_$FUNC',         // ❌ Prefix/suffix mixing
]

// ❌ WRONG: Invalid meta-variable combinations
const invalidRules = {
  // Three consecutive identifiers - invalid syntax
  pattern: '$LEFT $OP $RIGHT',  // ❌ Fix: Use kind + regex instead

  // Meta-var in non-identifier context
  pattern: 'obj = { $KIND foo() {} }',  // ❌ Can't replace keywords like get/set
}

// ✅ FIX: Use atomic rules instead
const fixedRules = {
  all: [
    { kind: 'binary_expression' },
    { regex: '^\\w+\\s+[+\\-*/]\\s+\\w+$' }
  ]
}