'use strict';

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
