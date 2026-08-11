import type { Metadata } from "next";
import "./globals.css";
import { CONFIG } from "@/lib/catalog";

export const metadata: Metadata = {
  title: `ARC Labs — ${CONFIG.title}`,
  description: CONFIG.description,
  openGraph: {
    title: `ARC Labs — ${CONFIG.title}`,
    description: CONFIG.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
