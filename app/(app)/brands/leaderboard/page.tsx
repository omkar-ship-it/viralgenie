"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, MERCHANTS } from "@/lib/store";
import { Leaderboard } from "@/components/app/Leaderboard";
import { BrandTabs } from "@/components/app/BrandTabs";

function LeaderboardContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const loves = useAppStore((s) => s.loves);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading leaderboards…</div>;
  }

  const totalLove = MERCHANTS.reduce((sum, m) => sum + (loves[m.id] ?? 0), 0);

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.4 }} />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          ❤️ {totalLove.toLocaleString("en-IN")} love given
        </span>
        <h1 className="max-w-[16ch] text-[clamp(30px,5vw,54px)] leading-[1.03] font-semibold">
          Who this city actually loves.
        </h1>
        <p className="mt-4 mb-7 max-w-[62ch] text-[15.5px] text-text-soft">
          Four boards, four different kinds of good: the brands people love, the ones
          giving the most away, the ones granting wishes, and the ones putting real money
          behind them. {category ? `Filtered to ${category}.` : "Filter by category up top, or see every category's leaders below."}
        </p>

        <div className="mb-8">
          <BrandTabs />
        </div>

        <Leaderboard categoryFilter={category} />
      </div>
    </div>
  );
}

export default function BrandLeaderboardPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading…</div>}>
      <LeaderboardContent />
    </Suspense>
  );
}
