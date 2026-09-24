"use client";

import { useEffect, useState } from "react";
import { useAppStore, REWARD_ITEMS } from "@/lib/store";
import { BRANDBOARD_SPOTS, genieStartSquare } from "@/lib/data";

/** Module scope so the randomness never sits in render-phase code. */
function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function playKey() {
  return `viralgenie-brandboard-${todayKey()}`;
}

export type DailyResult = {
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

/**
 * The daily roll, shared by both board layouts so the two variants differ
 * only in presentation — otherwise comparing them would be meaningless.
 * One roll per day is global, not per layout.
 */
export function useBrandboard() {
  const spots = useAppStore((s) => s.spots);
  const stock = useAppStore((s) => s.stock);
  const playBrand = useAppStore((s) => s.playBrand);

  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<DailyResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [die, setDie] = useState(1);
  const [tokenSquare, setTokenSquare] = useState(1);
  const [hopping, setHopping] = useState(false);

  const start = genieStartSquare(todayKey());

  useEffect(() => {
    // localStorage and today's date are client-only: read after mount so the
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

  const playedToday = result !== null;
  const candidates = playedToday
    ? []
    : Array.from({ length: 6 }, (_, i) => ((start - 1 + i + 1) % BRANDBOARD_SPOTS) + 1);

  /** A square only stops the genie if someone's home with something to give. */
  function isHome(square: number) {
    const spot = spots[square];
    if (!spot) return false;
    return REWARD_ITEMS.some((r) => r.merchantId === spot.merchantId && (stock[r.id] ?? 0) > 0);
  }

  function land(rolled: number, resting: number, passed: number) {
    const spot = spots[resting];
    let outcome: DailyResult;

    if (!spot) {
      outcome = {
        rolled,
        landed: resting,
        passed,
        note: "Every brand on the board is out of stock today — come back tomorrow.",
      };
    } else {
      const prize = playBrand(spot.merchantId);
      outcome = prize
        ? {
            rolled,
            landed: resting,
            passed,
            merchantId: spot.merchantId,
            rewardLabel: prize.rewardLabel,
            redemptionCode: prize.redemptionCode,
          }
        : { rolled, landed: resting, passed, merchantId: spot.merchantId, note: "That brand just ran dry — bad luck." };
    }

    setResult(outcome);
    window.localStorage.setItem(playKey(), JSON.stringify(outcome));
    setBusy(false);
  }

  function walk(steps: number, reduced: boolean) {
    const rolled = ((start - 1 + steps) % BRANDBOARD_SPOTS) + 1;

    // The genie won't settle on an empty lot — he keeps walking until he finds
    // a brand at home, so a single daily roll is never wasted.
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

  function roll() {
    if (playedToday || busy) return;
    setBusy(true);
    setRolling(true);

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

  return { mounted, start, die, rolling, busy, result, playedToday, candidates, tokenSquare, hopping, roll };
}
