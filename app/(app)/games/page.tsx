"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  PODS,
  GAME_LIBRARY,
  COMMUNITY_UNLOCK_TARGET,
  dailyWindow,
  nextWeekday,
} from "@/lib/data";
import { useAppStore, useHasHydrated } from "@/lib/store";

function formatCountdown(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "now";
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hrs = Math.floor((totalMin % 1440) / 60);
  const min = totalMin % 60;
  if (days > 0) return `${days}d ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${min}m`;
  return `${min}m`;
}

function GamesContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const totalPlays = useAppStore((s) => s.totalPlaysThisWeek);

  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    // Gate on mount so the server-prerendered shell and the first client
    // render match exactly; only after hydration do we show live countdowns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  if (!mounted || !hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading the games board…</div>;
  }

  const now = new Date();
  const flash = dailyWindow(18, 19);
  const lotteryAt = nextWeekday(0, 20);
  const communityPct = Math.min(100, (totalPlays / COMMUNITY_UNLOCK_TARGET) * 100);
  const communityDone = totalPlays >= COMMUNITY_UNLOCK_TARGET;

  const pods = category ? PODS.filter((p) => p.category === category) : PODS;

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-12">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        Games
      </span>
      <h1 className="mb-3">Play now, or plan around what&rsquo;s coming</h1>
      <p className="mb-10 max-w-[64ch] text-[15px] text-text-soft">
        Two always-on games run in every pod. Around them, a handful of scheduled events
        create a reason to come back at a specific time — the same appointment-viewing
        pull as a live drop, not just an anytime freebie.
      </p>

      <h2 className="mb-4 flex items-center gap-2 text-[18px]">
        <span className="h-2 w-2 rounded-full bg-good" /> Live now
      </h2>
      <p className="mb-4 -mt-2 text-[12.5px] text-text-soft">
        {GAME_LIBRARY.length} games, live in every pod — pick one per pod, not one per game.
      </p>
      <div className="mb-14 flex flex-col gap-3">
        {pods.map((pod) => (
          <div
            key={pod.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-raised px-4.5 py-3.5"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="mr-1 min-w-[150px]">
              <div className="text-[14px] font-semibold">{pod.name}</div>
              <div className="text-[11px] text-text-soft">{pod.category}</div>
            </div>
            <div className="flex flex-1 flex-wrap gap-2">
              {GAME_LIBRARY.map((game) => (
                <Link
                  key={game.id}
                  href={`/play/${pod.id}?game=${game.id}`}
                  title={game.tagline}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold transition-colors hover:border-accent hover:text-accent-deep"
                >
                  <span>{game.icon}</span>
                  {game.name}
                </Link>
              ))}
            </div>
            <span className="rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-bold text-good">LIVE</span>
          </div>
        ))}
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-[18px]">
        <span className="h-2 w-2 rounded-full bg-warn" /> Scheduled
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        <div className="rounded-2xl border p-5" style={{ borderColor: flash.state === "live" ? "var(--gold)" : "var(--border)", background: "var(--surface-raised)", boxShadow: "var(--shadow)" }}>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[20px]">⚡</span>
            <span className="text-[14.5px] font-semibold">Flash Drop</span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                flash.state === "live" ? "bg-gold text-[#241705]" : "bg-surface-sunken text-text-soft"
              }`}
            >
              {flash.state === "live" ? "LIVE — DOUBLE PRIZES" : "SCHEDULED"}
            </span>
          </div>
          <p className="mb-2 text-[12.5px] text-text-soft">
            Every day 6–7pm, every spin pays out two prizes instead of one, across every pod.
          </p>
          <div className="mono text-[13px] font-semibold text-accent-deep">
            {flash.state === "live" ? `Ends in ${formatCountdown(flash.endsAt, now)}` : `Starts in ${formatCountdown(flash.startsAt, now)}`}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-raised p-5" style={{ boxShadow: "var(--shadow)" }}>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[20px]">🎟️</span>
            <span className="text-[14.5px] font-semibold">Weekly Lottery Draw</span>
            <span className="ml-auto rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-bold text-text-soft">
              SCHEDULED
            </span>
          </div>
          <p className="mb-2 text-[12.5px] text-text-soft">
            Every play this week is one entry into Sunday&rsquo;s big draw — one winner takes a
            grand prize pooled from every sponsor.
          </p>
          <div className="mono text-[13px] font-semibold text-accent-deep">
            Draws in {formatCountdown(lotteryAt, now)}
          </div>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: communityDone ? "var(--good)" : "var(--border)", background: "var(--surface-raised)", boxShadow: "var(--shadow)" }}>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[20px]">🤝</span>
            <span className="text-[14.5px] font-semibold">Community Unlock</span>
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                communityDone ? "bg-good-soft text-good" : "bg-surface-sunken text-text-soft"
              }`}
            >
              {communityDone ? "UNLOCKED" : "IN PROGRESS"}
            </span>
          </div>
          <p className="mb-2 text-[12.5px] text-text-soft">
            {communityDone
              ? "This week's goal is met — every pod gets boosted odds until Sunday."
              : `${COMMUNITY_UNLOCK_TARGET - totalPlays} more plays across all pods unlocks a bonus round for everyone.`}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full rounded-full bg-good" style={{ width: `${communityPct}%` }} />
          </div>
          <div className="mono mt-1.5 text-[11.5px] text-text-soft">
            {totalPlays} / {COMMUNITY_UNLOCK_TARGET} plays this week
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading…</div>}>
      <GamesContent />
    </Suspense>
  );
}
