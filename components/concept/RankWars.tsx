"use client";

import { useEffect, useState } from "react";

type WarEvent = {
  id: number;
  pod: string;
  winner: string;
  loser: string;
  price: number;
  delta: number;
  rank: number;
  ago: string;
};

const SEED: WarEvent[] = [
  { id: 1, pod: "Cafés · Koramangala", winner: "Third Wave Coffee", loser: "Filter & Fable", price: 8000, delta: 300, rank: 1, ago: "2m ago" },
  { id: 2, pod: "Salons · Indiranagar", winner: "Glow Salon & Spa", loser: "Bliss Studio", price: 5400, delta: 150, rank: 1, ago: "11m ago" },
  { id: 3, pod: "Diners · HSR Layout", winner: "Trip's Diner", loser: "Urban Tadka", price: 4200, delta: 200, rank: 2, ago: "24m ago" },
  { id: 4, pod: "Cafés · Koramangala", winner: "Filter & Fable", loser: "Brew Bros", price: 5100, delta: 100, rank: 3, ago: "38m ago" },
];

const RANDOM_PODS = [
  { pod: "Cafés · Koramangala", names: ["Third Wave Coffee", "Filter & Fable", "Brew Bros"] },
  { pod: "Salons · Indiranagar", names: ["Glow Salon & Spa", "Bliss Studio", "Studio Noir"] },
  { pod: "Diners · HSR Layout", names: ["Trip's Diner", "Urban Tadka", "The Local"] },
];

function randomEvent(id: number): WarEvent {
  const group = RANDOM_PODS[Math.floor(Math.random() * RANDOM_PODS.length)];
  const [a, b] = [...group.names].sort(() => Math.random() - 0.5);
  const delta = (1 + Math.floor(Math.random() * 4)) * 100;
  return {
    id,
    pod: group.pod,
    winner: a,
    loser: b,
    price: 4000 + Math.floor(Math.random() * 4000),
    delta,
    rank: 1 + Math.floor(Math.random() * 2),
    ago: "just now",
  };
}

function medal(rank: number) {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
}

export function RankWars() {
  const [events, setEvents] = useState(SEED);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let nextId = 100;
    const id = setInterval(() => {
      setEvents((prev) => [randomEvent(nextId++), ...prev].slice(0, 6));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-raised"
      style={{ boxShadow: "var(--shadow)" }}
    >
      {events.map((e) => (
        <div key={e.id} className="flex items-center gap-3.5 px-5 py-3.5 text-[13.5px]">
          <span className="text-[18px] leading-none">{medal(e.rank)}</span>
          <div className="min-w-0 flex-1">
            <span className="font-semibold">{e.winner}</span> outbid{" "}
            <span className="text-text-soft">{e.loser}</span> for #{e.rank} in{" "}
            <span className="text-text-soft">{e.pod}</span>
          </div>
          <div className="flex flex-none flex-col items-end">
            <span className="mono font-semibold text-accent-deep">
              ₹{e.price.toLocaleString("en-IN")}
              <span className="text-good"> +{e.delta}</span>
            </span>
            <span className="text-[10.5px] text-text-soft">{e.ago}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
