"use client";

import { useMemo, useState } from "react";
import { useAppStore, useHasHydrated, PODS, MERCHANTS } from "@/lib/store";

const CATEGORIES = Array.from(new Set(PODS.map((p) => p.category)));

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(ms / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WishesPage() {
  const hydrated = useHasHydrated();
  const wishes = useAppStore((s) => s.wishes);
  const addWish = useAppStore((s) => s.addWish);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const sorted = useMemo(
    () => [...wishes].sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()),
    [wishes]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    addWish(name.trim(), category, text.trim());
    setName("");
    setText("");
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 3000);
  }

  if (!hydrated) {
    return <div className="mx-auto max-w-[820px] px-6 py-16 text-text-soft">Loading wishes…</div>;
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 py-12">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        Wishes
      </span>
      <h1 className="mb-3">Ask for what you actually want</h1>
      <p className="mb-9 max-w-[62ch] text-[15px] text-text-soft">
        Post a wish and a nearby merchant can grant it directly — no game, no odds, just a
        brand deciding your ask is worth fulfilling.
      </p>

      <form
        onSubmit={submit}
        className="mb-12 rounded-2xl border border-border bg-surface-raised p-5"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <div className="mb-3 grid grid-cols-[1fr_auto] gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus-visible:border-accent"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wish for…"
          required
          rows={2}
          className="mb-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus-visible:border-accent"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" }}
          >
            Make a wish
          </button>
          {justAdded && <span className="text-[12.5px] text-good">Posted — merchants can see it now.</span>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {sorted.map((w) => {
          const merchant = w.fulfilledByMerchantId ? MERCHANTS.find((m) => m.id === w.fulfilledByMerchantId) : null;
          return (
            <div key={w.id} className="rounded-xl border border-border bg-surface-raised px-4.5 py-3.5">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-sunken text-[11px] font-bold text-accent-deep">
                  {w.customerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] font-semibold">{w.customerName}</span>
                <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10.5px] text-text-soft">
                  {w.category}
                </span>
                <span className="ml-auto text-[11px] text-text-soft">{timeAgo(w.createdAtISO)}</span>
              </div>
              <div className="mb-2 text-[14px]">Wish: {w.text}</div>
              {w.status === "fulfilled" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-2.5 py-1 text-[11px] font-semibold text-good">
                  ✓ Granted · {merchant?.name ?? "a merchant"}
                  {w.fulfilledRewardLabel ? ` — ${w.fulfilledRewardLabel}` : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-[11px] font-semibold text-warn">
                  ● Open
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
