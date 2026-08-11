---
title: Read-Heavy Web Service
category: Web
difficulty: starter
tags: [caching, scaling, web, cdn]
updated: 2026-08-11
origin: "ARC Labs catalog seed"
---

# Read-Heavy Web Service

A cache-fronted, horizontally scaled service pattern for read-dominant workloads with graceful cache invalidation.

_Harvested from:_ ARC Labs catalog seed

## When not to use
Write-heavy or strongly consistent workflows (checkout, ledgers, approvals) where a stale read is a bug.

## Problem
Traffic is overwhelmingly reads of data that changes infrequently, and the database is the bottleneck under load.

## Shape
A **CDN** fronts static and cacheable responses. Behind it, stateless app servers sit behind a load balancer and consult a **shared cache** (Redis) before the database. Writes update the DB and invalidate/refresh the affected cache keys. The DB has one primary for writes and **read replicas** for overflow reads.

## Key decisions
- **Cache-aside** (lazy) vs write-through: cache-aside is simpler and fails safe; accept a cold-miss penalty.
- **TTL vs explicit invalidation**: use short TTLs for tolerance to staleness, explicit invalidation where correctness matters.
- **Stateless app tier** so any instance serves any request — enables trivial horizontal scaling.

## Failure modes
A **thundering herd** on cache expiry can stampede the DB — use request coalescing or jittered TTLs. Stale reads after a write are the cache-invalidation tax; make the staleness window explicit. Read replicas lag — don't read-your-own-writes from a replica.

## Scaling path
Push more to the CDN edge. Add replicas for reads and shard the primary only when writes saturate it. Introduce a dedicated cache cluster before you shard the database.
