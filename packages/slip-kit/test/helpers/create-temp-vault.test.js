'use strict';

const fs = require('fs');
const path = require('path');
const { createTempVault } = require('./create-temp-vault');

describe('createTempVault', () => {
  let vault;

  afterEach(() => vault?.cleanup());

  test('AC-4: creates a temp dir with the provided file at the correct path and content', () => {
    vault = createTempVault({ 'a.md': '# A' });

    const filePath = path.join(vault.root, 'a.md');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('# A');
  });

  test('AC-4: creates nested subdirectories automatically', () => {
    vault = createTempVault({ 'notes/hello.md': '# Hello\n' });

    const filePath = path.join(vault.root, 'notes', 'hello.md');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf8')).toBe('# Hello\n');
  });

  test('AC-4: works with no files (empty vault)', () => {
    vault = createTempVault();

    expect(fs.existsSync(vault.root)).toBe(true);
    expect(fs.readdirSync(vault.root)).toHaveLength(0);
  });

  test('AC-5: cleanup() removes the directory and all contents', () => {
    vault = createTempVault({ 'a.md': '# A' });
    const root = vault.root;

    expect(fs.existsSync(root)).toBe(true);
    vault.cleanup();
    expect(fs.existsSync(root)).toBe(false);

    vault = null; // prevent afterEach from calling cleanup again
  });

  test('AC-6: two vaults created in the same test have different root paths', () => {
    const vault1 = createTempVault({ 'a.md': 'A' });
    const vault2 = createTempVault({ 'b.md': 'B' });

    expect(vault1.root).not.toBe(vault2.root);

    vault1.cleanup();
    vault2.cleanup();
  });
});
