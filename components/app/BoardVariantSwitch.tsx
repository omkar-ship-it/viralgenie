"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const VARIANTS = [
  { href: "/brandboard", label: "Compact board", hint: "100 squares at a glance" },
  { href: "/brandboard/big", label: "Big tiles", hint: "Logo, description, stats" },
];

/** Both layouts share one daily roll — this only swaps the presentation. */
export function BoardVariantSwitch() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] tracking-wide text-text-soft uppercase">Layout</span>
      {VARIANTS.map((v) => {
        const active = pathname === v.href;
        return (
          <Link
            key={v.href}
            href={v.href}
            title={v.hint}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
              active ? "text-white" : "border border-border bg-surface-raised text-text-soft hover:text-text"
            }`}
            style={active ? { background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" } : undefined}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
