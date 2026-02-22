# SPEC-000: Testing Infrastructure

**Spec ID**: SPEC-000
**Feature**: Cross-cutting (all packages)
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Ready
**Effort**: S
**Risk**: Low
**Dependencies**: None
**Blocks**: All other specs (tests cannot run without this)

## Overview

Establish the Jest test infrastructure for the mono-repo before any implementation begins. Each package owns its own Jest configuration and test runner setup. A shared temp vault utility is provided for integration tests. `.gitignore` entries are added for test artifacts.

## User Stories

### US-1: Run tests across all packages

**As a** developer
**I want to** run all tests in the mono-repo with a single command
**So that** I can verify the whole system without running each package individually

**Acceptance Criteria**:

- AC-1. WHEN tests are run across all packages (via workspace commands or a convenience script), the system SHALL discover and run tests in all four packages
- AC-2. WHEN tests in one package fail, the system SHALL report the failure with the package name and test name
- AC-3. WHEN all tests pass, the system SHALL exit with code 0
- AC-8. WHEN tests are run for a single package, the system SHALL run only that package's test suite

### US-2: Create temporary vault for tests

**As a** test author
**I want to** create and clean up a real temporary vault directory in tests
**So that** integration tests can run against a real filesystem without leaving artifacts

**Acceptance Criteria**:

- AC-4. WHEN `createTempVault(files)` is called, the system SHALL create a temp directory with the provided markdown files
- AC-5. WHEN the test completes, the temp vault SHALL be deleted automatically (even if the test fails)
- AC-6. WHEN multiple temp vaults are created in parallel tests, they SHALL not interfere with each other

### US-3: Exclude test artifacts from version control

**As a** developer
**I want to** keep generated test artifacts out of git
**So that** coverage reports, snapshots, and caches don't pollute commits

**Acceptance Criteria**:

- AC-7. WHEN Jest generates artifacts (coverage reports, snapshots, caches), they SHALL be excluded from version control

## Functional Requirements

- **FR-1**: Each package SHALL have its own Jest configuration; running tests across all packages SHALL be supported via npm workspace commands or a convenience script in `scripts/`. _(References: AC-1, AC-2, AC-3, AC-8)_
- **FR-2**: A `createTempVault(files)` test utility SHALL be provided for integration tests. _(References: AC-4, AC-5, AC-6)_
- **FR-3**: Generated test artifacts SHALL be excluded from version control. _(References: AC-7)_

## Non-Functional Requirements

- **NFR-1**: Test infrastructure SHALL add zero production runtime dependencies.
- **NFR-2**: Temp vault directories SHALL be created under `os.tmpdir()` with unique names.

