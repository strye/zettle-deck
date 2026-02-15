# SPEC-001: Filesystem Sandbox

**Spec ID**: SPEC-001
**Feature**: [FEAT-001](../../../planning/features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: SPEC-000 (test infrastructure)
**Blocks**: SPEC-004, SPEC-005, all zettel-forge specs

## Overview

Implement `createFsSandbox(vaultRoot)` in `packages/slip-kit/src/fs-sandbox.js`. This is the security foundation of the entire system — every file operation goes through it. It provides sandboxed `readFile`, `writeFile`, `listDir`, `exists`, and `resolve` functions that reject any path escaping the vault root.

## User Stories

### US-1: Resolve paths safely

**As a** tool implementation
**I want to** resolve a relative or absolute path against the vault root
**So that** all paths are normalized and validated before use

**Acceptance Criteria**:

- AC-1. WHEN a relative path is provided, the system SHALL resolve it relative to `vaultRoot` and return the absolute path
- AC-2. WHEN an absolute path within the vault is provided, the system SHALL return it unchanged
- AC-3. WHEN a path containing `../` that escapes the vault is provided, the system SHALL throw `{ code: 'SANDBOX_VIOLATION' }`
- AC-4. WHEN an absolute path outside the vault is provided, the system SHALL throw `{ code: 'SANDBOX_VIOLATION' }`
- AC-5. WHEN a symlink is resolved and its target is outside the vault, the system SHALL throw `{ code: 'SANDBOX_VIOLATION' }`

### US-2: Read files safely

**As a** tool implementation
**I want to** read a file within the sandbox
**So that** tools can access vault contents safely

**Acceptance Criteria**:

- AC-6. WHEN a valid in-sandbox path is provided, the system SHALL return the file contents as a UTF-8 string
- AC-7. IF the file does not exist, the system SHALL throw `{ code: 'NOT_FOUND' }`

### US-3: Write files safely

**As a** tool implementation
**I want to** write a file within the sandbox
**So that** tools can create and update vault contents safely

**Acceptance Criteria**:

- AC-8. WHEN a valid in-sandbox path and content are provided, the system SHALL write the content to disk
- AC-9. IF parent directories do not exist, the system SHALL create them recursively before writing

### US-4: List and check files safely

**As a** tool implementation
**I want to** list directory contents and check file existence within the sandbox
**So that** tools can enumerate vault contents safely

**Acceptance Criteria**:

- AC-10. WHEN a valid in-sandbox directory path is provided, the system SHALL return an array of entry names
- AC-11. WHEN `exists(path)` is called with an in-sandbox path, the system SHALL return `true` if the file/dir exists, `false` otherwise

## Functional Requirements

- **FR-1**: `createFsSandbox(vaultRoot)` SHALL return an object with `{ readFile, writeFile, listDir, exists, resolve }`. _(References: all ACs)_
- **FR-2**: Every method SHALL call `resolve()` on its path argument before performing any filesystem operation. _(References: AC-3, AC-4, AC-5)_
- **FR-3**: Path resolution SHALL use `path.resolve()` and verify the result starts with `vaultRoot + path.sep`. _(References: AC-1, AC-2, AC-3, AC-4)_

## Non-Functional Requirements

- **NFR-1** (Security): 100% of path traversal test cases in the unit test suite SHALL be rejected.
- **NFR-2** (Correctness): Paths with encoded characters (e.g., `%2F`) SHALL be normalized before validation.

## Implementation Notes

- File: `packages/slip-kit/src/fs-sandbox.js`
- Use Node.js built-in `path` and `fs/promises`
- Symlink resolution: use `fs.realpath()` to resolve symlinks before validation
- Error objects: throw plain objects `{ code: 'SANDBOX_VIOLATION', message: '...' }` (not Error instances) for consistency with tool error returns
