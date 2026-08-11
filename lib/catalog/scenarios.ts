/** Realistic named scenario shown with each architecture image. */
export const SCENARIOS: Record<string, string> = {
  "kinesis-data-streams":
    "Northline Rides — Black Friday surge. Partition by driver_id, Enhanced Fan-Out for fraud, Firehose for the lake.",
  "streaming-service-decision":
    "Launch-week ingest: replay plus three consumers picks Kinesis, not SQS.",
  "event-driven-ingestion":
    "Launch-day clickstream. Commit the offset after the upsert; poison messages go to the DLQ.",
  "deterministic-operator-pipeline":
    "Avery Consulting POC daily brief. Explicit stages, no multi-agent orchestration.",
  "operator-intelligence-loop":
    "Meridian Health: reported green, evidence red. The gap is the product.",
  "bedrock-knowledge-base-pipeline":
    "S3 is the artifact system of record. The Knowledge Base is a derived index.",
  "llm-app-backend":
    "Prompt v14 at 2am. Gateway, versioned prompts, traces, and a cost cap.",
  "hitl-workflow-automation":
    "Draft the Jira ticket. A human still has to send it.",
  "synthetic-eval-loop":
    "Meridian Health 56-day calendar. Ground truth never enters the model context.",
  "arc-labs-nextjs-stack":
    "Fourth free tool, same Next.js + Vercel stack. Three homes: Drive, GitHub, website.",
  "read-heavy-web-service":
    "Sale-day ticketing homepage. CDN and Redis take the reads; replicas lag.",
  "async-job-processing":
    "Franchise CRO crawl of 40 URLs. The web tier returns; workers run the journeys.",
  "multi-tenant-saas":
    "Two agency clients, one database. RLS makes tenant_id mandatory, including on jobs.",
  "agent-spend-control":
    "jordan@ spiked 7.8×. Kill switch via admin APIs — minutes-scale, no proxy.",
  "maturity-assessment-balance-score":
    "Mean looks healthy. Security is 32. A high average with high variance is fragile.",
  "experience-intelligence-pipeline":
    "RFP-grade checkout assessment. AI only ranks findings the crawlers produced.",
  "verified-recovery-loyalty-ledger":
    "Charity pickup of 42.5 kg mints Gold-tier points on Postgres — not a chain.",
  "webhook-delivery-system":
    "Customer endpoint down three hours. Signed retries, then replay.",
  "mcp-conformance-gate":
    "Server looked fine in one client. Handshake and schemas say otherwise.",
  "well-architected-review-loop":
    "Prod checkout workload. Six pillars, named owners, a date on the calendar.",
};

export function scenarioImage(slug: string): string {
  return `/scenarios/${slug}.jpg`;
}
