---
title: Streaming Service Decision Tree
category: Data
difficulty: starter
tags: [kinesis, msk, sqs, firehose, decision]
updated: 2026-08-11
origin: "AWS Professor / DEA-C01 / Kinesis vs alternatives decision tree"
scenario: "Launch-week ingest: replay plus three consumers picks Kinesis, not SQS."
image: /scenarios/streaming-service-decision.jpg
---

# Streaming Service Decision Tree

When to pick Kinesis Data Streams, Firehose, MSK, SQS, or DynamoDB Streams — decided by consumer count, replay, latency, retention, and toolchain.

_Harvested from:_ AWS Professor / DEA-C01 / Kinesis vs alternatives decision tree

## Scenario
Launch-week ingest: replay plus three consumers picks Kinesis, not SQS.

![Launch-week ingest: replay plus three consumers picks Kinesis, not SQS.](/scenarios/streaming-service-decision.jpg)

## When not to use
If the source is a single request/response API with no fan-out, you do not need a streaming service at all.

## Problem
Every streaming question on a whiteboard (and on DEA-C01) is actually a service-choice question. Teams default to the tool they know and then fight the semantics. The decision is almost always one of: number of consumers, need to replay, latency budget, retention window, or ecosystem lock-in.

## Shape
```
Need a durable log + N independent consumers + replay?
  YES → already on Kafka tooling / compacted topics / >365d retention?
          YES → Amazon MSK
          NO  → Kinesis Data Streams
  NO  → only landing in S3/Redshift/OpenSearch, no custom code?
          YES → Data Firehose
          NO  → source IS a DynamoDB table?
                  YES → DynamoDB Streams
                  NO  → one consumer, ack-and-forget load leveling?
                          YES → SQS
                          NO  → go back to KDS
```

## Key decisions
- **KDS vs Firehose.** Firehose is a managed *sink* — buffer + deliver, optional Lambda transform, 60 s minimum buffer. Use it when the job is "land this stream in S3 as Parquet." Use KDS when you need multiple consumers, custom processing, replay, or sub-second latency.
- **KDS vs MSK.** MSK is vanilla Kafka. Choose it for Kafka Streams / Connect / ksqlDB, compacted topics, or an on-prem Kafka migration. Choose KDS for IAM-native auth, Lambda triggers, Firehose, and zero cluster ops.
- **KDS vs SQS.** SQS is a queue: the record disappears when acked. KDS is a log: the record stays until retention expires. One consumer, no replay → SQS. Replay or fan-out → KDS.
- **DynamoDB Streams** is a change log of a DDB table (24 h retention, shard-per-partition). Use it when the source *is* DynamoDB; use KDS for everything else.

## Failure modes
Picking KDS for a single-consumer job queue burns money and operational surface SQS would have hidden. Picking SQS when a second consumer shows up later means you cannot replay — the data is gone. Picking Firehose when you needed <1 s fraud scoring, then bolting a Lambda on the delivery stream, is the long way around KDS + EFO. Picking MSK "because Kafka is industry standard" when you have no Kafka skills is a cluster you will babysit.

## Scaling path
Start at the cheapest semantic that matches today's consumers. Promote SQS → KDS the moment a second independent reader or a replay requirement appears. Promote KDS → MSK only when a Kafka-native tool is the actual constraint, not a resume line. Keep Firehose as a *consumer of* KDS rather than a replacement once you have more than a lake-landing job.
