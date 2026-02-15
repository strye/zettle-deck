# SPEC-013: Summarization Tools

**Spec ID**: SPEC-013
**Feature**: [FEAT-003](../../../planning/features/FEAT-003-neuro-dex-ai-tools.md) neuro-dex AI Tools
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: M
**Risk**: High — ONNX inference in Node.js; model selection; first-run model download
**Dependencies**: SPEC-005 (slip-kit API — for reading note files)
**Blocks**: SPEC-014
**Parallel with**: All of Phase 2 (SPEC-006 through SPEC-010)

## Overview

Implement `summarizeNote`, `distillNotes`, and `compressContext` in `neuro-dex`. All three use local ONNX inference via `@huggingface/transformers`. The model is loaded once and cached for the process lifetime.

## Pre-Implementation Decisions Required

1. **Model selection**: Default `Xenova/t5-small` (confirm before coding)
2. **Response mode**: Single-response (not streaming) for v0.1.0
3. **Document both decisions in `design.md`** before starting

## Tool Signatures

```js
summarizeNote({ path }, context)
// Returns: { summary: string } | ErrorResult

distillNotes({ paths }, context)
// Returns: { summary: string } | ErrorResult

compressContext({ text }, context)
// Returns: { compressed: string, originalTokens: number, compressedTokens: number } | ErrorResult
```

## User Stories

### US-1: Summarize a single note

**Acceptance Criteria**:

- AC-1. WHEN a valid note path is provided, SHALL return `{ summary: string }` with a shorter version of the note
- AC-2. The summary SHALL be shorter than the original body (fewer tokens)
- AC-3. IF the note does not exist, SHALL return NOT_FOUND error
- AC-4. IF the note body is empty, SHALL return `{ error: true, code: 'INVALID_PARAMS', message: 'Note body is empty' }`
- AC-5. WHEN the model is called for the first time, it SHALL be downloaded and cached; subsequent calls SHALL use the cache

### US-2: Distill multiple notes

**Acceptance Criteria**:

- AC-6. WHEN an array of 2+ valid note paths is provided, SHALL return `{ summary: string }` synthesizing content from all notes
- AC-7. IF any path does not exist, SHALL return NOT_FOUND error with the missing path in the message
- AC-8. IF the `paths` array is empty or has fewer than 1 item, SHALL return INVALID_PARAMS error
- AC-9. The distilled summary SHALL reflect themes from all provided notes

### US-3: Compress context

**Acceptance Criteria**:

- AC-10. WHEN a non-empty text string is provided, SHALL return `{ compressed: string, originalTokens: number, compressedTokens: number }`
- AC-11. `compressedTokens` SHALL be less than `originalTokens`
- AC-12. IF `text` is empty, SHALL return INVALID_PARAMS error

### US-4: Model lifecycle

**Acceptance Criteria**:

- AC-13. The model SHALL be loaded lazily on first tool call, not at module import time
- AC-14. The model SHALL be cached in memory after first load
- AC-15. IF the model fails to load, SHALL return `{ error: true, code: 'IO_ERROR', message: 'Model load failed: ...' }`

## Functional Requirements

- **FR-1**: A single `loadModel()` function SHALL manage model loading and caching. _(References: AC-5, AC-13, AC-14, AC-15)_
- **FR-2**: `summarizeNote` and `distillNotes` SHALL use `context.sandbox.readFile` to read note files. _(References: AC-1, AC-6)_
- **FR-3**: All three tools SHALL return structured errors, never throw to the caller. _(References: AC-3, AC-4, AC-7, AC-8, AC-12, AC-15)_

## Non-Functional Requirements

- **NFR-1** (Performance): Single-note summarization SHALL complete in under 30 seconds for notes up to 2,000 tokens.
- **NFR-2** (Privacy): All inference SHALL be local; no data sent to external APIs.
- **NFR-3** (Configurability): Model name SHALL be read from `context.config.model` with fallback to `"Xenova/t5-small"`.
- **NFR-4** (Observability): Model download progress SHALL be logged to stderr.

## Implementation Notes

- Files: `packages/neuro-dex/src/summarize-note.js`, `distill-notes.js`, `compress-context.js`
- Shared: `packages/neuro-dex/src/model-loader.js` (lazy singleton)
- `@huggingface/transformers` v3.x: use `pipeline('summarization', modelName)`
- ESM bridge: `@huggingface/transformers` may also be ESM-only — validate with same spike approach as SPEC-002
- Token counting: use `pipeline.tokenizer.encode(text).length` for token estimates
- For `distillNotes`: concatenate note contents with separators, then summarize the combined text
