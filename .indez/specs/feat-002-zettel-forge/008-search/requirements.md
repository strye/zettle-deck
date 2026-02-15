# SPEC-008: Search Tools

**Spec ID**: SPEC-008
**Feature**: [FEAT-002](../../../planning/features/FEAT-002-zettel-forge-file-tools.md) zettel-forge File Tools
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: Medium — regex safety; performance on large vaults
**Dependencies**: SPEC-004 (wikilink/tag indexes), SPEC-005 (slip-kit API)
**Blocks**: SPEC-010
**Parallel with**: SPEC-006, SPEC-007, SPEC-009

## Overview

Implement `searchNotes` in `zettel-forge`. A single tool that supports four search modes: `fulltext`, `regex`, `tag`, and `backlink`. Full-text and regex modes scan file content. Tag and backlink modes query the in-memory indexes from context.

## Tool Signature

```js
searchNotes({ mode, query }, context)
// Returns: { results: [{ path, matchCount }] } | ErrorResult
```

## User Stories

### US-1: Full-text search

**Acceptance Criteria**:
- AC-1. WHEN `mode: 'fulltext'` and a query string are provided, SHALL return all notes containing the query string (case-insensitive)
- AC-2. Each result SHALL include `{ path, matchCount }` where `matchCount` is the number of occurrences
- AC-3. IF no notes match, SHALL return `{ results: [] }` (not an error)
- AC-4. IF query is empty, SHALL return `{ error: true, code: 'INVALID_PARAMS', message: 'query is required' }`

### US-2: Regex search

**Acceptance Criteria**:
- AC-5. WHEN `mode: 'regex'` and a valid regex pattern are provided, SHALL return all notes matching the pattern
- AC-6. IF the pattern is not a valid regex, SHALL return `{ error: true, code: 'INVALID_PARAMS', message: 'Invalid regex: ...' }`
- AC-7. IF the pattern could cause catastrophic backtracking (ReDoS), SHALL return INVALID_PARAMS error
- AC-8. Each result SHALL include `{ path, matchCount }`

### US-3: Tag filter search

**Acceptance Criteria**:
- AC-9. WHEN `mode: 'tag'` and a tag name are provided, SHALL return all notes from `context.tagIndex` with that tag
- AC-10. Tag matching SHALL be case-sensitive (tags are case-sensitive in Obsidian)
- AC-11. IF the tag is not in the index, SHALL return `{ results: [] }`

### US-4: Backlink search

**Acceptance Criteria**:
- AC-12. WHEN `mode: 'backlink'` and a target note name are provided, SHALL return all notes from `context.wikilinkIndex` that link to it
- AC-13. IF no notes link to the target, SHALL return `{ results: [] }`
- AC-14. The query SHALL match the link target by filename without extension (e.g., query `my-note` matches `[[my-note]]`)

### US-5: Invalid mode

**Acceptance Criteria**:
- AC-15. IF `mode` is not one of `fulltext`, `regex`, `tag`, `backlink`, SHALL return `{ error: true, code: 'INVALID_PARAMS', message: 'Invalid mode: ...' }`

## Functional Requirements

- **FR-1**: `fulltext` and `regex` modes SHALL use `context.sandbox.readFile` to read each note — no direct `fs` access. _(References: AC-1, AC-5)_
- **FR-2**: `tag` mode SHALL query `context.tagIndex` directly (no file scanning). _(References: AC-9)_
- **FR-3**: `backlink` mode SHALL query `context.wikilinkIndex` directly (no file scanning). _(References: AC-12)_
- **FR-4**: Regex input SHALL be validated before use to prevent ReDoS. _(References: AC-7)_

## Non-Functional Requirements

- **NFR-1** (Safety): Regex patterns SHALL be validated; overly complex patterns SHALL be rejected.
- **NFR-2** (Performance): Full-text and regex search are O(n) scans; document this limitation in implementation notes.
- **NFR-3** (Consistency): All four modes return the same result shape `{ results: [...] }`.

## Implementation Notes

- File: `packages/zettel-forge/src/tools/search-notes.js`
- ReDoS prevention: use a regex complexity check library or set a timeout on regex execution
- For fulltext scan: `content.toLowerCase().includes(query.toLowerCase())`; count matches with a global regex
- For vault file enumeration: the sandbox needs a recursive `walkFiles` method — add to sandbox if not in SPEC-001
- Consider: full-text scan on 1,000 files is slow; document as v0.1.0 known limitation; SPEC-016 (RAG) is the long-term solution
