# SPEC-012: MCP Server Core + Tool Registry

**Spec ID**: SPEC-012
**Feature**: [FEAT-004](../../../planning/features/FEAT-004-zettel-agent-mcp-server.md) zettel-agent MCP Server
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: Medium-High — first MCP SDK integration; context assembly is critical
**Dependencies**: SPEC-010 (zettel-forge API), SPEC-011 (config loader)
**Blocks**: SPEC-014

## Overview

Implement the MCP server in `packages/zettel-agent/src/`: config loading, sandbox and index initialization, tool registration for all 11 zettel-forge tools, and server lifecycle management (start, graceful shutdown). Uses `@modelcontextprotocol/sdk`.

**Note**: neuro-dex tools (SPEC-013) are registered in SPEC-014, not here. The server starts and is functional with zettel-forge tools only.

## Pre-Implementation Decision Required

**Index freshness strategy** must be finalized before this spec. The context object assembled here includes `wikilinkIndex` and `tagIndex`. If the strategy is startup-only, the assembly is straightforward. Document the decision in `design.md`.

## User Stories

### US-1: Start the MCP server

**As a** developer or MCP client host
**I want to** start the server with `node packages/zettel-agent/src/index.js`
**So that** AI assistants can connect and call tools

**Acceptance Criteria**:

- AC-1. WHEN the server is started, it SHALL load config, initialize sandbox and indexes, register tools, and begin accepting MCP connections
- AC-2. WHEN startup succeeds, the server SHALL log `zettle-deck MCP server started` to stderr
- AC-3. IF config loading fails, the server SHALL log the error to stderr and exit with code 1
- AC-4. All startup logs SHALL go to stderr; stdout is reserved for MCP protocol messages

### US-2: Register and invoke zettel-forge tools

**As an** AI assistant
**I want to** call zettle-deck tools by name
**So that** I can read, write, and search notes via MCP

**Acceptance Criteria**:

- AC-5. WHEN the server starts, all 11 zettel-forge tools SHALL be registered with the MCP SDK
- AC-6. WHEN a tool is called, the server SHALL construct and pass `{ sandbox, wikilinkIndex, tagIndex, config }` as the context
- AC-7. WHEN a tool returns `{ error: true, code, message }`, the server SHALL propagate this as an MCP error response
- AC-8. IF an unknown tool name is called, the server SHALL return an MCP-standard error (tool not found)

### US-3: Graceful shutdown

**As a** process manager
**I want to** the server to shut down cleanly on SIGTERM/SIGINT
**So that** no open handles are left and the process exits cleanly

**Acceptance Criteria**:

- AC-9. WHEN SIGTERM or SIGINT is received, the server SHALL shut down gracefully and exit with code 0
- AC-10. WHEN shutting down, the server SHALL log `zettle-deck MCP server stopping` to stderr
- AC-11. An unhandled error SHALL be logged to stderr and the process SHALL exit with code 1

## Functional Requirements

- **FR-1**: `server-lifecycle.js` SHALL handle start, stop, and error boundary. _(References: AC-1, AC-9, AC-11)_
- **FR-2**: `tool-registry.js` SHALL register all tools from `require('zettel-forge')` with the MCP SDK. _(References: AC-5, AC-6)_
- **FR-3**: The context object `{ sandbox, wikilinkIndex, tagIndex, config }` SHALL be assembled once at startup and passed to every tool call. _(References: AC-6)_
- **FR-4**: All server output to stdout SHALL be valid MCP protocol messages only. _(References: AC-4)_

## Non-Functional Requirements

- **NFR-1** (Startup time): Server SHALL be ready within 5 seconds of process start (excluding model download).
- **NFR-2** (Resilience): A tool call error SHALL not crash the server; the next call SHALL succeed.
- **NFR-3** (Protocol purity): No `console.log` in production code paths; use `console.error` for all logging.

## Implementation Notes

- Files: `packages/zettel-agent/src/index.js`, `config-loader.js`, `tool-registry.js`, `server-lifecycle.js`
- MCP SDK: `@modelcontextprotocol/sdk` — read its documentation before implementation
- Transport: stdio (standard MCP transport for local servers)
- Tool registration pattern: iterate over `require('zettel-forge')` exports, register each with the SDK
- The `sandbox` is created once: `createFsSandbox(config.vaultRoot)` from slip-kit
- Both indexes are built once at startup: `buildWikilinkIndex(config.vaultRoot, sandbox)`, `buildTagIndex(...)`
