---
title: Agent Spend Control Without a Gateway
category: SaaS
difficulty: intermediate
tags: [finops, agents, kill-switch, tokenloop]
updated: 2026-08-11
origin: "ARC Labs / TokenLoop (tokenloop.vercel.app) — live free product"
scenario: "jordan@ spiked 7.8×. Kill switch via admin APIs — minutes-scale, no proxy."
image: /scenarios/agent-spend-control.jpg
---

# Agent Spend Control Without a Gateway

Detect-and-cut AI coding-agent spend from read-only admin APIs: per-developer burn, a minutes-scale kill switch, and client chargeback — no traffic proxy.

_Harvested from:_ ARC Labs / TokenLoop (tokenloop.vercel.app) — live free product

## Scenario
jordan@ spiked 7.8×. Kill switch via admin APIs — minutes-scale, no proxy.

![jordan@ spiked 7.8×. Kill switch via admin APIs — minutes-scale, no proxy.](/scenarios/agent-spend-control.jpg)

## When not to use
When you need true per-request blocking. A minutes-scale kill switch cannot stop a token already in flight. Don't pretend otherwise.

## Problem
Engineering and agency leads running Claude Code and Cursor find out about runaway spend on the invoice. They need detect-and-cut plus client bill-back **without** rebuilding all traffic through a proxy they do not want to operate.

## Shape
```
Free signup (email + password)
        ↓
Read-only admin keys  (Anthropic / Cursor)
        ↓
AES-256-GCM encrypt at rest  — never returned to the browser
        ↓
Periodic sync  (~10 min)  →  per-developer burn, spike multiplier
        ↓
Policy: daily cap / spike threshold
        ↓
Kill switch: detect → alert → throttle or revoke via admin APIs
        ↓
Optional chargeback: tag clients, markup, CSV export
```

No gateway. The system observes admin APIs and acts through them. Honest scope: minutes-scale cut, not true per-request blocking.

## Key decisions
- **No proxy.** Inserting a gateway would catch more, and would also become an availability and privacy surface most teams will not accept for a free tool.
- **Keys encrypted at rest, never echoed back.** Signup exists so secrets have an org to belong to — not to unlock paid tiers.
- **Kill switch is a state machine** (detect / alert / throttle / revoke), not a single button.
- **Chargeback is a view on the same spend data**, not a second ingestion path.

## Failure modes
A 10-minute sync window can miss a flash spike — say so on the dashboard. A revoke that the provider API delays looks like a broken kill switch; show last-action status. Storing keys in localStorage "just for the session" is how they leak. Treating this as a replacement for procurement-level budget controls oversells it.

## Scaling path
Add providers (Codex / OpenAI) as additional read-only ingestions behind the same policy engine. Tighten sync frequency only where the provider API allows it. A real per-request gateway is a different product with a different trust model — do not sneak it into this shape.
