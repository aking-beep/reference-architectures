---
title: Deterministic Operator Pipeline
category: AI
difficulty: intermediate
tags: [operator-ai, pipeline, bedrock, adr]
updated: 2026-08-11
origin: "Operator-AI / 13_Architecture / ADR-001-deterministic-pipeline.md"
---

# Deterministic Operator Pipeline

Explicit ingest → extract → validate → persist → retrieve → brief stages. No multi-agent orchestration in the proof of concept.

_Harvested from:_ Operator-AI / 13_Architecture / ADR-001-deterministic-pipeline.md

## When not to use
A research sandbox where autonomous tool use is the point. This pattern is for operating intelligence that must be debuggable, evaluable, and unable to mutate business systems on its own.

## Problem
Agentic orchestration looks powerful in a demo and then becomes undebuggable in a consulting product: you cannot tell which step hallucinated, you cannot evaluate a stage in isolation, and an agent with write tools can mutate Jira, Slack, or a CRM without a human in the loop.

## Shape
```
Synthetic files / client artifacts
    ↓
S3 source bucket
    ↓
Bedrock Knowledge Base ingestion
    ↓
Bedrock extraction invocation
    ↓
JSON Schema validation
    ↓
Operating-object store (DynamoDB)
    ↓
Retrieval + prioritization
    ↓
Daily Operating Brief
    ↓
Human feedback
```

ADR-001: use explicit stages. Do **not** introduce multi-agent orchestration in the POC. Initial AWS footprint is one account, one S3 bucket (source + generated prefixes), one Bedrock Knowledge Base, one least-privilege IAM role, one DynamoDB table, two Lambdas (extract + brief), CloudWatch logs.

## Key decisions
- **Deterministic workflow before agentic orchestration** — easier to debug, evaluate, cost, and bound. Each error has an owner stage.
- **JSON Schema validation** between extraction and persistence so a bad model response cannot corrupt the operating-object store.
- **Human feedback is a stage**, not an afterthought — the loop closes on a person, not on an autonomous write.
- **Least-privilege IAM execution role** — the pipeline can read artifacts and write objects; it cannot ticket, email, or page on its own.

## Failure modes
Skipping schema validation lets a drifted prompt silently write garbage objects. Collapsing stages into one "agent" means a failure in retrieval looks identical to a failure in extraction. Giving the POC write tools "just for the demo" is how you get an autonomous mutation of a client's system. Bedrock KB ingestion lag makes the brief look stale — surface ingestion status, don't hide it.

## Scaling path
Keep this shape through the POC and the first paid accounts. Promote individual stages to Step Functions + EventBridge when you need retries, fan-out, and a visible state machine — that is a new ADR, not a silent rewrite. Multi-agent orchestration is a later ADR, and only after evaluation scores prove a stage is the bottleneck rather than the model.
