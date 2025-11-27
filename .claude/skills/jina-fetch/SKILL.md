---
name: jina-fetch
description: Fetch URL using ~/bin/jina CLI toolchain, leveraging complete pipeline
auto_trigger: false
keywords: [jina, fetch, url]
---

# Jina Fetch

Uses the complete `/Users/jrad/bin/jina` CLI toolchain for fetching and processing URLs.

## CLI Toolchain

**Main Tool:** `/Users/jrad/bin/jina`
**Supporting Tools:** `jina-batch`, `jina-query`, `jina-monitor`, `jina-worker`

## Operations

**Fetch Single URL**
```bash
/Users/jrad/bin/jina <url>
```
Saves to `$JINA_CACHE_DIR/{domain}.md` (default: `~/jina-output/`)

**Fetch with Force Refresh**
```bash
/Users/jrad/bin/jina --force <url>
```

**Full Pipeline (Fetch → Chunk → Embed → Store)**
```bash
/Users/jrad/bin/jina pipeline <url>
```

**Batch Processing**
```bash
/Users/jrad/bin/jina-batch <file-with-urls>
```

## Workflow

**Single URL:** Use `/Users/jrad/bin/jina <url>` directly
**Multiple URLs:** Spawn parallel agents, each calling jina CLI
**Report:** Output saved filepath to user
