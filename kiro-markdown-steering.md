# Markdown Repository Steering

This steering file guides Kiro when working with a structured markdown content repository organized around scopes, projects, and content documents.

---

## Naming Conventions

All files and folders follow a prefixed naming convention. The prefix identifies the type of entity, followed by an inherited scope ID and a descriptive title:

```
{Prefix}{ScopeID}_{Title}.md
```

### Prefixes

| Prefix | Type | Description |
|--------|------|-------------|
| `S` | Scope | Top-level organizational container. Also used as the scope folder name. |
| `P` | Project | A project grouping within a scope. |
| `C` | Content | A content document. Always lives in its own folder. |
| `N` | Note | Supporting notes, reference material, changelogs, and session context. |

### Scope ID Inheritance

The numeric ID is always inherited from the parent scope. Every file within a scope — regardless of how deep in the hierarchy — shares the same scope ID. For example, all files under `S1234_MyScope/` will carry the ID `1234`.

---

## Repository Structure

### General Shape

```
S1234_MyScope/
├── S1234_MyScope.md                        ← scope descriptor
├── C1234_GettingStarted/                   ← content folder
│   ├── C1234_GettingStarted.md             ← source document
│   ├── N1234_ClientFeedback.md             ← supporting note
│   └── _versions/
│       ├── C1234_GettingStarted-v1.1.md
│       └── N1234_GettingStarted-CHANGELOG.md
└── 3_Projects/                             ← numbered category folder
    └── P1234_Project1/
        └── C1234_APIReference/
            ├── C1234_APIReference.md
            ├── N1234_APIPlanning.md
            └── _versions/
                ├── C1234_APIReference-v1.1.md
                └── N1234_APIReference-CHANGELOG.md
```

### Rules

- Every `C` content file lives in its own folder named identically to the file (without the `.md` extension).
- The content folder contains: the source document, any `N` note files, and a `_versions/` subfolder.
- `P` project folders and numbered category folders are organizational containers only — they do not have their own `_versions/` folder.
- The `S` scope file lives at the root of the scope folder alongside any top-level content or project folders.

---

## File System & Symlink Handling

When traversing the repository:

- Always resolve symbolic links before reading or writing. Use `fs.realpath()` or equivalent to get the canonical path before any file operation.
- Treat symlinked directories as real directories and recurse into them.
- Never assume a symlink's target is a file — always stat the resolved path to determine its type.
- Write to the resolved real path, not the symlink path, to avoid broken link behavior.
- If a path resolution fails, report the broken symlink explicitly rather than silently skipping it.
- When resolving links that will be stored in markdown content, preserve the symlink path (not the real path) to keep links portable.

---

## Frontmatter Management

All markdown files may contain YAML frontmatter. When reading or writing any `.md` file:

- Parse frontmatter from the block between opening and closing `---` delimiters.
- Never overwrite frontmatter fields that are not part of the current task.
- Preserve all existing frontmatter fields, even if their values are unknown or unused.
- When adding new fields, insert them in alphabetical order unless a field order is already established.

### Frontmatter for New Content Files

When creating a new `C` content file, initialize with:

```yaml
---
created: YYYY-MM-DD
scope_id: "1234"
status: draft
tags: []
title: ""
version: "1.0"
---
```

### Frontmatter for Versioned Working Copies

```yaml
---
based_on_version: "1.0"
created: YYYY-MM-DD
scope_id: "1234"
source_file: "../C1234_Title.md"
status: draft
tags: []
title: ""
version: "1.1"
---
```

### Status Values

`draft` → `in-review` → `revised` → `published` → `archived`

---

## Versioning & Working Copies

### Core Rule

The source document is never modified during iteration. It represents the last stable, approved version. All work happens in `_versions/` until explicitly promoted.

### Working Copy Naming

Naming convention inside `_versions/` is flexible, but should follow this pattern for clarity:

```
{original-filename}-v{version}.md
```

Example: `C1234_GettingStarted-v1.1.md`

### Version Number Rules

Use two-part versioning: `{major}.{minor}`

| Change Type | Version Bump |
|-------------|--------------|
| Typo, broken link, minor formatting fix | No bump — note in changelog as patch |
| Section rewrite, new content, restructuring | Minor bump (1.0 → 1.1) |
| Document purpose, audience, or structure fundamentally changes | Major bump (1.x → 2.0) |

### Promoting a Version to Source

When a working copy is approved:

1. Copy its content back to the source file.
2. Update the source file's frontmatter `version` and `status` fields to match.
3. Leave `_versions/` intact as a full audit trail.

---

## Changelog

Each content document maintains a changelog at:

```
{C-folder}/_versions/N{ScopeID}_{Title}-CHANGELOG.md
```

Example: `C1234_GettingStarted/_versions/N1234_GettingStarted-CHANGELOG.md`

### Format

```markdown
# Changelog: {Document Title}

Source: `../C{ID}_{Title}.md`

---

## [v1.1] - YYYY-MM-DD

**Status:** in-review  
**Summary:** Brief description of what changed and why.

### Changes
- Specific change
- Specific change

### Notes
Context, open questions, or decisions that should carry forward to future sessions.

---

## [v1.0] - YYYY-MM-DD

**Status:** published  
**Summary:** Initial version.
```

- Always prepend new entries at the top (newest first).
- At the start of any session on a document, read the changelog before making changes to restore prior context.

---

## Document Discovery

When working across the repository:

- Recursively scan all `.md` files, following symlinks per the rules above.
- Identify file types by their prefix (`S`, `C`, `N`, `P`) before processing.
- Treat the `C` file matching the folder name as the source document.
- Treat all other `N` files in the same folder as supporting context, not publishable content.
- Exclude `_versions/` contents from content-level tasks unless explicitly asked.
- Use the frontmatter `title` field in preference to the filename when referring to documents.
- Flag broken internal links encountered during traversal rather than silently skipping them.

---

## Editing Practices

- Preserve the author's voice and terminology unless explicitly asked to change it.
- Do not reformat markdown structure (heading levels, list styles) unless that is the stated task.
- For any substantive edit, create a working copy in `_versions/` rather than editing in place.
- For minor corrections (typos, broken links), in-place edits are acceptable — note them in the changelog as a patch with no version bump.
- Read the full document and its changelog before making changes.

---

## Session Startup Checklist

At the start of any session involving a content document:

1. Resolve any symlinks in the working path.
2. Identify the scope ID from the path or filename.
3. Read the source document's frontmatter for current version and status.
4. Check for an existing `_versions/` folder and changelog to restore prior context.
5. Confirm the task intent before creating new versions or modifying files.
