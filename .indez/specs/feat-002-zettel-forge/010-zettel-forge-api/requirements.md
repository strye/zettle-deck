# SPEC-010: zettel-forge Public API Surface

**Spec ID**: SPEC-010
**Feature**: [FEAT-002](../../../planning/features/FEAT-002-zettel-forge-file-tools.md) zettel-forge File Tools
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: SPEC-006, SPEC-007, SPEC-008, SPEC-009 (all zettel-forge tools complete)
**Blocks**: SPEC-012 — this is the Phase 2 → Phase 3 gate

## Overview

Wire all 11 zettel-forge tools together in `packages/zettel-forge/src/index.js` and run an integration test against a real temp vault. Same pattern as SPEC-005 for slip-kit.

## User Stories

### US-1: Consume zettel-forge from zettel-agent

**As a** zettel-agent developer
**I want to** `require('zettel-forge')` and get all 11 tool functions
**So that** the tool registry can register them all without importing internal paths

**Acceptance Criteria**:

- AC-1. WHEN `require('zettel-forge')` is called, SHALL export exactly: `readNote`, `writeNote`, `deleteNote`, `moveRenameNote`, `insertBlock`, `appendText`, `deleteBlock`, `replaceLines`, `searchNotes`, `readFrontmatter`, `writeFrontmatter`
- AC-2. All 11 exports SHALL follow the `(params, context) => Promise<result>` signature
- AC-3. WHEN any export is called with a path that escapes the sandbox, SHALL return SANDBOX_VIOLATION error

### US-2: Integration test against real vault

**Acceptance Criteria**:

- AC-4. WHEN integration tests run all 11 tools against a temp vault, all SHALL complete without uncaught exceptions
- AC-5. The integration test SHALL cover at least one happy-path and one error-path call per tool

## Functional Requirements

- **FR-1**: `packages/zettel-forge/src/index.js` SHALL re-export all 11 tool functions. _(References: AC-1)_
- **FR-2**: No circular dependencies between tool modules. _(References: AC-2)_

## Non-Functional Requirements

- **NFR-1** (Completeness): All 11 exports SHALL have JSDoc comments.
- **NFR-2** (No side effects): Importing `zettel-forge` SHALL not start any processes or open any file handles.

## Implementation Notes

- File: `packages/zettel-forge/src/index.js`
- Integration test: `packages/zettel-forge/test/integration.test.js`
- Use `createTempVault` from SPEC-000 for the integration test vault
