# zettle-deck MCP Server Platform

**Epic ID**: EPIC-001
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Status**: In Progress
**Priority**: Critical

## Overview

Build a production-quality MCP (Model Context Protocol) server that gives AI assistants safe, sandboxed, programmatic access to markdown-based knowledge repositories. The server exposes tools for reading, writing, searching, editing, and summarizing markdown notes — with first-class support for Obsidian vaults.

The project is structured as a Node.js mono-repo with four packages that build on each other in a linear dependency chain: `slip-kit` → `zettel-forge` + `neuro-dex` → `zettel-agent`.

## Business Value

AI assistants cannot currently interact with local markdown vaults in a structured, safe way. Users must manually copy-paste content or use fragile workarounds. zettle-deck makes vault access a first-class MCP capability: the AI calls a tool, the tool accesses the vault safely, the AI gets structured results.

## Features

| Feature | Status | Specs | Priority |
|---------|--------|-------|----------|
| [FEAT-001](../features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation | Ready | SPEC-000 through SPEC-005 | Critical |
| [FEAT-002](../features/FEAT-002-zettel-forge-file-tools.md) zettel-forge File Tools | Draft | SPEC-006 through SPEC-010 | Critical |
| [FEAT-003](../features/FEAT-003-neuro-dex-ai-tools.md) neuro-dex AI Tools | Draft | SPEC-013 | High |
| [FEAT-004](../features/FEAT-004-zettel-agent-mcp-server.md) zettel-agent MCP Server | Draft | SPEC-011, SPEC-012, SPEC-014 | Critical |

## Optional / Phase 4 Features

| Feature | Status | Specs | Priority |
|---------|--------|-------|----------|
| Obsidian Bridge (Cap 5) | Deferred | SPEC-015 | Necessary |
| RAG Index | Deferred | SPEC-016 | Nice to have |
| Wikilink Updater | Deferred | SPEC-017 | Necessary |
| Canvas Tools | Deferred | SPEC-018 | Nice to have |

## Build Sequence

```
Phase 1 (slip-kit):     SPEC-000 → SPEC-001 + SPEC-002 (parallel) → SPEC-003 → SPEC-004 → SPEC-005
                                                                   → SPEC-011 (parallel, independent)
Phase 2 (zettel-forge): SPEC-006 + SPEC-007 + SPEC-008 + SPEC-009 (all parallel) → SPEC-010
                        SPEC-013 (neuro-dex, parallel with Phase 2)
Phase 3 (zettel-agent): SPEC-012 → SPEC-014
Phase 4 (optional):     SPEC-015, SPEC-016, SPEC-017, SPEC-018
```

## Dependencies, Risks & Milestones

### Blocking Pre-Implementation Decisions

1. **ESM/CJS bridge spike** — Validate `require('remark')` works in Node 22.12.0 before SPEC-002
2. **Index freshness strategy** — Decide startup-only vs rebuild-on-write before Phase 3
3. **Summarization model selection** — Choose HuggingFace model before SPEC-013
4. **Streaming vs single-response** — Decide for summarization tools before SPEC-013

### Risk Areas

- **SPEC-002 (remark ESM bridge)**: Medium risk — must validate first
- **SPEC-012 (MCP SDK integration)**: Medium-High risk — first integration of MCP SDK
- **SPEC-013 (ONNX inference in Node.js)**: High risk — less battle-tested than Python

## Success Criteria

- [ ] All 11 zettel-forge MCP tools callable and tested
- [ ] All 3 neuro-dex summarization tools callable and tested
- [ ] zettel-agent server starts cleanly from `node packages/zettel-agent/src/index.js`
- [ ] Sandbox rejects 100% of path traversal attempts in tests
- [ ] Full integration test suite passes against a temp vault
- [ ] README with setup and run instructions

## Notes

This epic encompasses the entire initial release of zettle-deck. All four features together constitute the v0.1.0 release milestone.
