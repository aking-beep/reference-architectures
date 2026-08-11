---
title: Bedrock Knowledge Base Extraction Pipeline
category: AI
difficulty: intermediate
tags: [bedrock, rag, s3, dynamodb, aws]
updated: 2026-08-11
origin: "Operator-AI master spec §18 AWS Architecture + ADR-001 initial resources"
---

# Bedrock Knowledge Base Extraction Pipeline

S3 artifacts into a Bedrock Knowledge Base, schema-validated extraction into DynamoDB, briefs generated on a schedule — the AWS shape behind Operator AI.

_Harvested from:_ Operator-AI master spec §18 AWS Architecture + ADR-001 initial resources

## When not to use
A single-document Q&A toy, or a workload that must not leave your VPC without a private Bedrock setup you are ready to operate.

## Problem
You have artifacts in object storage and you need structured operating objects out the other side — not a chatty RAG demo. Extraction must be invocable, validatable, and cheap enough to run on a daily brief cadence.

## Shape
```
Frontend
  ↓
FastAPI or API Gateway
  ↓
Application service
  ├── Bedrock Runtime          extraction, classification, reasoning
  ├── Bedrock Knowledge Base   retrieval over S3 artifacts
  ├── DynamoDB                 accounts, risks, commitments, decisions, evals
  ├── S3                       artifacts, scenarios, prompts, exports
  ├── Step Functions           orchestration (next layer)
  ├── EventBridge              daily / weekly triggers (next layer)
  ├── Lambda                   extract + brief generation
  └── CloudWatch               logs, cost, token usage, pipeline failures
```

## Key decisions
- **S3 is the artifact system of record**; the Knowledge Base is a derived index. Rebuild the index from S3, never the other way around.
- **DynamoDB holds operating objects**, not raw documents. Keep access patterns in the schema (account_id partition, typed sort keys).
- **Bedrock for extraction and reasoning**, not for durable state.
- **CloudWatch on token usage and pipeline failures** — LLM cost is an ops metric, not an invoice surprise.
- Next layer (new ADR): Step Functions for orchestration, EventBridge for the daily brief trigger. Do not smuggle them into the POC.

## Failure modes
Treating the Knowledge Base as source of truth means a failed ingestion silently drops evidence. Unbounded Bedrock context or retries blow the token budget — cap both and alarm. A single IAM role that can invoke Bedrock *and* write to production ticketing is how the action layer leaks into the POC. DynamoDB without a typed sort-key convention becomes an unqueryable blob store.

## Scaling path
One bucket, one table, two Lambdas, one KB is the POC. Add Step Functions when you need visible retries and fan-out. Add EventBridge when the brief must run unattended. Add a vector store beside the KB only when retrieval quality, not orchestration, is the measured bottleneck.
