"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, MERCHANTS } from "@/lib/store";
import { CATEGORIES } from "@/lib/data";

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(ms / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CAT_ICON: Record<string, string> = {
  "Food & Beverage": "☕",
  "Beauty & Wellness": "💆",
  Fitness: "🏋️",
};

function WishesContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const wishes = useAppStore((s) => s.wishes);
  const wishWarEvents = useAppStore((s) => s.wishWarEvents);
  const addWish = useAppStore((s) => s.addWish);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const filtered = useMemo(
    () => (categoryFilter ? wishes.filter((w) => w.category === categoryFilter) : wishes),
    [wishes, categoryFilter]
  );
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()),
    [filtered]
  );

  function contestCount(wishId: string) {
    return new Set(wishWarEvents.filter((e) => e.wishId === wishId).map((e) => e.winnerId)).size;
  }

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
    return <div className="mx-auto max-w-[860px] px-6 py-16 text-text-soft">Loading wishes…</div>;
  }

  return (
    <div className="mx-auto max-w-[860px] px-6 py-12">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        Wishes
      </span>
      <h1 className="mb-3">Ask for what you actually want</h1>
      <p className="mb-9 max-w-[64ch] text-[15px] text-text-soft">
        Every wish starts at <span className="font-semibold text-text">₹100</span> for a
        merchant to claim and grant. If more than one brand wants the goodwill, they{" "}
        <span className="font-semibold text-text">outbid each other</span> for the right to
        fulfil it — bids are final, exactly like outbid.lol.
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
                {CAT_ICON[c]} {c}
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
          const claimant = w.claimedByMerchantId ? MERCHANTS.find((m) => m.id === w.claimedByMerchantId) : null;
          const contests = contestCount(w.id);
          return (
            <div
              key={w.id}
              className="overflow-hidden rounded-2xl border bg-surface-raised px-5 py-4"
              style={{
                borderColor: w.status === "fulfilled" ? "var(--good)" : w.status === "claimed" ? "var(--gold)" : "var(--border)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-sunken text-[11px] font-bold text-accent-deep">
                  {w.customerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] font-semibold">{w.customerName}</span>
                <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10.5px] text-text-soft">
                  {CAT_ICON[w.category]} {w.category}
                </span>
                <span className="ml-auto text-[11px] text-text-soft">{timeAgo(w.createdAtISO)}</span>
              </div>
              <div className="mb-3 text-[15px] leading-snug">&ldquo;{w.text}&rdquo;</div>

              {w.status === "fulfilled" && (
                <div className="flex items-center gap-2 rounded-xl bg-good-soft px-3 py-2 text-[12.5px] font-semibold text-good">
                  ✓ Granted by {claimant?.name ?? "a merchant"}
                  {w.fulfilledRewardLabel ? ` — ${w.fulfilledRewardLabel}` : ""}
                </div>
              )}
              {w.status === "claimed" && (
                <div
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[12.5px]"
                  style={{ background: "var(--gold-soft)", color: "#241705" }}
                >
                  <span className="font-semibold">
                    🔥 {claimant?.emoji} {claimant?.name} is sponsoring this
                    {contests > 1 ? ` · ${contests} brands have bid` : ""}
                  </span>
                  <span className="mono font-bold">₹{w.claimPrice}</span>
                </div>
              )}
              {w.status === "open" && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-sunken px-3 py-2 text-[12.5px] text-text-soft">
                  <span>Open — waiting for a merchant to claim it</span>
                  <span className="mono font-semibold">from ₹100</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WishesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[860px] px-6 py-16 text-text-soft">Loading…</div>}>
      <WishesContent />
    </Suspense>
  );
}
