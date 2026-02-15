# SPEC-009: Frontmatter MCP Tools

**Spec ID**: SPEC-009
**Feature**: [FEAT-002](../../../planning/features/FEAT-002-zettel-forge-file-tools.md) zettel-forge File Tools
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: SPEC-005 (slip-kit API — provides parseFrontmatter, stringifyFrontmatter)
**Blocks**: SPEC-010
**Parallel with**: SPEC-006, SPEC-007, SPEC-008

## Overview

Implement `readFrontmatter` and `writeFrontmatter` tools in `zettel-forge`. These are thin MCP wrappers over slip-kit's frontmatter functions. Cap 6.

## Tool Signatures

```js
readFrontmatter({ path }, context)
// Returns: { data: object } | ErrorResult

writeFrontmatter({ path, fields }, context)
// Returns: { success: true, data: object } | ErrorResult
```

## User Stories

### US-1: Read frontmatter

**Acceptance Criteria**:
- AC-1. WHEN a valid in-sandbox path is provided, SHALL return `{ data: object }` with the note's frontmatter
- AC-2. IF the note has no frontmatter, SHALL return `{ data: {} }`
- AC-3. IF the file does not exist, SHALL return NOT_FOUND error
- AC-4. IF path escapes sandbox, SHALL return SANDBOX_VIOLATION error

### US-2: Write/merge frontmatter

**Acceptance Criteria**:
- AC-5. WHEN a valid path and `fields` object are provided, SHALL merge `fields` into the existing frontmatter
- AC-6. Fields not present in `fields` SHALL be preserved unchanged
- AC-7. Fields present in `fields` SHALL overwrite existing values
- AC-8. The operation SHALL be atomic: read → merge → write in a single logical operation
- AC-9. On success, SHALL return `{ success: true, data: mergedFrontmatter }`
- AC-10. IF the file does not exist, SHALL return NOT_FOUND error
- AC-11. IF path escapes sandbox, SHALL return SANDBOX_VIOLATION error

## Functional Requirements

- **FR-1**: Both tools SHALL use `context.sandbox.readFile` and `writeFile`. _(References: all ACs)_
- **FR-2**: `writeFrontmatter` SHALL use `parseFrontmatter` to read, merge with `Object.assign`, then `stringifyFrontmatter` to write back. _(References: AC-5, AC-6, AC-7, AC-8)_
- **FR-3**: Both tools SHALL return structured errors, never throw. _(References: AC-3, AC-4, AC-10, AC-11)_

## Non-Functional Requirements

- **NFR-1** (Safety): `writeFrontmatter` SHALL never delete frontmatter fields not mentioned in the `fields` param.
- **NFR-2** (Atomicity): The read-merge-write cycle SHALL not be interrupted; if write fails, return IO_ERROR.

## Implementation Notes

- Files: `packages/zettel-forge/src/tools/read-frontmatter.js`, `write-frontmatter.js`
- `writeFrontmatter` merge logic: `const merged = { ...existingData, ...fields }`
- These are the simplest tools in zettel-forge — good starting point for new contributors
