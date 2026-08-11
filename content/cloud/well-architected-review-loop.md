---
title: Well-Architected Review Loop
category: Cloud
difficulty: starter
tags: [aws, well-architected, governance, review]
updated: 2026-08-11
origin: "AWS Professor / Lesson_002 Well-Architected Framework Six Pillars + Operator-AI AWS Assessment module"
---

# Well-Architected Review Loop

Run AWS Well-Architected as a repeating operating loop across six pillars — not a one-time slide — with named risks, owners, and a next-workload date.

_Harvested from:_ AWS Professor / Lesson_002 Well-Architected Framework Six Pillars + Operator-AI AWS Assessment module

## When not to use
A greenfield sketch with no workload yet. Review real systems; don't score a deck.

## Problem
Teams treat Well-Architected as a certification checkbox or a consultant's PDF. Six months later nothing has owners. The framework only pays off as a **loop**: score a named workload against the six pillars, write risks with owners, schedule the next review, and refuse to let "we'll get to security later" hide inside an average.

## Shape
```
Named workload (not "the AWS account")
        ↓
Six pillars: Operational Excellence · Security · Reliability
             Performance Efficiency · Cost Optimization · Sustainability
        ↓
Per-pillar findings  →  risks with owner + due date
        ↓
Balance check: a high mean with a failing Security pillar is not healthy
        ↓
Remediation backlog  →  next review date on the calendar
```

Same balance-score instinct as C.I.T.H.: the weak pillar is the finding. Operator AI's AWS Assessment module is this loop productized.

## Key decisions
- **Review a workload, not an account.** "Prod checkout" and "analytics lake" have different risks.
- **Every finding has an owner and a date**, or it is a slide.
- **Cost is a pillar, not a finance afterthought.** Token and egress spend belong here for AI workloads.
- **Sustainability is in the framework** — treat it as capacity and waste, not marketing.
- **Re-review on a cadence** (quarterly, or after a material change), not after an incident.

## Failure modes
Averaging six pillars into a gold badge hides a missing encryption finding. Reviewing "AWS" instead of a workload produces generic advice. A report without owners is a souvenir. Running the review only to unlock a partner credit, then archiving the PDF, is the anti-pattern this loop exists to prevent.

## Scaling path
One workload, six pillars, a spreadsheet if you must. Promote to Operator AI's AWS Assessment when you want evidence pointers and a dashboard. Multi-account is a later problem — get the loop honest on one production workload first.
