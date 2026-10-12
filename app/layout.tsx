import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { UPDATED } from "@/lib/data";


export const metadata: Metadata = {
  title: "MSB Funding Hub",
  description: "Sponsorships, grants and outreach for McMaster School of Bhangra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="stripe h-1.5 w-full" />
        <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-20">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-lg font-extrabold text-saffron">
                M
              </span>
              <span className="font-display text-lg font-extrabold leading-tight">
                MSB <span className="text-phulkari">Funding Hub</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium">
              <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/">Opportunities</Link>
              <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/profile">Club profile</Link>
              <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/guide">Guide</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted">
          McMaster School of Bhangra · Database updated {UPDATED} · New opportunities are added automatically each week
        </footer>
      </body>
    </html>
  );
}
