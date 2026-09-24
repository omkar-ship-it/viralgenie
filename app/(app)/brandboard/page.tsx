"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";
import {
  BRANDBOARD_SPOTS,
  SPOT_BASE_PRICE,
  CATEGORY_ACCENT,
  squareToCell,
} from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { BiddingAsPicker } from "@/components/app/WishBidding";
import { BoardVariantSwitch } from "@/components/app/BoardVariantSwitch";
import { useBrandboard } from "@/components/app/useBrandboard";
import { DieFace } from "@/components/app/DieFace";
import { SpotModal } from "@/components/app/SpotModal";


export default function BrandboardPage() {
  const hydrated = useHasHydrated();
  const spots = useAppStore((s) => s.spots);
  const registerSpotClick = useAppStore((s) => s.registerSpotClick);

  const { mounted, start, die, rolling, busy, result, candidates, tokenSquare, hopping, roll } =
    useBrandboard();

  const [selected, setSelected] = useState<number | null>(null);

  if (!hydrated || !mounted) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Waking the genie…</div>;
  }

  function selectSquare(square: number) {
    setSelected(square);
    registerSpotClick(square);
  }

  const filled = Object.keys(spots).length;
  const landedMerchant = result?.merchantId ? MERCHANTS.find((m) => m.id === result.merchantId) : null;
  const tokenCell = squareToCell(tokenSquare);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.42 }} />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {filled} of {BRANDBOARD_SPOTS} spots claimed
          </span>
          <BoardVariantSwitch />
        </div>

        <h1 className="max-w-[17ch] text-[clamp(30px,5vw,54px)] leading-[1.03] font-semibold">
          One hundred spots. One roll a day.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15.5px] text-text-soft">
          Brands bid for a square on the board. Every day the genie falls asleep on one
          square, you roll once, and he walks to whoever is standing there — you take a
          prize from that brand. He won&rsquo;t stop on an empty lot, he just keeps walking,
          so the more squares a brand holds the more often he lands on it.
        </p>

        <div className="mt-9 grid gap-7" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(280px,0.65fr)" }}>
          {/* ---------------- board ---------------- */}
          <div>
            <div className="bb-board">
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
                  "bb-cell",
                  spot ? "" : "open",
                  selected === square ? "selected" : "",
                  candidates.includes(square) ? "candidate" : "",
                  result?.landed === square ? "landed" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={square}
                    className={classes}
                    onClick={() => selectSquare(square)}
                    style={
                      accent
                        ? {
                            borderColor:
                              selected === square ? undefined : `color-mix(in srgb, var(--${accent}) 45%, var(--border))`,
                          }
                        : undefined
                    }
                    title={merchant ? `#${square} · ${merchant.name} · ₹${spot!.price}` : `#${square} · open spot`}
                  >
                    <span className="bb-num">{square}</span>
                    {merchant ? (
                      <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="sm" />
                    ) : (
                      <span className="text-[15px] text-text-soft opacity-45">+</span>
                    )}
                  </button>
                );
              })}

              <span
                className={`bb-token ${hopping ? "hopping" : ""}`}
                // 10px padding, 4px gap: a cell is (100% - 20px - 9*4px)/10 wide
                // and each column starts one cell + one gap further along.
                style={{
                  left: `calc(10px + ${tokenCell.col} * ((100% - 56px) / 10 + 4px))`,
                  top: `calc(10px + ${tokenCell.row} * ((100% - 56px) / 10 + 4px))`,
                  width: `calc((100% - 56px) / 10)`,
                  height: `calc((100% - 56px) / 10)`,
                }}
                aria-hidden="true"
              >
                🧞
              </span>
            </div>
            <p className="mt-3 text-center text-[11.5px] text-text-soft">
              Square 1 is bottom-left — the board snakes upward, just like the one you grew up with.
            </p>
          </div>

          {/* ---------------- side panel ---------------- */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-surface-raised p-5" style={{ boxShadow: "var(--shadow)" }}>
              <h2 className="mb-1 text-[18px]">Your daily roll</h2>

              {!result ? (
                <>
                  <p className="mb-4 text-[12.5px] text-text-soft">
                    Tonight the genie sleeps on <span className="mono font-bold text-accent-deep">#{start}</span>. Roll
                    and he walks 1–6 squares — the gold squares are where he could land, and
                    he&rsquo;ll keep going if he finds an empty lot.
                  </p>
                  <div className="mb-4 flex items-center justify-center">
                    <DieFace value={die} size={68} rolling={rolling} />
                  </div>
                  <button onClick={roll} disabled={busy} className="btn-primary w-full rounded-full py-3 text-[14px] font-semibold">
                    {rolling ? "Rolling…" : "🎲 Roll the dice"}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-text-soft">One roll per day. Make it count.</p>
                </>
              ) : (
                <div className="pop-in">
                  <p className="mb-3 text-[12.5px] text-text-soft">
                    You rolled onto <span className="mono font-bold">#{result.rolled}</span>
                    {result.passed > 0 ? (
                      <>
                        , and the genie walked past {result.passed} empty{" "}
                        {result.passed === 1 ? "lot" : "lots"} to{" "}
                      </>
                    ) : (
                      <> and the genie stopped on </>
                    )}
                    <span className="mono font-bold text-accent-deep">#{result.landed}</span>.
                  </p>
                  {result.rewardLabel ? (
                    <div className="rounded-xl border border-gold bg-surface p-4 text-center">
                      <div className="text-[11px] tracking-wide text-text-soft uppercase">You won</div>
                      <div className="mt-1 text-[17px] font-semibold">{result.rewardLabel}</div>
                      {landedMerchant && (
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <BrandLogo id={landedMerchant.id} name={landedMerchant.name} emoji={landedMerchant.emoji} size="sm" />
                          <span className="text-[12px] text-text-soft">{landedMerchant.name}</span>
                        </div>
                      )}
                      <div className="mono mt-3 inline-block rounded-lg bg-surface-sunken px-3 py-1.5 text-[13px] font-bold text-accent-deep">
                        {result.redemptionCode}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-[13px] text-text-soft">
                      {result.note}
                    </div>
                  )}
                  <p className="mt-3 text-center text-[11.5px] text-text-soft">
                    That&rsquo;s your roll for today — the genie sleeps again at midnight.
                  </p>
                  {result.rewardLabel && (
                    <Link
                      href="/wallet"
                      className="mt-3 block rounded-full border border-border py-2.5 text-center text-[12.5px] font-semibold hover:border-accent"
                    >
                      View in My Rewards
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-surface-raised p-5" style={{ boxShadow: "var(--shadow)" }}>
              <h2 className="mb-1 text-[18px]">Claim a spot</h2>
              <p className="mb-3 text-[12.5px] text-text-soft">
                Tap any square to open the brand standing there — their links, their prizes,
                and what it costs to take the square. Open spots start at ₹{SPOT_BASE_PRICE}.
              </p>
              <BiddingAsPicker compact />
            </div>
          </div>
        </div>
      </div>

      <SpotModal square={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
