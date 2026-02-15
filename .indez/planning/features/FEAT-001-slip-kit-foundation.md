# slip-kit Foundation

**Feature ID**: FEAT-001
**Epic**: [EPIC-001](../epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Status**: Ready
**Package**: `slip-kit`

## Overview

Build the shared utility layer that all other packages depend on. slip-kit provides five foundational capabilities: sandboxed filesystem access, a remark AST pipeline, YAML frontmatter parsing and serialization, a wikilink backlink index, and a tag index. No other internal package is a dependency.

## Problem Statement

All tools in zettel-forge and neuro-dex need safe file access, markdown parsing, and vault-wide index queries. Without a shared, tested foundation, each tool would implement these concerns independently — leading to inconsistency, duplication, and security gaps (particularly around path sandboxing).

## Value Proposition

slip-kit is the security and reliability foundation of the entire system. A correct, well-tested sandbox prevents the AI from accessing files outside the vault. A reliable remark pipeline ensures consistent markdown round-trips. Shared indexes eliminate redundant vault scans.

## User Stories

### US-1: Sandbox file access

**As a** tool developer
**I want to** use a sandboxed filesystem API
**So that** tools cannot accidentally or maliciously access files outside the vault root

**Acceptance Criteria**:

- AC-1. WHEN a path within the vault root is resolved, the system SHALL return the absolute path without error
- AC-2. WHEN a path that escapes the vault root (via `../`, symlink, or absolute path) is resolved, the system SHALL throw a structured SANDBOX_VIOLATION error
- AC-3. WHEN reading a file within the sandbox, the system SHALL return the file contents
- AC-4. WHEN writing a file within the sandbox, the system SHALL persist the content to disk
- AC-5. IF a parent directory does not exist on write, the system SHALL create it recursively
- AC-6. WHEN listing a directory within the sandbox, the system SHALL return file and directory entries

### US-2: Markdown AST pipeline

**As a** tool developer
**I want to** parse markdown into an AST and stringify it back
**So that** I can manipulate note structure without corrupting content

**Acceptance Criteria**:

- AC-7. WHEN a markdown string is parsed, the system SHALL return a valid MDAST object
- AC-8. WHEN an MDAST is stringified, the system SHALL return a valid markdown string
- AC-9. WHEN a markdown string is round-tripped (parse then stringify), the system SHALL produce semantically equivalent markdown
- AC-10. WHEN the AST is walked with a visitor function, the system SHALL call the visitor for every node in document order
- AC-11. IF remark or unified fails to load (ESM bridge failure), the system SHALL throw with a clear error message indicating the Node.js version requirement

### US-3: Frontmatter parse and write

**As a** tool developer
**I want to** parse and serialize YAML frontmatter in notes
**So that** tools can read and update metadata without corrupting the note body

**Acceptance Criteria**:

- AC-12. WHEN a note with YAML frontmatter is parsed, the system SHALL return `{ data: object, body: string }` where body excludes the frontmatter block
- AC-13. WHEN a note with no frontmatter is parsed, the system SHALL return `{ data: {}, body: fullContent }`
- AC-14. WHEN frontmatter data and body are serialized, the system SHALL produce a string with valid YAML front block followed by the body
- AC-15. WHEN a note is round-tripped (parse then stringify), the system SHALL produce equivalent output
- AC-16. IF the YAML frontmatter is malformed, the system SHALL return a structured PARSE_ERROR rather than throwing

### US-4: Wikilink and tag indexes

**As a** tool developer
**I want to** query which notes link to a target and which notes have a given tag
**So that** search tools can answer backlink and tag queries without scanning the vault each time

**Acceptance Criteria**:

- AC-17. WHEN the wikilink index is built for a vault, the system SHALL return `Map<target, Set<sources>>` where each key is a link target and each value is the set of notes that link to it
- AC-18. WHEN the tag index is built for a vault, the system SHALL return `Map<tag, Set<notes>>` where each key is a tag name and each value is the set of notes that carry it
- AC-19. WHEN a vault contains zero notes, the system SHALL return empty maps without error
- AC-20. IF a note file cannot be parsed, the system SHALL skip it and continue building the index
- AC-21. WHEN wikilinks are indexed, the system SHALL handle both `[[target]]` and `[[target|alias]]` forms
- AC-22. WHEN tags are indexed, the system SHALL handle both inline `#tag` syntax and `tags:` frontmatter arrays

## Functional Requirements

- **FR-1**: WHEN any path is accessed, the system SHALL validate it against the vault root before performing any filesystem operation. _(References: AC-1, AC-2)_
- **FR-2**: The system SHALL provide a unified remark pipeline that parses, walks, and stringifies markdown in a single consistent way across all packages. _(References: AC-7, AC-8, AC-9, AC-10)_
- **FR-3**: The system SHALL parse and serialize YAML frontmatter using gray-matter as the primary parser, keeping the frontmatter and body as separate concerns. _(References: AC-12, AC-13, AC-14, AC-15, AC-16)_
- **FR-4**: The system SHALL build vault-wide wikilink and tag indexes at startup by scanning all `.md` files in the vault using the sandboxed filesystem. _(References: AC-17, AC-18, AC-19, AC-20, AC-21, AC-22)_

## Non-Functional Requirements

- **NFR-1** (Security): The fs-sandbox SHALL reject 100% of path traversal attempts in unit tests, including `../`, absolute paths outside vault, and symlink escapes.
- **NFR-2** (Reliability): Frontmatter round-trips SHALL produce byte-equivalent output for all standard YAML scalar types (string, number, boolean, array).
- **NFR-3** (Performance): Index build time SHALL complete in under 5 seconds for vaults up to 1,000 notes on a modern Mac.
- **NFR-4** (Compatibility): All modules SHALL work correctly on Node.js 22.12.0+ CommonJS with `require(esm)` for remark/unified.

## Specs

| Spec | Name | Status | Dependencies |
|------|------|--------|-------------|
| [SPEC-000](../../specs/feat-001-slip-kit/000-test-infrastructure/requirements.md) | Testing Infrastructure | Draft | None |
| [SPEC-001](../../specs/feat-001-slip-kit/001-fs-sandbox/requirements.md) | Filesystem Sandbox | Draft | None |
| [SPEC-002](../../specs/feat-001-slip-kit/002-remark-helpers/requirements.md) | Remark AST Pipeline | Draft | None |
| [SPEC-003](../../specs/feat-001-slip-kit/003-frontmatter/requirements.md) | Frontmatter Parse/Write | Draft | SPEC-002 |
| [SPEC-004](../../specs/feat-001-slip-kit/004-wikilink-tag-index/requirements.md) | Wikilink + Tag Index | Draft | SPEC-001, SPEC-002 |
| [SPEC-005](../../specs/feat-001-slip-kit/005-slip-kit-api/requirements.md) | slip-kit Public API Surface | Draft | SPEC-001–004 |

## Technical Considerations

- remark@15 and unified@11 are ESM-only — must validate `require(esm)` via spike before SPEC-002
- gray-matter is the primary frontmatter parser; `remark-frontmatter` is used for AST-level stripping only
- Index build is startup-only for Phase 1; freshness strategy to be resolved before Phase 3

## Out of Scope

- Index refresh on write (deferred to Phase 3 decision)
- Canvas file parsing (SPEC-018, optional)
- Streaming APIs
