"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { CATEGORIES, CATEGORY_ICON, CATEGORY_ACCENT } from "@/lib/data";
import { BrandWall } from "@/components/app/BrandWall";

function merchantById(id: string) {
  return MERCHANTS.find((m) => m.id === id)!;
}

function PodSection({ podId, name, area, category }: { podId: string; name: string; area: string; category: string }) {
  const stock = useAppStore((s) => s.stock);
  const rewards = REWARD_ITEMS.filter((r) => r.podId === podId);
  const totalPrizes = rewards.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  const accent = CATEGORY_ACCENT[category];
  const accentSoft = `${accent}-soft`;

  return (
    <div className="mb-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-[16.5px] font-semibold">{name}</h3>
          <p className="text-[12.5px] text-text-soft">
            {totalPrizes} prizes live across {rewards.length} reward{rewards.length === 1 ? "" : "s"} · {area}
          </p>
        </div>
        <Link
          href={`/play/${podId}`}
          className="rounded-full px-4.5 py-2 text-[12.5px] font-semibold text-white transition-transform hover:scale-[1.03]"
          style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))", boxShadow: "var(--shadow)" }}
        >
          Play this pod ✨
        </Link>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
        {rewards.map((r) => {
          const merchant = merchantById(r.merchantId);
          const remaining = stock[r.id] ?? 0;
          const pct = (remaining / r.totalStock) * 100;
          const low = remaining > 0 && pct <= 20;
          const soldOut = remaining === 0;
          return (
            <div
              key={r.id}
              className="group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border bg-surface-raised p-4 transition-transform hover:-translate-y-0.5"
              style={{
                borderColor: low ? `var(--${accent})` : "var(--border)",
                boxShadow: "var(--shadow)",
                opacity: soldOut ? 0.55 : 1,
              }}
            >
              <div
                className="absolute -top-6 -right-6 h-16 w-16 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
                style={{ background: `var(--${accentSoft})` }}
              />
              <div className="relative flex items-center gap-2 text-[12px]">
                <span className="text-[20px] leading-none">{r.icon}</span>
                {low && !soldOut && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white" style={{ background: `var(--${accent})` }}>
                    🔥 ALMOST GONE
                  </span>
                )}
                {soldOut && (
                  <span className="ml-auto rounded-full bg-text-soft px-2 py-0.5 text-[9.5px] font-bold text-surface-raised">
                    OUT OF STOCK
                  </span>
                )}
              </div>
              <div className="relative text-[14.5px] font-semibold leading-snug">{r.label}</div>
              <div className="relative flex items-center gap-1.5 text-[11px] text-text-soft">
                <span>{merchant.emoji}</span>
                {merchant.name}
              </div>
              <div className="relative mt-auto flex items-center justify-between text-[11px] text-text-soft">
                <span>{remaining} left</span>
                <span>of {r.totalStock}</span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `var(--${accent})` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: string }) {
  const pods = PODS.filter((p) => p.category === category);
  const accent = CATEGORY_ACCENT[category];

  return (
    <section className="mb-16">
      <div className="mb-5 flex items-center gap-2.5 border-b border-border pb-3">
        <span className="text-[20px]">{CATEGORY_ICON[category]}</span>
        <h2 className="text-[22px]">{category}</h2>
        <span
          className="ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
          style={{ background: `var(--${accent})` }}
        >
          {pods.length} pod{pods.length === 1 ? "" : "s"}
        </span>
      </div>
      {pods.map((pod) => (
        <PodSection key={pod.id} podId={pod.id} name={pod.name} area={pod.area} category={pod.category} />
      ))}
    </section>
  );
}

function RewardPoolContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const stock = useAppStore((s) => s.stock);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading the reward pool…</div>;
  }

  const categories = category ? CATEGORIES.filter((c) => c === category) : CATEGORIES;
  const totalLive = REWARD_ITEMS.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-12">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        Live reward pool
      </span>
      <h1 className="mb-3 max-w-[26ch] text-[clamp(28px,4vw,42px)]">
        {totalLive} prizes up for grabs right now
      </h1>
      <p className="mb-10 max-w-[64ch] text-[15px] text-text-soft">
        Every game here runs on fair, equal odds — no merchant can buy a better chance of
        winning. The only place money changes hands is{" "}
        <Link href="/wishes" className="text-accent-deep underline">
          Wishes
        </Link>
        , where brands bid to grant what customers actually asked for.
      </p>

      <BrandWall categoryFilter={category} />

      {categories.map((c) => (
        <CategorySection key={c} category={c} />
      ))}
    </div>
  );
}

export default function RewardPoolPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading…</div>}>
      <RewardPoolContent />
    </Suspense>
  );
}
