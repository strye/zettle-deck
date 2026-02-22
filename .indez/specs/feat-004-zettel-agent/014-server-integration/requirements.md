# SPEC-014: Full Server Integration + Testing

**Spec ID**: SPEC-014
**Feature**: [FEAT-004](../../../planning/features/FEAT-004-zettel-agent-mcp-server.md) zettel-agent MCP Server
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: Medium — integration testing surfaces unexpected cross-package issues
**Dependencies**: SPEC-012 (MCP server core), SPEC-013 (summarization tools)
**Blocks**: Nothing — this is the final validation gate for v0.1.0

## Overview

Register neuro-dex tools alongside zettel-forge tools in the server, run a full end-to-end integration test suite against a real temp vault, and produce a setup README. This spec completes the v0.1.0 release.

## User Stories

### US-1: All 14 tools available via MCP

**As an** AI assistant
**I want to** call all zettle-deck tools including summarization
**So that** I have the full capability set in a single MCP server

**Acceptance Criteria**:

- AC-1. WHEN the server starts, all 14 tools SHALL be registered: 11 from zettel-forge + 3 from neuro-dex
- AC-2. WHEN `summarizeNote`, `distillNotes`, and `compressContext` are called via MCP, they SHALL return valid results
- AC-3. WHEN the server is queried for available tools, it SHALL list all 14 tool names

### US-2: End-to-end integration test

**As a** developer
**I want to** run a test that exercises all 14 tools against a real vault via the MCP protocol
**So that** I have confidence in the full system before shipping

**Acceptance Criteria**:

- AC-4. WHEN the integration test suite runs, it SHALL start the server, call each of the 14 tools, and verify results
- AC-5. WHEN the integration tests complete, the server SHALL shut down cleanly
- AC-6. IF any tool returns an error in a happy-path test case, the test SHALL fail with a clear message
- AC-7. The integration test SHALL use a real temp vault (not mocked)

### US-3: Setup documentation

**As a** new user
**I want to** read a README to understand how to install and run zettle-deck
**So that** I can set it up without reading source code

**Acceptance Criteria**:

- AC-8. A `README.md` at the repo root SHALL document: prerequisites, installation steps, config setup, and how to run the server
- AC-9. The README SHALL include an example MCP client configuration showing how to add zettle-deck to an AI assistant

## Functional Requirements

- **FR-1**: `tool-registry.js` in zettel-agent SHALL be updated to also register the 3 neuro-dex tools. _(References: AC-1, AC-2, AC-3)_
- **FR-2**: An integration test file SHALL exercise all 14 tools. _(References: AC-4, AC-5, AC-6, AC-7)_
- **FR-3**: A `README.md` SHALL be created at the repo root. _(References: AC-8, AC-9)_

## Non-Functional Requirements

- **NFR-1** (Completeness): All 14 tools SHALL have at least one happy-path and one error-path integration test case.
- **NFR-2** (Documentation): README SHALL be accurate and tested against a fresh setup.

