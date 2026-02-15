# zettle-deck Build Plan

## Overview

A mono-repo of packages that together provide an MCP (Model Context Protocol) server for markdown-based knowledge repositories, enabling AI assistants to programmatically interact with notes, zettels, and Obsidian vaults.

---

## Mono-Repo Structure

```
zettle-deck/                    # mono-repo root
├── packages/
│   ├── zettel-forge/           # file I/O + search tools (Cap 1, 2, 3)
│   ├── neuro-dex/              # knowledge base indexing + RAG retrieval (Cap 4)
│   ├── zettel-agent/           # MCP server entrypoint — composes all packages
│   └── slip-kit/               # shared markdown utilities (used across packages)
├── config/
│   └── config.json             # repository root, Obsidian API key placeholder
├── package.json                # workspace root
├── plan.md
├── design.md
└── readme.md
```

---

## Packages

### slip-kit (`@zettle-deck/slip-kit`)

Shared utilities for working with markdown files. A dependency of all other packages.

**Responsibilities:**
- Sandboxed file system access (path validation, no symlink traversal)
- Remark AST parsing and traversal helpers
- Frontmatter parse/write (gray-matter + js-yaml)
- Wikilink and tag index utilities

**Key modules (`src/`):**
- `fs.js` — sandboxed file system helpers
- `markdown.js` — remark AST utilities
- `yaml.js` — frontmatter parse/write helpers
- `index.js` — wikilink/tag index builder

---

### zettel-forge (`@zettle-deck/zettel-forge`)

The primary file-level interface to a markdown repository. Implements capabilities 1, 2, and 3.

**Capability 1 — File Read/Write:**
- `read_note` — read a file by path, return raw markdown + frontmatter
- `write_note` — create or overwrite a file at a given path
- `append_note` — append content to an existing file
- `delete_note` — remove a file from the repository
- `list_notes` — list files in a directory, optionally recursive

**Capability 2 — Manual Edit Support:**
- `patch_note` — apply a targeted diff/replacement within a file (block level)
- `insert_section` — insert content at a named heading anchor
- `replace_section` — replace content under a specific heading

**Capability 3 — Search:**
- `search_notes` — full-text search, return matching files + excerpts
- `search_by_tag` — find notes with a given frontmatter tag
- `search_by_frontmatter` — query by arbitrary frontmatter key/value pairs
- `list_tags` — enumerate all tags in the repository
- `find_backlinks` — find notes that link to a given note

**Key modules (`src/`):**
- `tools/files.js` — read/write/delete/list
- `tools/edit.js` — patch/insert/replace
- `tools/search.js` — search tools
- `tools/frontmatter.js` — frontmatter tools
- `tools/obsidian.js` — Obsidian-specific tools
- `lib/` — delegates to slip-kit

**Considerations:**
- All file access sandboxed to configured repository root
- Heading-aware patching via AST (not raw string replacement)
- Search: ripgrep subprocess or minisearch in-process index

---

### neuro-dex (`@zettle-deck/neuro-dex`)

Knowledge base indexing and context retrieval. Implements capability 4.

**Capability 4 — LLM Token Reduction / Summarization:**
- `summarize_note` — condensed version of a note (headings + first paragraph per section)
- `get_outline` — heading hierarchy only
- `get_frontmatter` — frontmatter only
- `excerpt_note` — windowed slice of a file by line range or heading range

**Future:**
- RAG indexing pipeline (embedding generation, vector store)
- Semantic search over repository content

**Considerations:**
- Tools are read-only and designed to reduce token cost before fetching full content
- Pair with `search_notes` to narrow scope before reading full files

---

### zettel-agent (`@zettle-deck/zettel-agent`)

The runnable MCP server. Composes `zettel-forge`, `neuro-dex`, and `slip-kit` into a single MCP-compliant server for one repository.

**Responsibilities:**
- MCP server lifecycle (start, register tools, handle requests)
- Config loading (`config/config.json`)
- Tool registration from zettel-forge and neuro-dex
- Entry point for Claude Desktop / Claude Code MCP integration

**Stack:**
- `@modelcontextprotocol/sdk`
- CommonJS (`require`)
- Node.js, no compile step

---

## Capability Areas (Original Reference)

### 5. Obsidian Integration _(owned by zettel-forge)_

- `resolve_wikilink` — convert `[[Note Title]]` to a file path
- `get_canvas` — read and parse an Obsidian `.canvas` file
- `list_attachments` — list non-markdown assets linked from a note
- `open_in_obsidian` — emit the `obsidian://` URI to open a note

**Considerations:**
- Wikilink resolution requires a title-to-path index (built in slip-kit)
- Canvas files are JSON; expose a parsed representation
- Graceful degradation when Obsidian API is unavailable

### 6. Frontmatter Standards _(owned by zettel-forge)_

- `get_frontmatter` — parse and return frontmatter as structured JSON
- `set_frontmatter_field` — set a single key without touching the rest of the file
- `validate_frontmatter` — check a note against a configurable schema
- `bulk_update_frontmatter` — apply a frontmatter patch across matching files

**Considerations:**
- Use a YAML parser; no regex-parsing of frontmatter
- Schema defined in `config.json` or a separate schema file
- Bulk operations should be dry-run capable

---

## Build Sequence

1. **slip-kit** — `fs.js` sandbox, `markdown.js` AST helpers, `yaml.js` frontmatter parser
2. **zettel-forge file I/O** — `read_note`, `write_note`, `list_notes`, `delete_note`
3. **zettel-forge frontmatter** — `get_frontmatter`, `set_frontmatter_field`
4. **zettel-forge search** — `search_notes`, `search_by_tag`, `list_tags`
5. **zettel-forge edit** — `patch_note`, `insert_section`, `replace_section`
6. **neuro-dex** — `get_outline`, `summarize_note`, `excerpt_note`
7. **zettel-forge obsidian** — wikilink resolver, canvas reader
8. **zettel-forge bulk/validation** — `validate_frontmatter`, `bulk_update_frontmatter`
9. **zettel-agent** — wire all tools into MCP server, config loading, packaging

---

## Resolved Questions

**Single repository per server instance**
Each `zettel-agent` instance manages one repository root. Multiple instances can be registered in Claude Desktop to span multiple vaults.

**Obsidian Local REST API**
Not required. Direct file system access is the foundation. The API is a reference for design only, not a runtime dependency.

**Frontmatter schema**
Deferred. Examples provided when development reaches frontmatter validation.

**Symlinked directories**
Not supported. Path sandboxing in slip-kit will reject symlink traversal.

**Write access control**
Not enforced server-side. Tool exposure is the responsibility of the implementer.

**Module format**
CommonJS (`require`) throughout. Rationale: maximum Node.js compatibility, no build step, simpler interop with the MCP SDK. See design.md D-002.

**Node.js minimum version**
22.12.0. Required for stable `require(esm)` support needed by LanceDB. See design.md D-006.

**RAG backend for neuro-dex**
LanceDB (`@lancedb/lancedb`) for the vector store; `@huggingface/transformers` with `all-MiniLM-L6-v2` for local embeddings. Fully embedded — no separate server or API key required. See design.md D-007.

**Versioning**
Per-package independent versioning. See design.md D-008.

## Open Questions

- Ollama integration in neuro-dex: optional config flag, auto-detected, or deferred?
