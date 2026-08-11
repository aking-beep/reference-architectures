#!/usr/bin/env tsx
import { CONFIG, ITEMS, allCategories, searchItems } from "../lib/catalog";

function usage(): never {
  console.error(`Usage:
  npm run catalog                 List every ${CONFIG.noun}
  npm run catalog -- <query>      Search ${CONFIG.nounPlural}
  npm run catalog -- --category="Engineering"
  npm run catalog -- --json`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) usage();

let query = "";
let category: string | null = null;
let asJson = false;
for (const a of args) {
  if (a === "--json") asJson = true;
  else if (a.startsWith("--category=")) category = a.split("=")[1] ?? null;
  else if (a.startsWith("-")) usage();
  else query = a;
}

const results = searchItems(query, category);

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  console.log(`${CONFIG.title} — ${results.length}/${ITEMS.length} ${CONFIG.nounPlural}`);
  console.log(`Categories: ${allCategories().join(", ")}\n`);
  for (const r of results) {
    console.log(`• ${r.title}  [${r.category}${r.difficulty ? " · " + r.difficulty : ""}]`);
    console.log(`  ${r.summary}`);
    if (r.origin) console.log(`  origin: ${r.origin}`);
    console.log(`  /${r.slug}  tags: ${r.tags.join(", ")}\n`);
  }
}
