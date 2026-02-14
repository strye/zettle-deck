# zettle-mcp Design Document

This document captures architectural and implementation decisions for the project. It is a living document — decisions are added as they are made and revised if reversed.

---

## Decisions

### D-001: Language Stack

**Decision:** Custom code is written in vanilla JavaScript (CommonJS or ESM). TypeScript is not used.

**Rationale:** Eliminates a build step, reduces toolchain complexity, and keeps the project accessible without a compilation pipeline.

**Constraints:**
- Python is allowed only when a capability genuinely requires it and a JavaScript equivalent does not exist or is significantly inferior (e.g., a library with no JS port).
- Bash is allowed for build scripts, deployment automation, and lightweight operational tasks (e.g., install scripts, CI steps).
- If Python is introduced, the reason must be documented in this file under a new decision entry.

**Applies to:** All source files under `src/`, any scripts in `scripts/`.

---

## Open Decisions

- Module format: CommonJS (`require`) vs. ESM (`import`) — decide before first source file is written.
- Whether a `package.json` build/lint script is needed or if the server runs directly with `node`.
- Runtime version floor (Node.js minimum version to target).
