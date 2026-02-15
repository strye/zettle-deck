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
├── scripts/            # bash build/install/ops scripts
├── .indez/             # SDD specifications (epics, features, specs, steering)
│   ├── steering/       # product, tech, structure steering docs
│   ├── planning/
│   │   ├── epics/      # EPIC-NNN-slug.md
│   │   └── features/   # FEAT-NNN-slug.md
│   └── specs/
│       ├── feat-001-slip-kit/     # specs for slip-kit (SPEC-000 through SPEC-005)
│       ├── feat-002-zettel-forge/ # specs for zettel-forge (SPEC-006 through SPEC-010)
│       ├── feat-003-neuro-dex/    # specs for neuro-dex (SPEC-013)
│       └── feat-004-zettel-agent/ # specs for zettel-agent (SPEC-011, SPEC-012, SPEC-014)
├── package.json        # npm workspaces root
├── plan.md             # legacy capability breakdown (reference only)
└── design.md           # legacy architectural decisions (reference only)
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

SDD specifications are fully written. See `.indez/planning/epics/EPIC-001-mcp-server-platform.md` for the build sequence and `.indez/steering/tech.md` for architectural decisions. `plan.md` and `design.md` are legacy reference documents.

## Key Decisions (see design.md for full rationale)

- **Node.js minimum:** 22.12.0 (required for `require(esm)` — needed by LanceDB)
- **Module format:** CommonJS throughout
- **neuro-dex RAG stack:** LanceDB (embedded vector store) + `@huggingface/transformers` ONNX (local embeddings, no API key or server needed)
- **Versioning:** Per-package independent versioning

## Open Questions

- Ollama integration in neuro-dex: optional config flag, auto-detected, or deferred?
