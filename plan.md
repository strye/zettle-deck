# zettle-mcp Build Plan

## Overview

An MCP (Model Context Protocol) server that wraps a markdown-based knowledge repository, enabling AI assistants to programmatically interact with notes, zettels, and Obsidian vaults.

---

## Capability Areas

### 1. File Read/Write

Core CRUD operations on markdown files within the repository.

**Tools to expose:**
- `read_note` — read a file by path, return raw markdown + frontmatter
- `write_note` — create or overwrite a file at a given path
- `append_note` — append content to an existing file
- `delete_note` — remove a file from the repository
- `list_notes` — list files in a directory, optionally recursive

**Considerations:**
- Path validation and sandboxing to the configured repository root
- Preserve line endings and encoding
- Support both absolute (within root) and relative paths

---

### 2. Manual Edit Support

Allow AI-assisted edits that respect the file's existing structure.

**Tools to expose:**
- `patch_note` — apply a targeted diff/replacement within a file (find-and-replace at block level)
- `insert_section` — insert content at a named heading anchor
- `replace_section` — replace content under a specific heading

**Considerations:**
- Avoid overwriting unrelated sections
- Heading-aware patching (parse AST, not raw string replacement)

---

### 3. Search

Full-text and structured search across the repository.

**Tools to expose:**
- `search_notes` — full-text search, return matching files + excerpts
- `search_by_tag` — find notes with a given frontmatter tag
- `search_by_frontmatter` — query by arbitrary frontmatter key/value pairs
- `list_tags` — enumerate all tags in the repository
- `find_backlinks` — find notes that link to a given note

**Considerations:**
- Index-based approach (build an in-memory or SQLite index at startup) vs. live grep
- Start with live ripgrep-style search; add an index if performance requires it
- Support regex patterns

---

### 4. LLM Token Reduction / Summarization

Reduce token cost when an AI needs repository context.

**Tools to expose:**
- `summarize_note` — return a condensed version of a note (headings + first paragraph of each section)
- `get_outline` — return only the heading hierarchy of a note
- `get_frontmatter` — return only the frontmatter of a note
- `excerpt_note` — return a windowed slice of a file by line range or heading range

**Considerations:**
- These are read-only, low-cost tools the LLM can call before fetching full content
- Pair with `search_notes` to narrow scope before reading full files

---

### 5. Obsidian Integration

Support Obsidian-specific conventions on top of standard markdown.

**Tools to expose:**
- `resolve_wikilink` — convert `[[Note Title]]` to a file path
- `get_canvas` — read and parse an Obsidian `.canvas` file
- `list_attachments` — list non-markdown assets linked from a note
- `open_in_obsidian` — emit the `obsidian://` URI to open a note (optional, client-side)

**Obsidian Local REST API integration (if API key is configured):**
- `obsidian_search` — delegate search to the Obsidian Local REST API
- `obsidian_get_note` — fetch rendered note via the API

**Considerations:**
- Wikilink resolution requires a title-to-path index built from filenames and `aliases` frontmatter
- Canvas files are JSON; expose a parsed representation
- Graceful degradation when Obsidian API is unavailable

---

### 6. Frontmatter Standards

Read, write, and validate YAML frontmatter.

**Tools to expose:**
- `get_frontmatter` — parse and return frontmatter as structured JSON
- `set_frontmatter_field` — set a single key without touching the rest of the file
- `validate_frontmatter` — check a note against a schema (configurable)
- `bulk_update_frontmatter` — apply a frontmatter patch across many files matching a query

**Considerations:**
- Use a YAML parser; do not regex-parse frontmatter
- Schema defined in `config.json` or a separate schema file
- Bulk operations should be dry-run capable

---

## Architecture

### Stack

- **Runtime:** Node.js (vanilla JavaScript — no TypeScript)
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Markdown parsing:** `unified` / `remark` (AST-level operations)
- **YAML:** `js-yaml` or `gray-matter` (frontmatter)
- **Search:** `ripgrep` subprocess or `minisearch` in-process index
- **Config:** `config/config.json` (already present)
- **Build/ops scripts:** Bash

### Project Structure

```
zettle-mcp/
├── config/
│   └── config.json          # repository root, Obsidian API key, symlinks
├── src/
│   ├── index.js             # MCP server entrypoint
│   ├── config.js            # config loader
│   ├── tools/
│   │   ├── files.js         # read/write/delete/list tools
│   │   ├── edit.js          # patch/insert/replace tools
│   │   ├── search.js        # search tools
│   │   ├── summarize.js     # token-reduction tools
│   │   ├── obsidian.js      # Obsidian-specific tools
│   │   └── frontmatter.js   # frontmatter tools
│   └── lib/
│       ├── fs.js            # sandboxed file system helpers
│       ├── markdown.js      # remark AST utilities
│       ├── yaml.js          # frontmatter parse/write helpers
│       ├── index.js         # search index (wikilinks, tags)
│       └── obsidian-api.js  # Obsidian Local REST API client
├── scripts/
│   └── install.sh           # setup/install script
├── package.json
├── plan.md
├── design.md
└── readme.md
```

---

## Build Sequence

1. **Scaffold** — `package.json`, MCP server skeleton that starts and registers zero tools
2. **File I/O** — implement `read_note`, `write_note`, `list_notes`, `delete_note` with path sandboxing
3. **Frontmatter** — implement `get_frontmatter`, `set_frontmatter_field` using `gray-matter`
4. **Search** — implement `search_notes` (ripgrep subprocess), `search_by_tag`, `list_tags`
5. **Edit tools** — implement `patch_note`, `insert_section`, `replace_section` using remark AST
6. **Token reduction** — implement `get_outline`, `summarize_note`, `excerpt_note`
7. **Obsidian** — wikilink resolver, canvas reader; direct file access only (no REST API dependency)
8. **Bulk/validation** — `validate_frontmatter`, `bulk_update_frontmatter`
9. **Packaging** — define MCP server config for Claude Desktop / Claude Code integration

---

## Resolved Questions

**Single repository per server instance**
Each MCP server manages one repository root. A future orchestrator MCP server will coordinate multiple instances. Symlink support in `config.json` is not needed and will be removed from the config.

**Obsidian Local REST API**
Not required. Direct file system access is the foundation. The Obsidian Local REST API is a useful reference for API design but will not be a runtime dependency. Remove `obsidianApiKey` from `config.json` once Obsidian file-based integration is built.

**Frontmatter schema**
Deferred. Examples will be provided when development reaches the frontmatter validation capability.

**Symlinked directories**
Not supported. Symlinks in `config.json` will be manually removed. This server replaces the need for them.

**Write access control**
Not enforced at the server level. Tool exposure and access control is the responsibility of the implementer (Claude Desktop config, agent system prompt, etc.).

## Open Questions

- Module format for JavaScript source: CommonJS (`require`) or ESM (`import`)?
- Minimum Node.js version to target?
