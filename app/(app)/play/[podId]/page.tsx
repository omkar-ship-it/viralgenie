"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";
import { dailyWindow, GAME_LIBRARY } from "@/lib/data";

const DAILY_PLAYS = 3;
const REEL_SYMBOLS = ["🍒", "⭐", "💎", "🔔", "🍋", "7️⃣"];
const SCRATCH_SYMBOLS = ["🍀", "⭐", "💎", "🎉", "🔔"];

const REVEAL_DELAY_MS: Record<string, number> = {
  "rub-the-lamp": 2600,
  "roll-the-dice": 900,
  "lucky-reels": 1400,
  "mystery-box": 550,
  "scratch-win": 300,
};

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

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

function ReelsFace({ spinning }: { spinning: boolean }) {
  const [symbols, setSymbols] = useState(() => [randomPick(REEL_SYMBOLS), randomPick(REEL_SYMBOLS), randomPick(REEL_SYMBOLS)]);

  useEffect(() => {
    if (!spinning) return;
    const id = window.setInterval(() => setSymbols([randomPick(REEL_SYMBOLS), randomPick(REEL_SYMBOLS), randomPick(REEL_SYMBOLS)]), 80);
    return () => window.clearInterval(id);
  }, [spinning]);

  return (
    <div className="reels-row">
      {symbols.map((sym, i) => (
        <div key={i} className={`reel-window ${spinning ? "spinning" : ""}`}>
          {sym}
        </div>
      ))}
    </div>
  );
}

function ScratchCard({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [symbols] = useState(() => [randomPick(SCRATCH_SYMBOLS), randomPick(SCRATCH_SYMBOLS), randomPick(SCRATCH_SYMBOLS)]);

  function scratch(i: number) {
    if (revealed[i]) return;
    const next = [...revealed];
    next[i] = true;
    setRevealed(next);
    if (next.every(Boolean)) window.setTimeout(onComplete, 250);
  }

  return (
    <div className="scratch-row">
      {symbols.map((sym, i) => (
        <button
          key={i}
          onClick={() => scratch(i)}
          className={`scratch-cell ${revealed[i] ? "revealed" : ""}`}
          aria-label={`Scratch panel ${i + 1}`}
        >
          {sym}
          <span className="scratch-cover">?</span>
        </button>
      ))}
    </div>
  );
}

function MysteryBoxes({ onPick }: { onPick: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    onPick();
  }

  return (
    <div className="box-row">
      {[0, 1, 2].map((i) => (
        <button
          key={i}
          onClick={() => pick(i)}
          disabled={picked !== null}
          className={`mystery-box ${picked === i ? "picked" : ""} ${picked !== null && picked !== i ? "faded" : ""}`}
          aria-label={`Pick box ${i + 1}`}
        >
          🎁
        </button>
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
  const [roundKey, setRoundKey] = useState(0);

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
    if (game.id === "rub-the-lamp") {
      const extra = 1080 + Math.floor(Math.random() * 360);
      rotationRef.current += extra;
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
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
      reduced ? 0 : REVEAL_DELAY_MS[game.id] ?? 1000
    );
  }

  function playAgain() {
    setRoundKey((k) => k + 1);
    setResults([]);
    setEmpty(false);
  }

  const needsGenericButton = game.id === "rub-the-lamp" || game.id === "roll-the-dice" || game.id === "lucky-reels";
  const roundInProgress = results.length > 0 || empty;

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
        {game.id === "roll-the-dice" && <DiceFace rolling={spinning} />}
        {game.id === "lucky-reels" && <ReelsFace spinning={spinning} />}
        {game.id === "scratch-win" && !roundInProgress && playsLeft > 0 && (
          <ScratchCard key={roundKey} onComplete={play} />
        )}
        {game.id === "mystery-box" && !roundInProgress && playsLeft > 0 && (
          <MysteryBoxes key={roundKey} onPick={play} />
        )}
        {game.id === "rub-the-lamp" && (
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

      {needsGenericButton && (
        <button
          onClick={play}
          disabled={spinning || playsLeft <= 0}
          className="rounded-full px-7 py-3 text-[14px] font-semibold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))", boxShadow: "var(--shadow)" }}
        >
          {spinning
            ? game.id === "roll-the-dice"
              ? "Rolling…"
              : game.id === "lucky-reels"
                ? "Pulling…"
                : "Spinning…"
            : `${game.icon} ${game.id === "roll-the-dice" ? "Roll" : game.id === "lucky-reels" ? "Pull" : "Rub the Lamp"}`}
        </button>
      )}
      {!needsGenericButton && roundInProgress && (
        <button
          onClick={playAgain}
          disabled={playsLeft <= 0}
          className="rounded-full border border-border px-6 py-2.5 text-[13px] font-semibold disabled:opacity-40"
        >
          Play again
        </button>
      )}

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
