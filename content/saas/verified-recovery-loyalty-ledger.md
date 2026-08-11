---
title: Verified Recovery Loyalty Ledger
category: SaaS
difficulty: starter
tags: [ledger, loyalty, supabase, foodmesh]
updated: 2026-08-11
origin: "foodmesh-mvp-kit / foodmesh-rewards — verified recovery → farmer loyalty tokens"
---

# Verified Recovery Loyalty Ledger

Verified food recovery mints loyalty points on a Postgres ledger — not a blockchain — with role-specific views for charity, farmer, and impact.

_Harvested from:_ foodmesh-mvp-kit / foodmesh-rewards — verified recovery → farmer loyalty tokens

## When not to use
When you actually need a public chain, or when "tokens" are a pitch and there is no verified event to mint from.

## Problem
A food-recovery network wants to reward farmers for surplus that charities actually pick up. A blockchain token sounds like the answer and then becomes the product. The real need is a **verified event → mint rule → ledger → payout status**, with role-specific views and an audit trail.

## Shape
```
Charity logs a pickup  (weight_kg, farmer, timestamp)
        ↓
Server-side mint rule
  tokens = weight_kg × tokens_per_kg × tier_multiplier
        ↓
Postgres ledger  (append-only entries, running balance)
        ↓
Farmer dashboard: balance, tier, badges, listings, payout requests
Impact view: aggregate recovery, not individual wallets
```

Stack: Next.js App Router, Supabase (Postgres + Auth + Storage), Vercel. Tiers live in `reward_config` (Bronze 1×, Silver 1.25× at 500 kg, Gold 1.5× at 2000 kg). Tokens are **loyalty points on a ledger**, not crypto.

## Key decisions
- **Ledger, not chain.** Postgres with an append-only mint table is auditable, cheap, and reversible by a compensating entry — not a fork.
- **Mint on the server.** The formula is not a client trust boundary.
- **Roles are views over the same ledger** (charity writes pickups, farmer reads balance, impact reads aggregates).
- **Payout is a status change**, not a wallet transfer, until a real finance integration exists.

## Failure modes
Minting from an unverified self-report is how the ledger stops meaning anything — require the charity pickup as the event. Client-side mint math will be edited. Treating points as currency without a payout policy creates expectations you cannot meet. Skipping RLS on the ledger is a cross-farmer leak.

## Scaling path
Start with one charity and the SQL schema. Add Auth/RLS before a second org. Add Storage for pickup evidence photos. Only consider an external points partner once the ledger is the boring source of truth.
