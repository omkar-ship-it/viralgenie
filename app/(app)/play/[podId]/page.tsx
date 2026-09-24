"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";

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

export default function PlayPage() {
  const params = useParams<{ podId: string }>();
  const podId = params.podId;
  const pod = PODS.find((p) => p.id === podId);
  const hydrated = useHasHydrated();
  const playGame = useAppStore((s) => s.playGame);

  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ rewardLabel: string; merchantId: string; redemptionCode: string } | null>(
    null
  );
  const [empty, setEmpty] = useState(false);
  const [playsLeft, setPlaysLeft] = useState(() => (pod ? readPlaysLeft(pod.id) : DAILY_PLAYS));

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

  function spin() {
    if (!pod || spinning || playsLeft <= 0) return;
    setSpinning(true);
    setResult(null);
    setEmpty(false);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const extra = 1080 + Math.floor(Math.random() * 360);
    rotationRef.current += extra;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }

    const outcome = playGame(pod.id);
    const used = Number(window.localStorage.getItem(playsKey(pod.id)) ?? "0") + 1;
    window.localStorage.setItem(playsKey(pod.id), String(used));
    setPlaysLeft(Math.max(0, DAILY_PLAYS - used));

    window.setTimeout(
      () => {
        setSpinning(false);
        if (!outcome) {
          setEmpty(true);
        } else {
          setResult(outcome);
        }
      },
      reduced ? 0 : 2600
    );
  }

  const winnerMerchant = result ? MERCHANTS.find((m) => m.id === result.merchantId) : null;

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14 text-center">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        {pod.name}
      </span>
      <h1 className="mb-2">Rub the Lamp</h1>
      <p className="mb-9 text-[14.5px] text-text-soft">
        {playsLeft > 0
          ? `${playsLeft} play${playsLeft === 1 ? "" : "s"} left today in this pod.`
          : "You're out of plays here today — come back tomorrow, or try another pod."}
      </p>

      <div className="mx-auto mb-8 flex flex-col items-center gap-2">
        <div className="relative">
          <div className="wheel-pin" />
          <div className="wheel" ref={wheelRef} style={{ width: 220, height: 220 }}>
            <div className="wheel-hub" style={{ width: 50, height: 50, fontSize: 22 }}>
              🧞
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning || playsLeft <= 0}
        className="rounded-full px-7 py-3 text-[14px] font-semibold text-white disabled:opacity-40"
        style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))", boxShadow: "var(--shadow)" }}
      >
        {spinning ? "Spinning…" : "Rub the Lamp ✨"}
      </button>

      <div className="mt-8 min-h-[90px]">
        {empty && (
          <div className="rounded-2xl border border-dashed border-border px-5 py-4 text-[13.5px] text-text-soft">
            The pool ran dry mid-spin — every reward in this pod is out of stock. No merchant
            is defending #1 here right now.
          </div>
        )}
        {result && winnerMerchant && (
          <div className="rounded-2xl border border-gold bg-surface-raised px-5 py-4" style={{ boxShadow: "var(--shadow)" }}>
            <div className="text-[13px] text-text-soft">You won</div>
            <div className="mt-1 text-[18px] font-semibold">
              {winnerMerchant.emoji} {result.rewardLabel}
            </div>
            <div className="mt-1 text-[12.5px] text-text-soft">from {winnerMerchant.name}</div>
            <div className="mono mt-3 inline-block rounded-lg bg-surface-sunken px-3 py-1.5 text-[13px] font-semibold text-accent-deep">
              Code: {result.redemptionCode}
            </div>
            <div className="mt-3 text-[12px]">
              <Link href="/wallet" className="text-accent-deep underline">
                View it in My Rewards
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 text-[12.5px] text-text-soft">
        <Link href="/" className="underline">
          ← Back to the reward pool
        </Link>
      </div>
    </div>
  );
}
