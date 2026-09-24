"use client";

import { useState } from "react";

function Panel({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-border bg-surface-raised px-5.5 py-5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-[16px] font-semibold">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Badge({ tone, children }: { tone: "warn" | "good"; children: React.ReactNode }) {
  const cls =
    tone === "warn" ? "bg-warn-soft text-warn" : "bg-good-soft text-good";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border py-2.5 text-[13.5px] first:border-t-0">
      <span className="text-text-soft">{label}</span>
      <span className="mono font-semibold">{value}</span>
    </div>
  );
}

const MIN_INCREMENT = 300;
const STARTING_HOLDER = { name: "Third Wave Coffee", price: 8000, heldDays: 4 };
const STOCK_HOURS_TOTAL = 24;

function BidForRank() {
  const [holder, setHolder] = useState(STARTING_HOLDER);
  const [youAreHolder, setYouAreHolder] = useState(false);
  const [stockHours, setStockHours] = useState(6);
  const nextBid = holder.price + MIN_INCREMENT;

  function outbid() {
    setHolder({ name: "You", price: nextBid, heldDays: 0 });
    setYouAreHolder(true);
    setStockHours(STOCK_HOURS_TOTAL);
  }

  return (
    <Panel
      title="Rank Ladder"
      badge={
        <Badge tone={youAreHolder ? "good" : "warn"}>
          {youAreHolder ? "You hold #1" : "You hold #2"}
        </Badge>
      }
    >
      <Row label={`#1 — ${holder.name}`} value={`₹${holder.price.toLocaleString("en-IN")}`} />
      <Row
        label="Holding #1 since"
        value={holder.heldDays === 0 ? "just now" : `${holder.heldDays} days ago`}
      />
      <p className="mt-2 text-[11.5px] text-text-soft">
        No scheduled close — #1 stays yours until someone pays more. Every bid is final.
      </p>

      <div className="mt-3.5 flex items-center gap-2 rounded-[10px] bg-surface-sunken px-3 py-2.5">
        <span className="mono">₹</span>
        <span className="mono flex-1 text-[15px] font-semibold">
          {nextBid.toLocaleString("en-IN")}
        </span>
        <span className="text-[11px] text-text-soft">min. to outbid</span>
      </div>
      <button
        onClick={outbid}
        disabled={youAreHolder}
        className="mt-2.5 w-full rounded-full py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
        style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" }}
      >
        {youAreHolder ? "You're #1 right now" : `Outbid for #1 — ₹${nextBid.toLocaleString("en-IN")}`}
      </button>

      <div className="mt-4 border-t border-border pt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
          <span className="text-text-soft">Reward stock defending your rank</span>
          <span className={`font-semibold ${stockHours <= 6 ? "text-warn" : "text-good"}`}>
            ~{stockHours} hrs left
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className={`h-full rounded-full ${stockHours <= 6 ? "bg-warn" : "bg-good"}`}
            style={{ width: `${Math.min(100, (stockHours / STOCK_HOURS_TOTAL) * 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10.5px] text-text-soft">
          Auto-demoted the moment stock hits zero — even if no one outbids you.
        </p>
      </div>

      <p className="mt-3.5 mb-1.5 text-[11.5px] text-text-soft">
        Projected reach if you hold #1
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
        <div className="reach-fill h-full rounded-full" style={{ width: "72%" }} />
      </div>
      <div className="flex items-center justify-between pt-2.5 text-[13.5px]">
        <span className="text-text-soft">Est. impressions this week</span>
        <span className="mono font-semibold">+18,400</span>
      </div>
    </Panel>
  );
}

function RewardPoolContribution() {
  const items = [
    { name: "Free filter coffee", qty: "32 of 50 claimed", pct: 64 },
    { name: "20% off pastries", qty: "11 of 40 claimed", pct: 28 },
    { name: "Free merch tote (top prize)", qty: "1 of 3 claimed", pct: 33 },
  ];
  return (
    <Panel title="Reward Pool Contribution" badge={<Badge tone="good">Live</Badge>}>
      {items.map((it) => (
        <div
          key={it.name}
          className="flex items-center gap-2.5 border-t border-border py-2.5 first:border-t-0"
        >
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{it.name}</div>
            <div className="text-[11.5px] text-text-soft">{it.qty}</div>
          </div>
          <div className="h-1.5 w-[70px] overflow-hidden rounded-full bg-surface-sunken">
            <div className="h-full bg-accent" style={{ width: `${it.pct}%` }} />
          </div>
        </div>
      ))}
      <button className="mt-3.5 w-full rounded-[10px] border border-dashed border-border py-2.5 text-[12.5px] font-semibold text-text-soft">
        + Add a reward to the pool
      </button>
    </Panel>
  );
}

function WishesInbox() {
  return (
    <Panel
      title="Wishes Inbox"
      badge={<Badge tone="warn">4 open · Food &amp; Beverage</Badge>}
    >
      <div className="flex items-start gap-2.5 border-t border-border py-2.75 first:border-t-0">
        <div className="flex-1 text-[13px]">
          <span className="font-semibold">Priya</span> — &ldquo;wish for a quiet corner
          to study with good coffee for finals week&rdquo;
          <div className="mt-0.5 text-[11.5px] text-text-soft">
            Matched by category + 1.2km away
          </div>
        </div>
        <div className="flex flex-none gap-1.5">
          <button className="rounded-full bg-accent px-3 py-1.5 text-[11.5px] font-semibold text-white">
            Fulfill
          </button>
          <button className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold">
            Pass
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2.5 border-t border-border py-2.75">
        <div className="flex-1 text-[13px]">
          <span className="font-semibold">Dev</span> — &ldquo;wish for a cold brew that
          doesn&rsquo;t taste watered down&rdquo;
          <div className="mt-0.5 text-[11.5px] text-text-soft">
            Matched by category + 0.6km away
          </div>
        </div>
        <div className="flex flex-none gap-1.5">
          <button className="rounded-full bg-accent px-3 py-1.5 text-[11.5px] font-semibold text-white">
            Fulfill
          </button>
          <button className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold">
            Pass
          </button>
        </div>
      </div>
      <div className="flex items-start gap-2.5 border-t border-border py-2.75">
        <div className="flex-1 text-[13px]">
          <span className="font-semibold">Ananya</span> — &ldquo;wish for a birthday
          cake for my mom&rdquo;
          <div className="mt-0.5 text-[11.5px] text-text-soft">
            Fulfilled · shared to Instagram Stories · +2,100 reach
          </div>
        </div>
        <span className="flex-none rounded-full bg-good-soft px-2.5 py-1 text-[11px] font-semibold text-good">
          ✓ Done
        </span>
      </div>
    </Panel>
  );
}

function RoiStats() {
  const stats = [
    { k: "Repeat Visit Rate", v: "41%", d: "↑ 6pt since bidding began", hero: true },
    { k: "Redemptions this week", v: "214", d: "↑ 18%" },
    { k: "Cost per redemption", v: "₹38", d: "↓ ₹9 vs. flat ad spend" },
    { k: "New customers via wishes", v: "62", d: "↑ 24%" },
  ];
  return (
    <div className="col-span-full grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
      {stats.map((s) => (
        <div
          key={s.k}
          className={`rounded-[14px] border px-4.5 py-4 ${
            s.hero
              ? "border-accent"
              : "border-border bg-surface-raised"
          }`}
          style={
            s.hero
              ? {
                  background:
                    "linear-gradient(135deg, var(--surface-sunken), var(--surface-raised))",
                }
              : undefined
          }
        >
          <div className="mb-1.5 text-[12px] text-text-soft">{s.k}</div>
          <div className={`mono text-[24px] font-semibold ${s.hero ? "text-accent-deep" : ""}`}>
            {s.v}
          </div>
          <div className="mt-1 text-[11.5px] text-good">{s.d}</div>
        </div>
      ))}
    </div>
  );
}

export function MerchantConsole() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
      <BidForRank />
      <RewardPoolContribution />
      <WishesInbox />
      <RoiStats />
    </div>
  );
}
