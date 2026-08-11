---
title: Executive Operating Intelligence Loop
category: AI
difficulty: advanced
tags: [operator-ai, intelligence, schema, evidence]
updated: 2026-08-11
origin: "Operator-AI / 00_Product_Spec / operator_ai_master_spec.md (§2 Core Product Loop, §4–8 schemas)"
scenario: "Meridian Health: reported green, evidence red. The gap is the product."
image: /scenarios/operator-intelligence-loop.jpg
---

# Executive Operating Intelligence Loop

Turn fragmented operational evidence into a structured operating model, then render dashboards, briefs, SOWs, and assessments from that model — not from a chatbot.

_Harvested from:_ Operator-AI / 00_Product_Spec / operator_ai_master_spec.md (§2 Core Product Loop, §4–8 schemas)

## Scenario
Meridian Health: reported green, evidence red. The gap is the product.

![Meridian Health: reported green, evidence red. The gap is the product.](/scenarios/operator-intelligence-loop.jpg)

## When not to use
A Q&A copilot over a document dump. If you do not persist a structured operating model, this is RAG with extra steps.

## Problem
Executives and account teams drown in Slack, Jira, emails, incidents, and decks. Chatbots summarize the pile and forget it. Operator AI's job is to **create and maintain a structured operational model**, then render dashboards, reports, and consulting deliverables from that model — overall condition, ranked risks, missing owners, commitments at risk, required decisions, and evidence for every conclusion.

## Shape
```
Public signals, client artifacts, or synthetic artifacts
        ↓
Evidence ingestion
        ↓
Normalization
        ↓
Operational object extraction
        ↓
Risk, commitment, ownership, deadline, contradiction analysis
        ↓
Structured operational intelligence
        ↓
Executive dashboard  →  SOWs, RFPs, assessments, roadmaps, reports
        ↓
Evaluation
        ↓
Prompt, rule, schema, and workflow improvement
```

Canonical objects: account, operating_condition (GREEN/AMBER/RED/CRITICAL), risk, commitment, decision, evidence. Contradiction detection is a first-class stage, not a prompt trick.

## Key decisions
- **Model first, chat second.** The product is the operating object store. The dashboard and the brief are views.
- **Evidence for every conclusion.** A risk without an evidence pointer is an opinion and does not ship.
- **Reported status vs evidence-based status** are both stored — the gap is the product.
- **Synthetic scenario engine** produces fictional companies plus hidden ground truth so evaluation is possible before any client data is touched.
- **Action layer is later and HITL.** Drafting a Jira ticket is allowed; creating it without approval is not.

## Failure modes
Summarizing without persisting objects means yesterday's brief cannot be compared to today's. Mixing reported status with inferred status hides the gap executives actually pay for. Skipping contradiction detection lets two artifacts disagree in silence. Generating an SOW from a chat transcript instead of from the operating model produces a document you cannot defend in a review.

## Scaling path
Phase 1 is structured intelligence; Phase 2 the executive dashboard; Phase 3 the consulting workbench; Phase 4 synthetic scenarios; Phase 5 evaluation; Phase 6 HITL workflows; Phase 7 enterprise scale (Step Functions, graph store, live connectors). Do not skip evaluation to "get to agents faster" — without ground truth you cannot tell if the model got better.
