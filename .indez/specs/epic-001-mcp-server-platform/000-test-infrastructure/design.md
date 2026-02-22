# Design: Testing Infrastructure

**Spec ID**: SPEC-000
**Feature**: Cross-cutting (all packages)
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-21
**Status**: Draft

## Overview

The test infrastructure is composed of four artifacts: per-package Jest configuration, a shared `createTempVault` helper (in `slip-kit`), a workspace-level convenience script, and `.gitignore` additions. There is no root-level Jest config — all test execution is delegated to individual packages.

## Components

### 1. Per-Package Jest Configuration (FR-1)

Each of the four packages adds the following to its `package.json`:

```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/test/**/*.test.js"]
  }
}
```

No shared or root-level `jest.config.js` exists. Each package is fully self-contained.

**Satisfies**: FR-1, AC-1, AC-2, AC-3, AC-8

---

### 2. `createTempVault` Helper (FR-2)

**Location**: `packages/slip-kit/test/helpers/create-temp-vault.js`

This is the source of truth. All other packages that need integration tests reference it via a relative path, justified by the fact that every package already depends on `slip-kit` in the workspace dependency chain.

**Reference from other packages**:
```js
const { createTempVault } = require('../../slip-kit/test/helpers/create-temp-vault');
```

**Usage pattern** in a test file:
```js
const { createTempVault } = require('../helpers/create-temp-vault');

describe('...', () => {
  let vault;

  afterEach(() => vault?.cleanup());

  test('reads a note', () => {
    vault = createTempVault({ 'notes/hello.md': '# Hello\n' });
    // vault.root is the absolute path to the temp directory
  });
});
```

`afterEach` guarantees cleanup even when a test fails — this is how AC-5 ("deleted automatically even if the test fails") is satisfied.

**Satisfies**: FR-2, AC-4, AC-5, AC-6

---

### 3. `scripts/test-all.sh` (FR-1)

A bash convenience script at the workspace root that runs all four packages' tests via npm workspaces. Provides a single command entry point for CI and full-suite runs without requiring a root-level test runner.

**Satisfies**: FR-1 (convenience script path), AC-1, AC-2, AC-3

---

### 4. `.gitignore` Additions (FR-3)

Patterns added to the root `.gitignore`:

```
coverage/
*.snap
.jest-cache/
```

**Satisfies**: FR-3, AC-7

---

## Data Models

### `VaultFiles` — Input to `createTempVault`

```js
// @typedef {Object.<string, string>} VaultFiles
// Map of relative file paths to their string contents.
// Directories are created automatically as needed.
//
// Example:
// {
//   'notes/hello.md': '# Hello\n',
//   'index.md': '---\ntags: []\n---\n\nBody.\n'
// }
```

### `TempVault` — Return value of `createTempVault`

```js
// @typedef {Object} TempVault
// @property {string} root       - Absolute path to the temp directory (under os.tmpdir())
// @property {() => void} cleanup - Removes the directory and all contents (call in afterEach)
```

## API / Interface

### `createTempVault(files?)`

```js
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Creates a temporary vault directory populated with the given files.
 * Each key is a relative path; the value is the file's string content.
 * Subdirectories are created automatically.
 *
 * Call cleanup() in afterEach to remove the directory, even on test failure.
 *
 * @param {Object.<string, string>} [files={}]
 * @returns {{ root: string, cleanup: () => void }}
 */
function createTempVault(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'zettle-deck-test-'));

  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(root, relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, 'utf8');
  }

  return {
    root,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

module.exports = { createTempVault };
```

**NFR-1**: Uses only built-in Node modules (`fs`, `os`, `path`) — zero production runtime dependencies.
**NFR-2**: `fs.mkdtempSync` with a fixed prefix generates a unique directory name under `os.tmpdir()` on every call, ensuring parallel vaults never collide (AC-6).

### `scripts/test-all.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

npm run test --workspaces
```

## File Structure

```
packages/
  slip-kit/
    test/
      helpers/
        create-temp-vault.js        ← FR-2: source of truth, shared by all packages
      *.test.js
    package.json                    ← jest devDependency + "jest" config block
  zettel-forge/
    test/
      *.test.js                     ← requires ../../slip-kit/test/helpers/create-temp-vault
    package.json
  neuro-dex/
    test/
      *.test.js
    package.json
  zettel-agent/
    test/
      *.test.js
    package.json
scripts/
  test-all.sh                       ← FR-1: all-package convenience script
.gitignore                          ← FR-3: coverage/, *.snap, .jest-cache/ added
```

## Requirement Traceability

| Requirement | Design element |
|---|---|
| FR-1 (AC-1, AC-2, AC-3, AC-8) | Per-package Jest config in `package.json`; `scripts/test-all.sh` |
| FR-2 (AC-4, AC-5, AC-6) | `createTempVault` in `slip-kit/test/helpers/`; `afterEach` cleanup pattern |
| FR-3 (AC-7) | `.gitignore` additions |
| NFR-1 (zero prod deps) | Jest in `devDependencies`; `createTempVault` uses only built-in Node modules |
| NFR-2 (unique tmpdir names) | `fs.mkdtempSync` generates a unique directory on every call |

## Testing Strategy

This spec establishes the infrastructure — it has no application logic to unit test. Verification is done by:

1. **Smoke test** — Run `npm run test --workspace=packages/slip-kit` with an empty `test/` directory; verify exit code 0. _(AC-1, AC-3)_
2. **`createTempVault` self-test** — A test file at `slip-kit/test/helpers/create-temp-vault.test.js` exercises AC-4, AC-5, and AC-6 directly.
3. **Multi-package run** — Run `./scripts/test-all.sh`; verify all four packages are discovered and reported. _(AC-1, AC-2)_
4. **Single-package isolation** — Run `npm run test --workspace=packages/slip-kit`; verify only `slip-kit` tests run, not the others. _(AC-8)_
