# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that wraps a markdown-based knowledge repository. It exposes tools that let AI assistants programmatically read, write, search, and manage markdown notes — including Obsidian vaults.

## Language and Tooling Rules

- **All custom source code is vanilla JavaScript (no TypeScript, no JSX).** Do not introduce a compile step.
- **Python** is only allowed when a capability cannot be reasonably implemented in JavaScript. Any Python added must be documented with a rationale in `design.md`.
- **Bash** is allowed for build scripts, install scripts, and operational tasks under `scripts/`.
- See `design.md` for the full record of architectural decisions.

## Project Status

Pre-scaffolding. No source files exist yet. The planning documents define what will be built:

- `plan.md` — capability breakdown, proposed project structure, and build sequence
- `design.md` — architectural decisions (living document; add new decisions here as they are made)
- `config/config.json` — single repository configuration (root path, Obsidian API key placeholder)

## Planned Architecture

The server is organized into two layers under `src/`:

- **`src/tools/`** — one file per capability group, each registering MCP tools (`files.js`, `edit.js`, `search.js`, `summarize.js`, `obsidian.js`, `frontmatter.js`)
- **`src/lib/`** — shared utilities called by tools (`fs.js` for sandboxed file access, `markdown.js` for remark AST helpers, `yaml.js` for frontmatter parsing, `index.js` for the wikilink/tag index, `obsidian-api.js` reserved for future Obsidian REST integration)

Key design constraints:
- All file access is sandboxed to the single configured repository root
- No symlink traversal
- The Obsidian Local REST API is a design reference only — not a runtime dependency
- Write access control is delegated to the implementer via MCP tool exposure, not enforced server-side

## Open Questions (resolve before first source file)

- Module format: CommonJS (`require`) or ESM (`import`)?
- Minimum Node.js version to target?
