# Reference Architectures

**ARC Labs 0.2** — Free · Open Source · Community Project

A free, open library of battle-tested system blueprints harvested from ARC's real work: AWS streaming labs, Operator AI, Labs products, CITH, Experience Intelligence, and FoodMesh. Each entry documents the problem, the component shape, key decisions and trade-offs, failure modes, **when not to use it**, and a scaling path.

Repo: https://github.com/aking-beep/reference-architectures  
Live: https://referencearchitectures.arctransformationgrouplab.dev  
Website: https://arc-website-pi-five.vercel.app/labs/reference-architectures  
Labs home (Google Drive): `ARC Transformation/ARC Labs (Free)/reference-architectures`

No account. No lock-in. Browse, copy, adapt.

---

## What's inside

- **20 architectures** across Data, AI, Web, Backend, SaaS, Integration, and Cloud.
- **Browsable catalog** — search and filter by category and tag.
- **Per-architecture detail pages** — statically generated, each linking to its source file.
- **Read-only JSON API** — `GET /api/catalog`, no key required.
- **Open content repo** — every architecture also lives as Markdown under `content/`.
- **CLI** — `npm run catalog` to search from the terminal.
- **Origin notes** — every entry cites the Drive folder or product it was harvested from. See `SOURCES.md`.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run build
npm run catalog -- "kinesis"
npm run sync-content # regenerate content/*.md from lib/catalog/data.ts
```

## API

```
GET /api/catalog                # list all
GET /api/catalog?category=Data  # filter by category
GET /api/catalog?slug=<slug>    # a single architecture
```

## Using an architecture

1. Read **When not to use** first — it saves you from copying the wrong shape.
2. Use **Shape** (and the diagram, when present) as the starting picture.
3. Treat **Failure modes** as a pre-mortem checklist.
4. Follow the **Scaling path** as load grows rather than over-building on day one.

## Where the code lives

| Location | Role |
|----------|------|
| Google Drive `ARC Labs (Free)/reference-architectures` | Canonical Labs project home |
| GitHub `aking-beep/reference-architectures` | Public source of truth |
| `arc-website` `/labs/reference-architectures` | Marketing page on the ARC site |

## Contributing

Add an entry to `lib/catalog/data.ts` (include `origin` and `whenNotToUse`), run `npm run sync-content`, and open a PR. See `HOWTO.md`.

## Tech

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS. Deploys to Vercel. MIT licensed.

## License

MIT © 2026 ARC Transformation Group
