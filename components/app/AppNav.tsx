"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Reward Pool" },
  { href: "/wishes", label: "Wishes" },
  { href: "/wallet", label: "My Rewards" },
  { href: "/merchant", label: "Merchant Console" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-surface/90 px-6 py-3.5 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5 font-semibold">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-[15px]"
          style={{
            background: "linear-gradient(155deg, var(--accent), var(--accent-deep))",
            boxShadow: "var(--shadow)",
          }}
        >
          ✨
        </div>
        <span className="font-display text-[17px]">ViralGenie</span>
      </Link>
      <div className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                active ? "bg-surface-sunken text-text" : "text-text-soft hover:bg-surface-sunken hover:text-text"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/concept"
          className="ml-1 rounded-full border border-border px-2.5 py-1 text-[11px] tracking-wide text-text-soft uppercase hover:text-text"
        >
          How it works
        </Link>
      </div>
    </nav>
  );
}
