"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import {
  BRANDBOARD_SPOTS,
  SPOT_BASE_PRICE,
  SPOT_INCREMENT,
  CATEGORY_ACCENT,
  BRAND_TAGLINE,
  squareToCell,
} from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { BiddingAsPicker } from "@/components/app/WishBidding";
import { BoardVariantSwitch } from "@/components/app/BoardVariantSwitch";
import { useBrandboard } from "@/components/app/useBrandboard";
import { DieFace } from "@/components/app/DieFace";

const ROW_H = 152;
const GAP = 6;
const PAD = 12;

export default function BigBrandboardPage() {
  const hydrated = useHasHydrated();
  const spots = useAppStore((s) => s.spots);
  const stock = useAppStore((s) => s.stock);
  const wallets = useAppStore((s) => s.wallets);
  const spotClicks = useAppStore((s) => s.spotClicks);
  const activeMerchantId = useAppStore((s) => s.activeMerchantId);
  const claimSpot = useAppStore((s) => s.claimSpot);
  const registerSpotClick = useAppStore((s) => s.registerSpotClick);

  const { mounted, start, die, rolling, busy, result, candidates, tokenSquare, hopping, roll } =
    useBrandboard();

  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  if (!hydrated || !mounted) {
    return <div className="mx-auto max-w-[1460px] px-6 py-24 text-text-soft">Waking the genie…</div>;
  }

  function selectSquare(square: number) {
    setSelected(square);
    registerSpotClick(square);
  }

  function bidOnSpot(square: number) {
    const res = claimSpot(square, activeMerchantId);
    setFeedback(res);
    window.setTimeout(() => setFeedback(null), 4000);
  }

  function rewardsFor(merchantId: string) {
    return REWARD_ITEMS.filter((r) => r.merchantId === merchantId).reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  }

  const filled = Object.keys(spots).length;
  const totalClicks = Object.values(spotClicks).reduce((a, b) => a + b, 0);
  const landedMerchant = result?.merchantId ? MERCHANTS.find((m) => m.id === result.merchantId) : null;
  const selectedSpot = selected ? spots[selected] : undefined;
  const selectedMerchant = selectedSpot ? MERCHANTS.find((m) => m.id === selectedSpot.merchantId) : null;
  const nextSpotPrice = selectedSpot ? selectedSpot.price + SPOT_INCREMENT : SPOT_BASE_PRICE;
  const tokenCell = squareToCell(tokenSquare);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.42 }} />

      <div className="relative mx-auto max-w-[1460px] px-6 pt-12 pb-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {filled} of {BRANDBOARD_SPOTS} claimed · {totalClicks.toLocaleString("en-IN")} clicks
          </span>
          <BoardVariantSwitch />
        </div>

        <h1 className="max-w-[20ch] text-[clamp(30px,5vw,52px)] leading-[1.03] font-semibold">
          One hundred storefronts. One roll a day.
        </h1>
        <p className="mt-4 max-w-[70ch] text-[15.5px] text-text-soft">
          Same board, bigger windows: every claimed square shows the brand behind it — who
          they are, what they do, how many people have looked, and how many prizes are still
          on the shelf. Tap a square to inspect it; roll once a day to see where the genie
          walks.
        </p>

        {/* ---------------- control bar ---------------- */}
        <div
          className="mt-8 flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-surface-raised px-5 py-4"
          style={{ boxShadow: "var(--shadow)" }}
        >
          {!result ? (
            <>
              <DieFace value={die} size={54} rolling={rolling} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold">Your daily roll</div>
                <p className="text-[12.5px] text-text-soft">
                  The genie sleeps on <span className="mono font-bold text-accent-deep">#{start}</span> tonight — gold
                  tiles are where he could land, and he walks on past empty lots.
                </p>
              </div>
              <button onClick={roll} disabled={busy} className="btn-primary rounded-full px-7 py-3 text-[14px] font-semibold">
                {rolling ? "Rolling…" : "🎲 Roll the dice"}
              </button>
            </>
          ) : (
            <div className="pop-in flex w-full flex-wrap items-center gap-4">
              <span className="text-[34px] leading-none">{result.rewardLabel ? "🎉" : "😅"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-text-soft">
                  You rolled onto <span className="mono font-bold">#{result.rolled}</span>
                  {result.passed > 0 ? (
                    <>
                      , the genie walked past {result.passed} empty {result.passed === 1 ? "lot" : "lots"} and stopped on{" "}
                    </>
                  ) : (
                    <> and the genie stopped on </>
                  )}
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

        {/* ---------------- spot inspector ---------------- */}
        <div
          className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface-raised px-5 py-3.5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <BiddingAsPicker compact />

          {selected === null ? (
            <p className="text-[12.5px] text-text-soft">
              Tap any tile to inspect it — open spots start at ₹{SPOT_BASE_PRICE}.
            </p>
          ) : (
            <>
              <span className="mono text-[15px] font-bold text-accent-deep">#{selected}</span>
              {selectedMerchant ? (
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <BrandLogo id={selectedMerchant.id} name={selectedMerchant.name} emoji={selectedMerchant.emoji} size="sm" />
                  <div className="min-w-0">
                    <Link href={`/brands/${selectedMerchant.id}`} className="block truncate text-[13px] font-semibold hover:underline">
                      {selectedMerchant.name}
                    </Link>
                    <div className="mono truncate text-[11px] text-text-soft">
                      👆 {(spotClicks[selected] ?? 0).toLocaleString("en-IN")} clicks · 🎁 {rewardsFor(selectedMerchant.id)} rewards ·
                      held at ₹{selectedSpot!.price}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="min-w-0 flex-1 text-[12.5px] text-text-soft">Open spot — nobody here yet</span>
              )}
              <button
                onClick={() => bidOnSpot(selected)}
                disabled={(wallets[activeMerchantId] ?? 0) < nextSpotPrice}
                className="btn-primary rounded-full px-5 py-2.5 text-[12.5px] font-semibold"
              >
                {selectedSpot ? `Outbid · ₹${nextSpotPrice}` : `Claim · ₹${nextSpotPrice}`}
              </button>
            </>
          )}

          {feedback && (
            <span className={`text-[11.5px] font-semibold ${feedback.ok ? "text-good" : "text-warn"}`}>
              {feedback.message}
            </span>
          )}
        </div>

        {/* ---------------- board ---------------- */}
        <div className="bbx-board mt-6">
          {Array.from({ length: 100 }, (_, cellIndex) => {
            const row = Math.floor(cellIndex / 10);
            const col = cellIndex % 10;
            const rowFromBottom = 9 - row;
            const withinRow = rowFromBottom % 2 === 0 ? col : 9 - col;
            const square = rowFromBottom * 10 + withinRow + 1;

            const spot = spots[square];
            const merchant = spot ? MERCHANTS.find((m) => m.id === spot.merchantId) : null;
            const pod = merchant ? PODS.find((p) => p.id === merchant.podId) : null;
            const accent = pod ? CATEGORY_ACCENT[pod.category] : null;

            const classes = [
              "bbx-cell",
              spot ? "" : "open",
              selected === square ? "selected" : "",
              candidates.includes(square) ? "candidate" : "",
              result?.landed === square ? "landed" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button key={square} className={classes} onClick={() => selectSquare(square)}>
                {accent && <span className="bbx-accent" style={{ background: `var(--${accent})` }} />}
                <span className="bbx-num">{square}</span>

                {merchant ? (
                  <>
                    <span className="bbx-price">₹{spot!.price}</span>
                    <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="md" />
                    <span className="bbx-name">{merchant.name}</span>
                    <span className="bbx-desc">{BRAND_TAGLINE[merchant.id] ?? pod?.category}</span>
                    <span className="bbx-stats">
                      <span title="tile clicks">👆 {(spotClicks[square] ?? 0).toLocaleString("en-IN")}</span>
                      <span style={{ color: `var(--${accent})` }} title="rewards live">
                        🎁 {rewardsFor(merchant.id)}
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[22px] text-text-soft opacity-40">+</span>
                    <span className="text-[10.5px] font-semibold text-text-soft">Open spot</span>
                    <span className="mono text-[10px] text-text-soft">₹{SPOT_BASE_PRICE}</span>
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
          Square 1 is bottom-left — the board snakes upward. 👆 is how many times a tile has
          been opened, 🎁 is how many prizes that brand still has on the shelf.
        </p>
      </div>
    </div>
  );
}
