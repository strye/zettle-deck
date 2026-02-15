# neuro-dex AI Tools

**Feature ID**: FEAT-003
**Epic**: [EPIC-001](../epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Last Updated**: 2026-02-14
**Status**: Draft
**Package**: `neuro-dex`
**Depends on**: FEAT-001 (slip-kit Foundation — SPEC-005 must be complete)

## Overview

Implement the summarization and token-reduction tools in `neuro-dex` using local ONNX inference via `@huggingface/transformers`. Three tools: summarize a single note, distill multiple notes into a synthesis, and compress a text block to reduce AI token consumption. No external API keys or services required.

## Problem Statement

AI assistants working with large knowledge bases quickly hit context window limits. Long notes, multiple related notes, and verbose content consume expensive tokens. neuro-dex tools let the AI reduce token count intelligently before sending content to the model — or summarize vault content on demand.

## Value Proposition

Local inference means no API costs, no data leaving the machine, and no rate limits. Users with large vaults can summarize and distill content without exporting data to external services.

## User Stories

### US-1: Summarize a single note

**As an** AI assistant
**I want to** generate a concise summary of a single note
**So that** I can reference the key points without consuming the full note's token budget

**Acceptance Criteria**:

- AC-1. WHEN a valid note path is provided, the system SHALL return a shorter textual summary of the note's content
- AC-2. IF the note does not exist, the system SHALL return a NOT_FOUND error
- AC-3. IF the note body is empty, the system SHALL return an INVALID_PARAMS error
- AC-4. WHEN the model is not yet loaded, the system SHALL load it once and cache it for subsequent calls
- AC-5. IF the model fails to load, the system SHALL return `{ error: true, code: 'IO_ERROR', message: '...' }`

### US-2: Distill multiple notes

**As an** AI assistant
**I want to** synthesize the key themes across multiple notes into a single summary
**So that** I can understand a topic without reading every individual note

**Acceptance Criteria**:

- AC-6. WHEN an array of valid note paths is provided, the system SHALL return a single synthesized summary
- AC-7. IF any path does not exist, the system SHALL return a NOT_FOUND error identifying the missing path
- AC-8. IF the array is empty, the system SHALL return an INVALID_PARAMS error
- AC-9. The summary SHALL reflect content from all provided notes, not just the first

### US-3: Compress context

**As an** AI assistant
**I want to** reduce the token count of a provided text block
**So that** I can fit more information into my context window

**Acceptance Criteria**:

- AC-10. WHEN a text string is provided, the system SHALL return a shorter version that preserves the key meaning
- AC-11. IF the input text is empty, the system SHALL return an INVALID_PARAMS error
- AC-12. WHEN compression is applied, the output token count SHALL be less than the input token count

## Functional Requirements

- **FR-1**: The system SHALL load the ONNX model once at first use and cache it in memory for the process lifetime. _(References: AC-4, AC-5)_
- **FR-2**: All three tools SHALL accept text/paths via the standard `(params, context)` tool signature. _(References: US-1, US-2, US-3)_
- **FR-3**: All three tools SHALL return structured errors on failure, not thrown exceptions. _(References: AC-2, AC-3, AC-5, AC-7, AC-8, AC-11)_

## Non-Functional Requirements

- **NFR-1** (Performance): Single-note summarization SHALL complete in under 30 seconds for notes up to 2,000 tokens on a modern Mac.
- **NFR-2** (Reliability): Model loading failures SHALL be caught and returned as structured errors, never crashing the MCP server.
- **NFR-3** (Privacy): All inference SHALL be local; no content SHALL be sent to external APIs.
- **NFR-4** (Configurability): The model name SHALL be configurable via `config.json` with a sensible default.

## Specs

| Spec | Name | Status | Dependencies |
|------|------|--------|-------------|
| [SPEC-013](../../specs/feat-003-neuro-dex/013-summarization/requirements.md) | Summarization Tools | Draft | SPEC-005 |

## Open Questions (Must Resolve Before SPEC-013)

1. **Model selection**: Which `@huggingface/transformers` model? Recommendation: `Xenova/t5-small` as default (fast, small download). Must be configurable.
2. **Single-response vs streaming**: Streaming changes the return type and the MCP tool registration. Recommendation: single-response for v0.1.0; add streaming later.
3. **Ollama integration**: Optional backend alternative. Recommendation: defer to v0.2.0; implement as optional config flag.

## Technical Considerations

- neuro-dex depends only on slip-kit — it can be built fully in parallel with all of Phase 2 (zettel-forge)
- `@huggingface/transformers` v3.x ONNX in Node.js is higher-risk than Python equivalents — allocate extra testing time
- Model download on first run requires network access; document this in setup instructions
- LanceDB (for future RAG) is ESM-only — the same `require(esm)` concern as remark applies here

## Out of Scope

- RAG index and semantic search (SPEC-016, optional Phase 4)
- Ollama backend (deferred)
- Streaming responses (deferred)
