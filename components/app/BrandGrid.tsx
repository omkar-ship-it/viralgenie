"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { MAX_BRANDS_DISPLAYED, CATEGORIES, CATEGORY_ICON, CATEGORY_ACCENT } from "@/lib/data";
import { BrandLogo } from "./BrandLogo";

const PAGE_SIZE = 18;
const ROTATE_MS = 5000;

type Ranked = {
  id: string;
  name: string;
  emoji: string;
  podId: string;
  category: string;
  prizes: number;
  rank: number;
};

function useRankedBrands(): Ranked[] {
  const stock = useAppStore((s) => s.stock);
  return MERCHANTS.map((m) => {
    const pod = PODS.find((p) => p.id === m.podId)!;
    const prizes = REWARD_ITEMS.filter((r) => r.merchantId === m.id).reduce(
      (sum, r) => sum + (stock[r.id] ?? 0),
      0
    );
    return { ...m, category: pod.category, prizes, rank: 0 };
  })
    .sort((a, b) => b.prizes - a.prizes || a.name.localeCompare(b.name))
    .slice(0, MAX_BRANDS_DISPLAYED)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}

function Tile({
  brand,
  spotlight,
  delay = 0,
  linkTo = "brand",
}: {
  brand: Ranked;
  spotlight?: boolean;
  delay?: number;
  linkTo?: "brand" | "play";
}) {
  const accent = CATEGORY_ACCENT[brand.category];
  return (
    <Link
      href={linkTo === "brand" ? `/brands/${brand.id}` : `/play/${brand.podId}`}
      className={`brand-tile tile-page ${spotlight ? "spotlight" : ""}`}
      style={{ borderColor: spotlight ? `var(--${accent})` : undefined, animationDelay: `${delay}ms` }}
      title={`${brand.name} · ${brand.category} · ${brand.prizes} prizes live`}
    >
      <BrandLogo id={brand.id} name={brand.name} emoji={brand.emoji} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold leading-tight">{brand.name}</span>
        <span className="mono block text-[10px] text-text-soft">
          #{brand.rank} · {brand.prizes} live
        </span>
      </span>
      <span className="h-6 w-1 flex-none rounded-full" style={{ background: `var(--${accent})` }} />
    </Link>
  );
}

export function BrandGrid({
  categoryFilter,
  query = "",
  linkTo = "brand",
}: {
  categoryFilter: string | null;
  query?: string;
  linkTo?: "brand" | "play";
}) {
  const ranked = useRankedBrands();
  const [page, setPage] = useState(0);

  const q = query.trim().toLowerCase();
  const searched = q ? ranked.filter((b) => b.name.toLowerCase().includes(q)) : ranked;
  const visiblePool = categoryFilter ? searched.filter((b) => b.category === categoryFilter) : searched;
  const pageCount = Math.max(1, Math.ceil(visiblePool.length / PAGE_SIZE));
  const current = page % pageCount;
  const pageBrands = visiblePool.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setPage((p) => p + 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const categories = categoryFilter ? CATEGORIES.filter((c) => c === categoryFilter) : CATEGORIES;

  return (
    <div className="mb-16">
      {/* ---- rotating top 100 ---- */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[20px]">Top 100 brands</h2>
          <p className="text-[12.5px] text-text-soft">
            Ranked by prizes they&rsquo;re giving away right now — never by what they paid.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="mono text-[11.5px] text-text-soft">
            {ranked.length}/{MAX_BRANDS_DISPLAYED} spots filled
          </span>
          <div className="flex gap-1">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Show brands page ${i + 1}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === current ? 18 : 6,
                  background: i === current ? "var(--accent)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        key={current}
        className="mb-12 grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(202px, 1fr))" }}
      >
        {pageBrands.map((b, i) => (
          <Tile key={b.id} brand={b} spotlight={b.rank === 1} delay={i * 22} linkTo={linkTo} />
        ))}
      </div>

      {/* ---- category-wise grids ---- */}
      <div className="flex flex-col gap-8">
        {categories.map((cat) => {
          const brands = searched.filter((b) => b.category === cat);
          if (brands.length === 0) return null;
          const accent = CATEGORY_ACCENT[cat];
          return (
            <div key={cat}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-[17px]">{CATEGORY_ICON[cat]}</span>
                <h3 className="text-[15px] font-semibold">{cat}</h3>
                <span
                  className="mono rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white"
                  style={{ background: `var(--${accent})` }}
                >
                  {brands.length}
                </span>
                <span className="mono ml-auto text-[11px] text-text-soft">
                  {brands.reduce((s, b) => s + b.prizes, 0)} prizes live
                </span>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(202px, 1fr))" }}>
                {brands.map((b) => (
                  <Tile key={b.id} brand={b} linkTo={linkTo} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
