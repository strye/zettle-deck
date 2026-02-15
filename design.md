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

### D-006: Node.js Minimum Version

**Decision:** Node.js 22.12.0 is the minimum supported version.

**Rationale:** Node 22 is the current LTS line. The 22.12.0 floor specifically is required because `require()` of ESM modules (the `require(esm)` feature) became unflagged and stable in 22.12.0. This is needed for LanceDB (`@lancedb/lancedb`), which ships ESM-only. Pinning to 22.12.0 avoids wrapping every LanceDB import in `import()` while maintaining CommonJS throughout the rest of the codebase.

**Applies to:** All packages. Document in each `package.json` `engines` field when packages are fleshed out.

---

### D-007: neuro-dex RAG Stack

**Decision:** Use `@lancedb/lancedb` as the embedded vector store and `@huggingface/transformers` with `Xenova/all-MiniLM-L6-v2` as the local embedding model.

**Rationale:**

*Vector store — LanceDB:*
- Fully embedded; no separate server or Docker container required.
- Active maintenance by a funded team (used in production by AnythingLLM and others).
- Supports ANN vector search + BM25 full-text search + SQL metadata filtering in a single library — the hybrid search is genuinely useful for note retrieval.
- Ships ESM-only, but `require('@lancedb/lancedb')` works natively on Node 22.12.0+ (see D-006).
- Scales well beyond the expected 10,000-note corpus.

*Alternatives considered and rejected:*
- **vectra**: Pure JS and very simple, but no ANN index (linear scan) and uncertain maintenance.
- **hnswlib-node**: Solid HNSW performance and true CJS, but ~2-year-old last release; no built-in persistence helpers or metadata filtering.
- **chromadb**: No embedded mode for Node.js — always requires a running Python/Docker server.
- **usearch**: Excellent performance but too low-level for this use case; no metadata filtering or persistence helpers.

*Embeddings — `@huggingface/transformers` (ONNX Runtime in-process):*
- No external process, no API key, no Ollama daemon required.
- Model (`all-MiniLM-L6-v2`) downloads once (~23 MB) and caches to disk.
- Works on macOS Apple Silicon and x64 via ONNX Runtime.
- The package is ESM-only; wrap in a single `async function getEmbedding()` helper that does `await import('@huggingface/transformers')` once.

*Ollama alternative:* If a user already runs Ollama, calling `fetch('http://localhost:11434/api/embed')` with `nomic-embed-text` is a higher-quality option. This will be an optional configuration path, not the default.

**Implementation location:** `neuro-dex/src/lib/embeddings.js` (embedding helper) and `neuro-dex/src/lib/vector-store.js` (LanceDB wrapper).

**Applies to:** `@zettle-deck/neuro-dex` package only.

---

### D-008: Versioning Strategy

**Decision:** Per-package independent versioning. Each package in `packages/` has its own version in its `package.json` and is released independently.

**Rationale:** The packages have different maturity trajectories and different consumers. `slip-kit` is a utility library that should be publishable and consumable independently. `neuro-dex` may iterate at a different cadence than `zettel-forge`. Lockstep versioning would force version bumps on unchanged packages, which is misleading to downstream consumers.

**Consequence:** Inter-package dependencies within the mono-repo use `"*"` (workspace wildcard) during development. When publishing, the workspace protocol resolves to concrete semver ranges.

**Applies to:** All `packages/*/package.json` files.

---

## Open Decisions

- Ollama integration in neuro-dex: optional config flag vs. auto-detected vs. not supported initially?
