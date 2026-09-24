"use client";

import { useEffect, useState } from "react";
import { useAppStore, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { MAX_BRANDS_DISPLAYED, CATEGORY_ACCENT } from "@/lib/data";

function podOf(merchantId: string) {
  const merchant = MERCHANTS.find((m) => m.id === merchantId)!;
  return PODS.find((p) => p.id === merchant.podId)!;
}

export function BrandWall({ categoryFilter }: { categoryFilter: string | null }) {
  const stock = useAppStore((s) => s.stock);
  const [spotlight, setSpotlight] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSpotlight((i) => i + 1), 3500);
    return () => window.clearInterval(id);
  }, []);

  // Prominence is what a brand is currently giving away, never what they paid —
  // games stay fair, so this wall can't be a pay-for-placement leaderboard.
  const ranked = MERCHANTS.map((m) => {
    const prominence = REWARD_ITEMS.filter((r) => r.merchantId === m.id).reduce(
      (sum, r) => sum + (stock[r.id] ?? 0),
      0
    );
    return { merchant: m, pod: podOf(m.id), prominence };
  })
    .sort((a, b) => b.prominence - a.prominence)
    .slice(0, MAX_BRANDS_DISPLAYED);

  const visible = categoryFilter ? ranked.filter((r) => r.pod.category === categoryFilter) : ranked;

  return (
    <div className="mb-14">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[16px] font-semibold">Sponsor Wall</h2>
        <span className="text-[11.5px] text-text-soft">
          {ranked.length} of {MAX_BRANDS_DISPLAYED} brand spots filled
        </span>
      </div>
      <p className="mb-4 text-[12px] text-text-soft">
        Tile size tracks what a brand is currently giving away, not what it paid —
        million-dollar-homepage energy, without selling pixels.
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gridAutoFlow: "dense" }}
      >
        {visible.map(({ merchant, pod, prominence }, i) => {
          const tier = i < 2 ? "large" : i < 6 ? "medium" : "small";
          const accent = CATEGORY_ACCENT[pod.category];
          const isSpotlight = visible.length > 0 && i === spotlight % visible.length;
          return (
            <div
              key={merchant.id}
              className={`brand-tile ${isSpotlight ? "spotlight" : ""}`}
              style={{
                gridColumn: tier === "large" ? "span 2" : "span 1",
                gridRow: tier === "large" ? "span 2" : "span 1",
                borderColor: `var(--${accent})`,
              }}
              title={`${merchant.name} · ${pod.category} · ${prominence} prizes live`}
            >
              <span style={{ fontSize: tier === "large" ? 26 : tier === "medium" ? 20 : 16 }}>{merchant.emoji}</span>
              <span
                className="truncate font-semibold"
                style={{ fontSize: tier === "large" ? 12.5 : 11 }}
              >
                {merchant.name}
              </span>
              {tier === "large" && (
                <span className="text-[10px] text-text-soft">{prominence} prizes live</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
