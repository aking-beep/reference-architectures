import { CONFIG } from "./config";
import { ITEMS } from "./data";
import type { CatalogItem } from "./types";

export { CONFIG, ITEMS };

export function getItem(slug: string): CatalogItem | undefined {
  return ITEMS.find((i) => i.slug === slug);
}

export function allCategories(): string[] {
  return Array.from(new Set(ITEMS.map((i) => i.category))).sort();
}

export function allTags(): string[] {
  return Array.from(new Set(ITEMS.flatMap((i) => i.tags))).sort();
}

export function searchItems(query: string, category: string | null): CatalogItem[] {
  const q = query.trim().toLowerCase();
  return ITEMS.filter((i) => {
    if (category && i.category !== category) return false;
    if (!q) return true;
    const hay = [i.title, i.summary, i.category, ...i.tags].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
