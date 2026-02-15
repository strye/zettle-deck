# SPEC-004: Wikilink + Tag Index

**Spec ID**: SPEC-004
**Feature**: [FEAT-001](../../../planning/features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: Medium — index freshness strategy must be decided; performance on large vaults
**Dependencies**: SPEC-001 (fs-sandbox), SPEC-002 (remark pipeline)
**Blocks**: SPEC-005, SPEC-008

## Overview

Implement `buildWikilinkIndex(vaultRoot, sandbox)` and `buildTagIndex(vaultRoot, sandbox)` in `packages/slip-kit/src/wikilink-index.js` and `tag-index.js`. Both scan all `.md` files in the vault at startup and build in-memory maps used by the search tool and context object.

## Pre-Implementation Decision Required

**Index freshness strategy** must be decided before coding begins:
- **Option A (recommended for v0.1.0)**: Build at startup only. Write tools do not update indexes. Document as a known limitation.
- **Option B**: Rebuild relevant index entries on every write operation.

Document the decision in `design.md` before starting this spec.

## User Stories

### US-1: Build wikilink backlink index

**As a** search tool
**I want to** query which notes link to a given target
**So that** I can answer backlink queries without scanning the vault each time

**Acceptance Criteria**:

- AC-1. WHEN `buildWikilinkIndex(vaultRoot, sandbox)` is called, the system SHALL return a `Map<string, Set<string>>` where each key is a link target and each value is the set of source file paths
- AC-2. WHEN a note contains `[[target]]`, the system SHALL add that source note to `wikilinkIndex.get('target')`
- AC-3. WHEN a note contains `[[target|alias]]`, the system SHALL index by `target` (not the alias)
- AC-4. WHEN the vault contains zero markdown files, the system SHALL return an empty Map without error
- AC-5. IF a note file cannot be read or parsed, the system SHALL skip it (log to stderr) and continue

### US-2: Build tag index

**As a** search tool
**I want to** query which notes have a given tag
**So that** I can answer tag filter queries without scanning the vault each time

**Acceptance Criteria**:

- AC-6. WHEN `buildTagIndex(vaultRoot, sandbox)` is called, the system SHALL return a `Map<string, Set<string>>` where each key is a tag name and each value is the set of note paths with that tag
- AC-7. WHEN a note body contains `#tagname`, the system SHALL add that note to `tagIndex.get('tagname')`
- AC-8. WHEN a note frontmatter contains `tags: [tag1, tag2]`, the system SHALL add that note to indexes for both tags
- AC-9. WHEN the vault contains zero markdown files, the system SHALL return an empty Map without error
- AC-10. IF a note file cannot be read or parsed, the system SHALL skip it and continue

## Functional Requirements

- **FR-1**: Both builders SHALL use the sandbox's `listDir` and `readFile` methods — no direct `fs` access. _(References: AC-1, AC-6)_
- **FR-2**: Both builders SHALL recursively walk all subdirectories within the vault. _(References: AC-1, AC-6)_
- **FR-3**: Wikilink extraction SHALL use the remark pipeline to parse markdown and identify link patterns. _(References: AC-2, AC-3)_
- **FR-4**: Tag extraction SHALL handle both inline `#tag` AST nodes and frontmatter `tags:` arrays. _(References: AC-7, AC-8)_

## Non-Functional Requirements

- **NFR-1** (Performance): Index build SHALL complete in under 5 seconds for vaults with up to 1,000 notes.
- **NFR-2** (Resilience): Malformed notes SHALL not abort the index build.

## Implementation Notes

- Files: `packages/slip-kit/src/wikilink-index.js`, `packages/slip-kit/src/tag-index.js`
- Both share the same file-walk pattern — consider a shared `walkVault(vaultRoot, sandbox, onFile)` helper
- Wikilink regex fallback (if remark doesn't give wikilink nodes): `/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g`
- Tag regex fallback: `/#([a-zA-Z0-9_/-]+)/g`
- Document the startup-only freshness decision in design.md as `decision: INDEX_FRESHNESS_V1`
