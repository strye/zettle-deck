# zettle-deck Design Document

This document captures architectural and implementation decisions for the project. It is a living document — decisions are added as they are made and revised if reversed.

---

## Decisions

### D-001: Language Stack

**Decision:** Custom code is written in vanilla JavaScript (CommonJS). TypeScript is not used.

**Rationale:** Eliminates a build step, reduces toolchain complexity, and keeps the project accessible without a compilation pipeline.

**Constraints:**
- Python is allowed only when a capability genuinely requires it and a JavaScript equivalent does not exist or is significantly inferior (e.g., a library with no JS port).
- Bash is allowed for build scripts, deployment automation, and lightweight operational tasks (e.g., install scripts, CI steps).
- If Python is introduced, the reason must be documented in this file under a new decision entry.

**Applies to:** All source files under `packages/*/src/`, any scripts in `scripts/`.

---

### D-002: Module Format

**Decision:** CommonJS (`require` / `module.exports`) throughout all packages.

**Rationale:** Maximum Node.js compatibility without version constraints, no build step, simpler interop with the MCP SDK which currently targets CommonJS. ESM can be revisited if a dependency requires it.

**Applies to:** All `src/` files across all packages.

---

### D-003: Mono-Repo Structure

**Decision:** The project is organized as an npm workspaces mono-repo under `zettle-deck/`. Packages live under `packages/`.

**Rationale:** The original single-package design conflated concerns that should be independently versioned, tested, and potentially published. Splitting into focused packages improves separation of concerns and allows slip-kit to be reused without pulling in MCP server dependencies.

**Package responsibilities:**

| Package | npm name | Responsibility |
|---|---|---|
| `slip-kit` | `@zettle-deck/slip-kit` | Shared markdown utilities: fs sandbox, AST helpers, frontmatter, index |
| `zettel-forge` | `@zettle-deck/zettel-forge` | File I/O, search, edit tools (Cap 1, 2, 3) |
| `neuro-dex` | `@zettle-deck/neuro-dex` | Token-reduction / summarization tools; future RAG (Cap 4) |
| `zettel-agent` | `@zettle-deck/zettel-agent` | Runnable MCP server; composes zettel-forge + neuro-dex |

**Dependency graph (no cycles):**
```
slip-kit  (no internal deps)
    ↑
zettel-forge   neuro-dex
    ↑               ↑
        zettel-agent
```

**Applies to:** Repository layout, package.json workspaces, inter-package imports.

---

### D-004: Path Sandboxing

**Decision:** All file system access is sandboxed to a single configured repository root. Symlink traversal is rejected. Implemented in `slip-kit/src/fs.js`.

**Rationale:** Prevents path traversal attacks and accidental writes outside the intended vault. Centralizing this in slip-kit ensures consistent enforcement across zettel-forge and neuro-dex.

**Applies to:** All file I/O in `zettel-forge` and `neuro-dex`.

---

### D-005: Obsidian Local REST API

**Decision:** Not a runtime dependency. Direct file system access is the foundation. The Obsidian REST API is referenced for API design ideas only.

**Rationale:** Eliminates a required external process. The file-based approach works for any markdown repository, not just Obsidian vaults.

**Consequence:** `obsidianApiKey` will be removed from `config/config.json` once the Obsidian file-based tools are implemented.

---

## Open Decisions

- Minimum Node.js version to target.
- RAG backend strategy for neuro-dex: embedded vector store (vectra, hnswlib-node) vs. external (Chroma, Weaviate). Defer until Cap 4 RAG work begins.
- Per-package versioning vs. fixed-version lockstep across the mono-repo.
