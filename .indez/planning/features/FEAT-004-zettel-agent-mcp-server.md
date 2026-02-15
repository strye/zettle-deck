# zettel-agent MCP Server

**Feature ID**: FEAT-004
**Epic**: [EPIC-001](../epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Status**: Draft
**Package**: `zettel-agent`
**Depends on**: FEAT-001 (slip-kit), FEAT-002 (zettel-forge — SPEC-010 complete), FEAT-003 (neuro-dex — SPEC-013 complete)

## Overview

Implement the runnable MCP server that wires together all tools from zettel-forge and neuro-dex. Responsibilities: load and validate configuration, initialize the fs-sandbox and indexes, register all tools with the MCP SDK, and manage server lifecycle (start, graceful shutdown, error handling).

## Problem Statement

Without an MCP server entry point, all the tools in zettel-forge and neuro-dex are just functions — they cannot be called by AI assistants. zettel-agent is what transforms the tool library into a usable MCP server.

## Value Proposition

zettel-agent is the deployment unit. Once it starts, the AI assistant can call all 14 tools (11 zettel-forge + 3 neuro-dex) via the MCP protocol. It is the final integration layer that makes the project functional end-to-end.

## User Stories

### US-1: Load and validate configuration

**As a** developer running zettle-deck
**I want to** configure the vault root and optional settings in a JSON file
**So that** the server knows which vault to operate on without code changes

**Acceptance Criteria**:

- AC-1. WHEN `config/config.json` exists and contains a valid `vaultRoot` path, the system SHALL load the config without error
- AC-2. IF `config/config.json` is missing, the system SHALL exit with a clear error message indicating the expected location
- AC-3. IF `vaultRoot` is missing from the config, the system SHALL exit with a descriptive validation error
- AC-4. IF `vaultRoot` does not exist on disk, the system SHALL exit with a descriptive error
- AC-5. WHEN optional fields (`obsidianEnabled`, `obsidianApiKey`, `obsidianPort`) are absent, the system SHALL use safe defaults

### US-2: Register all tools

**As an** AI assistant
**I want to** call zettle-deck tools by name via the MCP protocol
**So that** I can invoke read-note, search-notes, summarize-note, and all other tools

**Acceptance Criteria**:

- AC-6. WHEN the server starts, the system SHALL register all 11 zettel-forge tools with the MCP tool registry
- AC-7. WHEN the server starts, the system SHALL register all 3 neuro-dex tools with the MCP tool registry
- AC-8. WHEN a registered tool is called, the system SHALL pass the correct context object `{ sandbox, wikilinkIndex, tagIndex, config }` to the tool function
- AC-9. IF an unknown tool name is called, the system SHALL return an MCP-standard error response
- AC-10. IF a tool returns `{ error: true, code, message }`, the system SHALL propagate this as an MCP error response

### US-3: Server lifecycle management

**As a** developer or process manager
**I want to** start and stop the MCP server cleanly
**So that** the server integrates well with process supervisors and development workflows

**Acceptance Criteria**:

- AC-11. WHEN `node packages/zettel-agent/src/index.js` is run, the server SHALL start and be ready to accept MCP connections
- AC-12. WHEN a `SIGTERM` or `SIGINT` signal is received, the server SHALL shut down gracefully without leaving open handles
- AC-13. WHEN the server encounters an unhandled error, the system SHALL log to stderr and exit with a non-zero code
- AC-14. All server logs SHALL go to stderr; stdout SHALL be reserved exclusively for the MCP protocol

### US-4: Full integration validation

**As a** developer
**I want to** verify all tools work end-to-end against a real vault
**So that** I have confidence in the full system before shipping

**Acceptance Criteria**:

- AC-15. WHEN an integration test starts the server and calls each tool, all 14 tools SHALL return expected results against a test vault
- AC-16. WHEN the test vault is cleaned up, the server SHALL shut down cleanly without errors

## Functional Requirements

- **FR-1**: The config loader SHALL validate `vaultRoot` existence before initializing any other component. _(References: AC-1–AC-5)_
- **FR-2**: The tool registry SHALL register tools from both zettel-forge and neuro-dex using the `@modelcontextprotocol/sdk` tool registration API. _(References: AC-6, AC-7)_
- **FR-3**: Every tool invocation SHALL receive a fully constructed context object with sandbox, both indexes, and the config. _(References: AC-8)_
- **FR-4**: The server SHALL handle SIGTERM and SIGINT with a graceful shutdown sequence. _(References: AC-12)_

## Non-Functional Requirements

- **NFR-1** (Startup time): The server SHALL be ready to accept connections within 5 seconds of process start (excluding model download).
- **NFR-2** (Reliability): An error in one tool call SHALL NOT crash the server; subsequent calls SHALL succeed normally.
- **NFR-3** (Observability): All errors SHALL be logged to stderr with enough context to debug (tool name, params summary, error code).
- **NFR-4** (Protocol correctness): stdout SHALL contain only valid MCP protocol messages; no `console.log` in production paths.

## Specs

| Spec | Name | Status | Dependencies |
|------|------|--------|-------------|
| [SPEC-011](../../specs/feat-004-zettel-agent/011-config-loader/requirements.md) | Config Loader | Draft | None (independent) |
| [SPEC-012](../../specs/feat-004-zettel-agent/012-mcp-server-core/requirements.md) | MCP Server Core + Tool Registry | Draft | SPEC-010, SPEC-011 |
| [SPEC-014](../../specs/feat-004-zettel-agent/014-server-integration/requirements.md) | Full Server Integration + Testing | Draft | SPEC-012, SPEC-013 |

## Technical Considerations

- SPEC-011 (config loader) is fully independent — can be built any time during Phase 1 or 2
- SPEC-012 is the highest-risk spec in Phase 3 — first integration of MCP SDK; allow extra time
- Context object assembly happens in SPEC-012; the `wikilinkIndex` and `tagIndex` are built at startup using slip-kit functions
- The index freshness decision (startup-only vs rebuild-on-write) must be finalized before SPEC-012

## Open Questions (Resolve Before SPEC-012)

1. **Index freshness**: Should write tools (write-note, delete-note, move-rename-note) invalidate and rebuild the indexes? Recommendation: startup-only for v0.1.0; mark as known limitation.
2. **Config schema completeness**: Finalize all config fields before SPEC-011 (at minimum: `vaultRoot`, `obsidianEnabled`, `obsidianApiKey`, `obsidianPort`, `model`).

## Out of Scope

- Obsidian bridge (SPEC-015, optional)
- HTTP transport (stdio only for v0.1.0)
- Multi-vault support
