"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";
import { dailyWindow, GAME_LIBRARY, CATEGORY_ACCENT } from "@/lib/data";
import { GAME_COMPONENTS } from "@/components/games/Games";
import { BrandLogo } from "@/components/app/BrandLogo";

const DAILY_PLAYS = 3;

function playsKey(podId: string) {
  return `viralgenie-plays-${podId}-${new Date().toISOString().slice(0, 10)}`;
}

function readPlaysLeft(podId: string) {
  if (typeof window === "undefined") return DAILY_PLAYS;
  const used = Number(window.localStorage.getItem(playsKey(podId)) ?? "0");
  return Math.max(0, DAILY_PLAYS - used);
}

type Outcome = { rewardLabel: string; merchantId: string; redemptionCode: string };

function PlayContent() {
  const params = useParams<{ podId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const podId = params.podId;
  const gameId = searchParams.get("game") ?? "rub-the-lamp";
  const game = GAME_LIBRARY.find((g) => g.id === gameId) ?? GAME_LIBRARY[0];
  const pod = PODS.find((p) => p.id === podId);
  const hydrated = useHasHydrated();
  const playGame = useAppStore((s) => s.playGame);

  const [results, setResults] = useState<Outcome[]>([]);
  const [status, setStatus] = useState<"playing" | "won" | "missed" | "empty">("playing");
  const [playsLeft, setPlaysLeft] = useState(() => (pod ? readPlaysLeft(pod.id) : DAILY_PLAYS));
  const [flashLive, setFlashLive] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  useEffect(() => {
    // Computed post-mount only, so the prerendered shell never bakes in a
    // stale "now" and mismatches the client's clock on hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlashLive(dailyWindow(18, 19).state === "live");
  }, []);

  if (!pod) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-20 text-center text-text-soft">
        There&rsquo;s no pod at this address.{" "}
        <Link href="/" className="text-accent-deep underline">
          Back to the reward pool
        </Link>
        .
      </div>
    );
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-[720px] px-6 py-20 text-text-soft">Loading…</div>;
  }

  const accent = CATEGORY_ACCENT[pod.category];
  const GameComponent = GAME_COMPONENTS[game.id] ?? GAME_COMPONENTS["rub-the-lamp"];

  function consumePlay() {
    const used = Number(window.localStorage.getItem(playsKey(podId)) ?? "0") + 1;
    window.localStorage.setItem(playsKey(podId), String(used));
    setPlaysLeft(Math.max(0, DAILY_PLAYS - used));
  }

  function handleFinish(success: boolean) {
    consumePlay();

    if (!success) {
      setStatus("missed");
      return;
    }

    const draws = flashLive ? 2 : 1;
    const outcomes: Outcome[] = [];
    for (let i = 0; i < draws; i++) {
      const outcome = playGame(podId);
      if (outcome) outcomes.push(outcome);
    }

    if (outcomes.length === 0) {
      setStatus("empty");
      return;
    }
    setResults(outcomes);
    setStatus("won");
  }

  function playAgain() {
    setResults([]);
    setStatus("playing");
    setRoundKey((k) => k + 1);
  }

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.35 }} />

      <div className="relative mx-auto max-w-[840px] px-6 py-10">
        {/* pod + game switchers */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[12.5px]">
            <span className="text-text-soft">Pod</span>
            <select
              value={podId}
              onChange={(e) => router.push(`/play/${e.target.value}?game=${game.id}`)}
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-[13px] font-semibold"
            >
              {PODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
            style={{ background: `var(--${accent})` }}
          >
            {pod.category}
          </span>
          <Link href="/games" className="ml-auto text-[12.5px] text-text-soft underline">
            All games →
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {GAME_LIBRARY.map((g) => (
            <Link
              key={g.id}
              href={`/play/${podId}?game=${g.id}`}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                g.id === game.id
                  ? "text-white"
                  : "border border-border bg-surface-raised text-text-soft hover:text-text"
              }`}
              style={g.id === game.id ? { background: `linear-gradient(120deg, ${g.gradient[0]}, ${g.gradient[1]})` } : undefined}
            >
              {g.icon} {g.name}
            </Link>
          ))}
        </div>

        {/* stage */}
        <div
          className="relative overflow-hidden rounded-3xl border border-border bg-surface-raised px-6 py-10 text-center"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ background: `linear-gradient(90deg, ${game.gradient[0]}, ${game.gradient[1]})` }}
          />

          <div className="mb-1 flex items-center justify-center gap-2">
            <h1 className="text-[26px]">{game.name}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                game.kind === "skill" ? "bg-warn-soft text-warn" : "bg-good-soft text-good"
              }`}
            >
              {game.kind === "skill" ? "SKILL" : "CHANCE"}
            </span>
          </div>
          <p className="text-[14px] text-text-soft">{game.tagline}</p>

          {flashLive && (
            <p className="mt-3 inline-block rounded-full bg-gold px-3 py-1 text-[12px] font-bold text-[#241705]">
              ⚡ Flash Drop live — every win pays out twice
            </p>
          )}

          <p className="mt-3 mb-8 text-[12.5px] text-text-soft">
            {playsLeft > 0
              ? `${playsLeft} play${playsLeft === 1 ? "" : "s"} left today in ${pod.name}`
              : "Out of plays here today — switch pods or come back tomorrow."}
          </p>

          <div className="flex justify-center">
            {status === "playing" ? (
              <GameComponent key={roundKey} onFinish={handleFinish} disabled={playsLeft <= 0} />
            ) : (
              <div className="w-full max-w-[420px]">
                {status === "won" &&
                  results.map((result, i) => {
                    const merchant = MERCHANTS.find((m) => m.id === result.merchantId)!;
                    return (
                      <div
                        key={result.redemptionCode}
                        className="pop-in mb-3 rounded-2xl border border-gold bg-surface-raised px-5 py-5"
                        style={{ boxShadow: "var(--shadow)" }}
                      >
                        <div className="text-[12px] tracking-wide text-text-soft uppercase">
                          {results.length > 1 ? `Prize ${i + 1} of ${results.length}` : "You won"}
                        </div>
                        <div className="mt-2 text-[20px] font-semibold">{result.rewardLabel}</div>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="sm" />
                          <span className="text-[12.5px] text-text-soft">{merchant.name}</span>
                        </div>
                        <div className="mono mt-4 inline-block rounded-lg bg-surface-sunken px-4 py-2 text-[14px] font-bold text-accent-deep">
                          {result.redemptionCode}
                        </div>
                      </div>
                    );
                  })}

                {status === "missed" && (
                  <div className="pop-in rounded-2xl border border-dashed border-border px-5 py-6">
                    <div className="text-[30px]">😅</div>
                    <div className="mt-2 text-[16px] font-semibold">So close — no prize this round</div>
                    <p className="mt-1 text-[13px] text-text-soft">
                      Skill games only pay out when you land them. That&rsquo;s the trade for
                      better odds than pure chance.
                    </p>
                  </div>
                )}

                {status === "empty" && (
                  <div className="pop-in rounded-2xl border border-dashed border-border px-5 py-6 text-[13.5px] text-text-soft">
                    This pod is out of stock — every reward here has been claimed. Try
                    another pod from the dropdown above.
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={playAgain}
                    disabled={playsLeft <= 0}
                    className="btn-primary rounded-full px-6 py-2.5 text-[13px] font-semibold"
                  >
                    Play again
                  </button>
                  {status === "won" && (
                    <Link
                      href="/wallet"
                      className="rounded-full border border-border px-5 py-2.5 text-[13px] font-semibold hover:border-accent"
                    >
                      View in My Rewards
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-[12.5px] text-text-soft">
          <Link href="/" className="underline">
            ← Back to the reward pool
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[720px] px-6 py-20 text-text-soft">Loading…</div>}>
      <PlayContent />
    </Suspense>
  );
}
