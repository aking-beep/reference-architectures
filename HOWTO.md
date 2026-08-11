# How to use and extend Reference Architectures

## Browse
- Web: search or filter by category, open any architecture.
- CLI: `npm run catalog`, `npm run catalog -- "<query>"`, `npm run catalog -- --json`.
- API: `curl https://referencearchitectures.arctransformationgrouplab.dev/api/catalog`.

## Apply an architecture
1. Read **When not to use** and **Problem** to confirm it matches your situation.
2. Use **Shape** as the starting diagram; keep the ASCII (or SVG) in the design doc.
3. Use **Key decisions** to understand the trade-offs before you copy the design.
4. Treat **Failure modes** as a pre-mortem checklist.
5. Follow the **Scaling path** as load grows rather than over-building on day one.

## Add a new architecture
1. Append a `CatalogItem` to `lib/catalog/data.ts` with:
   - `sections`: Problem, Shape, Key decisions, Failure modes, Scaling path
   - `origin`: the Google Drive folder, lesson, or product it was harvested from
   - `whenNotToUse`: one or two sentences
   - `source`: `content/<category-dir>/<slug>.md`
2. Run `npm run sync-content` to mirror Markdown under `content/`.
3. Add a row to `SOURCES.md`.
4. `npm run typecheck`.
5. Open a PR.

## Local development
```bash
npm install
npm run dev
```
Home, detail pages, API, and CLI all read from `lib/catalog/data.ts`.
