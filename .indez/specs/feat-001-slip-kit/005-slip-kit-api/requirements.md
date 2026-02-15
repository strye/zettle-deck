# SPEC-005: slip-kit Public API Surface

**Spec ID**: SPEC-005
**Feature**: [FEAT-001](../../../planning/features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: SPEC-001, SPEC-002, SPEC-003, SPEC-004 (all four slip-kit modules complete)
**Blocks**: SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-013 — this is the Phase 1 → Phase 2 gate

## Overview

Wire the four slip-kit modules together in `packages/slip-kit/src/index.js` and write integration tests against a real temp vault. This spec produces the public API surface that all downstream packages depend on.

## User Stories

### US-1: Consume slip-kit from other packages

**As a** zettel-forge or neuro-dex developer
**I want to** `require('slip-kit')` and access all exported functions
**So that** I don't need to reference internal module paths

**Acceptance Criteria**:

- AC-1. WHEN `require('slip-kit')` is called, the system SHALL export exactly: `createFsSandbox`, `createRemarkPipeline`, `parseFrontmatter`, `stringifyFrontmatter`, `buildWikilinkIndex`, `buildTagIndex`
- AC-2. WHEN each export is called with valid arguments, the system SHALL return the correct result without error
- AC-3. WHEN each export is called with invalid arguments (e.g., path outside sandbox), the system SHALL return or throw a structured error

### US-2: Verify integration against real vault

**As a** developer
**I want to** run an integration test that exercises all slip-kit exports against a real vault directory
**So that** I know the modules work together correctly on the real filesystem

**Acceptance Criteria**:

- AC-4. WHEN integration tests run against a temp vault with 3–5 sample notes, all six exported functions SHALL complete without error
- AC-5. WHEN the temp vault is cleaned up after tests, no temp directories SHALL remain on disk

## Functional Requirements

- **FR-1**: `packages/slip-kit/src/index.js` SHALL re-export all six functions from the four sub-modules. _(References: AC-1)_
- **FR-2**: No internal module SHALL require another internal module (no circular deps within slip-kit). _(References: AC-2)_

## Non-Functional Requirements

- **NFR-1** (Completeness): All six exports SHALL have JSDoc comments documenting their parameters and return types.
- **NFR-2** (No circular deps): Verify with `node -e "require('./packages/slip-kit')"` — no circular dependency warnings.

## Implementation Notes

- File: `packages/slip-kit/src/index.js`
- This spec is pure integration work — no new logic, just wiring and testing
- Integration test file: `packages/slip-kit/test/integration.test.js`
- Use the `createTempVault` helper from SPEC-000
