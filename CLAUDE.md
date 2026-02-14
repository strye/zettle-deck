# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A mono-repo of Node.js packages that together provide an MCP (Model Context Protocol) server for markdown-based knowledge repositories. It exposes tools that let AI assistants programmatically read, write, search, and manage markdown notes — including Obsidian vaults.

## Mono-Repo Structure

```
zettle-deck/
├── packages/
│   ├── slip-kit/       # shared markdown utilities (no internal deps)
│   ├── zettel-forge/   # file I/O, search, edit tools (depends on slip-kit)
│   ├── neuro-dex/      # summarization + RAG retrieval (depends on slip-kit)
│   └── zettel-agent/   # runnable MCP server (depends on all three)
├── config/
│   └── config.json     # repository root, Obsidian API key placeholder
├── package.json        # npm workspaces root
├── plan.md             # capability breakdown and build sequence
└── design.md           # architectural decisions (living document)
```

## Language and Tooling Rules

- **All custom source code is vanilla JavaScript (CommonJS — `require`/`module.exports`). No TypeScript, no JSX, no build step.**
- **Python** is only allowed when a capability cannot be reasonably implemented in JavaScript. Any Python added must be documented with a rationale in `design.md`.
- **Bash** is allowed for build scripts, install scripts, and operational tasks under `scripts/`.
- See `design.md` for the full record of architectural decisions.

## Package Responsibilities

| Package | Capabilities |
|---|---|
| `slip-kit` | fs sandbox, remark AST helpers, frontmatter parse/write, wikilink/tag index |
| `zettel-forge` | file read/write (Cap 1), manual edit (Cap 2), search (Cap 3), Obsidian file tools (Cap 5), frontmatter tools (Cap 6) |
| `neuro-dex` | token reduction / summarization (Cap 4); future RAG indexing |
| `zettel-agent` | MCP server lifecycle, config loading, tool registration |

## Project Status

Scaffolded. Package directories and `package.json` files exist for all four packages; `src/index.js` stubs are in place. No tool implementations exist yet.

See `plan.md` for the build sequence and `design.md` for resolved and open decisions.

## Open Questions (resolve before first source file)

- Minimum Node.js version to target?
- RAG backend for neuro-dex: embedded vs. external vector store?
- Per-package versioning vs. lockstep across the mono-repo?
