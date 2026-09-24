"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/data";

const ICONS: Record<string, string> = {
  "Food & Beverage": "☕",
  "Beauty & Wellness": "💆",
  Fitness: "🏋️",
};

const ACCENT: Record<string, string> = {
  "Food & Beverage": "cat-food",
  "Beauty & Wellness": "cat-beauty",
  Fitness: "cat-fitness",
};

export function CategoryHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  // Only meaningful on pages that actually filter by category.
  if (!["/", "/wishes", "/games"].includes(pathname)) return null;

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="border-b border-border bg-surface px-6 py-2.5">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2">
        <button
          onClick={() => select("all")}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            active === "all" ? "bg-text text-surface" : "bg-surface-sunken text-text-soft hover:text-text"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => {
          const isActive = active === c;
          const accent = ACCENT[c];
          return (
            <button
              key={c}
              onClick={() => select(c)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors"
              style={{
                background: isActive ? `var(--${accent})` : "var(--surface-sunken)",
                color: isActive ? "#fff" : "var(--text-soft)",
              }}
            >
              <span>{ICONS[c]}</span>
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
