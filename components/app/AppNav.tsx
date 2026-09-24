"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Reward Pool" },
  { href: "/games", label: "Games" },
  { href: "/brands", label: "Brands" },
  { href: "/wishes", label: "Wishes" },
  { href: "/wallet", label: "My Rewards" },
  { href: "/merchant", label: "Merchant" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-3">
      <Link href="/" className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 place-items-center rounded-[10px] text-[16px]"
          style={{
            background: "linear-gradient(150deg, var(--accent), var(--accent-deep))",
            boxShadow: "0 8px 18px -8px var(--accent)",
          }}
        >
          ✨
        </span>
        <span className="font-display text-[18px] font-semibold">ViralGenie</span>
      </Link>

      <div className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                active ? "text-white" : "text-text-soft hover:bg-surface-sunken hover:text-text"
              }`}
              style={
                active
                  ? {
                      background: "linear-gradient(120deg, var(--accent), var(--accent-deep))",
                      boxShadow: "0 8px 18px -10px var(--accent)",
                    }
                  : undefined
              }
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/concept"
          className="ml-1 rounded-full border border-border px-2.5 py-1 text-[10.5px] tracking-wide text-text-soft uppercase transition-colors hover:text-text"
        >
          How it works
        </Link>
      </div>
    </nav>
  );
}
