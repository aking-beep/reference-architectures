import { NextResponse } from "next/server";
import { CONFIG, ITEMS, getItem } from "@/lib/catalog";

export const runtime = "nodejs";

// Public read-only catalog API. `?slug=` returns a single item.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (slug) {
    const item = getItem(slug);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  }
  const category = searchParams.get("category");
  const items = category ? ITEMS.filter((i) => i.category === category) : ITEMS;
  return NextResponse.json({
    product: CONFIG.product,
    version: CONFIG.version,
    count: items.length,
    items: items.map((i) => ({
      slug: i.slug,
      title: i.title,
      category: i.category,
      summary: i.summary,
      tags: i.tags,
      difficulty: i.difficulty,
      updated: i.updated,
      source: i.source,
      origin: i.origin,
      whenNotToUse: i.whenNotToUse,
    })),
  });
}
