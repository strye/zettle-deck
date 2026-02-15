# SPEC-007: Manual Edit Tools

**Spec ID**: SPEC-007
**Feature**: [FEAT-002](../../../planning/features/FEAT-002-zettel-forge-file-tools.md) zettel-forge File Tools
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: Medium — heading AST identification has edge cases
**Dependencies**: SPEC-005 (slip-kit public API)
**Blocks**: SPEC-010
**Parallel with**: SPEC-006, SPEC-008, SPEC-009

## Overview

Implement the four note-editing tools in `zettel-forge`: `insertBlock`, `appendText`, `deleteBlock`, `replaceLines`. These are Cap 2 tools. `insertBlock` and `deleteBlock` use the remark AST pipeline to identify headings. `appendText` and `replaceLines` operate at the line level.

## Tool Signatures

```js
insertBlock({ path, afterHeading, content }, context)
appendText({ path, text }, context)
deleteBlock({ path, heading }, context)
replaceLines({ path, startLine, endLine, replacement }, context)
```

## User Stories

### US-1: Insert a block after a heading

**Acceptance Criteria**:
- AC-1. WHEN a path, heading text, and block content are provided, SHALL insert the content immediately after the heading line
- AC-2. IF the heading is not found in the note, SHALL return `{ error: true, code: 'NOT_FOUND', message: 'Heading not found: [heading]' }`
- AC-3. WHEN multiple headings exist with the same text, SHALL insert after the first occurrence
- AC-4. Heading matching SHALL be case-insensitive
- AC-5. IF path escapes sandbox, SHALL return SANDBOX_VIOLATION error

### US-2: Append text to a note

**Acceptance Criteria**:
- AC-6. WHEN a path and text are provided, SHALL append the text to the end of the note
- AC-7. The appended text SHALL be separated from existing content by a newline
- AC-8. IF the file does not exist, SHALL return NOT_FOUND error

### US-3: Delete a block by heading

**Acceptance Criteria**:
- AC-9. WHEN a path and heading text are provided, SHALL delete the heading and all content until the next heading of equal or higher level
- AC-10. IF the heading is not found, SHALL return NOT_FOUND error
- AC-11. IF the heading is the last section, SHALL delete to end of file

### US-4: Replace a line range

**Acceptance Criteria**:
- AC-12. WHEN a path, `startLine`, `endLine` (1-indexed, inclusive), and replacement text are provided, SHALL replace those lines
- AC-13. IF `startLine` or `endLine` is out of bounds (less than 1 or greater than line count), SHALL return `{ error: true, code: 'INVALID_PARAMS', message: '...' }`
- AC-14. IF `startLine > endLine`, SHALL return INVALID_PARAMS error

## Functional Requirements

- **FR-1**: `insertBlock` and `deleteBlock` SHALL use `createRemarkPipeline().parse()` from slip-kit for heading identification. _(References: AC-1, AC-9)_
- **FR-2**: All four tools SHALL use the read-modify-write pattern: read file → modify → write back. _(References: all ACs)_
- **FR-3**: All tools SHALL validate paths against the sandbox. _(References: AC-5)_

## Non-Functional Requirements

- **NFR-1** (Correctness): Edit tools SHALL not corrupt frontmatter when modifying note body.
- **NFR-2** (Edge cases): Unit tests SHALL cover: empty file, heading at end of file, line numbers at boundary.

## Implementation Notes

- Files: `packages/zettel-forge/src/tools/insert-block.js`, `append-text.js`, `delete-block.js`, `replace-lines.js`
- For heading identification: parse AST, find the heading node matching the text, use its position to determine insertion/deletion range in the raw file string
- Consider using `remark-frontmatter` to strip frontmatter before heading traversal to avoid false matches
- `replaceLines`: split file content by `\n`, replace slice, rejoin
