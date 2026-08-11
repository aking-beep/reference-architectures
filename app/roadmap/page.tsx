import Link from "next/link";
import { CONFIG } from "@/lib/catalog";

const ITEMS: { label: string; done: boolean; note: string }[] = [
  { label: "Seed catalog with vetted, copy-pasteable entries", done: true, note: "Shipped in 0.1" },
  { label: "Searchable, filterable browse UI", done: true, note: "Shipped in 0.1" },
  { label: "Read-only JSON API + open content repo", done: true, note: "Shipped in 0.1" },
  { label: "Per-item detail pages with source links", done: true, note: "Shipped in 0.1" },
  { label: "Community contribution guide + PR template", done: false, note: "Next" },
  { label: "Copy / download buttons per entry", done: false, note: "Next" },
  { label: "Versioned entries + changelog per item", done: false, note: "Later" },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <Link href="/" className="text-sm text-sub hover:text-ink">← {CONFIG.title}</Link>
        <h1 className="text-3xl font-bold">Roadmap</h1>
        <ul className="space-y-3">
          {ITEMS.map((item) => (
            <li key={item.label} className="card p-4 flex items-start gap-3">
              <span className={item.done ? "text-good" : "text-sub"}>{item.done ? "✓" : "○"}</span>
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-sub mt-0.5">{item.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
