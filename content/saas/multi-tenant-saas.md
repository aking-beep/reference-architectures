---
title: Multi-Tenant SaaS Data Isolation
category: SaaS
difficulty: advanced
tags: [multi-tenancy, saas, isolation, security]
updated: 2026-08-11
origin: "ARC Labs catalog seed + TokenLoop org isolation + EIP agency workspace"
scenario: "Two agency clients, one database. RLS makes tenant_id mandatory, including on jobs."
image: /scenarios/multi-tenant-saas.jpg
---

# Multi-Tenant SaaS Data Isolation

Patterns for isolating tenant data — shared schema with row-level security, up to database-per-tenant.

_Harvested from:_ ARC Labs catalog seed + TokenLoop org isolation + EIP agency workspace

## Scenario
Two agency clients, one database. RLS makes tenant_id mandatory, including on jobs.

![Two agency clients, one database. RLS makes tenant_id mandatory, including on jobs.](/scenarios/multi-tenant-saas.jpg)

## When not to use
A single-tenant internal tool. Isolation machinery without a second customer is ceremony.

## Problem
Many customers share one system, but their data must never leak across tenants, and per-tenant cost, noise, and compliance needs vary.

## Shape
Three isolation levels along a cost/isolation curve:

- **Shared schema, tenant_id column** — cheapest, densest; enforce with row-level security.
- **Schema-per-tenant** — one database, many schemas; stronger isolation, more migration overhead.
- **Database-per-tenant** — strongest isolation and per-tenant tuning; highest operational cost.

A routing layer resolves the tenant from the auth context on every request — including background jobs.

## Key decisions
- Enforce isolation at the **data layer** (RLS), not just application code — defense in depth.
- **Tenant context** must be set on every query path, including workers and eval jobs.
- Offer **database-per-tenant** for enterprise/compliance tiers while keeping SMB on shared schema.
- Secrets (TokenLoop admin keys) are encrypted at rest **per org** and never returned to the browser.

## Failure modes
A single missing `tenant_id` filter is a cross-tenant leak — RLS makes the filter mandatory, not optional. Noisy-neighbor load on shared schema degrades everyone; per-tenant rate limits help. Migrations across thousands of per-tenant DBs need automation or they rot.

## Scaling path
Start shared-schema + RLS. Promote heavy or regulated tenants to their own schema or database. Shard the shared pool by tenant hash as it grows.
