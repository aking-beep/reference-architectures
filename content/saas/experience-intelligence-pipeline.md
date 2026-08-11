---
title: Experience Intelligence Assessment Pipeline
category: SaaS
difficulty: advanced
tags: [cro, ux, playwright, lighthouse, assessment]
updated: 2026-08-11
origin: "experience-intelligence-platform — Drive/GitHub RFP-grade CRO assessment"
scenario: "RFP-grade checkout assessment. AI only ranks findings the crawlers produced."
image: /scenarios/experience-intelligence-pipeline.jpg
---

# Experience Intelligence Assessment Pipeline

RFP-grade CRO/UX assessment: crawl, Playwright journeys, Lighthouse, axe-core, and AI interpretation into an evidence-backed, prioritized backlog.

_Harvested from:_ experience-intelligence-platform — Drive/GitHub RFP-grade CRO assessment

## Scenario
RFP-grade checkout assessment. AI only ranks findings the crawlers produced.

![RFP-grade checkout assessment. AI only ranks findings the crawlers produced.](/scenarios/experience-intelligence-pipeline.jpg)

## When not to use
A one-page Lighthouse paste. If you are not collecting journey evidence, you do not need this pipeline.

## Problem
Agencies and consultants still produce CRO/UX recommendations from a slide instinct. Buyers want RFP-grade evidence: what was crawled, which journeys ran, what Lighthouse and axe said, and why the model ranked a finding — in a backlog they can staff.

## Shape
```
NEW ASSESSMENT → client → URL → competitors → objective → journey
        ↓
RUN  →  crawl  →  Playwright  →  Lighthouse  →  a11y (axe-core)  →  AI interpretation
        ↓
Evidence-backed findings  →  prioritized CRO backlog  →  RFP output
```

Three product layers: **Assessment Engine**, **Agency Workspace** (clients, collaboration, deliverables), **Benchmarking** (industry / franchise intelligence). Stack: Next.js, Vercel, Supabase, Trigger.dev jobs, Playwright, axe-core, Lighthouse. Local JSON store under `.data/` so the app runs without Supabase in development.

## Key decisions
- **Evidence before interpretation.** The AI ranks findings that instruments produced; it does not invent them.
- **Jobs are async** (see Async Job Processing). A crawl is not a request.
- **Agency workspace is multi-tenant** with client records, not a folder of PDFs.
- **Companion toolkit stays outside the product** (Clarity, GA4, Search Console, WAVE) — don't rebuild analytics, ingest its exports.
- **Degrade to a local store** so development never blocks on cloud credentials.

## Failure modes
Running AI on a URL with no crawl evidence produces confident fiction. Blocking the UI on Playwright makes the assessment feel broken. Mixing competitor URLs into the same evidence bag without a source tag poisons the backlog. Treating Lighthouse scores as the recommendation (instead of as one evidence stream) is the old PDF report with extra steps.

## Scaling path
V0.1 persists the assessment and detail page. Next: the job runner, then AI interpretation with citations back to artifacts, then RFP export. Benchmarking is a third layer — do not delay the engine to build a data network.
