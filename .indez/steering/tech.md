# Tech Steering

**Created**: 2026-02-14
**Last Updated**: 2026-02-14

## Technology Stack

**Primary Language**: Vanilla JavaScript (CommonJS — `require`/`module.exports`)
**Runtime**: Node.js 22.12.0+ (required for stable `require(esm)`)
**Architecture**: Mono-repo with npm workspaces; four packages with a linear dependency chain
**Module Format**: CommonJS throughout; ESM dependencies consumed via `require(esm)` support in Node 22.12.0

## Package Dependency Chain

```
slip-kit (no internal deps)
    └── zettel-forge (depends on slip-kit)
    └── neuro-dex (depends on slip-kit)
            └── zettel-agent (depends on all three)
```

## Key Dependencies

| Dependency | Package | Purpose |
|-----------|---------|---------|
| `remark` + `unified` | slip-kit | Markdown AST parsing and stringification |
| `gray-matter` | slip-kit | YAML frontmatter parsing |
| `@huggingface/transformers` | neuro-dex | Local ONNX inference for summarization |
| `lancedb` | neuro-dex | Embedded vector store for future RAG |
| `@modelcontextprotocol/sdk` | zettel-agent | MCP server implementation |

## Architecture Decisions

### No TypeScript, No Build Step
All source is plain JavaScript. This eliminates build tooling, reduces contributor friction, and keeps the codebase readable without transpilation artifacts.

### CommonJS Throughout
Avoids top-level await complexity. Compatible with `require(esm)` for ESM-only dependencies (remark, lancedb). Simpler `require`/`module.exports` model throughout.

### ESM Bridge via Node 22.12.0
The minimum Node version (22.12.0) is a hard requirement. It provides stable `require(esm)` support needed for remark@15 (ESM-only) and lancedb (ESM-only). **Must be validated as a spike before SPEC-002 begins.**

### Embedded Everything
No external services required. LanceDB is embedded (no Docker). ONNX inference runs in-process. MCP server runs as a local stdio transport. This is a local-first tool.

### Tool Signature Convention
All MCP tools are implemented as plain functions: `(params, context) => result`
The context object carries: `{ sandbox, wikilinkIndex, tagIndex, config }`

### Error Shape Convention
All tools return structured errors on failure:
```js
{ error: true, code: 'ERROR_CODE', message: 'Human-readable message' }
```

Defined error codes: `NOT_FOUND`, `SANDBOX_VIOLATION`, `INVALID_PARAMS`, `PARSE_ERROR`, `IO_ERROR`

## Testing Strategy

- **Unit tests**: Per-module with `memfs` or `mock-fs` for fs mocking
- **Integration tests**: Against real temp vault directories
- **Framework**: Jest, declared as a devDependency in each package — not at the workspace root
- **No E2E MCP tests** planned initially
- See [mono-repo.md](mono-repo.md) for test locality rules and workspace-level run conventions

## Technical Constraints

- Node.js 22.12.0+ is a hard minimum — no polyfills, no workarounds
- No TypeScript, no JSX, no build step
- Python only if a capability cannot reasonably be implemented in JavaScript (document rationale in design.md)
- Bash allowed for `scripts/` only
- All file access must go through the fs-sandbox — no raw `fs` calls in tools
- stdout is reserved for MCP protocol — all logging goes to stderr

## Open Technical Questions

1. **remark ESM/CJS bridge** — Validate `require('remark')` works in Node 22.12.0 before starting SPEC-002
2. **Index freshness** — Startup-only vs rebuild-on-write for wikilink/tag indexes (decide before Phase 3)
3. **Summarization model** — Which HuggingFace model? Single-response vs streaming? (decide before SPEC-013)
4. **Ollama integration** — Optional config flag, auto-detect, or defer entirely?
5. **Obsidian bridge** — Always-on or config-gated? (recommend: `obsidianEnabled: false` default)
