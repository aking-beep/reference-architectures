---
title: Synthetic Data and Evaluation Loop
category: AI
difficulty: advanced
tags: [evaluation, synthetic-data, ground-truth, operator-ai]
updated: 2026-08-11
origin: "Operator-AI / 01_Synthetic_Companies, 06_Ground_Truth, 07_Evaluations + master spec §14–16"
---

# Synthetic Data and Evaluation Loop

Fictional companies, daily scenarios, and hidden ground truth so you can score extraction quality before any real client data is in the system.

_Harvested from:_ Operator-AI / 01_Synthetic_Companies, 06_Ground_Truth, 07_Evaluations + master spec §14–16

## When not to use
A one-shot demo with no intention to measure quality over time. If you cannot name a score, skip the synthetic factory.

## Problem
You cannot tune an extraction pipeline on real client data you do not yet have, and you should not. You need fictional-but-realistic companies, a daily stream of operational events, and **hidden ground truth** so a scorer can tell whether the model recovered the risks, owners, and contradictions you planted.

## Shape
```
Synthetic company profile
        ↓
Daily scenario generator  (Slack, Jira, email, incidents, AWS findings…)
        ↓
Raw public-style signals     +     hidden ground truth (not in the model context)
        ↓
Same production pipeline (ingest → extract → persist → brief)
        ↓
Evaluator compares operating objects to ground truth
        ↓
Quality score → prompt / schema / rule change → replay
```

Drive layout: `01_Synthetic_Companies`, `02_Daily_Scenarios`, `06_Ground_Truth`, `07_Evaluations`. Advance a 56-day calendar per account rather than generating one giant dump.

## Key decisions
- **Ground truth never enters the model context.** If it does, you are testing regurgitation.
- **The production pipeline is the thing under test.** A separate "eval prompt" that does not run in prod is a different product.
- **Score what the schema cares about** (risk recovered, owner correct, contradiction flagged), not BLEU on the brief prose.
- **Advance time on a calendar** so trend, missed deadlines, and compounding risk are testable.

## Failure modes
Leaking ground truth into the scenario text makes scores look great and production look random. Scoring the brief's fluency instead of the objects hides extraction bugs. A static synthetic dump goes stale the moment the schema changes — regenerate from the company profile. Using real client names "for realism" is how you get a compliance incident in a test folder.

## Scaling path
Start with one company and 14 days. Add industries once scores are stable. Wire the evaluator into CI so a prompt change that drops recall cannot merge. Only then point the same pipeline at a real (contracted, minimized) artifact set.
