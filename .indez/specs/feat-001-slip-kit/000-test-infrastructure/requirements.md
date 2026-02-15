# SPEC-000: Testing Infrastructure

**Spec ID**: SPEC-000
**Feature**: [FEAT-001](../../../planning/features/FEAT-001-slip-kit-foundation.md) slip-kit Foundation
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: None
**Blocks**: All other specs (tests cannot run without this)

## Overview

Establish the Jest test infrastructure for the mono-repo before any implementation begins. This includes Jest workspace configuration, shared test utilities (temp vault factory, mock sandbox helpers), and `.gitignore` entries for test artifacts.

## User Stories

### US-1: Run tests across all packages

**As a** developer
**I want to** run all tests in the mono-repo with a single command
**So that** I can verify the whole system without running each package individually

**Acceptance Criteria**:

- AC-1. WHEN `npm test` is run from the repo root, the system SHALL discover and run tests in all four packages
- AC-2. WHEN tests in one package fail, the system SHALL report the failure with the package name and test name
- AC-3. WHEN all tests pass, the system SHALL exit with code 0

### US-2: Create temporary vault for tests

**As a** test author
**I want to** create and clean up a real temporary vault directory in tests
**So that** integration tests can run against a real filesystem without leaving artifacts

**Acceptance Criteria**:

- AC-4. WHEN `createTempVault(files)` is called, the system SHALL create a temp directory with the provided markdown files
- AC-5. WHEN the test completes, the temp vault SHALL be deleted automatically (even if the test fails)
- AC-6. WHEN multiple temp vaults are created in parallel tests, they SHALL not interfere with each other

## Functional Requirements

- **FR-1**: Root `package.json` Jest configuration SHALL use `projects` to discover tests in all packages. _(References: AC-1, AC-2, AC-3)_
- **FR-2**: A shared `test/helpers/create-temp-vault.js` utility SHALL be created for integration tests. _(References: AC-4, AC-5, AC-6)_

## Non-Functional Requirements

- **NFR-1**: Test infrastructure SHALL add zero production runtime dependencies.
- **NFR-2**: Temp vault directories SHALL be created under `os.tmpdir()` with unique names.

## Implementation Notes

- Add `jest.config.js` at repo root using `projects: ['packages/*/package.json']`
- Create `test/helpers/` directory with `create-temp-vault.js`
- Add `*.snap`, `.jest-cache/`, `coverage/` to `.gitignore`
- Each package already has `"test": "jest"` in its package.json
