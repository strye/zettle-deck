# zettel-forge File Tools

**Feature ID**: FEAT-002
**Epic**: [EPIC-001](../epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Status**: Draft
**Package**: `zettel-forge`
**Depends on**: FEAT-001 (slip-kit Foundation — must be complete)

## Overview

Implement all MCP tools exposed by `zettel-forge`: file CRUD (Cap 1), manual edit tools (Cap 2), search (Cap 3), and frontmatter management (Cap 6). Each tool follows the `(params, context) => result` signature and uses the slip-kit sandbox for all file access.

## Problem Statement

AI assistants need structured, safe operations to read, write, edit, and search markdown notes. Raw filesystem access is unsafe and unstructured. zettel-forge wraps these operations as well-defined, sandboxed MCP tools with consistent error handling and clear parameter schemas.

## Value Proposition

zettel-forge is the primary user-facing value of zettle-deck. It exposes the 11 tools that AI assistants call most frequently to manage a knowledge base.

## User Stories

### US-1: Read a note

**As an** AI assistant
**I want to** read the content of a specific note
**So that** I can reference its frontmatter and body in my responses

**Acceptance Criteria**:

- AC-1. WHEN a valid in-sandbox path is provided, the system SHALL return `{ frontmatter, body }` for the note
- AC-2. IF the path does not exist, the system SHALL return `{ error: true, code: 'NOT_FOUND', message: '...' }`
- AC-3. IF the path escapes the sandbox, the system SHALL return `{ error: true, code: 'SANDBOX_VIOLATION', message: '...' }`

### US-2: Write a note

**As an** AI assistant
**I want to** create or overwrite a note at a given path
**So that** I can save generated or edited content to the vault

**Acceptance Criteria**:

- AC-4. WHEN a valid in-sandbox path and content are provided, the system SHALL create or overwrite the note
- AC-5. IF parent directories do not exist, the system SHALL create them recursively
- AC-6. IF the path escapes the sandbox, the system SHALL return a SANDBOX_VIOLATION error

### US-3: Delete a note

**As an** AI assistant
**I want to** delete a note from the vault
**So that** I can remove outdated or unwanted notes

**Acceptance Criteria**:

- AC-7. WHEN a valid path and `confirm: true` are provided, the system SHALL delete the note
- AC-8. IF `confirm` is not `true`, the system SHALL return an INVALID_PARAMS error without deleting
- AC-9. IF the file does not exist, the system SHALL return a NOT_FOUND error

### US-4: Move or rename a note

**As an** AI assistant
**I want to** move or rename a note within the vault
**So that** I can reorganize the knowledge base structure

**Acceptance Criteria**:

- AC-10. WHEN a valid source path and destination path are provided, the system SHALL move/rename the note
- AC-11. IF the destination path escapes the sandbox, the system SHALL return a SANDBOX_VIOLATION error
- AC-12. IF the source file does not exist, the system SHALL return a NOT_FOUND error

### US-5: Insert a block into a note

**As an** AI assistant
**I want to** insert a markdown block after a specific heading
**So that** I can add content to a specific section without overwriting the whole note

**Acceptance Criteria**:

- AC-13. WHEN a heading and block content are provided, the system SHALL insert the block immediately after the heading
- AC-14. IF the heading is not found, the system SHALL return `{ error: true, code: 'NOT_FOUND', message: 'Heading not found' }`
- AC-15. WHEN multiple headings exist with the same text, the system SHALL insert after the first occurrence

### US-6: Append text to a note

**As an** AI assistant
**I want to** append text to the end of a note
**So that** I can add new content without reading and rewriting the whole file

**Acceptance Criteria**:

- AC-16. WHEN a valid path and text are provided, the system SHALL append the text to the end of the note
- AC-17. IF the note does not exist, the system SHALL return a NOT_FOUND error

### US-7: Delete a block from a note

**As an** AI assistant
**I want to** delete a section identified by a heading
**So that** I can remove specific content from a note without affecting other sections

**Acceptance Criteria**:

- AC-18. WHEN a heading is provided, the system SHALL delete the heading and all content until the next same-or-higher-level heading
- AC-19. IF the heading is not found, the system SHALL return a NOT_FOUND error

### US-8: Replace a line range in a note

**As an** AI assistant
**I want to** replace a specific range of lines in a note
**So that** I can make precise edits to a note

**Acceptance Criteria**:

- AC-20. WHEN a valid path, start line, end line, and replacement text are provided, the system SHALL replace those lines
- AC-21. IF the line range is out of bounds, the system SHALL return an INVALID_PARAMS error

### US-9: Search notes

**As an** AI assistant
**I want to** search notes by full-text, regex, tag, or backlink query
**So that** I can find relevant notes without reading the entire vault

**Acceptance Criteria**:

- AC-22. WHEN mode is `fulltext` and a query string is provided, the system SHALL return all notes containing the query (case-insensitive)
- AC-23. WHEN mode is `regex` and a valid pattern is provided, the system SHALL return all notes matching the pattern
- AC-24. IF mode is `regex` and the pattern is invalid, the system SHALL return an INVALID_PARAMS error
- AC-25. WHEN mode is `tag` and a tag name is provided, the system SHALL return all notes from the tag index with that tag
- AC-26. WHEN mode is `backlink` and a target note name is provided, the system SHALL return all notes from the wikilink index that link to it
- AC-27. WHEN results are returned, each result SHALL include at minimum `{ path, matchCount }`

### US-10: Read frontmatter

**As an** AI assistant
**I want to** read the frontmatter fields of a note
**So that** I can access metadata without parsing the full note body

**Acceptance Criteria**:

- AC-28. WHEN a valid path is provided, the system SHALL return the frontmatter data object
- AC-29. IF the note has no frontmatter, the system SHALL return an empty object `{}`

### US-11: Write frontmatter

**As an** AI assistant
**I want to** write or merge frontmatter fields into a note
**So that** I can update metadata without disrupting the note body

**Acceptance Criteria**:

- AC-30. WHEN a valid path and fields object are provided, the system SHALL merge the fields into the existing frontmatter
- AC-31. WHEN merging frontmatter, the system SHALL preserve fields not mentioned in the update
- AC-32. The write SHALL be atomic: read existing content, merge, write back in a single operation

## Functional Requirements

- **FR-1**: All tools SHALL validate the path against the sandbox before any filesystem operation. _(References: AC-3, AC-6, AC-11)_
- **FR-2**: All tools SHALL return `{ error: true, code, message }` on failure; they SHALL NOT throw to the MCP layer. _(References: all AC error cases)_
- **FR-3**: The search tool SHALL support four modes: `fulltext`, `regex`, `tag`, `backlink`. _(References: AC-22–AC-26)_
- **FR-4**: Frontmatter write SHALL be atomic (read-merge-write). _(References: AC-32)_
- **FR-5**: Edit tools (insert-block, delete-block) SHALL use the remark AST pipeline for heading identification. _(References: AC-13, AC-18)_

## Non-Functional Requirements

- **NFR-1** (Security): All tools SHALL refuse path traversal with SANDBOX_VIOLATION; 100% test coverage for sandbox violations.
- **NFR-2** (Correctness): Frontmatter round-trips SHALL not corrupt any existing fields.
- **NFR-3** (Safety): The regex search mode SHALL validate and reject patterns with potential for catastrophic backtracking.
- **NFR-4** (Consistency): All 11 tools SHALL use the same `(params, context) => result` signature.

## Specs

| Spec | Name | Status | Dependencies |
|------|------|--------|-------------|
| [SPEC-006](../../specs/feat-002-zettel-forge/006-file-crud/requirements.md) | File CRUD Tools | Draft | SPEC-005 |
| [SPEC-007](../../specs/feat-002-zettel-forge/007-manual-edit/requirements.md) | Manual Edit Tools | Draft | SPEC-005 |
| [SPEC-008](../../specs/feat-002-zettel-forge/008-search/requirements.md) | Search Tools | Draft | SPEC-004, SPEC-005 |
| [SPEC-009](../../specs/feat-002-zettel-forge/009-frontmatter-tools/requirements.md) | Frontmatter MCP Tools | Draft | SPEC-005 |
| [SPEC-010](../../specs/feat-002-zettel-forge/010-zettel-forge-api/requirements.md) | zettel-forge Public API Surface | Draft | SPEC-006–009 |

## Technical Considerations

- SPEC-006, SPEC-007, SPEC-008, SPEC-009 are fully parallelizable after SPEC-005 is complete
- SPEC-008 additionally requires SPEC-004 (wikilink/tag indexes)
- Error code enumeration must be finalized before Phase 2 begins (see `.indez/steering/project-conventions.md`)
- MCP tool parameter schemas must be defined before Phase 2 begins

## Out of Scope

- Wikilink updater on move/rename (SPEC-017, optional)
- Obsidian-specific tools (SPEC-015, optional)
- Canvas file tools (SPEC-018, optional)
