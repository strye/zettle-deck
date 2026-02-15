# SPEC-003: Frontmatter Parse/Write

**Spec ID**: SPEC-003
**Feature**: [FEAT-001](../../../planning/features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: SPEC-002 (remark pipeline)
**Blocks**: SPEC-005, SPEC-006, SPEC-009

## Overview

Implement `parseFrontmatter(content)` and `stringifyFrontmatter(data, body)` in `packages/slip-kit/src/frontmatter.js`. Uses gray-matter as the primary YAML parser. The body returned by parse and accepted by stringify is the markdown content without the frontmatter block.

## Parsing Strategy Decision

gray-matter is the primary parser. `remark-frontmatter` is used only when operating on ASTs (e.g., in edit tools that need to strip the frontmatter from the AST before heading traversal). `parseFrontmatter` and `stringifyFrontmatter` use gray-matter directly — they do not go through the remark pipeline.

## User Stories

### US-1: Parse frontmatter from note content

**As a** tool implementation
**I want to** extract the YAML frontmatter and markdown body from a note string
**So that** I can read and modify metadata independently of the content

**Acceptance Criteria**:

- AC-1. WHEN a note string with YAML frontmatter is parsed, the system SHALL return `{ data: object, body: string }` where `body` does not include the frontmatter block
- AC-2. WHEN a note string with no frontmatter is parsed, the system SHALL return `{ data: {}, body: fullContent }`
- AC-3. WHEN frontmatter contains string, number, boolean, and array values, the system SHALL correctly parse all types
- AC-4. IF the YAML frontmatter is malformed, the system SHALL return `{ error: true, code: 'PARSE_ERROR', message: '...' }` rather than throwing

### US-2: Serialize frontmatter and body

**As a** tool implementation
**I want to** combine a frontmatter data object and markdown body back into a note string
**So that** I can write updated metadata back to a file

**Acceptance Criteria**:

- AC-5. WHEN a data object and body string are provided, the system SHALL return a string with `---\n[yaml]\n---\n[body]` format
- AC-6. WHEN an empty data object is provided with a body, the system SHALL return just the body (no empty frontmatter block)
- AC-7. WHEN a note is round-tripped (parse then stringify), the system SHALL produce output equivalent to the input

## Functional Requirements

- **FR-1**: `parseFrontmatter(content)` SHALL use gray-matter to parse the frontmatter. _(References: AC-1, AC-2, AC-3, AC-4)_
- **FR-2**: `stringifyFrontmatter(data, body)` SHALL produce valid YAML-fenced frontmatter. _(References: AC-5, AC-6, AC-7)_
- **FR-3**: Both functions SHALL be pure (no side effects, no filesystem access). _(References: all ACs)_

## Non-Functional Requirements

- **NFR-1** (Round-trip): Parse → stringify SHALL produce byte-equivalent output for all standard YAML scalar types.
- **NFR-2** (Safety): YAML parse errors SHALL never propagate as uncaught exceptions.

## Implementation Notes

- File: `packages/slip-kit/src/frontmatter.js`
- `gray-matter` is already in slip-kit's package.json dependencies
- `remark-frontmatter` is in slip-kit's package.json for use in SPEC-004 (AST work); not used directly in this spec
