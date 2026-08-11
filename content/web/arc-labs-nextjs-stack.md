---
title: ARC Labs Product Stack
category: Web
difficulty: starter
tags: [nextjs, vercel, labs, platform]
updated: 2026-08-11
origin: "ARC Transformation / ARC Labs (Free) + ARC Master Blueprint §5–6 (shared platform components)"
scenario: "Fourth free tool, same Next.js + Vercel stack. Three homes: Drive, GitHub, website."
image: /scenarios/arc-labs-nextjs-stack.jpg
---

# ARC Labs Product Stack

The shared Next.js + Vercel + TypeScript shape every ARC Labs tool ships on, so a new scanner or catalog lands fast and behaves the same.

_Harvested from:_ ARC Transformation / ARC Labs (Free) + ARC Master Blueprint §5–6 (shared platform components)

## Scenario
Fourth free tool, same Next.js + Vercel stack. Three homes: Drive, GitHub, website.

![Fourth free tool, same Next.js + Vercel stack. Three homes: Drive, GitHub, website.](/scenarios/arc-labs-nextjs-stack.jpg)

## When not to use
A Python data job with no UI, or an AWS-only pipeline. Don't drag Next.js into a Lambda that only transforms Parquet.

## Problem
A small studio shipping many free tools cannot afford a unique stack per product. Auth, scoring, export, API shape, and visual language have to be copy-paste close so a new Lab is days, not a platform rewrite.

## Shape
```
Next.js 15 App Router  +  TypeScript (strict)  +  Tailwind
        ↓
app/           UI + route handlers
lib/           domain logic (scan, catalog, review) — no UI imports
cli/           same domain logic, invoked from npm scripts
content/       open markdown mirror (catalog products)
.github/       typecheck + build on PR
        ↓
Vercel  (*.arctransformationgrouplab.dev)
Google Drive   ARC Labs (Free)/<product>   ← canonical working copy
GitHub         aking-beep/<product>        ← public source of truth
arc-website    /labs/<slug>                ← marketing + deep link
```

Shared components the Blueprint wants every product to reuse: auth/access gate (only when secrets are stored), report engine, scoring engine, recommendation engine, export (PDF/Markdown/JSON), API layer, design system, analytics, feedback.

## Key decisions
- **Open by default.** Catalogs (skills, architectures, workflows) have no access gate. Tools that store secrets (TokenLoop) encrypt at rest and require a free signup.
- **Domain logic in `lib/`, UI in `app/`.** The CLI and the GitHub Action must call the same functions the UI does.
- **Drive folder + GitHub repo + website card** are the three homes of every Lab. Missing one means it is not shipped.
- **Same visual language** (pills, cards, grade colors) so a user who ran the MCP scanner recognizes Prompt Reviewer.

## Failure modes
A Lab that only exists on a laptop never compounds. A unique CSS system per tool makes the website look like a directory of strangers. Putting API keys in the Next.js bundle because "it's just a scan" is how you leak them. Skipping `npm run typecheck` in CI is how Drive copies and GitHub copies drift.

## Scaling path
Extract a real `@arc/shared` package only after three tools are repeating the same 200 lines. Until then, copy the small files (rate limit, markdown-lite, catalog types) and keep each repo independently deployable. Productize into ARC Platform when the recurring scan/dashboard work outgrows a free Lab.
