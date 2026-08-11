"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type CatalogCard = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  difficulty?: string;
};

const DIFF_COLOR: Record<string, string> = {
  starter: "#35d0a5",
  intermediate: "#f0b23a",
  advanced: "#f0554d",
};

export function Catalog({
  items,
  categories,
  noun,
}: {
  items: CatalogCard[];
  categories: string[];
  noun: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (category && i.category !== category) return false;
      if (!q) return true;
      return [i.title, i.summary, i.category, ...i.tags].join(" ").toLowerCase().includes(q);
    });
  }, [items, query, category]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${items.length} ${noun}…`}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className="pill"
            style={category === null ? { borderColor: "#5b8cff", color: "#5b8cff", background: "rgba(91,140,255,0.1)" } : {}}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c === category ? null : c)}
              className="pill"
              style={category === c ? { borderColor: "#5b8cff", color: "#5b8cff", background: "rgba(91,140,255,0.1)" } : {}}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-sub">
        {filtered.length} {filtered.length === 1 ? noun.replace(/s$/, "") : noun}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((i) => (
          <Link key={i.slug} href={`/${i.slug}`} className="card p-4 space-y-2 hover:border-brand/50 transition block">
            <div className="flex items-center justify-between gap-2">
              <span className="pill text-brand border-brand/40 bg-brand/10">{i.category}</span>
              {i.difficulty && (
                <span className="text-[11px] uppercase tracking-wide" style={{ color: DIFF_COLOR[i.difficulty] ?? "#93a0b7" }}>
                  {i.difficulty}
                </span>
              )}
            </div>
            <div className="font-semibold text-ink">{i.title}</div>
            <div className="text-sm text-sub leading-relaxed">{i.summary}</div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {i.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[11px] text-sub">#{t}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-6 text-center text-sm text-sub">
          No {noun} match that search. Try a different term or clear the filter.
        </div>
      )}
    </div>
  );
}
