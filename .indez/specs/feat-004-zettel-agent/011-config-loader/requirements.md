# SPEC-011: Config Loader

**Spec ID**: SPEC-011
**Feature**: [FEAT-004](../../../planning/features/FEAT-004-zettel-agent-mcp-server.md) zettel-agent MCP Server
**Epic**: [EPIC-001](../../../planning/epics/EPIC-001-mcp-server-platform.md)
**Created**: 2026-02-14
**Status**: Draft
**Effort**: S
**Risk**: Low
**Dependencies**: None (fully independent — can be built any time during Phase 1 or 2)
**Blocks**: SPEC-012

## Overview

Implement `loadConfig(configPath)` in `packages/zettel-agent/src/config-loader.js` and create the `config/config.json` file with schema documentation. The config loader validates the config at startup and exits with a clear error if the config is invalid.

## Config Schema

```json
{
  "vaultRoot": "/absolute/path/to/vault",
  "obsidianEnabled": false,
  "obsidianApiKey": "",
  "obsidianPort": 27123,
  "model": "Xenova/t5-small"
}
```

Required: `vaultRoot`
Optional (with defaults): `obsidianEnabled` (false), `obsidianApiKey` (""), `obsidianPort` (27123), `model` ("Xenova/t5-small")

## User Stories

### US-1: Load valid configuration

**As a** server operator
**I want to** specify the vault root and optional settings in a JSON file
**So that** I don't need to modify code or environment variables to change configuration

**Acceptance Criteria**:

- AC-1. WHEN `config/config.json` exists with a valid `vaultRoot` path, `loadConfig()` SHALL return the parsed config object with all fields (defaults applied)
- AC-2. WHEN optional fields are absent, SHALL use defaults: `obsidianEnabled: false`, `obsidianApiKey: ""`, `obsidianPort: 27123`, `model: "Xenova/t5-small"`
- AC-3. The returned config SHALL have all six documented fields regardless of what is in the JSON file

### US-2: Fail clearly on bad config

**As a** server operator
**I want to** get a clear error message when my config is wrong
**So that** I can fix it without reading source code

**Acceptance Criteria**:

- AC-4. IF `config/config.json` does not exist, `loadConfig()` SHALL throw with message: `Config file not found: [path]. Copy config/config.example.json to config/config.json and set vaultRoot.`
- AC-5. IF `vaultRoot` is missing, SHALL throw with message: `Config validation error: vaultRoot is required`
- AC-6. IF `vaultRoot` does not exist on disk, SHALL throw with message: `Config validation error: vaultRoot does not exist: [path]`
- AC-7. IF the JSON is malformed, SHALL throw with message: `Config parse error: [JSON error message]`

## Functional Requirements

- **FR-1**: `loadConfig(configPath)` SHALL read, parse, and validate the JSON config file. _(References: AC-1–AC-7)_
- **FR-2**: `loadConfig` SHALL apply default values for all optional fields. _(References: AC-2, AC-3)_
- **FR-3**: A `config/config.example.json` file SHALL be created with all fields documented via comments (use a `.jsonc` format or a companion `.md`). _(References: AC-4)_

## Non-Functional Requirements

- **NFR-1** (Clarity): All error messages SHALL include the config file path and a hint about what to fix.
- **NFR-2** (Security): `vaultRoot` SHALL be resolved to an absolute path during loading.

## Implementation Notes

- File: `packages/zettel-agent/src/config-loader.js`
- Also create: `config/config.example.json` and `config/README.md` explaining each field
- Use `fs.existsSync` for the existence check (synchronous is fine at startup)
- `path.resolve(vaultRoot)` to normalize the vault root path
