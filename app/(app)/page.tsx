"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { CATEGORY_ACCENT, CATEGORY_ICON, MAX_BRANDS_DISPLAYED } from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";

function podOf(podId: string) {
  return PODS.find((p) => p.id === podId)!;
}
function merchantOf(id: string) {
  return MERCHANTS.find((m) => m.id === id)!;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-2xl px-5 py-4">
      <div className="stat-num text-[30px] text-accent-deep">{value}</div>
      <div className="mt-1 text-[12px] tracking-wide text-text-soft uppercase">{label}</div>
    </div>
  );
}

function PrizeCard({ rewardId }: { rewardId: string }) {
  const stock = useAppStore((s) => s.stock);
  const reward = REWARD_ITEMS.find((r) => r.id === rewardId)!;
  const pod = podOf(reward.podId);
  const merchant = merchantOf(reward.merchantId);
  const accent = CATEGORY_ACCENT[pod.category];
  const remaining = stock[reward.id] ?? 0;
  const pct = Math.round((remaining / reward.totalStock) * 100);
  const low = remaining > 0 && (pct <= 25 || remaining <= 5);
  const out = remaining === 0;

  return (
    <Link
      href={`/play/${pod.id}`}
      className="prize-card flex flex-col gap-3 p-4"
      style={{ borderColor: low ? `var(--${accent})` : undefined, opacity: out ? 0.5 : 1 }}
    >
      <span className="wash" style={{ background: `var(--${accent})` }} />

      <div className="relative flex items-start gap-3">
        <span className="prize-icon">{reward.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[14.5px] leading-snug font-semibold">{reward.label}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-text-soft">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: `var(--${accent})` }}
            />
            {pod.category}
          </div>
        </div>
        {low && !out && (
          <span
            className="shimmer rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
            style={{ background: `var(--${accent})` }}
          >
            HOT
          </span>
        )}
        {out && (
          <span className="rounded-full bg-text-soft px-2 py-0.5 text-[9px] font-bold text-surface-raised">
            GONE
          </span>
        )}
      </div>

      <div className="relative flex items-center gap-2">
        <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="sm" />
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold">{merchant.name}</div>
          <div className="truncate text-[10.5px] text-text-soft">{pod.area}</div>
        </div>
      </div>

      <div className="relative mt-auto">
        <div className="mb-1 flex items-center justify-between text-[10.5px] text-text-soft">
          <span className="mono font-semibold" style={{ color: `var(--${accent})` }}>
            {remaining} left
          </span>
          <span className="mono">of {reward.totalStock}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `var(--${accent})` }} />
        </div>
      </div>
    </Link>
  );
}

/** Teaser row — the full directory now lives on /brands. */
function BrandStrip({ category }: { category: string | null }) {
  const stock = useAppStore((s) => s.stock);

  const top = MERCHANTS.map((m) => {
    const pod = podOf(m.podId);
    const prizes = REWARD_ITEMS.filter((r) => r.merchantId === m.id).reduce(
      (sum, r) => sum + (stock[r.id] ?? 0),
      0
    );
    return { merchant: m, pod, prizes };
  })
    .filter((b) => !category || b.pod.category === category)
    .sort((a, b) => b.prizes - a.prizes)
    .slice(0, 8);

  return (
    <div className="mb-14">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-[19px]">Who&rsquo;s stocking the pool</h2>
          <p className="text-[12.5px] text-text-soft">
            {MERCHANTS.length} of {MAX_BRANDS_DISPLAYED} brand spots are filled.
          </p>
        </div>
        <Link href="/brands" className="text-[12.5px] font-semibold text-accent-deep underline">
          All brands →
        </Link>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(202px,1fr))" }}>
        {top.map(({ merchant, pod, prizes }) => (
          <Link
            key={merchant.id}
            href={`/brands/${merchant.id}`}
            className="brand-tile"
            title={`${merchant.name} · ${prizes} prizes live`}
          >
            <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold leading-tight">{merchant.name}</span>
              <span className="mono block text-[10px] text-text-soft">{prizes} live</span>
            </span>
            <span
              className="h-6 w-1 flex-none rounded-full"
              style={{ background: `var(--${CATEGORY_ACCENT[pod.category]})` }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

function RewardPoolContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const stock = useAppStore((s) => s.stock);
  const wishes = useAppStore((s) => s.wishes);
  const [sortBy, setSortBy] = useState<"rarest" | "biggest">("rarest");

  const rewards = useMemo(() => {
    const inCategory = REWARD_ITEMS.filter(
      (r) => !category || podOf(r.podId).category === category
    );
    const withStock = inCategory.map((r) => ({ r, left: stock[r.id] ?? 0 }));
    withStock.sort((a, b) => {
      if (a.left === 0 !== (b.left === 0)) return a.left === 0 ? 1 : -1;
      return sortBy === "rarest" ? a.left - b.left : b.left - a.left;
    });
    return withStock.map((x) => x.r);
  }, [category, stock, sortBy]);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading the reward pool…</div>;
  }

  const totalLive = REWARD_ITEMS.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  const openWishes = wishes.filter((w) => w.status !== "fulfilled").length;

  return (
    <div className="relative">
      <div className="aurora" />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
          Live reward pool
        </span>
        <h1 className="max-w-[18ch] text-[clamp(34px,6vw,64px)] leading-[1.02] font-semibold">
          {totalLive.toLocaleString("en-IN")} prizes, and none of them are rigged.
        </h1>
        <p className="mt-5 max-w-[60ch] text-[16px] text-text-soft">
          Every game runs on fair odds — a brand&rsquo;s spend can&rsquo;t buy better ones. The
          only place money moves is{" "}
          <Link href="/wishes" className="font-semibold text-accent-deep underline decoration-accent/40 underline-offset-2">
            Wishes
          </Link>
          , where brands outbid each other for the right to grant what you asked for.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/games" className="btn-primary rounded-full px-6 py-3 text-[14px] font-semibold">
            🎮 Play a game
          </Link>
          <Link
            href="/wishes"
            className="rounded-full border border-border bg-surface-raised px-6 py-3 text-[14px] font-semibold transition-colors hover:border-accent"
          >
            ✨ Make a wish
          </Link>
        </div>

        <div className="mt-9 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          <Stat value={totalLive.toLocaleString("en-IN")} label="Prizes live" />
          <Stat value={String(MERCHANTS.length)} label="Brands sponsoring" />
          <Stat value={String(PODS.length)} label="Neighbourhood pods" />
          <Stat value={String(openWishes)} label="Wishes open" />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1180px] px-6 pb-20">
        <BrandStrip category={category} />

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-8">
          <div>
            <h2 className="text-[20px]">
              {category ? `${CATEGORY_ICON[category]} ${category} prizes` : "Every prize on the board"}
            </h2>
            <p className="text-[12.5px] text-text-soft">
              {rewards.length} rewards · one grid, every category, no sorting into silos.
            </p>
          </div>
          <div className="flex gap-1.5">
            {(["rarest", "biggest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  sortBy === s ? "bg-text text-surface" : "bg-surface-sunken text-text-soft hover:text-text"
                }`}
              >
                {s === "rarest" ? "🔥 Rarest first" : "Biggest pool"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))" }}>
          {rewards.map((r) => (
            <PrizeCard key={r.id} rewardId={r.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RewardPoolPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading…</div>}>
      <RewardPoolContent />
    </Suspense>
  );
}
