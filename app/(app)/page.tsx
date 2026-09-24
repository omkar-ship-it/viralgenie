"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { MAX_ODDS_SHARE } from "@/lib/data";

function merchantById(id: string) {
  return MERCHANTS.find((m) => m.id === id)!;
}

function PodSection({ podId, name, area }: { podId: string; name: string; area: string }) {
  const bids = useAppStore((s) => s.bids);
  const stock = useAppStore((s) => s.stock);
  const ranking = useMemo(
    () =>
      bids
        .filter((b) => b.podId === podId && b.price > 0)
        .sort((a, b) => b.price - a.price),
    [bids, podId]
  );

  const rankedIds = new Set(ranking.map((r) => r.merchantId));
  const totalPrice = ranking.reduce((sum, r) => sum + r.price, 0) || 1;
  const priceByMerchant = new Map(ranking.map((r) => [r.merchantId, r.price]));

  const rewards = REWARD_ITEMS.filter((r) => r.podId === podId && rankedIds.has(r.merchantId));
  const totalPrizes = rewards.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  const leaderId = ranking[0]?.merchantId;

  return (
    <section className="mb-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px]">{name}</h2>
          <p className="mt-1 text-[13.5px] text-text-soft">
            {rewards.length > 0
              ? `${totalPrizes} prizes live across ${ranking.length} sponsor${ranking.length === 1 ? "" : "s"} · ${area}`
              : `No sponsor holds a rank here yet · ${area}`}
          </p>
        </div>
        <Link
          href={`/play/${podId}`}
          className={`rounded-full px-5 py-2.5 text-[13px] font-semibold text-white ${
            rewards.length === 0 ? "pointer-events-none opacity-40" : ""
          }`}
          style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))", boxShadow: "var(--shadow)" }}
        >
          Rub the Lamp ✨
        </Link>
      </div>

      {rewards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-[13.5px] text-text-soft">
          This pod is empty — no merchant has bid for rank here yet. Visit the Merchant
          Console to be the first to hold #1.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {rewards.map((r) => {
            const merchant = merchantById(r.merchantId);
            const remaining = stock[r.id] ?? 0;
            const isLeader = r.merchantId === leaderId;
            const price = priceByMerchant.get(r.merchantId) ?? 0;
            const odds = Math.round(Math.min(MAX_ODDS_SHARE, price / totalPrice) * 100);
            return (
              <div
                key={r.id}
                className={`flex flex-col gap-2.5 rounded-2xl border bg-surface-raised p-4 ${
                  isLeader ? "border-gold" : "border-border"
                }`}
                style={{
                  boxShadow: "var(--shadow)",
                  background: isLeader
                    ? "linear-gradient(150deg, var(--surface-sunken), var(--surface-raised))"
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-[18px] leading-none">{merchant.emoji}</span>
                  <span className="font-semibold">{merchant.name}</span>
                  {isLeader && (
                    <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-[#241705]">
                      #1
                    </span>
                  )}
                </div>
                <div className="text-[14px] font-semibold leading-snug">{r.label}</div>
                <div className="mt-auto flex items-center justify-between text-[11px] text-text-soft">
                  <span>{remaining} left</span>
                  <span className="mono text-good">{odds}% odds</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.min(100, (remaining / r.totalStock) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function RewardPoolPage() {
  const hydrated = useHasHydrated();

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading the reward pool…</div>;
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-12">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        Live reward pool
      </span>
      <h1 className="mb-3 max-w-[24ch] text-[clamp(28px,4vw,40px)]">
        Every prize on the board right now
      </h1>
      <p className="mb-12 max-w-[62ch] text-[15px] text-text-soft">
        Rank is bought, not scheduled — a merchant&rsquo;s odds share here rises the moment
        they take #1 in the Merchant Console, and falls the moment someone outbids them.
        Play any pod below to try for its prizes.
      </p>

      {PODS.map((pod) => (
        <PodSection key={pod.id} podId={pod.id} name={pod.name} area={pod.area} />
      ))}
    </div>
  );
}
