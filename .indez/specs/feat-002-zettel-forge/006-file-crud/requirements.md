# SPEC-006: File CRUD Tools

**Spec ID**: SPEC-006
**Feature**: [FEAT-002](../../../planning/features/FEAT-002-zettel-forge-file-tools.md) zettel-forge File Tools
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: Low-Medium (move/rename has wikilink updater hook complexity)
**Dependencies**: SPEC-005 (slip-kit public API)
**Blocks**: SPEC-010, SPEC-017 (optional wikilink updater)
**Parallel with**: SPEC-007, SPEC-008, SPEC-009

## Overview

Implement the four file-level CRUD tools in `zettel-forge`: `readNote`, `writeNote`, `deleteNote`, `moveRenameNote`. These are Cap 1 tools. All use `context.sandbox` for file access and return `{ frontmatter, body }` on read or `{ error: true, code, message }` on failure.

## Tool Signatures

```js
// All tools: (params, context) => Promise<result | ErrorResult>
readNote({ path }, context)
writeNote({ path, content }, context)
deleteNote({ path, confirm }, context)
moveRenameNote({ sourcePath, destinationPath }, context)
```

## User Stories

### US-1: Read a note

**Acceptance Criteria**:
- AC-1. WHEN a valid in-sandbox path is provided, SHALL return `{ frontmatter: object, body: string }`
- AC-2. IF path does not exist, SHALL return `{ error: true, code: 'NOT_FOUND', message: '...' }`
- AC-3. IF path escapes sandbox, SHALL return `{ error: true, code: 'SANDBOX_VIOLATION', message: '...' }`
- AC-4. IF the note has no frontmatter, `frontmatter` SHALL be `{}`

### US-2: Write a note

**Acceptance Criteria**:
- AC-5. WHEN a valid path and string content are provided, SHALL create or overwrite the file
- AC-6. IF parent directories do not exist, SHALL create them before writing
- AC-7. IF path escapes sandbox, SHALL return SANDBOX_VIOLATION error
- AC-8. On success, SHALL return `{ success: true, path }`

### US-3: Delete a note

**Acceptance Criteria**:
- AC-9. WHEN a valid path and `confirm: true` are provided, SHALL delete the file
- AC-10. IF `confirm` is not `true`, SHALL return `{ error: true, code: 'INVALID_PARAMS', message: 'confirm must be true' }`
- AC-11. IF the file does not exist, SHALL return NOT_FOUND error
- AC-12. IF path escapes sandbox, SHALL return SANDBOX_VIOLATION error

### US-4: Move or rename a note

**Acceptance Criteria**:
- AC-13. WHEN valid `sourcePath` and `destinationPath` are provided, SHALL move the file
- AC-14. IF destination parent directory does not exist, SHALL create it
- AC-15. IF source does not exist, SHALL return NOT_FOUND error
- AC-16. IF either path escapes sandbox, SHALL return SANDBOX_VIOLATION error
- AC-17. On success, SHALL return `{ success: true, sourcePath, destinationPath }`
- AC-18. The tool SHALL NOT update wikilinks (that is SPEC-017); it SHALL log a warning that wikilinks may be stale

## Functional Requirements

- **FR-1**: All four tools SHALL validate paths against the sandbox before any operation. _(References: AC-3, AC-7, AC-12, AC-16)_
- **FR-2**: `readNote` SHALL use `parseFrontmatter` from slip-kit to split the content. _(References: AC-1, AC-4)_
- **FR-3**: All tools SHALL return structured errors, never throw to the MCP layer. _(References: all error ACs)_

## Non-Functional Requirements

- **NFR-1** (Security): Unit tests SHALL include path traversal cases for every tool.
- **NFR-2** (Atomicity): `writeNote` SHALL complete the full write before returning success.

## Implementation Notes

- Files: `packages/zettel-forge/src/tools/read-note.js`, `write-note.js`, `delete-note.js`, `move-rename-note.js`
- Use `context.sandbox.readFile`, `writeFile`, etc. — never import `fs` directly
- `deleteNote`: use `fs/promises unlink` via sandbox wrapper
- `moveRenameNote`: use `fs/promises rename` via sandbox wrapper (add `rename` to sandbox if not present)
