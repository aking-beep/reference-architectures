#!/usr/bin/env tsx
/**
 * Mirror every CatalogItem in lib/catalog/data.ts to content/<dir>/<slug>.md.
 * Run after editing the catalog: `npm run sync-content`.
 */
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { ITEMS } from "../lib/catalog/data";

const ROOT = join(process.cwd(), "content");

const CATEGORY_DIR: Record<string, string> = {
  Data: "data",
  AI: "ai",
  Web: "web",
  Backend: "backend",
  SaaS: "saas",
  Integration: "integration",
  Cloud: "cloud",
};

function yamlList(tags: string[]): string {
  return `[${tags.join(", ")}]`;
}

function toMarkdown(item: (typeof ITEMS)[number]): string {
  const lines: string[] = [
    "---",
    `title: ${item.title}`,
    `category: ${item.category}`,
    `difficulty: ${item.difficulty ?? "intermediate"}`,
    `tags: ${yamlList(item.tags)}`,
    `updated: ${item.updated}`,
  ];
  if (item.origin) lines.push(`origin: ${JSON.stringify(item.origin)}`);
  lines.push("---", "", `# ${item.title}`, "", item.summary, "");
  if (item.origin) {
    lines.push(`_Harvested from:_ ${item.origin}`, "");
  }
  if (item.whenNotToUse) {
    lines.push("## When not to use", item.whenNotToUse, "");
  }
  for (const s of item.sections) {
    lines.push(`## ${s.heading}`, s.body, "");
  }
  return lines.join("\n");
}

if (existsSync(ROOT)) {
  rmSync(ROOT, { recursive: true, force: true });
}

for (const item of ITEMS) {
  const dir = CATEGORY_DIR[item.category];
  if (!dir) throw new Error(`No content directory mapped for category "${item.category}"`);
  const rel = join(dir, `${item.slug}.md`);
  const abs = join(ROOT, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, toMarkdown(item), "utf8");
  if (item.source && item.source !== `content/${rel}`) {
    console.warn(`source mismatch for ${item.slug}: data.ts has ${item.source}, wrote content/${rel}`);
  }
  console.log(`wrote content/${rel}`);
}

console.log(`\n${ITEMS.length} architectures mirrored under content/`);
