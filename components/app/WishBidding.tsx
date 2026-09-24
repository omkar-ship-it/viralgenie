"use client";

import { useState } from "react";
import { useAppStore, MERCHANTS, PODS } from "@/lib/store";
import { WISH_BASE_PRICE, WISH_INCREMENT, WISH_PACK_BULK } from "@/lib/data";
import { BrandLogo } from "./BrandLogo";

function categoryOf(merchantId: string) {
  const merchant = MERCHANTS.find((m) => m.id === merchantId);
  return merchant ? PODS.find((p) => p.id === merchant.podId)?.category : undefined;
}

/** Brand switcher — whoever is selected here is who a bid is placed as. */
export function BiddingAsPicker({ compact = false }: { compact?: boolean }) {
  const activeMerchantId = useAppStore((s) => s.activeMerchantId);
  const setActiveMerchant = useAppStore((s) => s.setActiveMerchant);
  const wallets = useAppStore((s) => s.wallets);
  const topUpWallet = useAppStore((s) => s.topUpWallet);
  const merchant = MERCHANTS.find((m) => m.id === activeMerchantId) ?? MERCHANTS[0];
  const balance = wallets[merchant.id] ?? 0;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-raised ${
        compact ? "px-3 py-2" : "px-4 py-3"
      }`}
    >
      <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="sm" />
      <label className="flex flex-col">
        <span className="text-[10px] tracking-wide text-text-soft uppercase">Bidding as</span>
        <select
          value={activeMerchantId}
          onChange={(e) => setActiveMerchant(e.target.value)}
          className="max-w-[190px] bg-transparent text-[13px] font-semibold outline-none"
        >
          {MERCHANTS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>
      <span className="mono ml-auto text-[13px] font-bold text-accent-deep">₹{balance}</span>
      <button
        onClick={() => topUpWallet(merchant.id, "bulk")}
        className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold transition-colors hover:border-accent"
      >
        + ₹{WISH_PACK_BULK.priceRs}
      </button>
    </div>
  );
}

/**
 * Claim / outbid a single wish. Rendered wherever wishes are shown, so
 * bidding isn't locked inside the merchant console.
 */
export function WishBidButton({
  wishId,
  merchantId,
  size = "md",
}: {
  wishId: string;
  merchantId: string;
  size?: "sm" | "md";
}) {
  const wish = useAppStore((s) => s.wishes.find((w) => w.id === wishId));
  const wallets = useAppStore((s) => s.wallets);
  const claimOrOutbidWish = useAppStore((s) => s.claimOrOutbidWish);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  if (!wish || wish.status === "fulfilled") return null;

  // A brand can only bid on what it could actually grant — same rule the
  // merchant console and brand pages use when matching wishes.
  if (categoryOf(merchantId) !== wish.category) {
    return (
      <span className="rounded-full bg-surface-sunken px-3 py-1.5 text-[10.5px] font-semibold text-text-soft">
        {wish.category} brands only
      </span>
    );
  }

  const nextPrice = wish.claimPrice === 0 ? WISH_BASE_PRICE : wish.claimPrice + WISH_INCREMENT;
  const iHold = wish.claimedByMerchantId === merchantId;
  const balance = wallets[merchantId] ?? 0;
  const affordable = balance >= nextPrice;

  function bid() {
    const res = claimOrOutbidWish(wishId, merchantId);
    setFeedback(res);
    window.setTimeout(() => setFeedback(null), 3500);
  }

  const pad = size === "sm" ? "px-3 py-1.5 text-[11.5px]" : "px-4 py-2 text-[12.5px]";

  return (
    <div className="flex flex-col items-end gap-1">
      {iHold ? (
        <span className={`rounded-full bg-good-soft font-semibold text-good ${pad}`}>You hold this</span>
      ) : (
        <button
          onClick={bid}
          disabled={!affordable}
          className={`btn-primary rounded-full font-semibold ${pad}`}
          title={affordable ? undefined : "Top up wish credits first"}
        >
          {wish.claimPrice === 0 ? `Claim · ₹${nextPrice}` : `Outbid · ₹${nextPrice}`}
        </button>
      )}
      {feedback && (
        <span className={`max-w-[230px] text-right text-[10.5px] font-semibold ${feedback.ok ? "text-good" : "text-warn"}`}>
          {feedback.message}
        </span>
      )}
      {!feedback && !affordable && !iHold && (
        <span className="text-[10.5px] text-warn">Needs ₹{nextPrice} in credits</span>
      )}
    </div>
  );
}
