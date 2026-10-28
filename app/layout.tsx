import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { UPDATED } from "@/lib/data";
import { TeamProvider } from "@/lib/team";
import Gate, { SenderSwitcher } from "@/components/Gate";

export const metadata: Metadata = {
  title: "MSB Sponsorships",
  description: "Sponsorship and funding tracker for McMaster School of Bhangra.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TeamProvider>
          <div className="stripe h-1.5 w-full" />
          <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-lg font-extrabold text-saffron">
                  M
                </span>
                <span className="font-display text-lg font-extrabold leading-tight">
                  MSB <span className="text-phulkari">Sponsorships</span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
                <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/">Opportunities</Link>
                <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/tracker">Tracker</Link>
                <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/updates">Updates</Link>
                <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/profile">Club &amp; senders</Link>
                <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/send">Send in bulk</Link>
                <Link className="rounded-md px-3 py-1.5 hover:bg-saffron-soft" href="/guide">Guide</Link>
                <span className="ml-2"><SenderSwitcher /></span>
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-6xl px-4 pb-20">
            <Gate>{children}</Gate>
          </main>
          <footer className="border-t border-line py-6 text-center text-xs text-muted">
            McMaster School of Bhangra · Opportunity list updated {UPDATED} · Pages and news are checked automatically twice a week
          </footer>
        </TeamProvider>
      </body>
    </html>
  );
}
