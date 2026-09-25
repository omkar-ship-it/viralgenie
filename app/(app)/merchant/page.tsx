"use client";

import { useMemo, useState } from "react";
import { useAppStore, useHasHydrated, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import { WISH_BASE_PRICE, WISH_INCREMENT, WISH_PACK_SINGLE, WISH_PACK_BULK } from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";
import { BidCheckout } from "@/components/app/BidCheckout";
import Link from "next/link";
import { rankBoard, SPOT_BASE_PRICE, SPOT_INCREMENT } from "@/lib/data";

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(ms / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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
  const stock = useAppStore((s) => s.stock);
  const wishes = useAppStore((s) => s.wishes);
  const wallets = useAppStore((s) => s.wallets);
  const wishWarEvents = useAppStore((s) => s.wishWarEvents);
  const topUpWallet = useAppStore((s) => s.topUpWallet);
  const claimOrOutbidWish = useAppStore((s) => s.claimOrOutbidWish);
  const fulfillWish = useAppStore((s) => s.fulfillWish);
  const addStock = useAppStore((s) => s.addStock);
  const boardBids = useAppStore((s) => s.boardBids);
  const payments = useAppStore((s) => s.payments);
  const profile = useAppStore((s) => s.merchantProfiles[s.activeMerchantId]);

  const [feedback, setFeedback] = useState<Record<string, { ok: boolean; message: string } | undefined>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [restockQty, setRestockQty] = useState<Record<string, string>>({});
  const [fulfillPick, setFulfillPick] = useState<Record<string, string>>({});

  const merchant = MERCHANTS.find((m) => m.id === activeMerchantId) ?? MERCHANTS[0];
  const boardRanked = rankBoard(boardBids);
  const boardTotal = boardRanked.length;
  const myBoardRank = boardRanked.find((r) => r.merchantId === activeMerchantId);
  const myPayments = payments.filter((p) => p.merchantId === activeMerchantId);
  const pod = PODS.find((p) => p.id === merchant.podId)!;
  const balance = wallets[merchant.id] ?? 0;
  const myItems = REWARD_ITEMS.filter((r) => r.merchantId === merchant.id);

  const categoryWishes = useMemo(
    () =>
      wishes
        .filter((w) => w.category === pod.category && w.status !== "fulfilled")
        .sort((a, b) => b.claimPrice - a.claimPrice || new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()),
    [wishes, pod.category]
  );
  const myWishWars = wishWarEvents
    .filter((e) => wishes.some((w) => w.id === e.wishId && w.category === pod.category))
    .slice(0, 6);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1180px] px-6 py-16 text-text-soft">Loading console…</div>;
  }

  function doClaimOrOutbid(wishId: string) {
    const res = claimOrOutbidWish(wishId, merchant.id);
    setFeedback((s) => ({ ...s, [wishId]: res }));
    window.setTimeout(() => setFeedback((s) => ({ ...s, [wishId]: undefined })), 3500);
  }

  function doFulfill(wishId: string) {
    const rewardId = fulfillPick[wishId] ?? myItems[0]?.id;
    const reward = myItems.find((r) => r.id === rewardId);
    if (!reward) return;
    const res = fulfillWish(wishId, merchant.id, reward.label);
    setFeedback((s) => ({ ...s, [wishId]: res }));
  }

  function doRestock(rewardId: string) {
    const qty = Number(restockQty[rewardId] ?? "0");
    if (qty > 0) {
      addStock(rewardId, qty);
      setRestockQty((s) => ({ ...s, [rewardId]: "" }));
    }
  }

  return (
    <div className="relative mx-auto max-w-[1180px] px-6 pt-12 pb-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
            Merchant console
          </span>
          <h1 className="text-[clamp(26px,3.6vw,38px)] leading-[1.08] font-semibold">
            Sponsor the wishes worth your name on
          </h1>
        </div>
        <label className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface-raised px-3 py-2.5 text-[13px]">
          <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="md" />
          <span className="flex flex-col">
            <span className="text-[10.5px] tracking-wide text-text-soft uppercase">Acting as</span>
            <select
              value={activeMerchantId}
              onChange={(e) => setActiveMerchant(e.target.value)}
              className="max-w-[220px] bg-transparent text-[13.5px] font-semibold outline-none"
            >
              {MERCHANTS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </span>
        </label>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        <Panel
          title="Brandboard position"
          badge={
            myBoardRank ? (
              <span className="mono rounded-full bg-surface-sunken px-2.5 py-0.5 text-[11px] font-bold text-accent-deep">
                #{myBoardRank.position}
              </span>
            ) : (
              <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn">Not listed</span>
            )
          }
        >
          {myBoardRank ? (
            <>
              <div className="mono mb-1 text-[30px] font-semibold text-accent-deep">₹{myBoardRank.price}</div>
              <p className="mb-4 text-[12px] text-text-soft">
                Your live bid holds position #{myBoardRank.position} of {boardTotal}. Raise it
                to climb — bids are final.
              </p>
            </>
          ) : (
            <p className="mb-4 text-[12px] text-text-soft">
              You&rsquo;re not on the board. A bid from ₹{SPOT_BASE_PRICE} puts you in front of
              everyone who plays The Genie&rsquo;s Round.
            </p>
          )}

          <button
            onClick={() => setCheckoutOpen(true)}
            className="btn-primary w-full rounded-full py-2.5 text-[12.5px] font-semibold"
          >
            {myBoardRank ? `Raise bid · from ₹${myBoardRank.price + SPOT_INCREMENT}` : `Join the board · from ₹${SPOT_BASE_PRICE}`}
          </button>
          <Link href="/brandboard" className="mt-2 block text-center text-[11.5px] text-text-soft underline">
            See the board
          </Link>

          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] tracking-wide text-text-soft uppercase">Billing details</span>
              {profile && <span className="text-[10.5px] font-semibold text-good">On file</span>}
            </div>
            {profile ? (
              <div className="text-[11.5px] text-text-soft">
                <div className="truncate font-semibold text-text">{profile.contactName}</div>
                <div className="truncate">{profile.businessEmail}</div>
                <div>
                  {profile.phone}
                  {profile.gstin ? ` · ${profile.gstin}` : ""}
                </div>
              </div>
            ) : (
              <p className="text-[11.5px] text-text-soft">Added during your first bid.</p>
            )}
          </div>
        </Panel>

        <Panel
          title="Payments"
          badge={
            <span className="mono rounded-full bg-surface-sunken px-2.5 py-0.5 text-[11px] font-semibold text-text-soft">
              ₹{myPayments.reduce((sum, p) => sum + p.amountRs, 0)}
            </span>
          }
        >
          {myPayments.length === 0 ? (
            <p className="text-[12.5px] text-text-soft">
              No charges yet. Board bids are paid when you place them; wish credits are
              topped up below.
            </p>
          ) : (
            myPayments.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-2.5 border-t border-border py-2.5 first:border-t-0">
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold">{p.purpose}</div>
                  <div className="mono truncate text-[11px] text-text-soft">
                    {p.reference} · {new Date(p.atISO).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <span className="mono flex-none text-[13px] font-bold text-accent-deep">₹{p.amountRs}</span>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Wish Wallet" badge={<span className="rounded-full bg-good-soft px-2.5 py-0.5 text-[11px] font-semibold text-good">Credits</span>}>
          <div className="mono mb-1 text-[34px] font-semibold text-accent-deep">₹{balance}</div>
          <p className="mb-4 text-[12px] text-text-soft">
            Spend this to claim or outbid wishes. Bidding only ever happens here — the games
            stay free and fair for everyone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => topUpWallet(merchant.id, "single")}
              className="flex-1 rounded-full border border-border py-2 text-[12.5px] font-semibold hover:bg-surface-sunken"
            >
              +{WISH_PACK_SINGLE.credits} wish · ₹{WISH_PACK_SINGLE.priceRs}
            </button>
            <button
              onClick={() => topUpWallet(merchant.id, "bulk")}
              className="flex-1 rounded-full py-2 text-[12.5px] font-semibold text-white"
              style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" }}
            >
              +{WISH_PACK_BULK.credits} wishes · ₹{WISH_PACK_BULK.priceRs}
            </button>
          </div>
        </Panel>

        <Panel title="Reward Pool Contribution" badge={<span className="rounded-full bg-good-soft px-2.5 py-0.5 text-[11px] font-semibold text-good">Live</span>}>
          {myItems.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 border-t border-border py-2.5 first:border-t-0">
              <span className="text-[16px]">{r.icon}</span>
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

        <div className="col-span-full">
          <Panel
            title="Sponsor Wishes"
            badge={
              <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn">
                {categoryWishes.length} live · {pod.category}
              </span>
            }
          >
            <p className="mb-4 -mt-2 text-[12px] text-text-soft">
              Ranked like outbid.lol — the wish with the highest price sits on top. Claim an
              open one for ₹{WISH_BASE_PRICE}, or outbid whoever holds it for +₹{WISH_INCREMENT}.
            </p>
            {categoryWishes.length === 0 && <p className="text-[13px] text-text-soft">No open wishes in your category right now.</p>}
            <div className="flex flex-col">
              {categoryWishes.map((w, i) => {
                const holder = w.claimedByMerchantId ? MERCHANTS.find((m) => m.id === w.claimedByMerchantId) : null;
                const iHold = w.claimedByMerchantId === merchant.id;
                const nextPrice = w.claimPrice === 0 ? WISH_BASE_PRICE : w.claimPrice + WISH_INCREMENT;
                const fb = feedback[w.id];
                return (
                  <div key={w.id} className="border-t border-border py-3.5 first:border-t-0">
                    <div className="flex items-center gap-3">
                      <span className="mono w-6 flex-none text-center text-[12px] text-text-soft">#{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px]">
                          <span className="font-semibold">{w.customerName}</span> — &ldquo;{w.text}&rdquo;
                        </div>
                        <div className="mt-0.5 text-[11px] text-text-soft">
                          {holder ? (
                            <>
                              {iHold ? "You hold this" : `Held by ${holder.emoji} ${holder.name}`} · {timeAgo(w.createdAtISO)}
                            </>
                          ) : (
                            `Unclaimed · ${timeAgo(w.createdAtISO)}`
                          )}
                        </div>
                      </div>
                      <div className="mono flex-none text-right text-[15px] font-bold text-accent-deep">
                        {w.claimPrice > 0 ? `₹${w.claimPrice}` : "—"}
                      </div>
                      {iHold ? (
                        <div className="flex flex-none items-center gap-1.5">
                          <select
                            value={fulfillPick[w.id] ?? myItems[0]?.id ?? ""}
                            onChange={(e) => setFulfillPick((s) => ({ ...s, [w.id]: e.target.value }))}
                            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[11.5px]"
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
                            className="rounded-full bg-good px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-50"
                          >
                            Fulfil
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => doClaimOrOutbid(w.id)}
                          className="flex-none rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold text-white"
                          style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-deep))" }}
                        >
                          {holder ? `Outbid · ₹${nextPrice}` : `Claim · ₹${nextPrice}`}
                        </button>
                      )}
                    </div>
                    {fb && (
                      <p className={`mt-1.5 ml-9 text-[11.5px] font-semibold ${fb.ok ? "text-good" : "text-warn"}`}>
                        {fb.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="col-span-full">
          <Panel title="Wish Wars" badge={<span className="text-[11px] text-text-soft">{pod.category}</span>}>
            {myWishWars.length === 0 && <p className="text-[13px] text-text-soft">No bidding activity in your category yet.</p>}
            {myWishWars.map((e) => {
              const winner = MERCHANTS.find((m) => m.id === e.winnerId);
              const loser = e.loserId ? MERCHANTS.find((m) => m.id === e.loserId) : null;
              return (
                <div key={e.id} className="flex items-center gap-2.5 border-t border-border py-2.5 text-[12.5px] first:border-t-0">
                  <span className="flex-1">
                    <span className="font-semibold">{winner?.name}</span>{" "}
                    {loser ? (
                      <>
                        outbid <span className="text-text-soft">{loser.name}</span> for a wish
                      </>
                    ) : (
                      "claimed a wish"
                    )}
                  </span>
                  <div className="flex flex-none flex-col items-end">
                    <span className="mono font-semibold text-accent-deep">
                      ₹{e.price} {e.delta > 0 && loser && <span className="text-good">+{e.delta}</span>}
                    </span>
                    <span className="text-[10.5px] text-text-soft">{timeAgo(e.atISO)}</span>
                  </div>
                </div>
              );
            })}
          </Panel>
        </div>
      </div>

      {checkoutOpen && (
        <BidCheckout
          merchantId={activeMerchantId}
          minimumPrice={myBoardRank ? myBoardRank.price + SPOT_INCREMENT : SPOT_BASE_PRICE}
          targetLabel={
            myBoardRank
              ? `You're at #${myBoardRank.position} with ₹${myBoardRank.price}. Go higher to climb.`
              : "You're not on the board yet — any bid puts you on it."
          }
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
