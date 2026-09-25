"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import {
  BRANDBOARD_SPOTS,
  SPOT_BASE_PRICE,
  CATEGORY_ACCENT,
  BRAND_TAGLINE,
  squareToCell,
} from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { BiddingAsPicker } from "@/components/app/WishBidding";
import { BoardVariantSwitch } from "@/components/app/BoardVariantSwitch";
import { SpotModal } from "@/components/app/SpotModal";
import { useBrandboard } from "@/components/app/useBrandboard";

const ROW_H = 152;
const GAP = 6;
const PAD = 12;

export default function BigBrandboardPage() {
  const hydrated = useHasHydrated();
  const stock = useAppStore((s) => s.stock);
  const brandClicks = useAppStore((s) => s.brandClicks);
  const registerBrandClick = useAppStore((s) => s.registerBrandClick);

  const { mounted, ranked, claimed, start, busy, slowing, result, tokenSquare, hopping, startRound } = useBrandboard();
  const [selected, setSelected] = useState<number | null>(null);

  if (!hydrated || !mounted) {
    return <div className="mx-auto max-w-[1460px] px-6 py-24 text-text-soft">Waking the genie…</div>;
  }

  function openPosition(position: number) {
    setSelected(position);
    const entry = ranked[position - 1];
    if (entry) registerBrandClick(entry.merchantId);
  }

  function rewardsFor(merchantId: string) {
    return REWARD_ITEMS.filter((r) => r.merchantId === merchantId).reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  }

  const totalClicks = Object.values(brandClicks).reduce((a, b) => a + b, 0);
  const landedMerchant = result?.merchantId ? MERCHANTS.find((m) => m.id === result.merchantId) : null;
  const tokenCell = squareToCell(tokenSquare);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.42 }} />

      <div className="relative mx-auto max-w-[1460px] px-6 pt-12 pb-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {claimed} of {BRANDBOARD_SPOTS} taken · {totalClicks.toLocaleString("en-IN")} clicks
          </span>
          <BoardVariantSwitch />
        </div>

        <h1 className="max-w-[20ch] text-[clamp(30px,5vw,52px)] leading-[1.03] font-semibold">
          The highest bid stands first in line.
        </h1>
        <p className="mt-4 max-w-[70ch] text-[15.5px] text-text-soft">
          One bid per brand, sorted highest first — raise yours and the board re-ranks
          around you. Positions fill from the top, so there are never gaps in between. Every
          tile shows who&rsquo;s standing there, what they do, how many people have looked and
          what&rsquo;s still on their shelf.
        </p>

        {/* ---------------- the round ---------------- */}
        <div
          className="mt-8 flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-surface-raised px-5 py-4"
          style={{ boxShadow: "var(--shadow)" }}
        >
          {!result ? (
            <>
              <span className="text-[38px] leading-none">{busy ? "🧞" : "😴"}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">
                  The Genie&rsquo;s Round
                  {busy && (
                    <span className="mono ml-2 text-[12px] font-normal text-text-soft">
                      {slowing ? "slowing down…" : "walking…"} now at #{tokenSquare}
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] text-text-soft">
                  He wakes at <span className="mono font-bold text-accent-deep">#{start}</span> — same for everyone
                  today — then walks until his feet give out. Nobody knows how far.
                </p>
              </div>
              <button onClick={startRound} disabled={busy} className="btn-primary rounded-full px-7 py-3 text-[14px] font-semibold">
                {busy ? "He's off…" : "🧞 Wake the genie"}
              </button>
            </>
          ) : (
            <div className="pop-in flex w-full flex-wrap items-center gap-4">
              <span className="text-[34px] leading-none">{result.rewardLabel ? "🎉" : "😅"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-text-soft">
                  He walked <span className="mono font-bold">{result.steps}</span> positions and stopped at{" "}
                  <span className="mono font-bold text-accent-deep">#{result.landed}</span>.
                </p>
                {result.rewardLabel ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2.5">
                    {landedMerchant && (
                      <BrandLogo id={landedMerchant.id} name={landedMerchant.name} emoji={landedMerchant.emoji} size="sm" />
                    )}
                    <span className="text-[16px] font-semibold">{result.rewardLabel}</span>
                    <span className="text-[12.5px] text-text-soft">from {landedMerchant?.name}</span>
                    <span className="mono rounded-lg bg-surface-sunken px-3 py-1 text-[13px] font-bold text-accent-deep">
                      {result.redemptionCode}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-[13px] text-text-soft">{result.note}</p>
                )}
              </div>
              {result.rewardLabel && (
                <Link
                  href="/wallet"
                  className="rounded-full border border-border px-5 py-2.5 text-[12.5px] font-semibold hover:border-accent"
                >
                  View in My Rewards
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ---------------- bidding identity ---------------- */}
        <div
          className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface-raised px-5 py-3.5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <BiddingAsPicker compact />
          <p className="text-[12.5px] text-text-soft">
            Tap any tile to open that brand and outbid them — bids start at ₹{SPOT_BASE_PRICE}{" "}
            and the board re-ranks the moment one lands.
          </p>
        </div>

        {/* ---------------- board ---------------- */}
        <div className="bbx-board mt-6">
          {Array.from({ length: BRANDBOARD_SPOTS }, (_, i) => {
            const position = i + 1;
            const entry = ranked[position - 1];
            const merchant = entry ? MERCHANTS.find((m) => m.id === entry.merchantId) : null;
            const pod = merchant ? PODS.find((p) => p.id === merchant.podId) : null;
            const accent = pod ? CATEGORY_ACCENT[pod.category] : null;

            const classes = [
              "bbx-cell",
              entry ? "" : "open",
              selected === position ? "selected" : "",
              !result && position === start ? "candidate" : "",
              result?.landed === position ? "landed" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button key={position} className={classes} onClick={() => openPosition(position)}>
                {accent && <span className="bbx-accent" style={{ background: `var(--${accent})` }} />}
                <span className="bbx-num">#{position}</span>

                {merchant ? (
                  <>
                    <span className="bbx-price">₹{entry!.price}</span>
                    <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="md" />
                    <span className="bbx-name">{merchant.name}</span>
                    <span className="bbx-desc">{BRAND_TAGLINE[merchant.id] ?? pod?.category}</span>
                    <span className="bbx-stats">
                      <span title="brand clicks">👆 {(brandClicks[merchant.id] ?? 0).toLocaleString("en-IN")}</span>
                      <span style={{ color: `var(--${accent})` }} title="rewards live">
                        🎁 {rewardsFor(merchant.id)}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[22px] text-text-soft opacity-40">+</span>
                    <span className="text-[10.5px] font-semibold text-text-soft">Open</span>
                    <span className="mono text-[10px] text-text-soft">from ₹{SPOT_BASE_PRICE}</span>
                  </>
                )}
              </button>
            );
          })}

          <span
            className={`bbx-token ${hopping ? "hopping" : ""}`}
            style={{
              left: `calc(${PAD}px + ${tokenCell.col} * ((100% - ${2 * PAD + 9 * GAP}px) / 10 + ${GAP}px))`,
              top: `${PAD + tokenCell.row * (ROW_H + GAP)}px`,
              width: `calc((100% - ${2 * PAD + 9 * GAP}px) / 10)`,
              height: `${ROW_H}px`,
            }}
            aria-hidden="true"
          >
            🧞
          </span>
        </div>

        <p className="mt-3 text-center text-[11.5px] text-text-soft">
          Position #1 is top-left, ranked by live bid. 👆 is how many times a brand has been
          opened, 🎁 is what they still have on the shelf.
        </p>
      </div>

      <SpotModal position={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
