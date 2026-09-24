"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { MAX_BRANDS_DISPLAYED, CATEGORIES } from "@/lib/data";
import { BrandGrid } from "@/components/app/BrandGrid";

function BrandsContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const stock = useAppStore((s) => s.stock);
  const wishes = useAppStore((s) => s.wishes);
  const [query, setQuery] = useState("");

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading brands…</div>;
  }

  const totalPrizes = REWARD_ITEMS.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  const sponsoring = new Set(
    wishes.filter((w) => w.claimedByMerchantId).map((w) => w.claimedByMerchantId)
  ).size;

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.4 }} />

      <div className="relative mx-auto max-w-[1180px] px-6 pt-14 pb-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          {MERCHANTS.length} of {MAX_BRANDS_DISPLAYED} spots filled
        </span>
        <h1 className="max-w-[16ch] text-[clamp(30px,5vw,54px)] leading-[1.03] font-semibold">
          The brands putting prizes on the board.
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15.5px] text-text-soft">
          Only 100 brands are live at a time across every category. Rank is earned by what
          a brand is giving away right now — it is never for sale. Open any brand to see
          its prizes and bid on the wishes it could grant.
        </p>

        <div className="mt-8 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[28px] text-accent-deep">{MERCHANTS.length}</div>
            <div className="mt-1 text-[11.5px] tracking-wide text-text-soft uppercase">Live brands</div>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[28px] text-accent-deep">{totalPrizes.toLocaleString("en-IN")}</div>
            <div className="mt-1 text-[11.5px] tracking-wide text-text-soft uppercase">Prizes offered</div>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[28px] text-accent-deep">{CATEGORIES.length}</div>
            <div className="mt-1 text-[11.5px] tracking-wide text-text-soft uppercase">Categories</div>
          </div>
          <div className="glass rounded-2xl px-5 py-4">
            <div className="stat-num text-[28px] text-accent-deep">{sponsoring}</div>
            <div className="mt-1 text-[11.5px] tracking-wide text-text-soft uppercase">Sponsoring a wish</div>
          </div>
        </div>

        <div className="mt-9 mb-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands…"
            className="w-full max-w-[380px] rounded-full border border-border bg-surface-raised px-5 py-3 text-[14px] outline-none focus-visible:border-accent"
          />
        </div>

        <BrandGrid categoryFilter={category} query={query} linkTo="brand" />
      </div>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1180px] px-6 py-24 text-text-soft">Loading…</div>}>
      <BrandsContent />
    </Suspense>
  );
}
