---
title: Event-Driven Ingestion Pipeline
category: Data
difficulty: intermediate
tags: [events, queue, ingestion, idempotency]
updated: 2026-08-11
origin: "ARC Labs catalog seed + AWS Professor streaming labs"
scenario: "Launch-day clickstream. Commit the offset after the upsert; poison messages go to the DLQ."
image: /scenarios/event-driven-ingestion.jpg
---

# Event-Driven Ingestion Pipeline

Durable, replayable ingestion using a queue or log, idempotent consumers, and a dead-letter path for poison messages.

_Harvested from:_ ARC Labs catalog seed + AWS Professor streaming labs

## Scenario
Launch-day clickstream. Commit the offset after the upsert; poison messages go to the DLQ.

![Launch-day clickstream. Commit the offset after the upsert; poison messages go to the DLQ.](/scenarios/event-driven-ingestion.jpg)

## When not to use
Synchronous, low-volume CRUD where a lost write is acceptable and you will never reprocess history.

## Problem
You need to ingest a high, bursty volume of events without dropping data when a downstream store is slow or briefly down — and you need to reprocess history when logic changes.

## Shape
Producers write to a **durable log/queue** (Kafka, Kinesis, SQS). **Idempotent consumers** read in batches, transform, and upsert to the store keyed by a stable event ID. A **dead-letter queue** captures messages that fail repeatedly for out-of-band inspection. Consumer offset is committed only after a successful write.

## Key decisions
- **At-least-once + idempotency** over exactly-once: simpler and more robust; dedupe on a stable key.
- **Batch size** trades latency for throughput; start small, tune under load.
- **Backpressure**: let the queue absorb bursts; scale consumers horizontally.
- **Schema evolution**: version event payloads so replays of old data still parse.

## Failure modes
Poison messages block a partition — a DLQ prevents head-of-line blocking. Duplicate delivery is expected; non-idempotent writes cause double-counting. Committing offsets before the write loses data on crash — always commit after.

## Scaling path
Partition the log by a high-cardinality key for parallelism. Add consumer instances up to the partition count. When a single store becomes the bottleneck, shard it or add a write-through cache. Keep the raw log so you can rebuild any derived store by replay.
