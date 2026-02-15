# Project Conventions

## Spec IDs

- **EPIC-NNN** — Three-digit zero-padded epic identifier (EPIC-001)
- **FEAT-NNN** — Three-digit zero-padded feature identifier (FEAT-001)
- **SPEC-NNN** — Three-digit zero-padded spec identifier (SPEC-001), maps to `docs/specs/NNN-slug/`
- **US-N** — User story within a feature (US-1, US-2)
- **AC-N** — Acceptance criterion within a user story (AC-1, AC-2)
- **FR-N** — Functional requirement within a feature (FR-1, FR-2)
- **NFR-N** — Non-functional requirement (NFR-1, NFR-2)

## EARS Notation

```
WHEN [trigger/input condition], the system SHALL [action/response]
IF [precondition], THEN the system SHALL [conditional action]
WHILE [ongoing state], the system SHALL [continuous behavior]
```

## Error Codes

All tools return errors in this shape:
```js
{ error: true, code: 'ERROR_CODE', message: 'Human-readable description' }
```

Defined codes:
- `NOT_FOUND` — File or resource does not exist
- `SANDBOX_VIOLATION` — Path escapes the vault root
- `INVALID_PARAMS` — Required parameter missing or wrong type
- `PARSE_ERROR` — Markdown or YAML could not be parsed
- `IO_ERROR` — Filesystem read/write failure

## Spec Directory Structure

```
docs/specs/NNN-slug/
├── requirements.md   # user stories, AC in EARS, FR, NFR
├── design.md         # technical design, components, data models
└── tasks.md          # implementation task checklist
```

## Commit Convention

```
feat(package): short description
fix(package): short description
docs: short description
test(package): short description
refactor(package): short description
```
