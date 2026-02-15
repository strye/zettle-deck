# Structure Steering

**Created**: 2026-02-14
**Last Updated**: 2026-02-14

## Repository Layout

```
zettle-deck/
├── packages/                     # npm workspaces — all source code
│   ├── slip-kit/                 # shared utilities (no internal deps)
│   │   ├── src/
│   │   │   ├── index.js          # public API surface
│   │   │   ├── fs-sandbox.js     # sandboxed file access
│   │   │   ├── remark-helpers.js # remark pipeline + AST walk
│   │   │   ├── frontmatter.js    # YAML frontmatter parse/write
│   │   │   ├── wikilink-index.js # wikilink backlink map
│   │   │   └── tag-index.js      # tag → notes map
│   │   ├── test/
│   │   └── package.json
│   ├── zettel-forge/             # file I/O + edit tools
│   │   ├── src/
│   │   │   ├── index.js          # exports all tool functions
│   │   │   ├── tools/            # one file per tool
│   │   │   │   ├── read-note.js
│   │   │   │   ├── write-note.js
│   │   │   │   └── ...
│   │   ├── test/
│   │   └── package.json
│   ├── neuro-dex/                # summarization + RAG
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── summarize-note.js
│   │   │   ├── distill-notes.js
│   │   │   └── compress-context.js
│   │   ├── test/
│   │   └── package.json
│   └── zettel-agent/             # MCP server entry point
│       ├── src/
│       │   ├── index.js          # server entry point
│       │   ├── config-loader.js
│       │   ├── tool-registry.js
│       │   └── server-lifecycle.js
│       ├── test/
│       └── package.json
├── config/
│   └── config.json               # vault root + optional Obsidian config
├── scripts/                      # bash build/install/ops scripts
├── .indez/                       # SDD specifications (this directory)
│   ├── steering/                 # product, tech, structure, sdd-principles, project-conventions
│   ├── planning/
│   │   ├── epics/                # EPIC-NNN-slug.md
│   │   └── features/             # FEAT-NNN-slug.md
│   └── specs/
│       ├── feat-001-slip-kit/    # specs belonging to FEAT-001
│       ├── feat-002-zettel-forge/ # specs belonging to FEAT-002
│       ├── feat-003-neuro-dex/   # specs belonging to FEAT-003
│       └── feat-004-zettel-agent/ # specs belonging to FEAT-004
├── package.json                  # workspace root
├── CLAUDE.md                     # Claude Code project context
├── plan.md                       # legacy build plan (reference)
└── design.md                     # legacy design doc (reference)
```

## Naming Conventions

- **Package names**: kebab-case (`slip-kit`, `zettel-forge`)
- **Source files**: kebab-case (`fs-sandbox.js`, `read-note.js`)
- **Functions/variables**: camelCase (`createFsSandbox`, `buildWikilinkIndex`)
- **Constants**: UPPER_SNAKE_CASE (`VAULT_ROOT`, `ERROR_CODES`)
- **Epic files**: `EPIC-NNN-slug.md` (e.g., `EPIC-001-mcp-server-platform.md`)
- **Feature files**: `FEAT-NNN-slug.md` (e.g., `FEAT-001-slip-kit-foundation.md`)
- **Spec directories**: `NNN-slug/` (e.g., `001-fs-sandbox/`)

## File Organization

- **One tool per file** in `zettel-forge/src/tools/`
- **One module per concern** in `slip-kit/src/`
- **Test files** mirror source structure under `test/`
- **No barrel re-exports** except `src/index.js` (the public API surface of each package)
- **No circular dependencies** between modules within a package

## Module Exports Pattern

Each package's `src/index.js` is the only public API surface:

```js
// slip-kit/src/index.js
const { createFsSandbox } = require('./fs-sandbox');
const { createRemarkPipeline } = require('./remark-helpers');
const { parseFrontmatter, stringifyFrontmatter } = require('./frontmatter');
const { buildWikilinkIndex } = require('./wikilink-index');
const { buildTagIndex } = require('./tag-index');

module.exports = {
  createFsSandbox,
  createRemarkPipeline,
  parseFrontmatter,
  stringifyFrontmatter,
  buildWikilinkIndex,
  buildTagIndex,
};
```

## Tool Function Signature

All MCP tools follow this signature:

```js
// (params, context) => result | { error: true, code, message }
async function readNote(params, context) {
  const { path } = params;
  const { sandbox } = context;
  // ...
}
```

## Config File Schema

```json
{
  "vaultRoot": "/absolute/path/to/vault",
  "obsidianEnabled": false,
  "obsidianApiKey": "",
  "obsidianPort": 27123
}
```
