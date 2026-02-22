# Mono-Repo Steering

**Created**: 2026-02-21
**Last Updated**: 2026-02-21

## Overview

This is an npm workspaces mono-repo. The root `package.json` coordinates workspaces but does not own individual package tooling such as test runners or linters scoped to a single package.

## Test Locality

**Tests live in the package that owns the code under test.** Each sub-repo (`slip-kit`, `zettel-forge`, `neuro-dex`, `zettel-agent`) owns its own test harness:

- Test files live under `packages/<name>/test/`
- The test runner (Jest) and any test-specific devDependencies are declared in each package's own `package.json`, not at the workspace root
- Each package's `package.json` declares a `"test"` script that runs only that package's tests
- There is no root-level test runner or global Jest config

## Running Tests

**From within a package:**
```bash
cd packages/slip-kit && npm test
```

**From the workspace root** (npm workspaces delegation):
```bash
# single package
npm run test --workspace=packages/slip-kit

# all packages
npm run test --workspaces
```

**Via convenience script** (preferred for CI or full-suite runs):
```bash
./scripts/test-all.sh
```

## Root `package.json` Constraints

The root `package.json`:
- Declares the `workspaces` glob (`"packages/*"`)
- May declare shared devDependencies for repo-wide tooling (e.g., a shared linter or formatter config) — but NOT the test runner
- Does NOT declare a `"test"` script that runs across all packages directly; full-suite runs go through npm workspaces flags or a script in `scripts/`

## Package `package.json` Expectations

Each package is responsible for its own:
- `"scripts": { "test": "jest" }` (or equivalent)
- `"devDependencies"` for its own test runner and test utilities

Do not hoist test-specific dependencies to the workspace root.

## Adding a New Package

When adding a new package under `packages/`:
1. Create `packages/<name>/package.json` with `"name"`, `"version"`, a `"test"` script, and its own `"devDependencies"` including `jest`
2. Add a `test/` directory alongside `src/`
3. Confirm the workspace root `package.json` picks it up via the `"packages/*"` glob
