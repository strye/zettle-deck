# Project Naming Ideation

## Context

The original repository name `zettle-mcp` had two problems: "zettle" is an obscure Zettelkasten reference, and "mcp" bakes in an implementation detail. Since MCP server tools are only one aspect of the broader toolkit, a better high-level name was needed.

**Target audience:** Knowledge and content workers who use markdown repositories for knowledge tracking, research, and creating original content with AI assistance. The Zettelkasten reference is intentional — this community is familiar with the terminology.

---

## Candidates Explored

### Zettelkasten-rooted
- `zettelkit` — toolkit framing, no implementation coupling
- `zettelforge` — suggests creation and content production
- `zetteldeck` — deck of tools/cards; also resonates with cyberpunk fiction
- `zettelworks` — broad "works" framing, implies an ecosystem
- `zettelagent` — explicit AI framing
- `zettelflow` — workflow connotation

### Slip-box angle (literal ZK translation)
- `slipkit` — slip box + toolkit
- `slipforge` — slip box + creation
- `slipjack` — slip box + "jack in" (cyberpunk slang); aggressive, niche

### AI/cognitive angle
- `neurodex` — neural + index (dex as in index cards); Gibson-adjacent
- `cogdeck` — cognitive deck; clean but loses ZK signal
- `minddeck` — mind + cyberdeck

### Matrix/net angle
- `zetmatrix` — ZK + the matrix
- `zetnet` — cleaner alternative to zetmatrix; ZK + the net

---

## The Cyberpunk Riff

`zettledeck` surfaced a deeper resonance: the **cyberdeck** from William Gibson's *Neuromancer* — the primary cognitive interface tool used by hackers to jack into the matrix.

The parallel is real, not forced:
- The **Zettelkasten** augments human memory and thinking — a second brain built from linked index cards
- The **cyberdeck** is a prosthetic interface between the hacker's mind and the net

Both are cognitive tools. This project sits at the same intersection: wiring an AI assistant into your second brain.

This framing also opens a natural aesthetic territory — monospace, terminal-native, no-nonsense tooling. Documentation as a hacker's manual. A CLI that feels like jacking in.

---

## Decision

**Chosen name: `zettle-deck`**

Works on three levels:
1. Zettelkasten origin — legible to the PKM community
2. Cyberdeck reference — cognitive prosthetic, jacking AI into your second brain
3. Cards-as-notes — the index card is native to Zettelkasten thinking

Runner-up noted: `zetnet` — a cleaner, more evocative alternative to `zetmatrix` if the net/matrix angle is ever revisited.

**Folder/module convention:** hyphenated (`zettle-deck`), consistent with the existing naming pattern.
