# Tasks: Testing Infrastructure

**Spec ID**: SPEC-000
**Requirements**: [requirements.md](./requirements.md)
**Design**: [design.md](./design.md)

## Summary

- **Total**: 9
- **Completed**: 9 (100%)
- **Remaining**: 0

---

## Implementation Tasks

- [x] **T1. Configure Jest in `slip-kit`**

  Add Jest as a devDependency, replace the existing `node --test` stub with a `jest` test script, and add an inline Jest config block. Create the `test/` directory.

  **Acceptance Criteria**:
  - `package.json` has `"devDependencies": { "jest": "^29.0.0" }`
  - `"scripts": { "test": "jest" }` replaces the existing `node --test` stub
  - `"jest": { "testEnvironment": "node", "testMatch": ["**/test/**/*.test.js"] }` block is present
  - `packages/slip-kit/test/` directory exists
  - `npm test` from within `packages/slip-kit/` exits 0

  **References**: FR-1, AC-1, AC-2, AC-3, AC-8

---

- [x] **T2. Configure Jest in `zettel-forge`**

  Add Jest devDependency, test script, and Jest config block to `zettel-forge/package.json`. Create the `test/` directory.

  **Acceptance Criteria**:
  - `package.json` has `jest` devDependency, `"test": "jest"` script, and Jest config block
  - `packages/zettel-forge/test/` directory exists
  - `npm test` from within `packages/zettel-forge/` exits 0

  **References**: FR-1, AC-1, AC-2, AC-3, AC-8

---

- [x] **T3. Configure Jest in `neuro-dex`**

  Add Jest devDependency, test script, and Jest config block to `neuro-dex/package.json`. Create the `test/` directory.

  **Acceptance Criteria**:
  - `package.json` has `jest` devDependency, `"test": "jest"` script, and Jest config block
  - `packages/neuro-dex/test/` directory exists
  - `npm test` from within `packages/neuro-dex/` exits 0

  **References**: FR-1, AC-1, AC-2, AC-3, AC-8

---

- [x] **T4. Configure Jest in `zettel-agent`**

  Add Jest devDependency, test script, and Jest config block to `zettel-agent/package.json`. Create the `test/` directory.

  **Acceptance Criteria**:
  - `package.json` has `jest` devDependency, `"test": "jest"` script, and Jest config block
  - `packages/zettel-agent/test/` directory exists
  - `npm test` from within `packages/zettel-agent/` exits 0

  **References**: FR-1, AC-1, AC-2, AC-3, AC-8

---

- [x] **T5. Create `createTempVault` helper**

  Implement the shared temp vault utility at `packages/slip-kit/test/helpers/create-temp-vault.js` per the function signature and contract in `design.md`.

  **Acceptance Criteria**:
  - File exists at `packages/slip-kit/test/helpers/create-temp-vault.js`
  - `createTempVault(files)` creates a directory under `os.tmpdir()` with a unique name (NFR-2)
  - Each entry in `files` is written to the correct relative path; missing subdirectories are created automatically
  - Returns `{ root, cleanup }` where `root` is the absolute temp path
  - `cleanup()` removes the directory and all contents using `fs.rmSync`
  - Uses only built-in Node modules: `fs`, `os`, `path` — no new runtime dependencies (NFR-1)
  - Exported as `module.exports = { createTempVault }`

  **References**: FR-2, AC-4, AC-5, AC-6, NFR-1, NFR-2

---

- [x] **T6. Write self-tests for `createTempVault`**

  Create `packages/slip-kit/test/helpers/create-temp-vault.test.js` to verify the helper's own behaviour.

  **Acceptance Criteria**:
  - AC-4: Test verifies that `createTempVault({ 'a.md': '# A' })` creates a temp dir containing `a.md` with the correct content
  - AC-5: Test verifies that `cleanup()` removes the directory (`fs.existsSync(root)` is false after cleanup)
  - AC-5: `afterEach(() => vault?.cleanup())` pattern is used so cleanup runs even when a test throws
  - AC-6: Two vaults created in the same test have different `root` paths
  - All tests pass with `npm test` in `slip-kit`

  **References**: FR-2, AC-4, AC-5, AC-6

---

- [x] **T7. Create `scripts/test-all.sh`**

  Create the `scripts/` directory and add the convenience script that runs all four packages' tests via npm workspaces.

  **Acceptance Criteria**:
  - `scripts/` directory exists at the workspace root
  - `scripts/test-all.sh` exists and is executable (`chmod +x`)
  - Script uses `#!/usr/bin/env bash` shebang and `set -euo pipefail`
  - Script body: `npm run test --workspaces`
  - Running `./scripts/test-all.sh` from the repo root discovers and runs tests in all four packages

  **References**: FR-1, AC-1, AC-2, AC-3

---

- [x] **T8. Update `.gitignore` for test artifacts**

  Add the two missing Jest artifact patterns. (`coverage` is already present in the root `.gitignore`.)

  **Acceptance Criteria**:
  - `*.snap` is present in `.gitignore`
  - `.jest-cache/` is present in `.gitignore`
  - The existing `coverage` entry is preserved unchanged

  **References**: FR-3, AC-7

---

- [x] **T9. Smoke test — verify full infrastructure**

  Manually verify the complete infrastructure works end-to-end after all other tasks are complete.

  **Acceptance Criteria**:
  - `npm run test --workspace=packages/slip-kit` exits 0 and runs only slip-kit tests (AC-8)
  - `./scripts/test-all.sh` from the workspace root runs all four packages and reports each by name (AC-1, AC-2)
  - A deliberately failing test in one package shows the package name and test name in output (AC-2)
  - After running tests, `git status` shows no untracked artifact files (AC-7)

  **References**: AC-1, AC-2, AC-3, AC-7, AC-8

---

## Acceptance

SPEC-000 is complete when:
- All 9 tasks above are checked
- `./scripts/test-all.sh` exits 0
- All four packages have `"test": "jest"` and a `test/` directory
- `createTempVault` self-tests pass
- No test artifacts appear in `git status`
