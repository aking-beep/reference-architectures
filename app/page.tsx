import Link from "next/link";
import { CONFIG, ITEMS, allCategories } from "@/lib/catalog";
import { Catalog } from "@/components/Catalog";
import { Subscribe } from "@/components/Subscribe";

export default function Home() {
  const cards = ITEMS.map((i) => ({
    slug: i.slug,
    title: i.title,
    category: i.category,
    summary: i.summary,
    tags: i.tags,
    difficulty: i.difficulty,
    image: i.image,
    scenario: i.scenario,
  }));

  return (
    <main className="min-h-screen">
      <header className="border-b border-line/80 backdrop-blur sticky top-0 z-20 bg-bg/80">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="text-left">
            <div className="text-sm font-semibold tracking-tight">ARC Labs · {CONFIG.title}</div>
            <div className="text-[11px] text-sub">ARC Labs {CONFIG.version} · updated {CONFIG.updated}</div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/docs" className="btn-ghost text-xs py-2">Docs</Link>
            <Link href="/roadmap" className="btn-ghost text-xs py-2">Roadmap</Link>
            <a href={CONFIG.repo} target="_blank" rel="noreferrer" className="btn-ghost text-xs py-2">GitHub</a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <section className="space-y-4 animate-fade-up">
          <div className="pill w-fit border-brand/40 text-brand bg-brand/10">Free · Open repository</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">{CONFIG.tagline}</h1>
          <p className="text-sub max-w-2xl leading-relaxed">{CONFIG.description}</p>
        </section>

        <Catalog items={cards} categories={allCategories()} noun={CONFIG.nounPlural} />

        <section className="card p-5 space-y-3">
          <div className="font-semibold text-sm">Get notified when new {CONFIG.nounPlural} land (optional)</div>
          <p className="text-xs text-sub">Everything here is free and browsable without an account. This is just for updates.</p>
          <Subscribe />
        </section>

        <footer className="pt-8 pb-16 text-xs text-sub border-t border-line">
          <p>
            ARC Labs builds free operator tools. Contributions welcome — open a PR on{" "}
            <a className="text-brand hover:underline" href={CONFIG.repo} target="_blank" rel="noreferrer">GitHub</a>.
          </p>
        </footer>
      </div>
    </main>
  );
}
