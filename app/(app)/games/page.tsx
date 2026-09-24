"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PODS, GAME_LIBRARY, COMMUNITY_UNLOCK_TARGET, dailyWindow, nextWeekday } from "@/lib/data";
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

function ScheduledCard({
  icon,
  title,
  badge,
  badgeTone,
  children,
  footer,
}: {
  icon: string;
  title: string;
  badge: string;
  badgeTone: "live" | "idle" | "good";
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const tone =
    badgeTone === "live"
      ? "bg-gold text-[#241705]"
      : badgeTone === "good"
        ? "bg-good-soft text-good"
        : "bg-surface-sunken text-text-soft";
  return (
    <div
      className="rounded-2xl border bg-surface-raised p-5"
      style={{ borderColor: badgeTone === "live" ? "var(--gold)" : "var(--border)", boxShadow: "var(--shadow)" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[22px]">{icon}</span>
        <span className="text-[15px] font-semibold">{title}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>{badge}</span>
      </div>
      <p className="mb-3 text-[12.5px] text-text-soft">{children}</p>
      {footer}
    </div>
  );
}

function GamesContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const totalPlays = useAppStore((s) => s.totalPlaysThisWeek);

  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    // Gate on mount so the prerendered shell and first client render match;
    // live countdowns only appear once we're safely past hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  if (!mounted || !hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading the games board…</div>;
  }

  const now = new Date();
  const flash = dailyWindow(18, 19);
  const lotteryAt = nextWeekday(0, 20);
  const communityPct = Math.min(100, (totalPlays / COMMUNITY_UNLOCK_TARGET) * 100);
  const communityDone = totalPlays >= COMMUNITY_UNLOCK_TARGET;

  const pods = category ? PODS.filter((p) => p.category === category) : PODS;
  const defaultPod = pods[0] ?? PODS[0];

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.4 }} />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          {GAME_LIBRARY.length} games · {pods.length} pods
        </span>
        <h1 className="max-w-[16ch] text-[clamp(30px,5vw,52px)] leading-[1.05] font-semibold">
          Nine ways to win the same fair pool.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15.5px] text-text-soft">
          Six are pure chance — pick a box, pull a lever, drop a ball. Three are skill: land
          them and you win, miss and you don&rsquo;t. Every game runs in every pod, and the
          odds behind all of them are identical.
        </p>

        <Link
          href="/brandboard"
          className="group relative mt-10 flex flex-wrap items-center gap-5 overflow-hidden rounded-2xl p-6 text-white transition-transform hover:-translate-y-1"
          style={{
            background: "linear-gradient(120deg, #3B1F7A, #7C3AED 55%, #B8306F)",
            boxShadow: "var(--shadow-lift)",
          }}
        >
          <span className="absolute -top-10 -right-6 h-36 w-36 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
          <span className="relative text-[44px] leading-none">🎲</span>
          <span className="relative min-w-0 flex-1">
            <span className="mb-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
              ONCE A DAY
            </span>
            <span className="block text-[20px] font-semibold">The Brandboard</span>
            <span className="block text-[13px] text-white/80">
              100 spots, one roll. The genie walks the board and stops at a brand — whatever
              they&rsquo;re giving away is yours.
            </span>
          </span>
          <span className="relative rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold backdrop-blur-sm">
            Roll today &rarr;
          </span>
        </Link>

        <h2 className="mt-12 mb-4 flex items-center gap-2 text-[19px]">
          <span className="h-2 w-2 rounded-full bg-good" /> Live now
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
          {GAME_LIBRARY.map((game) => (
            <Link
              key={game.id}
              href={`/play/${defaultPod.id}?game=${game.id}`}
              className="group relative overflow-hidden rounded-2xl p-5 text-white transition-transform hover:-translate-y-1"
              style={{
                background: `linear-gradient(145deg, ${game.gradient[0]}, ${game.gradient[1]})`,
                boxShadow: "var(--shadow)",
              }}
            >
              <span className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative flex items-start justify-between">
                <span className="text-[34px] leading-none">{game.icon}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                    game.kind === "skill" ? "bg-white/25" : "bg-black/25"
                  }`}
                >
                  {game.kind === "skill" ? "SKILL" : "CHANCE"}
                </span>
              </div>
              <div className="relative mt-4 text-[17px] font-semibold">{game.name}</div>
              <p className="relative mt-1 text-[12.5px] text-white/75">{game.tagline}</p>
              <div className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold backdrop-blur-sm">
                Play now →
              </div>
            </Link>
          ))}
        </div>

        <h2 className="mt-14 mb-4 flex items-center gap-2 text-[19px]">
          <span className="h-2 w-2 rounded-full bg-warn" /> Scheduled
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))" }}>
          <ScheduledCard
            icon="⚡"
            title="Flash Drop"
            badge={flash.state === "live" ? "LIVE — DOUBLE PRIZES" : "SCHEDULED"}
            badgeTone={flash.state === "live" ? "live" : "idle"}
            footer={
              <div className="mono text-[13px] font-semibold text-accent-deep">
                {flash.state === "live"
                  ? `Ends in ${formatCountdown(flash.endsAt, now)}`
                  : `Starts in ${formatCountdown(flash.startsAt, now)}`}
              </div>
            }
          >
            Every day 6–7pm, a winning play pays out two prizes instead of one, in every pod.
          </ScheduledCard>

          <ScheduledCard
            icon="🎟️"
            title="Weekly Lottery Draw"
            badge="SCHEDULED"
            badgeTone="idle"
            footer={
              <div className="mono text-[13px] font-semibold text-accent-deep">
                Draws in {formatCountdown(lotteryAt, now)}
              </div>
            }
          >
            Every play this week is one entry into Sunday&rsquo;s draw — one winner takes a grand
            prize pooled from every sponsor.
          </ScheduledCard>

          <ScheduledCard
            icon="🤝"
            title="Community Unlock"
            badge={communityDone ? "UNLOCKED" : "IN PROGRESS"}
            badgeTone={communityDone ? "good" : "idle"}
            footer={
              <>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full rounded-full bg-good" style={{ width: `${communityPct}%` }} />
                </div>
                <div className="mono mt-1.5 text-[11.5px] text-text-soft">
                  {totalPlays} / {COMMUNITY_UNLOCK_TARGET} plays this week
                </div>
              </>
            }
          >
            {communityDone
              ? "This week's goal is met — every pod gets a bonus round until Sunday."
              : `${COMMUNITY_UNLOCK_TARGET - totalPlays} more plays across all pods unlocks a bonus round for everyone.`}
          </ScheduledCard>
        </div>
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading…</div>}>
      <GamesContent />
    </Suspense>
  );
}
