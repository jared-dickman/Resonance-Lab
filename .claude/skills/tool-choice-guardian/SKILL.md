---
name: tool-choice-guardian
description: Blocks bash cat/grep/find/sed/awk/echo, enforces Read/Write/Edit/Grep/Glob (10-100x faster)
auto_trigger: true
keywords: [bash cat, bash grep, bash find, bash sed, bash awk, bash echo, bash head, bash tail, bash ls, cat file, grep pattern, find files, read file, write file, search files, file operations, shell command, bash command, heredoc, echo >, cat <<EOF, read content, write content, search content, file listing, text processing, output redirection, file reading, file writing, file editing, content search, directory listing]
---

# Tool Choice Guardian

**Mode:** Performance enforcer - prevents slow bash commands, mandates specialized tools

## Core Principle

**Zero bash for file operations** - All file operations MUST use specialized tools (Read/Write/Edit/Grep/Glob) instead of bash equivalents. 10-100x faster, safer, more reliable.

## Trigger Conditions

**Block these bash patterns:**
- `cat`, `grep`, `find`, `sed`, `awk`, `echo >`, `head`, `tail`, `ls -R`
- Heredocs (`cat <<EOF`)
- Output redirection for file writes
- Echo for user communication

**Allow (exceptions):**
- System commands: `git`, `npm`, `pnpm`, `docker`, `curl`
- Pipes: `cmd1 | cmd2`
- Shell operators: `&&`, `||`, `&`

## Workflow

### Detect Bash Pattern

Monitor for:
- Tool calls starting with `bash cat`, `bash grep`, `bash find`, `bash sed`, `bash awk`
- Agent proposing bash file operations in response
- Output redirection: `>`, `>>`, `<<EOF`
- Echo for communication instead of direct text

### Intercept and Block

**STOP immediately before execution:**

"⚠️ **Specialized Tool Required**

bash {command} is 10-100x slower. Use specialized tool."

### Provide Replacement

**Show exact substitution:**

| ❌ Bash | ✅ Specialized Tool |
|---------|---------------------|
| `cat file.txt` | `Read("file.txt")` |
| `grep "pattern"` | `Grep(pattern="pattern")` |
| `find . -name "*.js"` | `Glob("**/*.js")` |
| `sed 's/old/new/' f` | `Edit(f, "old", "new")` |
| `echo "text" > f` | `Write(f, "text")` |
| `head -n 10 f` | `Read(f, limit=10)` |
| `tail -n 10 f` | `Read(f, offset=-10)` |
| `ls -R dir` | `Glob("**/*", path=dir)` |
| `echo "message"` | Direct text output |

### Educate Agent

**Why specialized tools:**
- 10-100x faster (ripgrep vs grep)
- No shell escaping bugs
- Better error handling

## Best Practices

**Read: File inspection**
```bash
❌ bash cat package.json
✅ Read("package.json")

❌ bash head -n 10 README.md
✅ Read("README.md", limit=10)

❌ bash tail -n 20 logs.txt
✅ Read("logs.txt", offset=-20)
```

**Grep: Content search**
```bash
❌ bash grep -r "TODO" src/
✅ Grep(pattern="TODO", path="src")

❌ bash grep -i "error" logs/*.txt
✅ Grep(pattern="error", path="logs", glob="*.txt", -i=true)

❌ bash grep -A 3 -B 3 "Exception"
✅ Grep(pattern="Exception", -A=3, -B=3, output_mode="content")
```

**Glob: File discovery**
```bash
❌ bash find . -name "*.test.ts"
✅ Glob("**/*.test.ts")

❌ bash find src -type f -name "*.tsx"
✅ Glob("**/*.tsx", path="src")

❌ bash ls -R components/
✅ Glob("**/*", path="components")
```

**Edit: File modification**
```bash
❌ bash sed 's/old/new/g' file.ts
✅ Edit("file.ts", "old", "new", replace_all=true)

❌ bash sed -i 's/var /const /g' *.js
✅ Edit multiple files individually with Edit tool
```

**Write: File creation**
```bash
❌ bash echo "text" > file.txt
✅ Write("file.txt", "text")

❌ bash cat <<EOF > config.json
{"key": "value"}
EOF
✅ Write("config.json", '{"key": "value"}')
```

## Advanced Use Cases

**Pattern 1: Multi-file search with context**
```typescript
// Find all error handlers with surrounding code
Grep(pattern="catch.*Error", output_mode="content", -A=5, -B=5)
```

**Pattern 2: Targeted file subset**
```typescript
// Search only TypeScript test files
Grep(pattern="describe\\(", glob="**/*.test.ts")
```

**Pattern 3: Case-insensitive config search**
```typescript
// Find environment variable usage
Grep(pattern="process\\.env", -i=true, path="src")
```

**Pattern 4: Batch file discovery**
```typescript
// Find all Storybook stories
Glob("**/*.stories.tsx")

// Find all migration files
Glob("**/migrations/*.sql")
```

**Pattern 5: Precise edits without regex**
```typescript
// Safe refactoring - exact string match
Edit("service.ts", "UserService", "AccountService", replace_all=true)
```

## Anti-Patterns

❌ "Bash is fine for small files" - still slower
❌ Allowing "just this once"
❌ Using echo for messages to user
❌ Partial enforcement (some bash, some tools)

✅ 100% specialized tool enforcement
✅ Zero exceptions for file operations
✅ Clear violation messages
✅ Exact tool replacements shown

## Validation

Before allowing any file operation:
- ✅ Using Read/Write/Edit/Grep/Glob tools
- ✅ No bash cat/grep/find/sed/awk detected
- ✅ No output redirection for file writes
- ✅ No echo for user communication
- ✅ Exceptions verified (git, npm, pipes allowed)

## References

- `AGENTS.md:99-143` - Tool usage policy