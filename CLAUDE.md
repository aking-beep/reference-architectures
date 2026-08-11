# CLAUDE.md — Reference Architectures

Context for AI assistants working in this repo.

## What this is
An open catalog of reference architectures harvested from ARC Google Drive folders. Every surface (home, detail pages, API, CLI) is generated from `lib/catalog/data.ts`. There is **no access gate** — free and browsable without an account.

## Architecture
- `lib/catalog/config.ts` — product identity (title, noun, repo, site, version).
- `lib/catalog/data.ts` — the `ITEMS: CatalogItem[]` array; source of truth.
- `lib/catalog/index.ts` — helpers: `getItem`, `allCategories`, `allTags`, `searchItems`.
- `lib/catalog/types.ts` — shared `CatalogItem` / `CatalogConfig` types.
- `app/page.tsx` — server home: hero + `<Catalog>` + `<Subscribe>`.
- `app/[slug]/page.tsx` — static detail pages (`dynamicParams = false`).
- `app/api/catalog/route.ts` — read-only JSON API.
- `components/Markdown.tsx` — zero-dependency markdown-lite renderer.
- `content/` — human-readable mirror; regenerate with `npm run sync-content`.
- `SOURCES.md` — Drive / product origin for every entry.

## Conventions
- Adding an architecture = one `CatalogItem` in `data.ts` + `npm run sync-content` + a `SOURCES.md` row.
- Required sections: Problem, Shape, Key decisions, Failure modes, Scaling path.
- Required metadata: `origin`, `whenNotToUse`.
- Keep failure modes and trade-offs — they are the value; don't trim them.
- Keep the dependency set minimal.
- Do not invent architectures ARC has not actually run or taught. Harvest from Drive.

## Checks
`npm run typecheck` and `npm run build` must pass. CI runs both on every PR.
