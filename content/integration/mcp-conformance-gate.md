---
title: MCP Conformance Gate
category: Integration
difficulty: starter
tags: [mcp, conformance, agents, ci]
updated: 2026-08-11
origin: "ARC Labs / mcp-conformance-scanner — flagship free tool"
---

# MCP Conformance Gate

Treat Model Context Protocol servers as production dependencies: handshake, capability negotiation, and schema checks as a gate — not a vibe check in one client.

_Harvested from:_ ARC Labs / mcp-conformance-scanner — flagship free tool

## When not to use
A local toy server you will never share. The gate is for anything another agent or team will call.

## Problem
Teams ship MCP servers that "looked fine in one client" and then break handshake, advertise tools they cannot call, or expose schemas another model cannot parse. You need a **clear-eyed conformance report** — what passes, what breaks, what to fix first — before production, and eventually in CI.

## Shape
```
Paste a server URL or point the CLI at a local process
        ↓
Handshake + capability negotiation
        ↓
Tool / resource / prompt schema validation
        ↓
Graded report  (operator language, not linter noise)
        ↓
Shareable link  ·  Markdown/JSON export  ·  CI --min-grade (when the Action ships)
```

Same Next.js + Vercel Labs stack. The scanner is the gate; Studio is the human read on what it surfaced.

## Key decisions
- **Protocol checks before cleverness.** Handshake and capability negotiation catch more production breaks than a prompt eval.
- **Operator-facing findings.** A prioritized fix list beats a dump of JSON-schema errors.
- **CLI parity with the UI** so the same grade can block a merge.
- **No model call required** for conformance — keep it fast, cheap, and reproducible.

## Failure modes
Testing only in one client hides capability mismatches. Treating a passing grade as a security audit oversells the tool — pair with real review. Scanning servers you do not own is both rude and an SSRF risk; refuse private ranges. A report nobody can share does not change a PR.

## Scaling path
Core suite and shareable links first. CI GitHub Action next. Historical diffing once teams run this on every release. Connectivity Scanner and Prompt Reviewer sit beside it as sibling gates (reachability, prompt surface) — don't merge them into one mega-scanner.
