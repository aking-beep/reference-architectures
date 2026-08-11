# Changelog

All notable changes to Reference Architectures are documented here. Format based on Keep a Changelog; this project follows semver.

## [0.2.0] - 2026-08-11
### Added
- Expanded catalog from 6 seeds to 20 architectures harvested from Google Drive (AWS Professor DEA-C01, Operator AI, Labs products, CITH, Experience Intelligence, FoodMesh).
- `origin` and `whenNotToUse` on every entry; `SOURCES.md` index.
- Kinesis Data Streams SVG from the DEA-C01 lesson.
- `npm run sync-content` to keep `content/` in lockstep with `lib/catalog/data.ts`.

## [0.1.0] - 2026-08-11
### Added
- Initial public release: 6 seeded reference architectures across Data, Web, Backend, SaaS, AI, and Integration.
- Browsable, searchable catalog UI with category filters.
- Static per-architecture detail pages with source links.
- Read-only JSON API at `/api/catalog`.
- CLI search (`npm run catalog`).
- Optional email capture for update notifications.
