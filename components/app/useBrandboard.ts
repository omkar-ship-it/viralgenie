"use client";

import { useEffect, useState } from "react";
import { useAppStore, REWARD_ITEMS } from "@/lib/store";
import { genieStart, rankBoard } from "@/lib/data";

const MIN_STEPS = 9;
const MAX_STEPS = 22;

/** Module scope so the randomness never sits in render-phase code. */
function walkLength() {
  return MIN_STEPS + Math.floor(Math.random() * (MAX_STEPS - MIN_STEPS + 1));
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function playKey() {
  return `viralgenie-genieround-${todayKey()}`;
}

export type DailyResult = {
  landed: number;
  steps: number;
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

/**
 * The Genie's Round: he wakes on the same position for everyone that day,
 * walks an unknown number of positions, and slows to a stop on a brand.
 * Shared by both board layouts so the two differ only in presentation.
 * One round per day, globally.
 */
export function useBrandboard() {
  const boardBids = useAppStore((s) => s.boardBids);
  const stock = useAppStore((s) => s.stock);
  const playBrand = useAppStore((s) => s.playBrand);

  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<DailyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [slowing, setSlowing] = useState(false);
  const [tokenSquare, setTokenSquare] = useState(1);
  const [hopping, setHopping] = useState(false);

  const ranked = rankBoard(boardBids);
  const claimed = ranked.length;
  const start = genieStart(todayKey(), claimed);

  useEffect(() => {
    // localStorage and today's date are client-only: read after mount so the
    // prerendered shell and the first client paint agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = readToday();
    if (saved) {
      setResult(saved);
      setTokenSquare(saved.landed);
    }
  }, []);

  useEffect(() => {
    // Park the genie on today's starting position once the board is known.
    if (result || busy) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTokenSquare(start);
  }, [start, result, busy]);

  /** He only stops where a brand can actually hand something over. */
  function hasStock(position: number) {
    const entry = ranked[position - 1];
    if (!entry) return false;
    return REWARD_ITEMS.some((r) => r.merchantId === entry.merchantId && (stock[r.id] ?? 0) > 0);
  }

  function land(position: number, steps: number) {
    const entry = ranked[position - 1];
    let outcome: DailyResult;

    if (!entry) {
      outcome = { landed: position, steps, note: "The board is empty today — come back once brands have bid." };
    } else {
      const prize = playBrand(entry.merchantId);
      outcome = prize
        ? {
            landed: position,
            steps,
            merchantId: entry.merchantId,
            rewardLabel: prize.rewardLabel,
            redemptionCode: prize.redemptionCode,
          }
        : { landed: position, steps, merchantId: entry.merchantId, note: "That brand just ran dry — bad luck." };
    }

    setResult(outcome);
    setSlowing(false);
    window.localStorage.setItem(playKey(), JSON.stringify(outcome));
    setBusy(false);
  }

  function startRound() {
    if (result || busy || claimed === 0) return;
    setBusy(true);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let steps = walkLength();

    // Keep walking past anyone who has nothing left to give.
    let resting = ((start - 1 + steps) % claimed) + 1;
    let guard = 0;
    while (!hasStock(resting) && guard < claimed) {
      steps++;
      resting = ((start - 1 + steps) % claimed) + 1;
      guard++;
    }

    if (reduced) {
      setTokenSquare(resting);
      land(resting, steps);
      return;
    }

    // He sets off briskly and drags his feet over the last few positions —
    // the deceleration is the suspense now that there's no die to watch.
    let elapsed = 0;
    for (let i = 1; i <= steps; i++) {
      const remaining = steps - i;
      const pace = remaining > 4 ? 135 : [520, 400, 300, 220, 175][remaining];
      elapsed += pace;
      const at = ((start - 1 + i) % claimed) + 1;
      window.setTimeout(() => {
        setTokenSquare(at);
        setHopping(true);
        if (remaining === 4) setSlowing(true);
        window.setTimeout(() => setHopping(false), Math.min(180, pace - 20));
      }, elapsed);
    }
    window.setTimeout(() => land(resting, steps), elapsed + 420);
  }

  return { mounted, ranked, claimed, start, busy, slowing, result, tokenSquare, hopping, startRound };
}
