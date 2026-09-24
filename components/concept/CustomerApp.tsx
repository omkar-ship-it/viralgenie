"use client";

import { useRef, useState } from "react";

const PRIZES = [
  "Free Coffee — Third Wave",
  "20% off — Glow Salon",
  "BOGO Mains — Trip's Diner",
  "Try Again ✨",
];

function PhoneFrame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="phone">
        <div className="phone-notch" />
        <div className="screen">{children}</div>
      </div>
      <p className="max-w-[26ch] text-center text-[13px] text-text-soft">{caption}</p>
    </div>
  );
}

function BottomNav({ active }: { active: "pool" | "play" | "wishes" | "wallet" }) {
  const items: Array<[typeof active, string]> = [
    ["pool", "Pool"],
    ["play", "Play"],
    ["wishes", "Wishes"],
    ["wallet", "Wallet"],
  ];
  return (
    <div className="flex justify-around border-t border-border px-1.5 py-2.5 text-[10px] text-text-soft">
      {items.map(([key, label]) => (
        <span key={key} className={key === active ? "font-semibold text-accent" : ""}>
          {label}
        </span>
      ))}
    </div>
  );
}

function RewardPoolScreen() {
  const merchants = [
    { rank: 1, name: "Third Wave Coffee", perk: "Free filter coffee + merch", odds: "3.2× odds", r1: true },
    { rank: 2, name: "Glow Salon & Spa", perk: "20% off any service", odds: "2.1× odds" },
    { rank: 3, name: "Trip's Diner", perk: "Buy 1 get 1 mains", odds: "1.6× odds" },
  ];
  return (
    <>
      <div className="flex items-center justify-between px-3.5 pt-5 pb-2.5 text-[13px] font-semibold">
        <span>📍 Koramangala</span>
        <span>🔔</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden px-3.5 pb-3">
        <div className="pool-banner rounded-xl px-3 py-2.5 text-[12px] font-semibold">
          ✨ This week&rsquo;s pool: ₹42,300 in prizes
        </div>
        {merchants.map((m) => (
          <div
            key={m.rank}
            className={`flex items-center gap-2.5 rounded-xl border border-border bg-surface px-2.5 py-2 ${
              m.r1 ? "rank-card-r1" : ""
            }`}
          >
            <div
              className={`mono flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-semibold ${
                m.r1 ? "bg-gold text-[#241705]" : "bg-surface-sunken text-accent-deep"
              }`}
            >
              {m.rank}
            </div>
            <div>
              <div className="text-[12.5px] font-semibold">{m.name}</div>
              <div className="text-[10.5px] text-text-soft">{m.perk}</div>
            </div>
            <div className="mono ml-auto text-right text-[10.5px] text-good">{m.odds}</div>
          </div>
        ))}
        <div className="flex flex-wrap gap-1.5">
          {["+ Baker's Basket", "+ FitZone", "+ 9 more"].map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-[10.5px] text-text-soft"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <BottomNav active="pool" />
    </>
  );
}

function SpinScreen() {
  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const [result, setResult] = useState("");

  function spin() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const extra = 1080 + Math.floor(Math.random() * 360);
    rotationRef.current += extra;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
    setResult("");
    setTimeout(
      () => setResult(`You won: ${PRIZES[Math.floor(Math.random() * PRIZES.length)]}`),
      reduced ? 0 : 2600
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-3.5 pt-5 pb-2.5 text-[13px] font-semibold">
        <span>Rub the Lamp</span>
        <span className="text-[11px] font-normal text-text-soft">3 plays left</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-3.5 pb-3">
        <div className="relative">
          <div className="wheel-pin" />
          <div className="wheel" ref={wheelRef}>
            <div className="wheel-hub">🧞</div>
          </div>
        </div>
        <button
          onClick={spin}
          className="rounded-full px-5 py-2.5 text-[12.5px] font-semibold text-white"
          style={{
            background: "linear-gradient(120deg, var(--accent), var(--accent-deep))",
            boxShadow: "var(--shadow)",
          }}
        >
          Rub the Lamp ✨
        </button>
        <div className="min-h-[14px] text-center text-[11px] font-semibold text-good">
          {result || " "}
        </div>
      </div>
      <BottomNav active="play" />
    </>
  );
}

function WishesScreen() {
  return (
    <>
      <div className="flex items-center justify-between px-3.5 pt-5 pb-2.5 text-[13px] font-semibold">
        <span>Wishes</span>
        <span className="text-[11px] font-normal text-text-soft">+ New</span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden px-3.5 pb-3">
        <div className="rounded-xl border border-border bg-surface px-2.5 py-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-surface-sunken text-[10px] font-bold text-accent-deep">
              A
            </div>
            <span className="text-[11.5px] font-semibold">Ananya</span>
          </div>
          <div className="mb-1.5 text-[11.5px]">
            Wish: a birthday cake for my mom this Saturday 🎂
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-2 py-0.5 text-[10px] font-semibold text-good">
            ✓ Granted · Baker&rsquo;s Basket
          </span>
        </div>
        <div className="rounded-xl border border-border bg-surface px-2.5 py-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-surface-sunken text-[10px] font-bold text-accent-deep">
              R
            </div>
            <span className="text-[11.5px] font-semibold">Rahul</span>
          </div>
          <div className="mb-1.5 text-[11.5px]">Wish: new running shoes before my marathon</div>
          <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">
            ● Open · 3 brands watching
          </span>
        </div>
        <div className="mt-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-[11px] text-text-soft">
          Make a wish…
        </div>
      </div>
      <BottomNav active="wishes" />
    </>
  );
}

export function CustomerApp() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-7">
      <PhoneFrame caption="Reward Pool feed — rank and odds are both bought by the merchant's bid.">
        <RewardPoolScreen />
      </PhoneFrame>
      <PhoneFrame caption="Payout table is drawn from the pool, weighted by each sponsor's rank.">
        <SpinScreen />
      </PhoneFrame>
      <PhoneFrame caption="Granted wishes auto-generate a shareable card — the marketplace's cheapest ad unit.">
        <WishesScreen />
      </PhoneFrame>
    </div>
  );
}
