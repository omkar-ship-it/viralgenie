"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore, useHasHydrated, MERCHANTS } from "@/lib/store";
import { CATEGORIES, CATEGORY_ICON, CATEGORY_ACCENT, WISH_BASE_PRICE } from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";

const VOTED_KEY = "viralgenie-upvoted-wishes";

function timeAgo(iso: string) {
  const hrs = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function readVoted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(VOTED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function WishesContent() {
  const hydrated = useHasHydrated();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const wishes = useAppStore((s) => s.wishes);
  const wishWarEvents = useAppStore((s) => s.wishWarEvents);
  const addWish = useAppStore((s) => s.addWish);
  const upvoteWish = useAppStore((s) => s.upvoteWish);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const [sortBy, setSortBy] = useState<"trending" | "newest">("trending");
  const [voted, setVoted] = useState<Set<string>>(() => readVoted());

  useEffect(() => {
    // Deferred to post-mount so the prerendered shell (no localStorage) and
    // the client's first paint agree, then we swap in the real voted set.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoted(readVoted());
  }, []);

  const sorted = useMemo(() => {
    const list = categoryFilter ? wishes.filter((w) => w.category === categoryFilter) : [...wishes];
    return [...list].sort((a, b) =>
      sortBy === "trending"
        ? b.upvotes - a.upvotes
        : new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
    );
  }, [wishes, categoryFilter, sortBy]);

  function contestCount(wishId: string) {
    return new Set(wishWarEvents.filter((e) => e.wishId === wishId).map((e) => e.winnerId)).size;
  }

  function doUpvote(wishId: string) {
    if (voted.has(wishId)) return;
    upvoteWish(wishId);
    const next = new Set(voted).add(wishId);
    setVoted(next);
    window.localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(next)));
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
    return <div className="mx-auto max-w-[880px] px-6 py-24 text-text-soft">Loading wishes…</div>;
  }

  const openCount = wishes.filter((w) => w.status === "open").length;
  const grantedCount = wishes.filter((w) => w.status === "fulfilled").length;

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.38 }} />

      <div className="relative mx-auto max-w-[880px] px-6 pt-14 pb-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          {openCount} open · {grantedCount} granted
        </span>
        <h1 className="max-w-[16ch] text-[clamp(30px,5vw,50px)] leading-[1.05] font-semibold">
          Ask for what you actually want.
        </h1>
        <p className="mt-4 max-w-[60ch] text-[15.5px] text-text-soft">
          A wish costs a brand <span className="font-semibold text-text">₹{WISH_BASE_PRICE}</span> to
          claim. When two brands want the same one, they outbid each other for the right to
          grant it — bids are final, exactly like outbid.lol. Upvote what you want granted first.
        </p>

        <form
          onSubmit={submit}
          className="mt-9 mb-10 rounded-2xl border border-border bg-surface-raised p-5"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="mb-3 grid gap-3" style={{ gridTemplateColumns: "1fr auto" }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="rounded-xl border border-border bg-surface px-4 py-3 text-[14px] outline-none focus-visible:border-accent"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-3 text-[14px] outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_ICON[c]} {c}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I wish for…"
            required
            rows={2}
            className="mb-3 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[14px] outline-none focus-visible:border-accent"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary rounded-full px-6 py-2.5 text-[13px] font-semibold">
              ✨ Make a wish
            </button>
            {justAdded && <span className="text-[12.5px] font-semibold text-good">Posted — brands can see it now.</span>}
          </div>
        </form>

        <div className="mb-4 flex gap-1.5">
          {(["trending", "newest"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                sortBy === s ? "bg-text text-surface" : "bg-surface-sunken text-text-soft hover:text-text"
              }`}
            >
              {s === "trending" ? "🔥 Trending" : "Newest"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {sorted.map((w) => {
            const claimant = w.claimedByMerchantId ? MERCHANTS.find((m) => m.id === w.claimedByMerchantId) : null;
            const contests = contestCount(w.id);
            const hasVoted = voted.has(w.id);
            const accent = CATEGORY_ACCENT[w.category];
            return (
              <div
                key={w.id}
                className="relative flex gap-4 overflow-hidden rounded-2xl border bg-surface-raised px-5 py-4"
                style={{
                  borderColor:
                    w.status === "fulfilled" ? "var(--good)" : w.status === "claimed" ? "var(--gold)" : "var(--border)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <span className="absolute inset-y-0 left-0 w-1" style={{ background: `var(--${accent})` }} />

                <button
                  onClick={() => doUpvote(w.id)}
                  disabled={hasVoted}
                  className={`flex w-[52px] flex-none flex-col items-center justify-center gap-0.5 self-start rounded-xl border py-2 transition-all ${
                    hasVoted
                      ? "border-accent bg-surface-sunken text-accent-deep"
                      : "border-border text-text-soft hover:-translate-y-0.5 hover:border-accent hover:text-accent-deep"
                  }`}
                  aria-label="Upvote this wish"
                >
                  <span className="text-[13px] leading-none">▲</span>
                  <span className="mono text-[13px] font-bold">{w.upvotes}</span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-sunken text-[11px] font-bold text-accent-deep">
                      {w.customerName.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-[13px] font-semibold">{w.customerName}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold text-white"
                      style={{ background: `var(--${accent})` }}
                    >
                      {CATEGORY_ICON[w.category]} {w.category}
                    </span>
                    <span className="ml-auto text-[11px] text-text-soft">{timeAgo(w.createdAtISO)}</span>
                  </div>

                  <div className="mb-3 text-[15.5px] leading-snug">&ldquo;{w.text}&rdquo;</div>

                  {w.status === "fulfilled" && (
                    <div className="flex items-center gap-2.5 rounded-xl bg-good-soft px-3 py-2">
                      {claimant && <BrandLogo id={claimant.id} name={claimant.name} emoji={claimant.emoji} size="sm" />}
                      <span className="text-[12.5px] font-semibold text-good">
                        ✓ Granted by {claimant?.name ?? "a merchant"}
                        {w.fulfilledRewardLabel ? ` — ${w.fulfilledRewardLabel}` : ""}
                      </span>
                    </div>
                  )}
                  {w.status === "claimed" && (
                    <div
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                      style={{ background: "var(--gold-soft)", color: "#241705" }}
                    >
                      {claimant && <BrandLogo id={claimant.id} name={claimant.name} emoji={claimant.emoji} size="sm" />}
                      <span className="text-[12.5px] font-semibold">
                        🔥 {claimant?.name} is sponsoring this
                        {contests > 1 ? ` · ${contests} brands have bid` : ""}
                      </span>
                      <span className="mono ml-auto text-[13px] font-bold">₹{w.claimPrice}</span>
                    </div>
                  )}
                  {w.status === "open" && (
                    <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-sunken px-3 py-2 text-[12.5px] text-text-soft">
                      <span>Open — waiting for a brand to claim it</span>
                      <span className="mono font-semibold">from ₹{WISH_BASE_PRICE}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WishesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[880px] px-6 py-24 text-text-soft">Loading…</div>}>
      <WishesContent />
    </Suspense>
  );
}
