"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { CATEGORY_ACCENT, CATEGORY_ICON, WISH_PACK_SINGLE, WISH_PACK_BULK } from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { WishBidButton } from "@/components/app/WishBidding";
import { LoveButton } from "@/components/app/LoveButton";

function timeAgo(iso: string) {
  const hrs = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function BrandProfilePage() {
  const params = useParams<{ brandId: string }>();
  const hydrated = useHasHydrated();
  const stock = useAppStore((s) => s.stock);
  const wallets = useAppStore((s) => s.wallets);
  const loves = useAppStore((s) => s.loves);
  const wishes = useAppStore((s) => s.wishes);
  const topUpWallet = useAppStore((s) => s.topUpWallet);

  const brand = MERCHANTS.find((m) => m.id === params.brandId);
  const pod = brand ? PODS.find((p) => p.id === brand.podId) : undefined;

  const biddable = useMemo(() => {
    if (!pod) return [];
    return wishes
      .filter((w) => w.category === pod.category && w.status !== "fulfilled")
      .sort((a, b) => b.claimPrice - a.claimPrice || b.upvotes - a.upvotes);
  }, [wishes, pod]);

  if (!brand || !pod) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center text-text-soft">
        No brand at this address.{" "}
        <Link href="/brands" className="text-accent-deep underline">
          Back to all brands
        </Link>
        .
      </div>
    );
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-[960px] px-6 py-24 text-text-soft">Loading brand…</div>;
  }

  const accent = CATEGORY_ACCENT[pod.category];
  const rewards = REWARD_ITEMS.filter((r) => r.merchantId === brand.id);
  const prizesLive = rewards.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  const balance = wallets[brand.id] ?? 0;
  const granted = wishes.filter((w) => w.status === "fulfilled" && w.claimedByMerchantId === brand.id);
  const holding = wishes.filter((w) => w.status === "claimed" && w.claimedByMerchantId === brand.id);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.35 }} />

      <div className="relative mx-auto max-w-[960px] px-6 pt-10 pb-20">
        <Link href="/brands" className="text-[12.5px] text-text-soft underline">
          ← All brands
        </Link>

        {/* ---- header ---- */}
        <div className="mt-5 mb-8 flex flex-wrap items-center gap-5">
          <BrandLogo id={brand.id} name={brand.name} emoji={brand.emoji} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(26px,4vw,40px)] leading-[1.05] font-semibold">{brand.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span
                className="rounded-full px-2.5 py-1 font-semibold text-white"
                style={{ background: `var(--${accent})` }}
              >
                {CATEGORY_ICON[pod.category]} {pod.category}
              </span>
              <span className="text-text-soft">{pod.name}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <LoveButton brandId={brand.id} size="lg" />
            <Link href={`/play/${pod.id}`} className="btn-primary rounded-full px-5 py-2.5 text-[13px] font-semibold">
              🎮 Play this pod
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[26px] text-accent-deep">{prizesLive}</div>
            <div className="mt-1 text-[11px] tracking-wide text-text-soft uppercase">Prizes live</div>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[26px]" style={{ color: "var(--cat-beauty)" }}>
              {(loves[brand.id] ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-[11px] tracking-wide text-text-soft uppercase">Love received</div>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[26px] text-accent-deep">{holding.length}</div>
            <div className="mt-1 text-[11px] tracking-wide text-text-soft uppercase">Wishes held</div>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[26px] text-accent-deep">{granted.length}</div>
            <div className="mt-1 text-[11px] tracking-wide text-text-soft uppercase">Wishes granted</div>
          </div>
        </div>

        {/* ---- bidding ---- */}
        <div
          className="mb-10 rounded-2xl border border-border bg-surface-raised p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[19px]">Bid on wishes</h2>
            <div className="flex items-center gap-2.5">
              <span className="text-[11.5px] text-text-soft">Wish credits</span>
              <span className="mono text-[18px] font-bold text-accent-deep">₹{balance}</span>
              <button
                onClick={() => topUpWallet(brand.id, "single")}
                className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold hover:border-accent"
              >
                +₹{WISH_PACK_SINGLE.priceRs}
              </button>
              <button
                onClick={() => topUpWallet(brand.id, "bulk")}
                className="btn-primary rounded-full px-3 py-1.5 text-[11.5px] font-semibold"
              >
                +₹{WISH_PACK_BULK.priceRs}
              </button>
            </div>
          </div>
          <p className="mb-4 text-[12.5px] text-text-soft">
            Open wishes in {pod.category}, ranked by what it costs to take them. Bids are
            final — outbid someone and their money stays spent.
          </p>

          {biddable.length === 0 ? (
            <p className="text-[13px] text-text-soft">No open wishes in this category right now.</p>
          ) : (
            <div className="flex flex-col">
              {biddable.map((w, i) => {
                const holder = w.claimedByMerchantId
                  ? MERCHANTS.find((m) => m.id === w.claimedByMerchantId)
                  : null;
                return (
                  <div
                    key={w.id}
                    className="flex flex-wrap items-center gap-3 border-t border-border py-3.5 first:border-t-0"
                  >
                    <span className="mono w-6 flex-none text-center text-[12px] text-text-soft">#{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px]">
                        <span className="font-semibold">{w.customerName}</span> — &ldquo;{w.text}&rdquo;
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-text-soft">
                        <span className="mono">▲ {w.upvotes}</span>
                        <span>·</span>
                        <span>
                          {holder
                            ? holder.id === brand.id
                              ? "You hold this"
                              : `Held by ${holder.name}`
                            : "Unclaimed"}
                        </span>
                        <span>·</span>
                        <span>{timeAgo(w.createdAtISO)}</span>
                      </div>
                    </div>
                    <span className="mono flex-none text-[15px] font-bold text-accent-deep">
                      {w.claimPrice > 0 ? `₹${w.claimPrice}` : "—"}
                    </span>
                    <WishBidButton wishId={w.id} merchantId={brand.id} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---- prizes ---- */}
        <h2 className="mb-4 text-[19px]">Prizes in the pool</h2>
        <div className="mb-10 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))" }}>
          {rewards.map((r) => {
            const left = stock[r.id] ?? 0;
            const pct = Math.round((left / r.totalStock) * 100);
            return (
              <div key={r.id} className="prize-card flex flex-col gap-3 p-4">
                <span className="wash" style={{ background: `var(--${accent})` }} />
                <div className="relative flex items-start gap-3">
                  <span className="prize-icon">{r.icon}</span>
                  <div className="text-[14.5px] leading-snug font-semibold">{r.label}</div>
                </div>
                <div className="relative mt-auto">
                  <div className="mb-1 flex items-center justify-between text-[10.5px] text-text-soft">
                    <span className="mono font-semibold" style={{ color: `var(--${accent})` }}>
                      {left} left
                    </span>
                    <span className="mono">of {r.totalStock}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `var(--${accent})` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---- granted ---- */}
        {granted.length > 0 && (
          <>
            <h2 className="mb-4 text-[19px]">Wishes granted</h2>
            <div className="flex flex-col gap-2.5">
              {granted.map((w) => (
                <div key={w.id} className="rounded-xl border border-good bg-good-soft px-4 py-3">
                  <div className="text-[13.5px] font-semibold text-good">
                    ✓ {w.customerName} — &ldquo;{w.text}&rdquo;
                  </div>
                  {w.fulfilledRewardLabel && (
                    <div className="mt-0.5 text-[12px] text-good">Granted with: {w.fulfilledRewardLabel}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
