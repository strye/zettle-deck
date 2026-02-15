# Product Steering

**Created**: 2026-02-14
**Last Updated**: 2026-02-14

## Product Vision

zettle-deck is an MCP (Model Context Protocol) server that gives AI assistants first-class programmatic access to markdown-based knowledge repositories. It bridges the gap between AI tools and personal knowledge management systems — particularly Obsidian vaults — by exposing a clean, sandboxed set of tools for reading, writing, searching, and managing markdown notes.

## Target Users

- **AI-assisted knowledge workers** who use Obsidian or plain markdown vaults and want their AI assistant to read, write, and organize notes on their behalf
- **Developers building AI agents** that need structured access to a local markdown corpus
- **Researchers and writers** who want AI to summarize, distill, and cross-reference large note collections without exporting data to third-party services

## Core Features

1. **File I/O Tools** — Read, write, create, delete, move, and rename markdown notes within a sandboxed vault
2. **Edit Tools** — Insert blocks, append text, delete sections, and replace line ranges in existing notes
3. **Search** — Full-text, regex, tag, and wikilink backlink search across the vault
4. **Summarization / Token Reduction** — Summarize single notes, distill multiple notes, compress context to reduce AI token consumption
5. **Frontmatter Management** — Read and write YAML frontmatter fields without disrupting note content
6. **Obsidian Integration** — Optional bridge to Obsidian Local REST API for Obsidian-specific metadata

## Value Proposition

AI assistants currently have no safe, structured way to interact with local markdown vaults. Users must copy-paste content manually, export files, or use fragile shell scripts. zettle-deck solves this by providing a production-quality MCP server that AI assistants can call directly — with sandboxing to ensure the AI cannot escape the vault directory.

## Unique Differentiators

- **Fully local** — no cloud service, no API keys required (except optional Obsidian bridge)
- **Sandboxed** — path validation prevents AI from accessing files outside the vault
- **Obsidian-aware** — understands wikilinks, tags, aliases, and canvas files
- **Embedded AI** — summarization uses local ONNX models via `@huggingface/transformers`; no external inference server needed
- **MCP-native** — designed from the ground up for the Model Context Protocol

## Success Metrics

- All 11 core zettel-forge tools callable via MCP without errors
- Sandbox correctly rejects 100% of path traversal attempts
- Summarization produces coherent output on notes up to 4,000 tokens
- Server starts in under 2 seconds on a modern Mac
