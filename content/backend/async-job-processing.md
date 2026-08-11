---
title: Async Job Processing
category: Backend
difficulty: starter
tags: [jobs, workers, queue, retries]
updated: 2026-08-11
origin: "ARC Labs catalog seed + Experience Intelligence (Trigger.dev / Playwright jobs)"
scenario: "Franchise CRO crawl of 40 URLs. The web tier returns; workers run the journeys."
image: /scenarios/async-job-processing.jpg
---

# Async Job Processing

Offload slow work to a worker pool with retries, visibility timeouts, and a dead-letter queue.

_Harvested from:_ ARC Labs catalog seed + Experience Intelligence (Trigger.dev / Playwright jobs)

## Scenario
Franchise CRO crawl of 40 URLs. The web tier returns; workers run the journeys.

![Franchise CRO crawl of 40 URLs. The web tier returns; workers run the journeys.](/scenarios/async-job-processing.jpg)

## When not to use
Work that must finish inside the user's request and is already well under your timeout (simple reads, tiny transforms).

## Problem
Some requests trigger slow work (image processing, emails, crawls, third-party calls) that shouldn't block the user's response or risk timing out the web tier.

## Shape
The web tier enqueues a **job** and returns immediately. A **worker pool** pulls jobs, executes them with a visibility timeout, and acks on success. Failures retry with **exponential backoff**; jobs that exhaust retries move to a **dead-letter queue**. Job status is queryable so the client can poll or receive a webhook on completion.

## Key decisions
- **Idempotent jobs** so a retry after a partial success is safe.
- **Visibility timeout** long enough for the slowest legitimate run, short enough to recover from a dead worker.
- **Priority queues** if some jobs must jump the line.
- Store a **job record** for status, not just the queue message.

## Failure modes
A worker that dies mid-job re-delivers after the visibility timeout — non-idempotent work double-executes. Poison jobs retry forever without a max-attempts + DLQ. Unbounded retries of a failing third party amplify an outage — add a circuit breaker.

## Scaling path
Add workers horizontally; the queue is the buffer. Split queues by job type so a flood of one kind doesn't starve another. Autoscale workers on queue depth. Experience Intelligence uses this shape for crawl → Playwright → Lighthouse → axe → AI interpretation.
