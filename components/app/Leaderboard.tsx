"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { CATEGORIES, CATEGORY_ICON, CATEGORY_ACCENT } from "@/lib/data";
import { BrandLogo } from "./BrandLogo";
import { LoveButton } from "./LoveButton";

export type Metric = "loved" | "generous" | "granted" | "spend";

const METRICS: Array<{ id: Metric; label: string; icon: string; unit: (n: number) => string; blurb: string }> = [
  { id: "loved", label: "Most loved", icon: "❤️", unit: (n) => n.toLocaleString("en-IN"), blurb: "Customer love — one per person, per brand." },
  { id: "generous", label: "Most generous", icon: "🎁", unit: (n) => `${n} live`, blurb: "Prizes sitting in the pool right now." },
  { id: "granted", label: "Wishes granted", icon: "🧞", unit: (n) => `${n}`, blurb: "Wishes this brand actually delivered on." },
  { id: "spend", label: "Wish spend", icon: "💸", unit: (n) => `₹${n.toLocaleString("en-IN")}`, blurb: "Committed to claiming and outbidding wishes." },
];

type Row = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  value: number;
};

function useRows(metric: Metric): Row[] {
  const loves = useAppStore((s) => s.loves);
  const stock = useAppStore((s) => s.stock);
  const wishes = useAppStore((s) => s.wishes);

  return useMemo(() => {
    return MERCHANTS.map((m) => {
      const category = PODS.find((p) => p.id === m.podId)!.category;
      const mine = wishes.filter((w) => w.claimedByMerchantId === m.id);
      const value =
        metric === "loved"
          ? (loves[m.id] ?? 0)
          : metric === "generous"
            ? REWARD_ITEMS.filter((r) => r.merchantId === m.id).reduce((sum, r) => sum + (stock[r.id] ?? 0), 0)
            : metric === "granted"
              ? mine.filter((w) => w.status === "fulfilled").length
              : mine.reduce((sum, w) => sum + w.claimPrice, 0);
      return { id: m.id, name: m.name, emoji: m.emoji, category, value };
    }).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }, [metric, loves, stock, wishes]);
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ categoryFilter }: { categoryFilter: string | null }) {
  const [metric, setMetric] = useState<Metric>("loved");
  const rows = useRows(metric);
  const meta = METRICS.find((m) => m.id === metric)!;

  const scoped = categoryFilter ? rows.filter((r) => r.category === categoryFilter) : rows;
  const podium = scoped.slice(0, 3);
  const rest = scoped.slice(3, 20);

  return (
    <div>
      {/* ---- metric tabs ---- */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetric(m.id)}
            className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
              metric === m.id ? "text-white" : "border border-border bg-surface-raised text-text-soft hover:text-text"
            }`}
            style={metric === m.id ? { background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" } : undefined}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      <p className="mb-6 text-[12.5px] text-text-soft">{meta.blurb}</p>

      {/* ---- podium ---- */}
      <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        {podium.map((row, i) => {
          const accent = CATEGORY_ACCENT[row.category];
          return (
            <div key={row.id} className="podium p-5">
              <span className="podium-rank" style={{ color: `var(--${accent})` }}>
                {i + 1}
              </span>
              <div className="relative flex items-center gap-3">
                <BrandLogo id={row.id} name={row.name} emoji={row.emoji} size="lg" />
                <div className="min-w-0">
                  <div className="text-[22px] leading-none">{MEDALS[i]}</div>
                  <Link href={`/brands/${row.id}`} className="mt-1.5 block truncate text-[15px] font-semibold hover:underline">
                    {row.name}
                  </Link>
                  <div className="truncate text-[11.5px] text-text-soft">
                    {CATEGORY_ICON[row.category]} {row.category}
                  </div>
                </div>
              </div>
              <div className="relative mt-4 flex items-center justify-between">
                <span className="mono text-[20px] font-bold" style={{ color: `var(--${accent})` }}>
                  {meta.unit(row.value)}
                </span>
                <LoveButton brandId={row.id} size="sm" showCount={metric !== "loved"} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- ranked rows ---- */}
      <div className="rounded-2xl border border-border bg-surface-raised p-2" style={{ boxShadow: "var(--shadow)" }}>
        {rest.length === 0 ? (
          <p className="px-3 py-4 text-[13px] text-text-soft">That&rsquo;s every brand in this category.</p>
        ) : (
          rest.map((row, i) => {
            const accent = CATEGORY_ACCENT[row.category];
            return (
              <div key={row.id} className="lb-row">
                <span className="mono w-7 flex-none text-center text-[12.5px] font-semibold text-text-soft">
                  {i + 4}
                </span>
                <BrandLogo id={row.id} name={row.name} emoji={row.emoji} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link href={`/brands/${row.id}`} className="block truncate text-[13.5px] font-semibold hover:underline">
                    {row.name}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-soft">
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: `var(--${accent})` }} />
                    {row.category}
                  </div>
                </div>
                <span className="mono flex-none text-[14px] font-bold" style={{ color: `var(--${accent})` }}>
                  {meta.unit(row.value)}
                </span>
                <LoveButton brandId={row.id} size="sm" showCount={metric !== "loved"} />
              </div>
            );
          })
        )}
      </div>

      {/* ---- per-category boards ---- */}
      {!categoryFilter && (
        <>
          <h2 className="mt-14 mb-1 text-[20px]">Category leaders</h2>
          <p className="mb-5 text-[12.5px] text-text-soft">
            Top three by {meta.label.toLowerCase()} in each category.
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))" }}>
            {CATEGORIES.map((cat) => {
              const top = rows.filter((r) => r.category === cat).slice(0, 3);
              const accent = CATEGORY_ACCENT[cat];
              return (
                <div key={cat} className="rounded-2xl border border-border bg-surface-raised p-4" style={{ boxShadow: "var(--shadow)" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[16px]">{CATEGORY_ICON[cat]}</span>
                    <h3 className="text-[14.5px] font-semibold">{cat}</h3>
                    <span
                      className="mono ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: `var(--${accent})` }}
                    >
                      {meta.icon}
                    </span>
                  </div>
                  {top.map((row, i) => (
                    <div key={row.id} className="flex items-center gap-2.5 border-t border-border py-2.5 first:border-t-0">
                      <span className="w-5 flex-none text-center text-[13px]">{MEDALS[i]}</span>
                      <BrandLogo id={row.id} name={row.name} emoji={row.emoji} size="sm" />
                      <Link href={`/brands/${row.id}`} className="min-w-0 flex-1 truncate text-[12.5px] font-semibold hover:underline">
                        {row.name}
                      </Link>
                      <span className="mono flex-none text-[12.5px] font-bold" style={{ color: `var(--${accent})` }}>
                        {meta.unit(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
