"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";
import { dailyWindow, GAME_LIBRARY } from "@/lib/data";

const DAILY_PLAYS = 3;

function playsKey(podId: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `viralgenie-plays-${podId}-${day}`;
}

function readPlaysLeft(podId: string) {
  if (typeof window === "undefined") return DAILY_PLAYS;
  const used = Number(window.localStorage.getItem(playsKey(podId)) ?? "0");
  return Math.max(0, DAILY_PLAYS - used);
}

type Outcome = { rewardLabel: string; merchantId: string; redemptionCode: string };

function rollPips() {
  return Array.from({ length: 2 }, () => 1 + Math.floor(Math.random() * 6));
}

function DiceFace({ rolling }: { rolling: boolean }) {
  const [pips, setPips] = useState(() => rollPips());

  useEffect(() => {
    if (!rolling) return;
    const id = window.setInterval(() => setPips(rollPips()), 90);
    return () => window.clearInterval(id);
  }, [rolling]);

  const LAYOUTS: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  return (
    <div className="flex gap-4">
      {pips.map((count, i) => (
        <div key={i} className={`dice ${rolling ? "rolling" : ""}`}>
          {Array.from({ length: 9 }, (_, cell) => (
            <div key={cell} className="pip" style={{ opacity: LAYOUTS[count].includes(cell) ? 1 : 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PlayContent() {
  const params = useParams<{ podId: string }>();
  const searchParams = useSearchParams();
  const podId = params.podId;
  const gameId = searchParams.get("game") ?? "rub-the-lamp";
  const game = GAME_LIBRARY.find((g) => g.id === gameId) ?? GAME_LIBRARY[0];
  const pod = PODS.find((p) => p.id === podId);
  const hydrated = useHasHydrated();
  const playGame = useAppStore((s) => s.playGame);

  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<Outcome[]>([]);
  const [empty, setEmpty] = useState(false);
  const [playsLeft, setPlaysLeft] = useState(() => (pod ? readPlaysLeft(pod.id) : DAILY_PLAYS));
  const [flashLive, setFlashLive] = useState(false);

  useEffect(() => {
    // Computed post-mount only, so the prerendered shell never bakes in a
    // stale "now" and mismatches the client's actual clock on hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlashLive(dailyWindow(18, 19).state === "live");
  }, []);

  if (!pod) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-16 text-center text-text-soft">
        There&rsquo;s no pod at this address.{" "}
        <Link href="/" className="text-accent-deep underline">
          Back to the reward pool
        </Link>
        .
      </div>
    );
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-[720px] px-6 py-16 text-text-soft">Loading…</div>;
  }

  function play() {
    if (!pod || spinning || playsLeft <= 0) return;
    setSpinning(true);
    setResults([]);
    setEmpty(false);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const extra = 1080 + Math.floor(Math.random() * 360);
    rotationRef.current += extra;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }

    const draws = flashLive ? 2 : 1;
    const outcomes: Outcome[] = [];
    for (let i = 0; i < draws; i++) {
      const outcome = playGame(pod.id);
      if (outcome) outcomes.push(outcome);
    }

    const used = Number(window.localStorage.getItem(playsKey(pod.id)) ?? "0") + 1;
    window.localStorage.setItem(playsKey(pod.id), String(used));
    setPlaysLeft(Math.max(0, DAILY_PLAYS - used));

    window.setTimeout(
      () => {
        setSpinning(false);
        if (outcomes.length === 0) setEmpty(true);
        else setResults(outcomes);
      },
      reduced ? 0 : game.id === "roll-the-dice" ? 900 : 2600
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14 text-center">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        {pod.name}
      </span>
      <h1 className="mb-2">{game.name}</h1>
      <p className="mb-2 text-[14.5px] text-text-soft">{game.tagline}</p>
      {flashLive && (
        <p className="mb-4 inline-block rounded-full bg-gold px-3 py-1 text-[12px] font-bold text-[#241705]">
          ⚡ Flash Drop live — every play pays out twice
        </p>
      )}
      <p className="mb-9 text-[13px] text-text-soft">
        {playsLeft > 0
          ? `${playsLeft} play${playsLeft === 1 ? "" : "s"} left today in this pod.`
          : "You're out of plays here today — come back tomorrow, or try another pod."}
      </p>

      <div className="mx-auto mb-8 flex flex-col items-center gap-2">
        {game.id === "roll-the-dice" ? (
          <DiceFace rolling={spinning} />
        ) : (
          <div className="relative">
            <div className="wheel-pin" />
            <div className="wheel" ref={wheelRef} style={{ width: 220, height: 220 }}>
              <div className="wheel-hub" style={{ width: 50, height: 50, fontSize: 22 }}>
                🧞
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={play}
        disabled={spinning || playsLeft <= 0}
        className="rounded-full px-7 py-3 text-[14px] font-semibold text-white disabled:opacity-40"
        style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))", boxShadow: "var(--shadow)" }}
      >
        {spinning ? (game.id === "roll-the-dice" ? "Rolling…" : "Spinning…") : `${game.icon} ${game.id === "roll-the-dice" ? "Roll" : "Rub the Lamp"}`}
      </button>

      <div className="mt-8 min-h-[90px]">
        {empty && (
          <div className="rounded-2xl border border-dashed border-border px-5 py-4 text-[13.5px] text-text-soft">
            The pool ran dry mid-play — every reward in this pod is out of stock right now.
          </div>
        )}
        {results.map((result, i) => {
          const winnerMerchant = MERCHANTS.find((m) => m.id === result.merchantId)!;
          return (
            <div
              key={result.redemptionCode}
              className="pop-in mb-3 rounded-2xl border border-gold bg-surface-raised px-5 py-4"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <div className="text-[13px] text-text-soft">{results.length > 1 ? `Prize ${i + 1}` : "You won"}</div>
              <div className="mt-1 text-[18px] font-semibold">
                {winnerMerchant.emoji} {result.rewardLabel}
              </div>
              <div className="mt-1 text-[12.5px] text-text-soft">from {winnerMerchant.name}</div>
              <div className="mono mt-3 inline-block rounded-lg bg-surface-sunken px-3 py-1.5 text-[13px] font-semibold text-accent-deep">
                Code: {result.redemptionCode}
              </div>
            </div>
          );
        })}
        {results.length > 0 && (
          <div className="text-[12px]">
            <Link href="/wallet" className="text-accent-deep underline">
              View it in My Rewards
            </Link>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4 text-[12.5px] text-text-soft">
        <Link href="/" className="underline">
          ← Reward pool
        </Link>
        <Link href="/games" className="underline">
          All games
        </Link>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[720px] px-6 py-16 text-text-soft">Loading…</div>}>
      <PlayContent />
    </Suspense>
  );
}
