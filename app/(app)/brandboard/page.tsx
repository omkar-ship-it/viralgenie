"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";
import { BRANDBOARD_SPOTS, SPOT_BASE_PRICE, CATEGORY_ACCENT, squareToCell } from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { BiddingAsPicker } from "@/components/app/WishBidding";
import { BoardVariantSwitch } from "@/components/app/BoardVariantSwitch";
import { SpotModal } from "@/components/app/SpotModal";
import { useBrandboard } from "@/components/app/useBrandboard";

export default function BrandboardPage() {
  const hydrated = useHasHydrated();
  const registerBrandClick = useAppStore((s) => s.registerBrandClick);

  const { mounted, ranked, claimed, start, busy, slowing, result, tokenSquare, hopping, startRound } = useBrandboard();
  const [selected, setSelected] = useState<number | null>(null);

  if (!hydrated || !mounted) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Waking the genie…</div>;
  }

  function openPosition(position: number) {
    setSelected(position);
    const entry = ranked[position - 1];
    if (entry) registerBrandClick(entry.merchantId);
  }

  const landedMerchant = result?.merchantId ? MERCHANTS.find((m) => m.id === result.merchantId) : null;
  const tokenCell = squareToCell(tokenSquare);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.42 }} />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {claimed} of {BRANDBOARD_SPOTS} positions taken
          </span>
          <BoardVariantSwitch />
        </div>

        <h1 className="max-w-[17ch] text-[clamp(30px,5vw,54px)] leading-[1.03] font-semibold">
          The highest bid stands first in line.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15.5px] text-text-soft">
          Every brand holds one bid, and the board is simply those bids in order — raise
          yours and the whole board re-ranks around you. No gaps: positions fill from the
          top, and the open slots are always the tail. Once a day the genie does his round
          and stops on whoever he reaches.
        </p>

        <div className="mt-9 grid gap-7" style={{ gridTemplateColumns: "minmax(0,1.35fr) minmax(280px,0.65fr)" }}>
          {/* ---------------- board ---------------- */}
          <div>
            <div className="bb-board">
              {Array.from({ length: BRANDBOARD_SPOTS }, (_, i) => {
                const position = i + 1;
                const entry = ranked[position - 1];
                const merchant = entry ? MERCHANTS.find((m) => m.id === entry.merchantId) : null;
                const pod = merchant ? PODS.find((p) => p.id === merchant.podId) : null;
                const accent = pod ? CATEGORY_ACCENT[pod.category] : null;

                const classes = [
                  "bb-cell",
                  entry ? "" : "open",
                  selected === position ? "selected" : "",
                  !result && position === start ? "candidate" : "",
                  result?.landed === position ? "landed" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={position}
                    className={classes}
                    onClick={() => openPosition(position)}
                    style={
                      accent
                        ? {
                            borderColor:
                              selected === position ? undefined : `color-mix(in srgb, var(--${accent}) 45%, var(--border))`,
                          }
                        : undefined
                    }
                    title={merchant ? `#${position} · ${merchant.name} · ₹${entry!.price}` : `#${position} · open`}
                  >
                    <span className="bb-num">{position}</span>
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
              Position #1 is top-left. Tap any tile to open the brand standing there.
            </p>
          </div>

          {/* ---------------- side panel ---------------- */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-surface-raised p-5" style={{ boxShadow: "var(--shadow)" }}>
              <h2 className="mb-1 text-[18px]">The Genie&rsquo;s Round</h2>

              {!result ? (
                <>
                  <p className="mb-4 text-[12.5px] text-text-soft">
                    He wakes at <span className="mono font-bold text-accent-deep">#{start}</span> — the same position for
                    everyone today — then walks the board. Nobody knows how far he&rsquo;ll go
                    before his feet give out.
                  </p>
                  <div className="mb-4 rounded-xl bg-surface-sunken py-6 text-center">
                    <div className="text-[40px] leading-none">{busy ? "🧞" : "😴"}</div>
                    <div className="mt-2 text-[12.5px] font-semibold">
                      {busy ? (slowing ? "He’s slowing down…" : "Walking…") : "Fast asleep"}
                    </div>
                    {busy && <div className="mono mt-0.5 text-[11px] text-text-soft">now at #{tokenSquare}</div>}
                  </div>
                  <button onClick={startRound} disabled={busy} className="btn-primary w-full rounded-full py-3 text-[14px] font-semibold">
                    {busy ? "He’s off…" : "🧞 Wake the genie"}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-text-soft">One round a day. Make it count.</p>
                </>
              ) : (
                <div className="pop-in">
                  <p className="mb-3 text-[12.5px] text-text-soft">
                    He walked <span className="mono font-bold">{result.steps}</span> positions and stopped at{" "}
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
                    He sleeps again until midnight.
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
              <h2 className="mb-1 text-[18px]">Move up the board</h2>
              <p className="mb-3 text-[12.5px] text-text-soft">
                Tap any tile to open the brand standing there and outbid them. Bids start at
                ₹{SPOT_BASE_PRICE} and are final.
              </p>
              <BiddingAsPicker compact />
            </div>
          </div>
        </div>
      </div>

      <SpotModal position={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
