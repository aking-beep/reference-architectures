---
title: Maturity Assessment with a Balance Score
category: SaaS
difficulty: intermediate
tags: [assessment, maturity, cith, scoring]
updated: 2026-08-11
origin: "aking-beep/arc-cith-app — C.I.T.H. maturity framework"
---

# Maturity Assessment with a Balance Score

A 40-question, behaviorally-anchored maturity model that scores pillars *and* variance — a high average with high spread is fragile, not healthy.

_Harvested from:_ aking-beep/arc-cith-app — C.I.T.H. maturity framework

## When not to use
A five-question marketing quiz. If answers are not behaviorally anchored, a balance score is decoration.

## Problem
Most maturity models average a handful of pillars and call the result "ready." A team that is excellent at tooling and empty at governance looks identical to a balanced team at the same mean. C.I.T.H. exists to make that lie visible: **a high average with high variance across pillars is fragile, not healthy.**

## Shape
```
Team answers 40 behaviorally-anchored questions
        ↓
Per-pillar scores
        ↓
Balance score  (variance / spread across pillars)
        ↓
Readiness profile  =  mean  ×  balance, with the gap named
        ↓
Report: strengths, fragile pillars, recommended next work
```

Questions are behavioral ("what actually happens when X") rather than aspirational ("we value Y"). The scoring engine is reusable across ARC assessments (AI-readiness, AWS, DevOps, CRO).

## Key decisions
- **Anchor every item in observable behavior**, not values. Otherwise people grade their intent.
- **Ship the balance score next to the mean.** Hide it and you are back to a vanity average.
- **One profile per team, not per executive.** High variance inside a team is the finding.
- **Recommendations map to Studio work** (the flywheel: free tool → named gap → scoped engagement) without gating the report behind a sales call.

## Failure modes
Averaging away the weakest pillar is how a "green" score ships into a real incident. Letting one champion fill the survey for a 40-person org measures that person. Numeric scores without the behavioral evidence make the report undebatable and therefore unused.

## Scaling path
Start with one framework (C.I.T.H.). Reuse the scoring engine for AWS / DevOps / AI-readiness assessments in Operator AI. Longitudinal re-takes become the ARC Platform dashboard once teams want the score as a system, not a PDF.
