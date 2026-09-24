"use client";

import { useMemo, useState } from "react";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(ms / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "just now" : `${days} day${days === 1 ? "" : "s"} ago`;
}

function Panel({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised px-5.5 py-5" style={{ boxShadow: "var(--shadow)" }}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-[16px] font-semibold">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}

export default function MerchantConsolePage() {
  const hydrated = useHasHydrated();
  const activeMerchantId = useAppStore((s) => s.activeMerchantId);
  const setActiveMerchant = useAppStore((s) => s.setActiveMerchant);
  const bids = useAppStore((s) => s.bids);
  const stock = useAppStore((s) => s.stock);
  const wishes = useAppStore((s) => s.wishes);
  const warEvents = useAppStore((s) => s.warEvents);
  const outbid = useAppStore((s) => s.outbid);
  const addStock = useAppStore((s) => s.addStock);
  const fulfillWish = useAppStore((s) => s.fulfillWish);
  const merchantStock = useAppStore((s) => s.merchantStock);

  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [restockQty, setRestockQty] = useState<Record<string, string>>({});
  const [fulfillPick, setFulfillPick] = useState<Record<string, string>>({});

  const merchant = MERCHANTS.find((m) => m.id === activeMerchantId) ?? MERCHANTS[0];
  const pod = PODS.find((p) => p.id === merchant.podId)!;

  const ranking = useMemo(
    () =>
      bids
        .filter((b) => b.podId === pod.id && b.price > 0)
        .sort((a, b) => b.price - a.price),
    [bids, pod.id]
  );
  const myRank = ranking.findIndex((b) => b.merchantId === merchant.id);
  const leader = ranking[0];
  const nextBid = Math.max(100, (leader?.price ?? 0) + 100);
  const myStockTotal = merchantStock(merchant.id);
  const myItems = REWARD_ITEMS.filter((r) => r.merchantId === merchant.id);

  const podWishes = wishes.filter((w) => w.category === pod.category && w.status === "open");
  const podWarEvents = warEvents.filter((e) => e.podId === pod.id).slice(0, 6);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading console…</div>;
  }

  function doOutbid() {
    const res = outbid(pod.id, merchant.id);
    setFeedback(res);
    window.setTimeout(() => setFeedback(null), 4000);
  }

  function doRestock(rewardId: string) {
    const qty = Number(restockQty[rewardId] ?? "0");
    if (qty > 0) {
      addStock(rewardId, qty);
      setRestockQty((s) => ({ ...s, [rewardId]: "" }));
    }
  }

  function doFulfill(wishId: string) {
    const rewardId = fulfillPick[wishId] ?? myItems[0]?.id;
    const reward = myItems.find((r) => r.id === rewardId);
    if (!reward) return;
    fulfillWish(wishId, merchant.id, reward.label);
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-2 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
            Merchant console
          </span>
          <h1>Where the ladder gets defended</h1>
        </div>
        <label className="flex items-center gap-2 text-[13px]">
          <span className="text-text-soft">Acting as</span>
          <select
            value={activeMerchantId}
            onChange={(e) => setActiveMerchant(e.target.value)}
            className="rounded-lg border border-border bg-surface-raised px-3 py-2 font-semibold"
          >
            {MERCHANTS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        <Panel
          title="Rank Ladder"
          badge={
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                myRank === 0 ? "bg-good-soft text-good" : "bg-warn-soft text-warn"
              }`}
            >
              {myRank === 0 ? "You hold #1" : myRank > 0 ? `You hold #${myRank + 1}` : "Not on the ladder"}
            </span>
          }
        >
          <div className="mb-3 flex flex-col gap-1.5">
            {ranking.length === 0 && <p className="text-[13px] text-text-soft">No one has bid in {pod.name} yet.</p>}
            {ranking.map((b, i) => {
              const m = MERCHANTS.find((x) => x.id === b.merchantId)!;
              return (
                <div
                  key={b.merchantId}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] ${
                    b.merchantId === merchant.id ? "bg-surface-sunken font-semibold" : ""
                  }`}
                >
                  <span>
                    #{i + 1} {m.emoji} {m.name}
                    {i === 0 && <span className="ml-1.5 text-[10.5px] text-text-soft">· held {daysAgo(b.heldSinceISO)}</span>}
                  </span>
                  <span className="mono">₹{b.price.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>
          <p className="mb-3 text-[11.5px] text-text-soft">
            No scheduled close — #1 stays yours until someone pays more. Every bid is final.
          </p>
          <button
            onClick={doOutbid}
            disabled={myRank === 0}
            className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" }}
          >
            {myRank === 0 ? "You're #1 right now" : `Outbid for #1 — ₹${nextBid.toLocaleString("en-IN")}`}
          </button>
          {feedback && (
            <p className={`mt-2 text-[12px] font-semibold ${feedback.ok ? "text-good" : "text-warn"}`}>
              {feedback.message}
            </p>
          )}

          <div className="mt-4 border-t border-border pt-3.5">
            <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
              <span className="text-text-soft">Your live reward stock in this pod</span>
              <span className={`font-semibold ${myStockTotal <= 5 ? "text-warn" : "text-good"}`}>
                {myStockTotal} units
              </span>
            </div>
            <p className="text-[10.5px] text-text-soft">
              Auto-demoted from #1 the moment your stock hits zero — even if no one outbids you.
            </p>
          </div>
        </Panel>

        <Panel title="Reward Pool Contribution" badge={<span className="rounded-full bg-good-soft px-2.5 py-0.5 text-[11px] font-semibold text-good">Live</span>}>
          {myItems.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 border-t border-border py-2.5 first:border-t-0">
              <div className="flex-1">
                <div className="text-[13px] font-semibold">{r.label}</div>
                <div className="text-[11.5px] text-text-soft">
                  {stock[r.id] ?? 0} of {r.totalStock} left
                </div>
              </div>
              <input
                type="number"
                min={0}
                placeholder="+qty"
                value={restockQty[r.id] ?? ""}
                onChange={(e) => setRestockQty((s) => ({ ...s, [r.id]: e.target.value }))}
                className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-[12.5px] outline-none"
              />
              <button
                onClick={() => doRestock(r.id)}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-accent-deep"
              >
                Add
              </button>
            </div>
          ))}
        </Panel>

        <Panel
          title="Wishes Inbox"
          badge={
            <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn">
              {podWishes.length} open · {pod.category}
            </span>
          }
        >
          {podWishes.length === 0 && <p className="text-[13px] text-text-soft">No open wishes in your category right now.</p>}
          {podWishes.map((w) => (
            <div key={w.id} className="flex flex-col gap-2 border-t border-border py-2.75 first:border-t-0">
              <div className="text-[13px]">
                <span className="font-semibold">{w.customerName}</span> — &ldquo;{w.text}&rdquo;
                <div className="mt-0.5 text-[11.5px] text-text-soft">{timeAgo(w.createdAtISO)}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={fulfillPick[w.id] ?? myItems[0]?.id ?? ""}
                  onChange={(e) => setFulfillPick((s) => ({ ...s, [w.id]: e.target.value }))}
                  className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-[11.5px]"
                >
                  {myItems.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => doFulfill(w.id)}
                  disabled={myItems.length === 0}
                  className="rounded-full bg-accent px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-50"
                >
                  Fulfill
                </button>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Rank Wars" badge={<span className="text-[11px] text-text-soft">{pod.name}</span>}>
          {podWarEvents.length === 0 && <p className="text-[13px] text-text-soft">No bidding activity in this pod yet.</p>}
          {podWarEvents.map((e) => {
            const winner = MERCHANTS.find((m) => m.id === e.winnerId);
            const loser = e.loserId ? MERCHANTS.find((m) => m.id === e.loserId) : null;
            const isStockout = e.winnerId === "__stockout__";
            return (
              <div key={e.id} className="flex items-center gap-2.5 border-t border-border py-2.5 text-[12.5px] first:border-t-0">
                {isStockout ? (
                  <span className="flex-1">
                    <span className="font-semibold">{loser?.name}</span> ran out of stock and was auto-demoted from #1
                  </span>
                ) : (
                  <span className="flex-1">
                    <span className="font-semibold">{winner?.name}</span> outbid{" "}
                    <span className="text-text-soft">{loser?.name ?? "an empty ladder"}</span> for #1
                  </span>
                )}
                <div className="flex flex-none flex-col items-end">
                  {!isStockout && (
                    <span className="mono font-semibold text-accent-deep">
                      ₹{e.price.toLocaleString("en-IN")} <span className="text-good">+{e.delta}</span>
                    </span>
                  )}
                  <span className="text-[10.5px] text-text-soft">{timeAgo(e.atISO)}</span>
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}
