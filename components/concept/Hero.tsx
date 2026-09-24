"use client";

import { useEffect, useState } from "react";

type Bid = { rank: number; name: string; base: number };

const INITIAL: Bid[] = [
  { rank: 1, name: "Third Wave Coffee", base: 8000 },
  { rank: 2, name: "Glow Salon & Spa", base: 6200 },
  { rank: 3, name: "Trip's Diner", base: 5400 },
];

export function Hero() {
  const [bids, setBids] = useState(INITIAL);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setBids((prev) =>
        prev.map((b) => ({ ...b, base: b.base + Math.round(Math.random() * 150) }))
      );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="mx-auto max-w-[1180px] px-6 pt-16 pb-14">
      <span className="mb-3.5 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        Adapted from outbid.lol&rsquo;s always-live, pay-to-dethrone ladder
      </span>
      <h1 className="max-w-[16ch] text-[clamp(32px,5vw,52px)] leading-[1.08] font-semibold tracking-tight">
        Merchants bid for the spotlight. Customers play for the prize.
      </h1>
      <p className="mt-4.5 max-w-[62ch] text-[16.5px] text-text-soft">
        No scheduled auctions — any merchant can pay to take #1 at any moment, and holds it
        until someone pays more. That rank feeds a shared reward pool, played out through
        the game mechanics LoyalGenie already has, plus a wish marketplace where brands earn
        goodwill by granting what customers actually ask for.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-2.5">
        <span className="mr-1 flex items-center gap-1.5 text-[12px] tracking-[0.07em] text-text-soft uppercase">
          <span
            className="motion-safe-only h-[7px] w-[7px] rounded-full bg-warn"
            style={{ animation: "pulse 1.8s ease-in-out infinite" }}
          />
          Holding right now · Koramangala pool
        </span>
        {bids.map((b) => (
          <div
            key={b.rank}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-[13.5px]"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <span className="font-display text-[14px] font-semibold text-gold">
              #{b.rank}
            </span>
            {b.name}
            <span className="mono font-semibold text-accent-deep">
              ₹{b.base.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }`}</style>
    </section>
  );
}
