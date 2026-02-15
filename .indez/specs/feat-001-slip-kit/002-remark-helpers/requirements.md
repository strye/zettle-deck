# SPEC-002: Remark AST Pipeline

**Spec ID**: SPEC-002
**Feature**: [FEAT-001](../../../planning/features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Medium — ESM/CJS bridge must be validated as a spike first
**Dependencies**: SPEC-000 (test infrastructure)
**Blocks**: SPEC-003, SPEC-004, SPEC-005

## Overview

Implement `createRemarkPipeline()` in `packages/slip-kit/src/remark-helpers.js`. Wraps remark@15 + unified@11 (both ESM-only) for use from CommonJS via Node 22.12.0's `require(esm)` support. Provides `parse`, `stringify`, and `walk` helpers used by frontmatter, edit tools, and index builders.

## Pre-Implementation Spike Required

**BEFORE writing SPEC-002 code**, validate that `require('remark')` works correctly in Node 22.12.0 CommonJS. Create a minimal spike script (`scripts/spike-esm-bridge.js`) and document the result in `design.md`. If the bridge does not work, the architecture decision must be revisited before proceeding.

## User Stories

### US-1: Parse markdown to AST

**As a** tool implementation
**I want to** parse a markdown string into an MDAST
**So that** I can traverse and modify note structure programmatically

**Acceptance Criteria**:

- AC-1. WHEN a markdown string is passed to `parse()`, the system SHALL return a valid MDAST root node
- AC-2. WHEN the markdown contains headings, the MDAST SHALL contain heading nodes with the correct depth and text
- AC-3. WHEN the markdown contains wikilinks (`[[target]]`), the MDAST SHALL preserve them (as text or custom nodes)
- AC-4. IF an empty string is parsed, the system SHALL return an empty root node without error

### US-2: Stringify AST to markdown

**As a** tool implementation
**I want to** convert an MDAST back to a markdown string
**So that** I can write modified ASTs back to files without corruption

**Acceptance Criteria**:

- AC-5. WHEN a valid MDAST is passed to `stringify()`, the system SHALL return a markdown string
- AC-6. WHEN a markdown string is parsed and then stringified without modification, the output SHALL be semantically equivalent to the input

### US-3: Walk AST nodes

**As a** tool implementation
**I want to** traverse all nodes in an MDAST with a visitor function
**So that** I can extract information (headings, links, tags) from the AST

**Acceptance Criteria**:

- AC-7. WHEN `walk(ast, visitor)` is called, the visitor SHALL be called for every node in document order
- AC-8. WHEN the visitor is called, it SHALL receive `(node, index, parent)` arguments
- AC-9. WHEN the visitor returns `false`, the walk SHALL skip the current node's children

## Functional Requirements

- **FR-1**: `createRemarkPipeline()` SHALL return `{ parse, stringify, walk }`. _(References: US-1, US-2, US-3)_
- **FR-2**: `parse` and `stringify` SHALL use the same unified processor instance to ensure consistent output. _(References: AC-5, AC-6)_
- **FR-3**: `walk` SHALL use `unist-util-visit` or equivalent for reliable traversal. _(References: AC-7, AC-8, AC-9)_

## Non-Functional Requirements

- **NFR-1** (Compatibility): The module SHALL load correctly via `require()` from CommonJS in Node 22.12.0.
- **NFR-2** (Round-trip fidelity): Parse → stringify round-trips SHALL not add or remove blank lines for standard markdown constructs.

## Implementation Notes

- File: `packages/slip-kit/src/remark-helpers.js`
- Dependencies already in slip-kit package.json: `remark`, `remark-parse`, `remark-stringify`, `unified`
- Spike script: `scripts/spike-esm-bridge.js` — document outcome in `design.md` before implementing
- Use dynamic `require()` or top-level async import pattern if needed for ESM bridge
