"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import {
  BRANDBOARD_SPOTS,
  SPOT_BASE_PRICE,
  SPOT_INCREMENT,
  CATEGORY_ACCENT,
  genieStartSquare,
  squareToCell,
} from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { BiddingAsPicker } from "@/components/app/WishBidding";

const PIP_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/** Module scope so the randomness never sits in render-phase code. */
function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function playKey() {
  return `viralgenie-brandboard-${todayKey()}`;
}

type DailyResult = {
  rolled: number;
  landed: number;
  passed: number;
  merchantId?: string;
  rewardLabel?: string;
  redemptionCode?: string;
  note?: string;
};

function readToday(): DailyResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(playKey());
    return raw ? (JSON.parse(raw) as DailyResult) : null;
  } catch {
    return null;
  }
}

export default function BrandboardPage() {
  const hydrated = useHasHydrated();
  const spots = useAppStore((s) => s.spots);
  const stock = useAppStore((s) => s.stock);
  const wallets = useAppStore((s) => s.wallets);
  const activeMerchantId = useAppStore((s) => s.activeMerchantId);
  const claimSpot = useAppStore((s) => s.claimSpot);
  const playBrand = useAppStore((s) => s.playBrand);

  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<DailyResult | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [die, setDie] = useState(1);
  const [tokenSquare, setTokenSquare] = useState(1);
  const [hopping, setHopping] = useState(false);
  const [busy, setBusy] = useState(false);

  const start = genieStartSquare(todayKey());

  useEffect(() => {
    // localStorage + today's date are client-only; read after mount so the
    // prerendered shell and the first client paint agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = readToday();
    if (saved) {
      setResult(saved);
      setTokenSquare(saved.landed);
    } else {
      setTokenSquare(genieStartSquare(todayKey()));
    }
  }, []);

  if (!hydrated || !mounted) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Waking the genie…</div>;
  }

  const playedToday = result !== null;
  const candidates = playedToday ? [] : Array.from({ length: 6 }, (_, i) => ((start - 1 + i + 1) % BRANDBOARD_SPOTS) + 1);

  function roll() {
    if (playedToday || busy) return;
    setBusy(true);
    setRolling(true);
    setFeedback(null);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const value = rollDie();

    const shuffle = window.setInterval(() => setDie(rollDie()), 80);

    window.setTimeout(
      () => {
        window.clearInterval(shuffle);
        setDie(value);
        setRolling(false);
        walk(value, reduced);
      },
      reduced ? 0 : 900
    );
  }

  /** A square only stops the genie if someone's home with something to give. */
  function isHome(square: number) {
    const spot = spots[square];
    if (!spot) return false;
    return REWARD_ITEMS.some((r) => r.merchantId === spot.merchantId && (stock[r.id] ?? 0) > 0);
  }

  function walk(steps: number, reduced: boolean) {
    const rolled = ((start - 1 + steps) % BRANDBOARD_SPOTS) + 1;

    // The genie won't settle on an empty lot — he keeps walking until he
    // finds a brand at home, so a single daily roll is never wasted.
    let resting = rolled;
    let passed = 0;
    while (!isHome(resting) && passed < BRANDBOARD_SPOTS) {
      resting = (resting % BRANDBOARD_SPOTS) + 1;
      passed++;
    }

    const totalHops = steps + passed;
    const stepMs = reduced ? 0 : 240;

    for (let i = 1; i <= totalHops; i++) {
      window.setTimeout(() => {
        setTokenSquare(((start - 1 + i) % BRANDBOARD_SPOTS) + 1);
        setHopping(true);
        window.setTimeout(() => setHopping(false), 200);
      }, i * stepMs);
    }
    window.setTimeout(() => land(rolled, resting, passed), totalHops * stepMs + 260);
  }

  function land(rolled: number, resting: number, passed: number) {
    const spot = spots[resting];
    let outcome: DailyResult;

    if (!spot) {
      outcome = { rolled, landed: resting, passed, note: "Every brand on the board is out of stock today — come back tomorrow." };
    } else {
      const prize = playBrand(spot.merchantId);
      outcome = prize
        ? { rolled, landed: resting, passed, merchantId: spot.merchantId, rewardLabel: prize.rewardLabel, redemptionCode: prize.redemptionCode }
        : { rolled, landed: resting, passed, merchantId: spot.merchantId, note: "That brand just ran dry — bad luck." };
    }

    setResult(outcome);
    window.localStorage.setItem(playKey(), JSON.stringify(outcome));
    setBusy(false);
  }

  function bidOnSpot(square: number) {
    const res = claimSpot(square, activeMerchantId);
    setFeedback(res);
    window.setTimeout(() => setFeedback(null), 4000);
  }

  const filled = Object.keys(spots).length;
  const landedMerchant = result?.merchantId ? MERCHANTS.find((m) => m.id === result.merchantId) : null;
  const selectedSpot = selected ? spots[selected] : undefined;
  const selectedMerchant = selectedSpot ? MERCHANTS.find((m) => m.id === selectedSpot.merchantId) : null;
  const nextSpotPrice = selectedSpot ? selectedSpot.price + SPOT_INCREMENT : SPOT_BASE_PRICE;
  const tokenCell = squareToCell(tokenSquare);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.42 }} />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          {filled} of {BRANDBOARD_SPOTS} spots claimed
        </span>
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
                // invert the serpentine mapping to find which square sits here
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
                    onClick={() => setSelected(square)}
                    style={accent ? { borderColor: selected === square ? undefined : `color-mix(in srgb, var(--${accent}) 45%, var(--border))` } : undefined}
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
                style={{
                  left: `calc(10px + ${tokenCell.col} * (100% - 20px) / 10)`,
                  top: `calc(10px + ${tokenCell.row} * (100% - 20px) / 10)`,
                  width: `calc((100% - 20px) / 10)`,
                  height: `calc((100% - 20px) / 10)`,
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
            {/* daily roll */}
            <div className="rounded-2xl border border-border bg-surface-raised p-5" style={{ boxShadow: "var(--shadow)" }}>
              <h2 className="mb-1 text-[18px]">Your daily roll</h2>

              {!playedToday ? (
                <>
                  <p className="mb-4 text-[12.5px] text-text-soft">
                    Tonight the genie sleeps on <span className="mono font-bold text-accent-deep">#{start}</span>. Roll
                    and he walks 1–6 squares — the gold squares are where he could land, and
                    he&rsquo;ll keep going if he finds an empty lot.
                  </p>
                  <div className="mb-4 flex items-center justify-center gap-4">
                    <span className="text-[56px] leading-none" style={{ color: "var(--accent)" }}>
                      {PIP_FACES[die]}
                    </span>
                  </div>
                  <button
                    onClick={roll}
                    disabled={busy}
                    className="btn-primary w-full rounded-full py-3 text-[14px] font-semibold"
                  >
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

            {/* spot bidding */}
            <div className="rounded-2xl border border-border bg-surface-raised p-5" style={{ boxShadow: "var(--shadow)" }}>
              <h2 className="mb-1 text-[18px]">Claim a spot</h2>
              <p className="mb-3 text-[12.5px] text-text-soft">
                Tap any square to inspect it. Open spots start at ₹{SPOT_BASE_PRICE}; taking an
                occupied one costs ₹{SPOT_INCREMENT} more than the brand standing there paid.
              </p>

              <div className="mb-3">
                <BiddingAsPicker compact />
              </div>

              {selected === null ? (
                <p className="rounded-xl bg-surface-sunken px-3 py-3 text-[12.5px] text-text-soft">
                  No square selected yet.
                </p>
              ) : (
                <div className="rounded-xl bg-surface-sunken px-3.5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="mono text-[15px] font-bold text-accent-deep">#{selected}</span>
                    {selectedMerchant ? (
                      <>
                        <BrandLogo
                          id={selectedMerchant.id}
                          name={selectedMerchant.name}
                          emoji={selectedMerchant.emoji}
                          size="sm"
                        />
                        <Link
                          href={`/brands/${selectedMerchant.id}`}
                          className="min-w-0 flex-1 truncate text-[12.5px] font-semibold hover:underline"
                        >
                          {selectedMerchant.name}
                        </Link>
                        <span className="mono text-[13px] font-bold">₹{selectedSpot!.price}</span>
                      </>
                    ) : (
                      <span className="flex-1 text-[12.5px] text-text-soft">Open spot — nobody here yet</span>
                    )}
                  </div>

                  {selectedMerchant && (
                    <p className="mt-2 text-[11px] text-text-soft">
                      {REWARD_ITEMS.filter((r) => r.merchantId === selectedMerchant.id).reduce(
                        (sum, r) => sum + (stock[r.id] ?? 0),
                        0
                      )}{" "}
                      prizes behind this square
                    </p>
                  )}

                  <button
                    onClick={() => bidOnSpot(selected)}
                    disabled={(wallets[activeMerchantId] ?? 0) < nextSpotPrice}
                    className="btn-primary mt-3 w-full rounded-full py-2.5 text-[12.5px] font-semibold"
                  >
                    {selectedSpot ? `Outbid for #${selected} · ₹${nextSpotPrice}` : `Claim #${selected} · ₹${nextSpotPrice}`}
                  </button>
                  {(wallets[activeMerchantId] ?? 0) < nextSpotPrice && (
                    <p className="mt-1.5 text-center text-[10.5px] text-warn">
                      Top up credits above to afford this.
                    </p>
                  )}
                </div>
              )}

              {feedback && (
                <p className={`mt-2.5 text-[11.5px] font-semibold ${feedback.ok ? "text-good" : "text-warn"}`}>
                  {feedback.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
