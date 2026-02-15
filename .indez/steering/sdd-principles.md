# SDD Principles

Spec-Driven Development (SDD) for zettle-deck follows these principles:

1. **Spec before code** — Every implementation unit has a requirements.md before a line of production code is written.
2. **EARS notation** — Acceptance criteria use WHEN/IF/WHILE...SHALL format for clarity and testability.
3. **Traceability** — Every design decision traces to a requirement; every requirement traces to a user story.
4. **Living documents** — Specs evolve; update them when implementation reveals gaps.
5. **Three tiers** — Epic (strategic) → Feature (capability) → Spec (implementable unit).
6. **Dependency-first ordering** — Build foundation specs before dependent specs.
7. **Parallelization by design** — Independent specs are identified and built concurrently.
8. **Structured errors** — All tools return `{ error: true, code, message }` on failure; never throw to the MCP layer.
9. **Sandbox-first** — No file access outside the vault. Period.
10. **Test every acceptance criterion** — Each AC maps to at least one test case.
