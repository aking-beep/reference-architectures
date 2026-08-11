"use client";

import { useState } from "react";

// Optional email capture for updates. Everything in the catalog is free and
// browsable without this.
export function Subscribe() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <p className="text-sm text-good">Thanks — we&apos;ll email you when new items land.</p>;

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input className="input max-w-xs" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      <button type="submit" className="btn-ghost text-sm" disabled={loading}>
        {loading ? "Saving…" : "Notify me of updates"}
      </button>
    </form>
  );
}
