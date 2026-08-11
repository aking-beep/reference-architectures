---
title: Human-in-the-Loop Action Layer
category: AI
difficulty: intermediate
tags: [hitl, workflows, approvals, operator-ai]
updated: 2026-08-11
origin: "Operator-AI / 00_Product_Spec / operator_ai_phase6_package + master spec §3.D Action Layer"
---

# Human-in-the-Loop Action Layer

Draft tickets, emails, and escalations from operating intelligence — but never mutate an external system without a human approval.

_Harvested from:_ Operator-AI / 00_Product_Spec / operator_ai_phase6_package + master spec §3.D Action Layer

## When not to use
Fully autonomous ops on throwaway environments. If a wrong write can page a client or move money, this is the pattern.

## Problem
Once you have a structured operating model, the obvious next step is to *do something*: open a Jira ticket, assign an owner, draft a Slack message, start an approval. Autonomous writes are how consulting tools lose trust. The action layer must produce drafts and require a human before anything leaves the building.

## Shape
```
Structured intelligence (risks, commitments, decisions)
        ↓
Action proposer (LLM, schema-bound)
        ↓
Draft store  — ticket | email | slack | meeting | escalation
        ↓
Human review queue  (approve / edit / reject)
        ↓
Connector  (Jira, Slack, email, calendar)  ← only after approval
        ↓
Audit log  (who approved, what changed, evidence pointer)
```

Phase 6 of Operator AI is this loop plus a portfolio UI. Live connectors and Step Functions wait for Phase 7 and a dedicated ADR.

## Key decisions
- **Human approval is mandatory** before any external action. That is a product rule, not a prompt suggestion.
- **Drafts are schema-bound** (owner, due date, evidence id, proposed text). Free-form "the agent will figure it out" is how you get un-reviewable blobs.
- **Edits are training signal.** Capture the human diff; feed it to evaluation.
- **Connectors are dumb.** They send an already-approved payload. They do not re-reason.

## Failure modes
A "send if confidence > 0.9" shortcut will eventually email a client. Mixing draft generation and connector I/O in one function makes it too easy to forget the approval check. No audit log means you cannot answer "who let this ticket out." Letting the model pick the target system ("maybe this is a Linear ticket") is how actions vanish into the wrong tool.

## Scaling path
Ship the review queue against synthetic accounts first. Add one connector at a time with a kill switch. Promote the queue to Step Functions when you need timeouts, nudges, and multi-approver chains. Never skip the audit log to "move faster."
