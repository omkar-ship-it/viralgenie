"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { href: "/brands", label: "Directory" },
  { href: "/brands/leaderboard", label: "Leaderboards" },
];

export function BrandTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  return (
    <div className="flex gap-1.5">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={qs ? `${tab.href}?${qs}` : tab.href}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
              active ? "text-white" : "border border-border bg-surface-raised text-text-soft hover:text-text"
            }`}
            style={active ? { background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" } : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
