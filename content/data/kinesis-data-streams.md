---
title: Kinesis Data Streams — Distributed Log
category: Data
difficulty: intermediate
tags: [kinesis, streaming, shards, efo, aws]
updated: 2026-08-11
origin: "AWS Professor / DEA-C01 / 2026-04-24 Kinesis Data Streams lesson + dea-lab-kds lab stream"
---

# Kinesis Data Streams — Distributed Log

AWS's managed distributed log: shards, partition keys, classic vs Enhanced Fan-Out consumers, and checkpointing. The foundation pattern for real-time pipelines.

_Harvested from:_ AWS Professor / DEA-C01 / 2026-04-24 Kinesis Data Streams lesson + dea-lab-kds lab stream

## When not to use
A single consumer that just needs load-leveling — use SQS. A no-code land-in-S3 path — use Firehose. An existing Kafka toolchain — use MSK.

## Problem
You need to decouple producers from consumers in **time** and in **count**. Synchronous APIs couple them: a slow consumer backs up the producer. A durable log lets the producer append and move on while N independent consumers replay the same events at their own pace — rebuild a warehouse, add a fraud detector, keep a raw archive — without coordinating with each other.

## Shape
```
Producers (KPL / SDK / Agent)
        ↓
Partition Key → MD5 hash → shard N (ordered append-only log)
        ↓
Kinesis Data Stream (N shards, 3-AZ sync replication)
        ↓                            ↓
Classic GetRecords (poll)       Enhanced Fan-Out (HTTP/2 push)
  2 MB/s shared per shard         2 MB/s dedicated per consumer
        ↓                            ↓
Consumers: KCL | Lambda | Firehose | Managed Flink
        ↓
S3 · Redshift · OpenSearch · DynamoDB (leases/checkpoints) · CloudWatch IteratorAge
```

A **shard** is the primitive: 1 MB/s or 1000 records/s in, 2 MB/s out. Ordering is guaranteed **within a shard** (same partition key), never across the stream.

## Key decisions
- **Partition key** controls both load and ordering. `driver_id` keeps per-driver order; a skewed key like `country=USA` hot-shards one shard and idles the rest. Salt the key if order doesn't matter.
- **Provisioned vs On-Demand.** Provisioned is cheaper at steady high volume but you split/merge shards yourself. On-Demand auto-scales to ~2× the prior 30-day peak and costs ~4× more at steady load.
- **Classic vs Enhanced Fan-Out.** Classic shares 2 MB/s across every polling consumer (~200 ms). EFO gives each registered consumer its own 2 MB/s pipe (~70 ms) at ~$0.015 per consumer-shard-hour. Use EFO at 3+ consumers or when sub-100 ms matters.
- **KCL + DynamoDB** owns leases and checkpoints. Default delivery is **at-least-once** — crash between process and checkpoint, and the next worker replays. Exactly-once is your sink's job (idempotent upsert or a transactional writer like Flink + two-phase commit).
- **KPL aggregation** packs many logical records into one KDS record so chatty producers hit the MB/s limit instead of the 1000 records/s limit.

## Failure modes
Hot shards from skewed keys — `ProvisionedThroughputExceededException` on a subset of `PutRecords`; you must inspect `FailedRecordCount` and retry only the failures. Classic consumers starve each other once you have three readers on one shard. IteratorAge climbing means you are falling behind and will eventually hit retention and drop data — alarm at 60 s. Shard iterators expire after 5 minutes idle (`ExpiredIteratorException`); resume from the last checkpointed sequence number. Checkpointing *before* the write loses records on crash; checkpointing too often throttles DynamoDB.

## Scaling path
Start with one shard and a high-cardinality partition key. Split shards online when ingress or IteratorAge says you are saturated; parent shards stay readable until retention expires. Register latency-sensitive consumers (fraud, dashboards) on EFO and leave the lake-landing Firehose on classic. Keep retention long enough to rebuild derived stores by replay (default 24 h, up to 365 d). The lab stream `dea-lab-kds` with `efo-consumer-1` is the smallest working sketch of this shape.
