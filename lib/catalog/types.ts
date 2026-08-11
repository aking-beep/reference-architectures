// Shared catalog types across ARC Labs content catalogs.

export interface CatalogSection {
  heading: string;
  /** Markdown-lite body: headings (##/###), lists (- / 1.), fenced code, **bold**, `code`. */
  body: string;
}

export type Difficulty = "starter" | "intermediate" | "advanced";

export interface CatalogItem {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  updated: string;
  difficulty?: Difficulty;
  sections: CatalogSection[];
  /** Relative path to the canonical source file in the open content repo. */
  source?: string;
  /** Google Drive / product origin this architecture was harvested from. */
  origin?: string;
  /** When this pattern is the wrong tool. */
  whenNotToUse?: string;
  /** Optional public path to a diagram asset (SVG/PNG). */
  diagram?: string;
  /** Scenario illustration shown on the catalog card and detail page. */
  image?: string;
  /** One-line caption for the realistic scenario in the image. */
  scenario?: string;
}

export interface CatalogConfig {
  product: string;
  title: string;
  noun: string;
  nounPlural: string;
  apiPath: string;
  tagline: string;
  description: string;
  repo: string;
  site: string;
  updated: string;
  version: string;
}
