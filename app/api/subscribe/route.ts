import { NextResponse } from "next/server";
import { z } from "zod";
import { LIMITS, clientIp, rateLimit } from "@/lib/security/ratelimit";

export const runtime = "nodejs";

const Schema = z.object({ email: z.string().email().max(200) });

// Optional updates list. Best-effort: forwards to a webhook if configured,
// never blocks and never gates catalog access.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`subscribe:${ip}`, LIMITS.subscribe.limit, LIMITS.subscribe.windowMs);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Try later." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

  const webhook = process.env.EMAIL_CAPTURE_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "subscribe", email: parsed.data.email, at: new Date().toISOString() }),
      });
    } catch {
      /* best-effort */
    }
  }
  return NextResponse.json({ ok: true });
}
