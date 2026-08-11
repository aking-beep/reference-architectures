import type { CatalogItem } from "./types";

/**
 * Catalog source of truth. Every item is mirrored under content/ by
 * `npm run sync-content`. Origins point at the Google Drive folders this
 * library was harvested from (ARC Transformation, Operator-AI, AWS Professor,
 * and the Labs product repos that live beside this one).
 */
export const ITEMS: CatalogItem[] = [
  {
    slug: "kinesis-data-streams",
    title: "Kinesis Data Streams — Distributed Log",
    category: "Data",
    summary:
      "AWS's managed distributed log: shards, partition keys, classic vs Enhanced Fan-Out consumers, and checkpointing. The foundation pattern for real-time pipelines.",
    tags: ["kinesis", "streaming", "shards", "efo", "aws"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/data/kinesis-data-streams.md",
    origin:
      "AWS Professor / DEA-C01 / 2026-04-24 Kinesis Data Streams lesson + dea-lab-kds lab stream",
    diagram: "/diagrams/kinesis-data-streams.svg",
    whenNotToUse:
      "A single consumer that just needs load-leveling — use SQS. A no-code land-in-S3 path — use Firehose. An existing Kafka toolchain — use MSK.",
    sections: [
      {
        heading: "Problem",
        body: "You need to decouple producers from consumers in **time** and in **count**. Synchronous APIs couple them: a slow consumer backs up the producer. A durable log lets the producer append and move on while N independent consumers replay the same events at their own pace — rebuild a warehouse, add a fraud detector, keep a raw archive — without coordinating with each other.",
      },
      {
        heading: "Shape",
        body: "```\nProducers (KPL / SDK / Agent)\n        ↓\nPartition Key → MD5 hash → shard N (ordered append-only log)\n        ↓\nKinesis Data Stream (N shards, 3-AZ sync replication)\n        ↓                            ↓\nClassic GetRecords (poll)       Enhanced Fan-Out (HTTP/2 push)\n  2 MB/s shared per shard         2 MB/s dedicated per consumer\n        ↓                            ↓\nConsumers: KCL | Lambda | Firehose | Managed Flink\n        ↓\nS3 · Redshift · OpenSearch · DynamoDB (leases/checkpoints) · CloudWatch IteratorAge\n```\n\nA **shard** is the primitive: 1 MB/s or 1000 records/s in, 2 MB/s out. Ordering is guaranteed **within a shard** (same partition key), never across the stream.",
      },
      {
        heading: "Key decisions",
        body: "- **Partition key** controls both load and ordering. `driver_id` keeps per-driver order; a skewed key like `country=USA` hot-shards one shard and idles the rest. Salt the key if order doesn't matter.\n- **Provisioned vs On-Demand.** Provisioned is cheaper at steady high volume but you split/merge shards yourself. On-Demand auto-scales to ~2× the prior 30-day peak and costs ~4× more at steady load.\n- **Classic vs Enhanced Fan-Out.** Classic shares 2 MB/s across every polling consumer (~200 ms). EFO gives each registered consumer its own 2 MB/s pipe (~70 ms) at ~$0.015 per consumer-shard-hour. Use EFO at 3+ consumers or when sub-100 ms matters.\n- **KCL + DynamoDB** owns leases and checkpoints. Default delivery is **at-least-once** — crash between process and checkpoint, and the next worker replays. Exactly-once is your sink's job (idempotent upsert or a transactional writer like Flink + two-phase commit).\n- **KPL aggregation** packs many logical records into one KDS record so chatty producers hit the MB/s limit instead of the 1000 records/s limit.",
      },
      {
        heading: "Failure modes",
        body: "Hot shards from skewed keys — `ProvisionedThroughputExceededException` on a subset of `PutRecords`; you must inspect `FailedRecordCount` and retry only the failures. Classic consumers starve each other once you have three readers on one shard. IteratorAge climbing means you are falling behind and will eventually hit retention and drop data — alarm at 60 s. Shard iterators expire after 5 minutes idle (`ExpiredIteratorException`); resume from the last checkpointed sequence number. Checkpointing *before* the write loses records on crash; checkpointing too often throttles DynamoDB.",
      },
      {
        heading: "Scaling path",
        body: "Start with one shard and a high-cardinality partition key. Split shards online when ingress or IteratorAge says you are saturated; parent shards stay readable until retention expires. Register latency-sensitive consumers (fraud, dashboards) on EFO and leave the lake-landing Firehose on classic. Keep retention long enough to rebuild derived stores by replay (default 24 h, up to 365 d). The lab stream `dea-lab-kds` with `efo-consumer-1` is the smallest working sketch of this shape.",
      },
    ],
  },
  {
    slug: "streaming-service-decision",
    title: "Streaming Service Decision Tree",
    category: "Data",
    summary:
      "When to pick Kinesis Data Streams, Firehose, MSK, SQS, or DynamoDB Streams — decided by consumer count, replay, latency, retention, and toolchain.",
    tags: ["kinesis", "msk", "sqs", "firehose", "decision"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/data/streaming-service-decision.md",
    origin: "AWS Professor / DEA-C01 / Kinesis vs alternatives decision tree",
    whenNotToUse:
      "If the source is a single request/response API with no fan-out, you do not need a streaming service at all.",
    sections: [
      {
        heading: "Problem",
        body: "Every streaming question on a whiteboard (and on DEA-C01) is actually a service-choice question. Teams default to the tool they know and then fight the semantics. The decision is almost always one of: number of consumers, need to replay, latency budget, retention window, or ecosystem lock-in.",
      },
      {
        heading: "Shape",
        body: "```\nNeed a durable log + N independent consumers + replay?\n  YES → already on Kafka tooling / compacted topics / >365d retention?\n          YES → Amazon MSK\n          NO  → Kinesis Data Streams\n  NO  → only landing in S3/Redshift/OpenSearch, no custom code?\n          YES → Data Firehose\n          NO  → source IS a DynamoDB table?\n                  YES → DynamoDB Streams\n                  NO  → one consumer, ack-and-forget load leveling?\n                          YES → SQS\n                          NO  → go back to KDS\n```",
      },
      {
        heading: "Key decisions",
        body: "- **KDS vs Firehose.** Firehose is a managed *sink* — buffer + deliver, optional Lambda transform, 60 s minimum buffer. Use it when the job is \"land this stream in S3 as Parquet.\" Use KDS when you need multiple consumers, custom processing, replay, or sub-second latency.\n- **KDS vs MSK.** MSK is vanilla Kafka. Choose it for Kafka Streams / Connect / ksqlDB, compacted topics, or an on-prem Kafka migration. Choose KDS for IAM-native auth, Lambda triggers, Firehose, and zero cluster ops.\n- **KDS vs SQS.** SQS is a queue: the record disappears when acked. KDS is a log: the record stays until retention expires. One consumer, no replay → SQS. Replay or fan-out → KDS.\n- **DynamoDB Streams** is a change log of a DDB table (24 h retention, shard-per-partition). Use it when the source *is* DynamoDB; use KDS for everything else.",
      },
      {
        heading: "Failure modes",
        body: "Picking KDS for a single-consumer job queue burns money and operational surface SQS would have hidden. Picking SQS when a second consumer shows up later means you cannot replay — the data is gone. Picking Firehose when you needed <1 s fraud scoring, then bolting a Lambda on the delivery stream, is the long way around KDS + EFO. Picking MSK \"because Kafka is industry standard\" when you have no Kafka skills is a cluster you will babysit.",
      },
      {
        heading: "Scaling path",
        body: "Start at the cheapest semantic that matches today's consumers. Promote SQS → KDS the moment a second independent reader or a replay requirement appears. Promote KDS → MSK only when a Kafka-native tool is the actual constraint, not a resume line. Keep Firehose as a *consumer of* KDS rather than a replacement once you have more than a lake-landing job.",
      },
    ],
  },
  {
    slug: "event-driven-ingestion",
    title: "Event-Driven Ingestion Pipeline",
    category: "Data",
    summary:
      "Durable, replayable ingestion using a queue or log, idempotent consumers, and a dead-letter path for poison messages.",
    tags: ["events", "queue", "ingestion", "idempotency"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/data/event-driven-ingestion.md",
    origin: "ARC Labs catalog seed + AWS Professor streaming labs",
    whenNotToUse:
      "Synchronous, low-volume CRUD where a lost write is acceptable and you will never reprocess history.",
    sections: [
      {
        heading: "Problem",
        body: "You need to ingest a high, bursty volume of events without dropping data when a downstream store is slow or briefly down — and you need to reprocess history when logic changes.",
      },
      {
        heading: "Shape",
        body: "Producers write to a **durable log/queue** (Kafka, Kinesis, SQS). **Idempotent consumers** read in batches, transform, and upsert to the store keyed by a stable event ID. A **dead-letter queue** captures messages that fail repeatedly for out-of-band inspection. Consumer offset is committed only after a successful write.",
      },
      {
        heading: "Key decisions",
        body: "- **At-least-once + idempotency** over exactly-once: simpler and more robust; dedupe on a stable key.\n- **Batch size** trades latency for throughput; start small, tune under load.\n- **Backpressure**: let the queue absorb bursts; scale consumers horizontally.\n- **Schema evolution**: version event payloads so replays of old data still parse.",
      },
      {
        heading: "Failure modes",
        body: "Poison messages block a partition — a DLQ prevents head-of-line blocking. Duplicate delivery is expected; non-idempotent writes cause double-counting. Committing offsets before the write loses data on crash — always commit after.",
      },
      {
        heading: "Scaling path",
        body: "Partition the log by a high-cardinality key for parallelism. Add consumer instances up to the partition count. When a single store becomes the bottleneck, shard it or add a write-through cache. Keep the raw log so you can rebuild any derived store by replay.",
      },
    ],
  },
  {
    slug: "deterministic-operator-pipeline",
    title: "Deterministic Operator Pipeline",
    category: "AI",
    summary:
      "Explicit ingest → extract → validate → persist → retrieve → brief stages. No multi-agent orchestration in the proof of concept.",
    tags: ["operator-ai", "pipeline", "bedrock", "adr"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/ai/deterministic-operator-pipeline.md",
    origin: "Operator-AI / 13_Architecture / ADR-001-deterministic-pipeline.md",
    whenNotToUse:
      "A research sandbox where autonomous tool use is the point. This pattern is for operating intelligence that must be debuggable, evaluable, and unable to mutate business systems on its own.",
    sections: [
      {
        heading: "Problem",
        body: "Agentic orchestration looks powerful in a demo and then becomes undebuggable in a consulting product: you cannot tell which step hallucinated, you cannot evaluate a stage in isolation, and an agent with write tools can mutate Jira, Slack, or a CRM without a human in the loop.",
      },
      {
        heading: "Shape",
        body: "```\nSynthetic files / client artifacts\n    ↓\nS3 source bucket\n    ↓\nBedrock Knowledge Base ingestion\n    ↓\nBedrock extraction invocation\n    ↓\nJSON Schema validation\n    ↓\nOperating-object store (DynamoDB)\n    ↓\nRetrieval + prioritization\n    ↓\nDaily Operating Brief\n    ↓\nHuman feedback\n```\n\nADR-001: use explicit stages. Do **not** introduce multi-agent orchestration in the POC. Initial AWS footprint is one account, one S3 bucket (source + generated prefixes), one Bedrock Knowledge Base, one least-privilege IAM role, one DynamoDB table, two Lambdas (extract + brief), CloudWatch logs.",
      },
      {
        heading: "Key decisions",
        body: "- **Deterministic workflow before agentic orchestration** — easier to debug, evaluate, cost, and bound. Each error has an owner stage.\n- **JSON Schema validation** between extraction and persistence so a bad model response cannot corrupt the operating-object store.\n- **Human feedback is a stage**, not an afterthought — the loop closes on a person, not on an autonomous write.\n- **Least-privilege IAM execution role** — the pipeline can read artifacts and write objects; it cannot ticket, email, or page on its own.",
      },
      {
        heading: "Failure modes",
        body: "Skipping schema validation lets a drifted prompt silently write garbage objects. Collapsing stages into one \"agent\" means a failure in retrieval looks identical to a failure in extraction. Giving the POC write tools \"just for the demo\" is how you get an autonomous mutation of a client's system. Bedrock KB ingestion lag makes the brief look stale — surface ingestion status, don't hide it.",
      },
      {
        heading: "Scaling path",
        body: "Keep this shape through the POC and the first paid accounts. Promote individual stages to Step Functions + EventBridge when you need retries, fan-out, and a visible state machine — that is a new ADR, not a silent rewrite. Multi-agent orchestration is a later ADR, and only after evaluation scores prove a stage is the bottleneck rather than the model.",
      },
    ],
  },
  {
    slug: "operator-intelligence-loop",
    title: "Executive Operating Intelligence Loop",
    category: "AI",
    summary:
      "Turn fragmented operational evidence into a structured operating model, then render dashboards, briefs, SOWs, and assessments from that model — not from a chatbot.",
    tags: ["operator-ai", "intelligence", "schema", "evidence"],
    updated: "2026-08-11",
    difficulty: "advanced",
    source: "content/ai/operator-intelligence-loop.md",
    origin: "Operator-AI / 00_Product_Spec / operator_ai_master_spec.md (§2 Core Product Loop, §4–8 schemas)",
    whenNotToUse:
      "A Q&A copilot over a document dump. If you do not persist a structured operating model, this is RAG with extra steps.",
    sections: [
      {
        heading: "Problem",
        body: "Executives and account teams drown in Slack, Jira, emails, incidents, and decks. Chatbots summarize the pile and forget it. Operator AI's job is to **create and maintain a structured operational model**, then render dashboards, reports, and consulting deliverables from that model — overall condition, ranked risks, missing owners, commitments at risk, required decisions, and evidence for every conclusion.",
      },
      {
        heading: "Shape",
        body: "```\nPublic signals, client artifacts, or synthetic artifacts\n        ↓\nEvidence ingestion\n        ↓\nNormalization\n        ↓\nOperational object extraction\n        ↓\nRisk, commitment, ownership, deadline, contradiction analysis\n        ↓\nStructured operational intelligence\n        ↓\nExecutive dashboard  →  SOWs, RFPs, assessments, roadmaps, reports\n        ↓\nEvaluation\n        ↓\nPrompt, rule, schema, and workflow improvement\n```\n\nCanonical objects: account, operating_condition (GREEN/AMBER/RED/CRITICAL), risk, commitment, decision, evidence. Contradiction detection is a first-class stage, not a prompt trick.",
      },
      {
        heading: "Key decisions",
        body: "- **Model first, chat second.** The product is the operating object store. The dashboard and the brief are views.\n- **Evidence for every conclusion.** A risk without an evidence pointer is an opinion and does not ship.\n- **Reported status vs evidence-based status** are both stored — the gap is the product.\n- **Synthetic scenario engine** produces fictional companies plus hidden ground truth so evaluation is possible before any client data is touched.\n- **Action layer is later and HITL.** Drafting a Jira ticket is allowed; creating it without approval is not.",
      },
      {
        heading: "Failure modes",
        body: "Summarizing without persisting objects means yesterday's brief cannot be compared to today's. Mixing reported status with inferred status hides the gap executives actually pay for. Skipping contradiction detection lets two artifacts disagree in silence. Generating an SOW from a chat transcript instead of from the operating model produces a document you cannot defend in a review.",
      },
      {
        heading: "Scaling path",
        body: "Phase 1 is structured intelligence; Phase 2 the executive dashboard; Phase 3 the consulting workbench; Phase 4 synthetic scenarios; Phase 5 evaluation; Phase 6 HITL workflows; Phase 7 enterprise scale (Step Functions, graph store, live connectors). Do not skip evaluation to \"get to agents faster\" — without ground truth you cannot tell if the model got better.",
      },
    ],
  },
  {
    slug: "bedrock-knowledge-base-pipeline",
    title: "Bedrock Knowledge Base Extraction Pipeline",
    category: "AI",
    summary:
      "S3 artifacts into a Bedrock Knowledge Base, schema-validated extraction into DynamoDB, briefs generated on a schedule — the AWS shape behind Operator AI.",
    tags: ["bedrock", "rag", "s3", "dynamodb", "aws"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/ai/bedrock-knowledge-base-pipeline.md",
    origin: "Operator-AI master spec §18 AWS Architecture + ADR-001 initial resources",
    whenNotToUse:
      "A single-document Q&A toy, or a workload that must not leave your VPC without a private Bedrock setup you are ready to operate.",
    sections: [
      {
        heading: "Problem",
        body: "You have artifacts in object storage and you need structured operating objects out the other side — not a chatty RAG demo. Extraction must be invocable, validatable, and cheap enough to run on a daily brief cadence.",
      },
      {
        heading: "Shape",
        body: "```\nFrontend\n  ↓\nFastAPI or API Gateway\n  ↓\nApplication service\n  ├── Bedrock Runtime          extraction, classification, reasoning\n  ├── Bedrock Knowledge Base   retrieval over S3 artifacts\n  ├── DynamoDB                 accounts, risks, commitments, decisions, evals\n  ├── S3                       artifacts, scenarios, prompts, exports\n  ├── Step Functions           orchestration (next layer)\n  ├── EventBridge              daily / weekly triggers (next layer)\n  ├── Lambda                   extract + brief generation\n  └── CloudWatch               logs, cost, token usage, pipeline failures\n```",
      },
      {
        heading: "Key decisions",
        body: "- **S3 is the artifact system of record**; the Knowledge Base is a derived index. Rebuild the index from S3, never the other way around.\n- **DynamoDB holds operating objects**, not raw documents. Keep access patterns in the schema (account_id partition, typed sort keys).\n- **Bedrock for extraction and reasoning**, not for durable state.\n- **CloudWatch on token usage and pipeline failures** — LLM cost is an ops metric, not an invoice surprise.\n- Next layer (new ADR): Step Functions for orchestration, EventBridge for the daily brief trigger. Do not smuggle them into the POC.",
      },
      {
        heading: "Failure modes",
        body: "Treating the Knowledge Base as source of truth means a failed ingestion silently drops evidence. Unbounded Bedrock context or retries blow the token budget — cap both and alarm. A single IAM role that can invoke Bedrock *and* write to production ticketing is how the action layer leaks into the POC. DynamoDB without a typed sort-key convention becomes an unqueryable blob store.",
      },
      {
        heading: "Scaling path",
        body: "One bucket, one table, two Lambdas, one KB is the POC. Add Step Functions when you need visible retries and fan-out. Add EventBridge when the brief must run unattended. Add a vector store beside the KB only when retrieval quality, not orchestration, is the measured bottleneck.",
      },
    ],
  },
  {
    slug: "llm-app-backend",
    title: "LLM Application Backend",
    category: "AI",
    summary:
      "A production LLM backend: gateway, prompt/version control, caching, guardrails, and observability.",
    tags: ["llm", "ai", "gateway", "observability"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/ai/llm-app-backend.md",
    origin: "ARC Labs catalog seed + Operator-AI Bedrock gateway practice",
    whenNotToUse:
      "A one-off notebook or an internal spike with no cost, safety, or replay requirements.",
    sections: [
      {
        heading: "Problem",
        body: "Calling an LLM directly from your app works in a demo but not in production — you need cost control, safety, versioned prompts, and the ability to debug a bad answer after the fact.",
      },
      {
        heading: "Shape",
        body: "Requests flow through an **LLM gateway** that handles auth, rate limiting, provider routing, and retries. Prompts are **versioned artifacts**, not inline strings. A **semantic/exact cache** short-circuits repeated queries. **Input and output guardrails** screen for injection, PII, and policy violations. Every call is **traced** (prompt, model, tokens, latency, cost) for observability and eval.",
      },
      {
        heading: "Key decisions",
        body: "- **Gateway indirection** so you can switch providers or models without touching app code.\n- **Prompt versioning** so you can attribute a regression to a change and roll back.\n- **Cache** on normalized input to cut cost and latency on hot paths.\n- **Streaming** responses for perceived latency; buffer for guardrail checks where needed.",
      },
      {
        heading: "Failure modes",
        body: "Provider outages need fallback routing or a degraded mode. Unbounded context or retries blow up cost — cap both. Prompt injection from user or retrieved content can exfiltrate data — screen inputs and constrain tool access. No tracing means you cannot reproduce a bad answer.",
      },
      {
        heading: "Scaling path",
        body: "Add provider fallbacks and per-tenant quotas at the gateway. Move hot prompts behind the cache. Introduce an eval pipeline that replays traced traffic against prompt changes before you ship them.",
      },
    ],
  },
  {
    slug: "hitl-workflow-automation",
    title: "Human-in-the-Loop Action Layer",
    category: "AI",
    summary:
      "Draft tickets, emails, and escalations from operating intelligence — but never mutate an external system without a human approval.",
    tags: ["hitl", "workflows", "approvals", "operator-ai"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/ai/hitl-workflow-automation.md",
    origin: "Operator-AI / 00_Product_Spec / operator_ai_phase6_package + master spec §3.D Action Layer",
    whenNotToUse:
      "Fully autonomous ops on throwaway environments. If a wrong write can page a client or move money, this is the pattern.",
    sections: [
      {
        heading: "Problem",
        body: "Once you have a structured operating model, the obvious next step is to *do something*: open a Jira ticket, assign an owner, draft a Slack message, start an approval. Autonomous writes are how consulting tools lose trust. The action layer must produce drafts and require a human before anything leaves the building.",
      },
      {
        heading: "Shape",
        body: "```\nStructured intelligence (risks, commitments, decisions)\n        ↓\nAction proposer (LLM, schema-bound)\n        ↓\nDraft store  — ticket | email | slack | meeting | escalation\n        ↓\nHuman review queue  (approve / edit / reject)\n        ↓\nConnector  (Jira, Slack, email, calendar)  ← only after approval\n        ↓\nAudit log  (who approved, what changed, evidence pointer)\n```\n\nPhase 6 of Operator AI is this loop plus a portfolio UI. Live connectors and Step Functions wait for Phase 7 and a dedicated ADR.",
      },
      {
        heading: "Key decisions",
        body: "- **Human approval is mandatory** before any external action. That is a product rule, not a prompt suggestion.\n- **Drafts are schema-bound** (owner, due date, evidence id, proposed text). Free-form \"the agent will figure it out\" is how you get un-reviewable blobs.\n- **Edits are training signal.** Capture the human diff; feed it to evaluation.\n- **Connectors are dumb.** They send an already-approved payload. They do not re-reason.",
      },
      {
        heading: "Failure modes",
        body: "A \"send if confidence > 0.9\" shortcut will eventually email a client. Mixing draft generation and connector I/O in one function makes it too easy to forget the approval check. No audit log means you cannot answer \"who let this ticket out.\" Letting the model pick the target system (\"maybe this is a Linear ticket\") is how actions vanish into the wrong tool.",
      },
      {
        heading: "Scaling path",
        body: "Ship the review queue against synthetic accounts first. Add one connector at a time with a kill switch. Promote the queue to Step Functions when you need timeouts, nudges, and multi-approver chains. Never skip the audit log to \"move faster.\"",
      },
    ],
  },
  {
    slug: "synthetic-eval-loop",
    title: "Synthetic Data and Evaluation Loop",
    category: "AI",
    summary:
      "Fictional companies, daily scenarios, and hidden ground truth so you can score extraction quality before any real client data is in the system.",
    tags: ["evaluation", "synthetic-data", "ground-truth", "operator-ai"],
    updated: "2026-08-11",
    difficulty: "advanced",
    source: "content/ai/synthetic-eval-loop.md",
    origin:
      "Operator-AI / 01_Synthetic_Companies, 06_Ground_Truth, 07_Evaluations + master spec §14–16",
    whenNotToUse:
      "A one-shot demo with no intention to measure quality over time. If you cannot name a score, skip the synthetic factory.",
    sections: [
      {
        heading: "Problem",
        body: "You cannot tune an extraction pipeline on real client data you do not yet have, and you should not. You need fictional-but-realistic companies, a daily stream of operational events, and **hidden ground truth** so a scorer can tell whether the model recovered the risks, owners, and contradictions you planted.",
      },
      {
        heading: "Shape",
        body: "```\nSynthetic company profile\n        ↓\nDaily scenario generator  (Slack, Jira, email, incidents, AWS findings…)\n        ↓\nRaw public-style signals     +     hidden ground truth (not in the model context)\n        ↓\nSame production pipeline (ingest → extract → persist → brief)\n        ↓\nEvaluator compares operating objects to ground truth\n        ↓\nQuality score → prompt / schema / rule change → replay\n```\n\nDrive layout: `01_Synthetic_Companies`, `02_Daily_Scenarios`, `06_Ground_Truth`, `07_Evaluations`. Advance a 56-day calendar per account rather than generating one giant dump.",
      },
      {
        heading: "Key decisions",
        body: "- **Ground truth never enters the model context.** If it does, you are testing regurgitation.\n- **The production pipeline is the thing under test.** A separate \"eval prompt\" that does not run in prod is a different product.\n- **Score what the schema cares about** (risk recovered, owner correct, contradiction flagged), not BLEU on the brief prose.\n- **Advance time on a calendar** so trend, missed deadlines, and compounding risk are testable.",
      },
      {
        heading: "Failure modes",
        body: "Leaking ground truth into the scenario text makes scores look great and production look random. Scoring the brief's fluency instead of the objects hides extraction bugs. A static synthetic dump goes stale the moment the schema changes — regenerate from the company profile. Using real client names \"for realism\" is how you get a compliance incident in a test folder.",
      },
      {
        heading: "Scaling path",
        body: "Start with one company and 14 days. Add industries once scores are stable. Wire the evaluator into CI so a prompt change that drops recall cannot merge. Only then point the same pipeline at a real (contracted, minimized) artifact set.",
      },
    ],
  },
  {
    slug: "arc-labs-nextjs-stack",
    title: "ARC Labs Product Stack",
    category: "Web",
    summary:
      "The shared Next.js + Vercel + TypeScript shape every ARC Labs tool ships on, so a new scanner or catalog lands fast and behaves the same.",
    tags: ["nextjs", "vercel", "labs", "platform"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/web/arc-labs-nextjs-stack.md",
    origin:
      "ARC Transformation / ARC Labs (Free) + ARC Master Blueprint §5–6 (shared platform components)",
    whenNotToUse:
      "A Python data job with no UI, or an AWS-only pipeline. Don't drag Next.js into a Lambda that only transforms Parquet.",
    sections: [
      {
        heading: "Problem",
        body: "A small studio shipping many free tools cannot afford a unique stack per product. Auth, scoring, export, API shape, and visual language have to be copy-paste close so a new Lab is days, not a platform rewrite.",
      },
      {
        heading: "Shape",
        body: "```\nNext.js 15 App Router  +  TypeScript (strict)  +  Tailwind\n        ↓\napp/           UI + route handlers\nlib/           domain logic (scan, catalog, review) — no UI imports\ncli/           same domain logic, invoked from npm scripts\ncontent/       open markdown mirror (catalog products)\n.github/       typecheck + build on PR\n        ↓\nVercel  (*.arctransformationgrouplab.dev)\nGoogle Drive   ARC Labs (Free)/<product>   ← canonical working copy\nGitHub         aking-beep/<product>        ← public source of truth\narc-website    /labs/<slug>                ← marketing + deep link\n```\n\nShared components the Blueprint wants every product to reuse: auth/access gate (only when secrets are stored), report engine, scoring engine, recommendation engine, export (PDF/Markdown/JSON), API layer, design system, analytics, feedback.",
      },
      {
        heading: "Key decisions",
        body: "- **Open by default.** Catalogs (skills, architectures, workflows) have no access gate. Tools that store secrets (TokenLoop) encrypt at rest and require a free signup.\n- **Domain logic in `lib/`, UI in `app/`.** The CLI and the GitHub Action must call the same functions the UI does.\n- **Drive folder + GitHub repo + website card** are the three homes of every Lab. Missing one means it is not shipped.\n- **Same visual language** (pills, cards, grade colors) so a user who ran the MCP scanner recognizes Prompt Reviewer.",
      },
      {
        heading: "Failure modes",
        body: "A Lab that only exists on a laptop never compounds. A unique CSS system per tool makes the website look like a directory of strangers. Putting API keys in the Next.js bundle because \"it's just a scan\" is how you leak them. Skipping `npm run typecheck` in CI is how Drive copies and GitHub copies drift.",
      },
      {
        heading: "Scaling path",
        body: "Extract a real `@arc/shared` package only after three tools are repeating the same 200 lines. Until then, copy the small files (rate limit, markdown-lite, catalog types) and keep each repo independently deployable. Productize into ARC Platform when the recurring scan/dashboard work outgrows a free Lab.",
      },
    ],
  },
  {
    slug: "read-heavy-web-service",
    title: "Read-Heavy Web Service",
    category: "Web",
    summary:
      "A cache-fronted, horizontally scaled service pattern for read-dominant workloads with graceful cache invalidation.",
    tags: ["caching", "scaling", "web", "cdn"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/web/read-heavy-web-service.md",
    origin: "ARC Labs catalog seed",
    whenNotToUse:
      "Write-heavy or strongly consistent workflows (checkout, ledgers, approvals) where a stale read is a bug.",
    sections: [
      {
        heading: "Problem",
        body: "Traffic is overwhelmingly reads of data that changes infrequently, and the database is the bottleneck under load.",
      },
      {
        heading: "Shape",
        body: "A **CDN** fronts static and cacheable responses. Behind it, stateless app servers sit behind a load balancer and consult a **shared cache** (Redis) before the database. Writes update the DB and invalidate/refresh the affected cache keys. The DB has one primary for writes and **read replicas** for overflow reads.",
      },
      {
        heading: "Key decisions",
        body: "- **Cache-aside** (lazy) vs write-through: cache-aside is simpler and fails safe; accept a cold-miss penalty.\n- **TTL vs explicit invalidation**: use short TTLs for tolerance to staleness, explicit invalidation where correctness matters.\n- **Stateless app tier** so any instance serves any request — enables trivial horizontal scaling.",
      },
      {
        heading: "Failure modes",
        body: "A **thundering herd** on cache expiry can stampede the DB — use request coalescing or jittered TTLs. Stale reads after a write are the cache-invalidation tax; make the staleness window explicit. Read replicas lag — don't read-your-own-writes from a replica.",
      },
      {
        heading: "Scaling path",
        body: "Push more to the CDN edge. Add replicas for reads and shard the primary only when writes saturate it. Introduce a dedicated cache cluster before you shard the database.",
      },
    ],
  },
  {
    slug: "async-job-processing",
    title: "Async Job Processing",
    category: "Backend",
    summary:
      "Offload slow work to a worker pool with retries, visibility timeouts, and a dead-letter queue.",
    tags: ["jobs", "workers", "queue", "retries"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/backend/async-job-processing.md",
    origin: "ARC Labs catalog seed + Experience Intelligence (Trigger.dev / Playwright jobs)",
    whenNotToUse:
      "Work that must finish inside the user's request and is already well under your timeout (simple reads, tiny transforms).",
    sections: [
      {
        heading: "Problem",
        body: "Some requests trigger slow work (image processing, emails, crawls, third-party calls) that shouldn't block the user's response or risk timing out the web tier.",
      },
      {
        heading: "Shape",
        body: "The web tier enqueues a **job** and returns immediately. A **worker pool** pulls jobs, executes them with a visibility timeout, and acks on success. Failures retry with **exponential backoff**; jobs that exhaust retries move to a **dead-letter queue**. Job status is queryable so the client can poll or receive a webhook on completion.",
      },
      {
        heading: "Key decisions",
        body: "- **Idempotent jobs** so a retry after a partial success is safe.\n- **Visibility timeout** long enough for the slowest legitimate run, short enough to recover from a dead worker.\n- **Priority queues** if some jobs must jump the line.\n- Store a **job record** for status, not just the queue message.",
      },
      {
        heading: "Failure modes",
        body: "A worker that dies mid-job re-delivers after the visibility timeout — non-idempotent work double-executes. Poison jobs retry forever without a max-attempts + DLQ. Unbounded retries of a failing third party amplify an outage — add a circuit breaker.",
      },
      {
        heading: "Scaling path",
        body: "Add workers horizontally; the queue is the buffer. Split queues by job type so a flood of one kind doesn't starve another. Autoscale workers on queue depth. Experience Intelligence uses this shape for crawl → Playwright → Lighthouse → axe → AI interpretation.",
      },
    ],
  },
  {
    slug: "multi-tenant-saas",
    title: "Multi-Tenant SaaS Data Isolation",
    category: "SaaS",
    summary:
      "Patterns for isolating tenant data — shared schema with row-level security, up to database-per-tenant.",
    tags: ["multi-tenancy", "saas", "isolation", "security"],
    updated: "2026-08-11",
    difficulty: "advanced",
    source: "content/saas/multi-tenant-saas.md",
    origin: "ARC Labs catalog seed + TokenLoop org isolation + EIP agency workspace",
    whenNotToUse:
      "A single-tenant internal tool. Isolation machinery without a second customer is ceremony.",
    sections: [
      {
        heading: "Problem",
        body: "Many customers share one system, but their data must never leak across tenants, and per-tenant cost, noise, and compliance needs vary.",
      },
      {
        heading: "Shape",
        body: "Three isolation levels along a cost/isolation curve:\n\n- **Shared schema, tenant_id column** — cheapest, densest; enforce with row-level security.\n- **Schema-per-tenant** — one database, many schemas; stronger isolation, more migration overhead.\n- **Database-per-tenant** — strongest isolation and per-tenant tuning; highest operational cost.\n\nA routing layer resolves the tenant from the auth context on every request — including background jobs.",
      },
      {
        heading: "Key decisions",
        body: "- Enforce isolation at the **data layer** (RLS), not just application code — defense in depth.\n- **Tenant context** must be set on every query path, including workers and eval jobs.\n- Offer **database-per-tenant** for enterprise/compliance tiers while keeping SMB on shared schema.\n- Secrets (TokenLoop admin keys) are encrypted at rest **per org** and never returned to the browser.",
      },
      {
        heading: "Failure modes",
        body: "A single missing `tenant_id` filter is a cross-tenant leak — RLS makes the filter mandatory, not optional. Noisy-neighbor load on shared schema degrades everyone; per-tenant rate limits help. Migrations across thousands of per-tenant DBs need automation or they rot.",
      },
      {
        heading: "Scaling path",
        body: "Start shared-schema + RLS. Promote heavy or regulated tenants to their own schema or database. Shard the shared pool by tenant hash as it grows.",
      },
    ],
  },
  {
    slug: "agent-spend-control",
    title: "Agent Spend Control Without a Gateway",
    category: "SaaS",
    summary:
      "Detect-and-cut AI coding-agent spend from read-only admin APIs: per-developer burn, a minutes-scale kill switch, and client chargeback — no traffic proxy.",
    tags: ["finops", "agents", "kill-switch", "tokenloop"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/saas/agent-spend-control.md",
    origin: "ARC Labs / TokenLoop (tokenloop.vercel.app) — live free product",
    whenNotToUse:
      "When you need true per-request blocking. A minutes-scale kill switch cannot stop a token already in flight. Don't pretend otherwise.",
    sections: [
      {
        heading: "Problem",
        body: "Engineering and agency leads running Claude Code and Cursor find out about runaway spend on the invoice. They need detect-and-cut plus client bill-back **without** rebuilding all traffic through a proxy they do not want to operate.",
      },
      {
        heading: "Shape",
        body: "```\nFree signup (email + password)\n        ↓\nRead-only admin keys  (Anthropic / Cursor)\n        ↓\nAES-256-GCM encrypt at rest  — never returned to the browser\n        ↓\nPeriodic sync  (~10 min)  →  per-developer burn, spike multiplier\n        ↓\nPolicy: daily cap / spike threshold\n        ↓\nKill switch: detect → alert → throttle or revoke via admin APIs\n        ↓\nOptional chargeback: tag clients, markup, CSV export\n```\n\nNo gateway. The system observes admin APIs and acts through them. Honest scope: minutes-scale cut, not true per-request blocking.",
      },
      {
        heading: "Key decisions",
        body: "- **No proxy.** Inserting a gateway would catch more, and would also become an availability and privacy surface most teams will not accept for a free tool.\n- **Keys encrypted at rest, never echoed back.** Signup exists so secrets have an org to belong to — not to unlock paid tiers.\n- **Kill switch is a state machine** (detect / alert / throttle / revoke), not a single button.\n- **Chargeback is a view on the same spend data**, not a second ingestion path.",
      },
      {
        heading: "Failure modes",
        body: "A 10-minute sync window can miss a flash spike — say so on the dashboard. A revoke that the provider API delays looks like a broken kill switch; show last-action status. Storing keys in localStorage \"just for the session\" is how they leak. Treating this as a replacement for procurement-level budget controls oversells it.",
      },
      {
        heading: "Scaling path",
        body: "Add providers (Codex / OpenAI) as additional read-only ingestions behind the same policy engine. Tighten sync frequency only where the provider API allows it. A real per-request gateway is a different product with a different trust model — do not sneak it into this shape.",
      },
    ],
  },
  {
    slug: "maturity-assessment-balance-score",
    title: "Maturity Assessment with a Balance Score",
    category: "SaaS",
    summary:
      "A 40-question, behaviorally-anchored maturity model that scores pillars *and* variance — a high average with high spread is fragile, not healthy.",
    tags: ["assessment", "maturity", "cith", "scoring"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/saas/maturity-assessment-balance-score.md",
    origin: "aking-beep/arc-cith-app — C.I.T.H. maturity framework",
    whenNotToUse:
      "A five-question marketing quiz. If answers are not behaviorally anchored, a balance score is decoration.",
    sections: [
      {
        heading: "Problem",
        body: "Most maturity models average a handful of pillars and call the result \"ready.\" A team that is excellent at tooling and empty at governance looks identical to a balanced team at the same mean. C.I.T.H. exists to make that lie visible: **a high average with high variance across pillars is fragile, not healthy.**",
      },
      {
        heading: "Shape",
        body: "```\nTeam answers 40 behaviorally-anchored questions\n        ↓\nPer-pillar scores\n        ↓\nBalance score  (variance / spread across pillars)\n        ↓\nReadiness profile  =  mean  ×  balance, with the gap named\n        ↓\nReport: strengths, fragile pillars, recommended next work\n```\n\nQuestions are behavioral (\"what actually happens when X\") rather than aspirational (\"we value Y\"). The scoring engine is reusable across ARC assessments (AI-readiness, AWS, DevOps, CRO).",
      },
      {
        heading: "Key decisions",
        body: "- **Anchor every item in observable behavior**, not values. Otherwise people grade their intent.\n- **Ship the balance score next to the mean.** Hide it and you are back to a vanity average.\n- **One profile per team, not per executive.** High variance inside a team is the finding.\n- **Recommendations map to Studio work** (the flywheel: free tool → named gap → scoped engagement) without gating the report behind a sales call.",
      },
      {
        heading: "Failure modes",
        body: "Averaging away the weakest pillar is how a \"green\" score ships into a real incident. Letting one champion fill the survey for a 40-person org measures that person. Numeric scores without the behavioral evidence make the report undebatable and therefore unused.",
      },
      {
        heading: "Scaling path",
        body: "Start with one framework (C.I.T.H.). Reuse the scoring engine for AWS / DevOps / AI-readiness assessments in Operator AI. Longitudinal re-takes become the ARC Platform dashboard once teams want the score as a system, not a PDF.",
      },
    ],
  },
  {
    slug: "experience-intelligence-pipeline",
    title: "Experience Intelligence Assessment Pipeline",
    category: "SaaS",
    summary:
      "RFP-grade CRO/UX assessment: crawl, Playwright journeys, Lighthouse, axe-core, and AI interpretation into an evidence-backed, prioritized backlog.",
    tags: ["cro", "ux", "playwright", "lighthouse", "assessment"],
    updated: "2026-08-11",
    difficulty: "advanced",
    source: "content/saas/experience-intelligence-pipeline.md",
    origin: "experience-intelligence-platform — Drive/GitHub RFP-grade CRO assessment",
    whenNotToUse:
      "A one-page Lighthouse paste. If you are not collecting journey evidence, you do not need this pipeline.",
    sections: [
      {
        heading: "Problem",
        body: "Agencies and consultants still produce CRO/UX recommendations from a slide instinct. Buyers want RFP-grade evidence: what was crawled, which journeys ran, what Lighthouse and axe said, and why the model ranked a finding — in a backlog they can staff.",
      },
      {
        heading: "Shape",
        body: "```\nNEW ASSESSMENT → client → URL → competitors → objective → journey\n        ↓\nRUN  →  crawl  →  Playwright  →  Lighthouse  →  a11y (axe-core)  →  AI interpretation\n        ↓\nEvidence-backed findings  →  prioritized CRO backlog  →  RFP output\n```\n\nThree product layers: **Assessment Engine**, **Agency Workspace** (clients, collaboration, deliverables), **Benchmarking** (industry / franchise intelligence). Stack: Next.js, Vercel, Supabase, Trigger.dev jobs, Playwright, axe-core, Lighthouse. Local JSON store under `.data/` so the app runs without Supabase in development.",
      },
      {
        heading: "Key decisions",
        body: "- **Evidence before interpretation.** The AI ranks findings that instruments produced; it does not invent them.\n- **Jobs are async** (see Async Job Processing). A crawl is not a request.\n- **Agency workspace is multi-tenant** with client records, not a folder of PDFs.\n- **Companion toolkit stays outside the product** (Clarity, GA4, Search Console, WAVE) — don't rebuild analytics, ingest its exports.\n- **Degrade to a local store** so development never blocks on cloud credentials.",
      },
      {
        heading: "Failure modes",
        body: "Running AI on a URL with no crawl evidence produces confident fiction. Blocking the UI on Playwright makes the assessment feel broken. Mixing competitor URLs into the same evidence bag without a source tag poisons the backlog. Treating Lighthouse scores as the recommendation (instead of as one evidence stream) is the old PDF report with extra steps.",
      },
      {
        heading: "Scaling path",
        body: "V0.1 persists the assessment and detail page. Next: the job runner, then AI interpretation with citations back to artifacts, then RFP export. Benchmarking is a third layer — do not delay the engine to build a data network.",
      },
    ],
  },
  {
    slug: "verified-recovery-loyalty-ledger",
    title: "Verified Recovery Loyalty Ledger",
    category: "SaaS",
    summary:
      "Verified food recovery mints loyalty points on a Postgres ledger — not a blockchain — with role-specific views for charity, farmer, and impact.",
    tags: ["ledger", "loyalty", "supabase", "foodmesh"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/saas/verified-recovery-loyalty-ledger.md",
    origin: "foodmesh-mvp-kit / foodmesh-rewards — verified recovery → farmer loyalty tokens",
    whenNotToUse:
      "When you actually need a public chain, or when \"tokens\" are a pitch and there is no verified event to mint from.",
    sections: [
      {
        heading: "Problem",
        body: "A food-recovery network wants to reward farmers for surplus that charities actually pick up. A blockchain token sounds like the answer and then becomes the product. The real need is a **verified event → mint rule → ledger → payout status**, with role-specific views and an audit trail.",
      },
      {
        heading: "Shape",
        body: "```\nCharity logs a pickup  (weight_kg, farmer, timestamp)\n        ↓\nServer-side mint rule\n  tokens = weight_kg × tokens_per_kg × tier_multiplier\n        ↓\nPostgres ledger  (append-only entries, running balance)\n        ↓\nFarmer dashboard: balance, tier, badges, listings, payout requests\nImpact view: aggregate recovery, not individual wallets\n```\n\nStack: Next.js App Router, Supabase (Postgres + Auth + Storage), Vercel. Tiers live in `reward_config` (Bronze 1×, Silver 1.25× at 500 kg, Gold 1.5× at 2000 kg). Tokens are **loyalty points on a ledger**, not crypto.",
      },
      {
        heading: "Key decisions",
        body: "- **Ledger, not chain.** Postgres with an append-only mint table is auditable, cheap, and reversible by a compensating entry — not a fork.\n- **Mint on the server.** The formula is not a client trust boundary.\n- **Roles are views over the same ledger** (charity writes pickups, farmer reads balance, impact reads aggregates).\n- **Payout is a status change**, not a wallet transfer, until a real finance integration exists.",
      },
      {
        heading: "Failure modes",
        body: "Minting from an unverified self-report is how the ledger stops meaning anything — require the charity pickup as the event. Client-side mint math will be edited. Treating points as currency without a payout policy creates expectations you cannot meet. Skipping RLS on the ledger is a cross-farmer leak.",
      },
      {
        heading: "Scaling path",
        body: "Start with one charity and the SQL schema. Add Auth/RLS before a second org. Add Storage for pickup evidence photos. Only consider an external points partner once the ledger is the boring source of truth.",
      },
    ],
  },
  {
    slug: "webhook-delivery-system",
    title: "Reliable Webhook Delivery",
    category: "Integration",
    summary:
      "Deliver outbound webhooks with retries, signatures, ordering guarantees, and a consumer-visible delivery log.",
    tags: ["webhooks", "integration", "retries", "signing"],
    updated: "2026-08-11",
    difficulty: "intermediate",
    source: "content/integration/webhook-delivery-system.md",
    origin: "ARC Labs catalog seed",
    whenNotToUse:
      "Internal, in-process notifications in a single app. Don't HTTP yourself.",
    sections: [
      {
        heading: "Problem",
        body: "You need to notify customer endpoints of events reliably, even though those endpoints are flaky, slow, or occasionally down — without hammering them or losing events.",
      },
      {
        heading: "Shape",
        body: "Events are enqueued for delivery. A **delivery worker** POSTs to the customer URL, **signs** the payload (HMAC) so the receiver can verify authenticity, and records the attempt. Failures **retry with exponential backoff** over hours. Each customer sees a **delivery log** and can replay failed events. Payloads carry a monotonic **event ID** so consumers can dedupe and order.",
      },
      {
        heading: "Key decisions",
        body: "- **At-least-once** delivery + consumer-side dedupe on event ID.\n- **HMAC signing** with a per-customer secret and a timestamp to prevent replay.\n- **Backoff schedule** (e.g. seconds → minutes → hours) with a cutoff, then mark failed.\n- Expose a **replay** endpoint rather than silently dropping after the cutoff.",
      },
      {
        heading: "Failure modes",
        body: "A slow consumer ties up workers — use per-endpoint timeouts and concurrency caps. Retrying a non-idempotent consumer double-processes — that's why you sign and number events. Delivering out of order confuses stateful consumers; include a sequence number.",
      },
      {
        heading: "Scaling path",
        body: "Shard delivery workers by customer so one bad endpoint can't starve others. Add per-endpoint circuit breakers. Offer a pull-based feed (or queue) as an alternative for high-volume consumers.",
      },
    ],
  },
  {
    slug: "mcp-conformance-gate",
    title: "MCP Conformance Gate",
    category: "Integration",
    summary:
      "Treat Model Context Protocol servers as production dependencies: handshake, capability negotiation, and schema checks as a gate — not a vibe check in one client.",
    tags: ["mcp", "conformance", "agents", "ci"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/integration/mcp-conformance-gate.md",
    origin: "ARC Labs / mcp-conformance-scanner — flagship free tool",
    whenNotToUse:
      "A local toy server you will never share. The gate is for anything another agent or team will call.",
    sections: [
      {
        heading: "Problem",
        body: "Teams ship MCP servers that \"looked fine in one client\" and then break handshake, advertise tools they cannot call, or expose schemas another model cannot parse. You need a **clear-eyed conformance report** — what passes, what breaks, what to fix first — before production, and eventually in CI.",
      },
      {
        heading: "Shape",
        body: "```\nPaste a server URL or point the CLI at a local process\n        ↓\nHandshake + capability negotiation\n        ↓\nTool / resource / prompt schema validation\n        ↓\nGraded report  (operator language, not linter noise)\n        ↓\nShareable link  ·  Markdown/JSON export  ·  CI --min-grade (when the Action ships)\n```\n\nSame Next.js + Vercel Labs stack. The scanner is the gate; Studio is the human read on what it surfaced.",
      },
      {
        heading: "Key decisions",
        body: "- **Protocol checks before cleverness.** Handshake and capability negotiation catch more production breaks than a prompt eval.\n- **Operator-facing findings.** A prioritized fix list beats a dump of JSON-schema errors.\n- **CLI parity with the UI** so the same grade can block a merge.\n- **No model call required** for conformance — keep it fast, cheap, and reproducible.",
      },
      {
        heading: "Failure modes",
        body: "Testing only in one client hides capability mismatches. Treating a passing grade as a security audit oversells the tool — pair with real review. Scanning servers you do not own is both rude and an SSRF risk; refuse private ranges. A report nobody can share does not change a PR.",
      },
      {
        heading: "Scaling path",
        body: "Core suite and shareable links first. CI GitHub Action next. Historical diffing once teams run this on every release. Connectivity Scanner and Prompt Reviewer sit beside it as sibling gates (reachability, prompt surface) — don't merge them into one mega-scanner.",
      },
    ],
  },
  {
    slug: "well-architected-review-loop",
    title: "Well-Architected Review Loop",
    category: "Cloud",
    summary:
      "Run AWS Well-Architected as a repeating operating loop across six pillars — not a one-time slide — with named risks, owners, and a next-workload date.",
    tags: ["aws", "well-architected", "governance", "review"],
    updated: "2026-08-11",
    difficulty: "starter",
    source: "content/cloud/well-architected-review-loop.md",
    origin:
      "AWS Professor / Lesson_002 Well-Architected Framework Six Pillars + Operator-AI AWS Assessment module",
    whenNotToUse:
      "A greenfield sketch with no workload yet. Review real systems; don't score a deck.",
    sections: [
      {
        heading: "Problem",
        body: "Teams treat Well-Architected as a certification checkbox or a consultant's PDF. Six months later nothing has owners. The framework only pays off as a **loop**: score a named workload against the six pillars, write risks with owners, schedule the next review, and refuse to let \"we'll get to security later\" hide inside an average.",
      },
      {
        heading: "Shape",
        body: "```\nNamed workload (not \"the AWS account\")\n        ↓\nSix pillars: Operational Excellence · Security · Reliability\n             Performance Efficiency · Cost Optimization · Sustainability\n        ↓\nPer-pillar findings  →  risks with owner + due date\n        ↓\nBalance check: a high mean with a failing Security pillar is not healthy\n        ↓\nRemediation backlog  →  next review date on the calendar\n```\n\nSame balance-score instinct as C.I.T.H.: the weak pillar is the finding. Operator AI's AWS Assessment module is this loop productized.",
      },
      {
        heading: "Key decisions",
        body: "- **Review a workload, not an account.** \"Prod checkout\" and \"analytics lake\" have different risks.\n- **Every finding has an owner and a date**, or it is a slide.\n- **Cost is a pillar, not a finance afterthought.** Token and egress spend belong here for AI workloads.\n- **Sustainability is in the framework** — treat it as capacity and waste, not marketing.\n- **Re-review on a cadence** (quarterly, or after a material change), not after an incident.",
      },
      {
        heading: "Failure modes",
        body: "Averaging six pillars into a gold badge hides a missing encryption finding. Reviewing \"AWS\" instead of a workload produces generic advice. A report without owners is a souvenir. Running the review only to unlock a partner credit, then archiving the PDF, is the anti-pattern this loop exists to prevent.",
      },
      {
        heading: "Scaling path",
        body: "One workload, six pillars, a spreadsheet if you must. Promote to Operator AI's AWS Assessment when you want evidence pointers and a dashboard. Multi-account is a later problem — get the loop honest on one production workload first.",
      },
    ],
  },
];
