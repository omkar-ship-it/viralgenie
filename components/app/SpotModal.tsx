"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore, PODS, MERCHANTS, REWARD_ITEMS } from "@/lib/store";
import {
  SPOT_BASE_PRICE,
  SPOT_INCREMENT,
  CATEGORY_ACCENT,
  CATEGORY_ICON,
  BRAND_TAGLINE,
  brandLinks,
  rankBoard,
} from "@/lib/data";
import { BrandLogo } from "./BrandLogo";
import { LoveButton } from "./LoveButton";
import { BidCheckout } from "./BidCheckout";

/**
 * Opens when a board position is tapped: who's standing there, what you could
 * win from them, where to find them, and what it costs to take their place.
 */
export function SpotModal({ position, onClose }: { position: number | null; onClose: () => void }) {
  const boardBids = useAppStore((s) => s.boardBids);
  const stock = useAppStore((s) => s.stock);
  const brandClicks = useAppStore((s) => s.brandClicks);
  const activeMerchantId = useAppStore((s) => s.activeMerchantId);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (position === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [position, onClose]);

  if (position === null) return null;

  const ranked = rankBoard(boardBids);
  const entry = ranked[position - 1];
  const merchant = entry ? MERCHANTS.find((m) => m.id === entry.merchantId) : null;
  const pod = merchant ? PODS.find((p) => p.id === merchant.podId) : null;
  const accent = pod ? CATEGORY_ACCENT[pod.category] : "accent";
  const rewards = merchant ? REWARD_ITEMS.filter((r) => r.merchantId === merchant.id) : [];
  const prizesLive = rewards.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);

  const bidder = MERCHANTS.find((m) => m.id === activeMerchantId);
  const isSelf = entry?.merchantId === activeMerchantId;
  const myBid = boardBids[activeMerchantId]?.price ?? 0;

  // Outbidding this position means bidding just above the price that holds it.
  const askingPrice = entry
    ? Math.max(entry.price + SPOT_INCREMENT, myBid + SPOT_INCREMENT)
    : Math.max(SPOT_BASE_PRICE, myBid + SPOT_INCREMENT);
  const links = merchant ? brandLinks(merchant.id) : null;

  if (checkoutOpen) {
    return (
      <BidCheckout
        merchantId={activeMerchantId}
        minimumPrice={askingPrice}
        targetLabel={
          entry
            ? `To take position #${position} you need to beat ${merchant?.name}'s ₹${entry.price}.`
            : `Position #${position} is open — any bid from ₹${SPOT_BASE_PRICE} puts you on the board.`
        }
        onClose={() => {
          setCheckoutOpen(false);
          onClose();
        }}
      />
    );
  }

  const bidPanel = (
    <div className="mt-5 rounded-xl bg-surface-sunken px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[12px] text-text-soft">
          Bidding as <span className="font-semibold text-text">{bidder?.name}</span>
          {myBid > 0 && <span className="text-text-soft"> · currently ₹{myBid}</span>}
        </span>
      </div>
      <button
        onClick={() => setCheckoutOpen(true)}
        disabled={isSelf}
        className="btn-primary w-full rounded-full py-2.5 text-[12.5px] font-semibold"
      >
        {isSelf ? "This is your position" : entry ? `Outbid ${merchant?.name} · from ₹${askingPrice}` : `Join the board · from ₹${askingPrice}`}
      </button>
      {!isSelf && (
        <p className="mt-1.5 text-center text-[10.5px] text-text-soft">
          Set your amount, add your details, pay — the board re-ranks the moment it lands.
        </p>
      )}
    </div>
  );

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={merchant ? `${merchant.name}, position ${position}` : `Open position ${position}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {merchant && pod && entry ? (
          <>
            <div className="h-1.5 w-full" style={{ background: `var(--${accent})` }} />

            <div className="px-6 pt-5 pb-6">
              <div className="flex items-start gap-4">
                <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="mono mb-1 text-[11px] text-text-soft">
                    Position #{position} · bid ₹{entry.price}
                  </div>
                  <h2 className="text-[22px] leading-tight font-semibold">{merchant.name}</h2>
                  <p className="mt-1 text-[13px] text-text-soft">{BRAND_TAGLINE[merchant.id]}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px]">
                    <span
                      className="rounded-full px-2.5 py-1 font-semibold text-white"
                      style={{ background: `var(--${accent})` }}
                    >
                      {CATEGORY_ICON[pod.category]} {pod.category}
                    </span>
                    <span className="text-text-soft">{pod.area}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface-sunken px-2 py-3">
                  <div className="mono text-[17px] font-bold">
                    {(brandClicks[merchant.id] ?? 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] tracking-wide text-text-soft uppercase">Clicks</div>
                </div>
                <div className="rounded-xl bg-surface-sunken px-2 py-3">
                  <div className="mono text-[17px] font-bold" style={{ color: `var(--${accent})` }}>
                    {prizesLive}
                  </div>
                  <div className="text-[10px] tracking-wide text-text-soft uppercase">Rewards live</div>
                </div>
                <div className="rounded-xl bg-surface-sunken px-2 py-3">
                  <div className="mono text-[17px] font-bold text-accent-deep">₹{entry.price}</div>
                  <div className="text-[10px] tracking-wide text-text-soft uppercase">Live bid</div>
                </div>
              </div>

              {rewards.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 text-[12px] tracking-wide text-text-soft uppercase">What you could win</h3>
                  <div className="flex flex-col gap-1.5">
                    {rewards.map((r) => (
                      <div key={r.id} className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2">
                        <span className="text-[16px]">{r.icon}</span>
                        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{r.label}</span>
                        <span className="mono text-[11.5px] text-text-soft">{stock[r.id] ?? 0} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="mb-2 text-[12px] tracking-wide text-text-soft uppercase">Find them</h3>
                <div className="grid grid-cols-3 gap-2">
                  <a href={links!.website} target="_blank" rel="noopener noreferrer" className="link-tile justify-center">
                    🌐 Website
                  </a>
                  <a href={links!.instagram} target="_blank" rel="noopener noreferrer" className="link-tile justify-center">
                    📸 Instagram
                  </a>
                  <a href={links!.directions} target="_blank" rel="noopener noreferrer" className="link-tile justify-center">
                    📍 Directions
                  </a>
                </div>
                <p className="mt-2 text-[10.5px] text-text-soft">
                  Demo destinations — a live brand points these at its own site and profiles.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link href={`/brands/${merchant.id}`} className="btn-primary rounded-full px-4 py-2.5 text-[12.5px] font-semibold">
                  Brand page
                </Link>
                <Link
                  href={`/play/${pod.id}`}
                  className="rounded-full border border-border px-4 py-2.5 text-[12.5px] font-semibold hover:border-accent"
                >
                  🎮 Play this pod
                </Link>
                <span className="ml-auto">
                  <LoveButton brandId={merchant.id} size="sm" />
                </span>
              </div>

              {bidPanel}
            </div>
          </>
        ) : (
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="text-[40px]">🪧</div>
            <div className="mono mt-2 text-[11px] text-text-soft">Position #{position}</div>
            <h2 className="mt-1 text-[22px] font-semibold">Nobody has bid this far down</h2>
            <p className="mx-auto mt-2 max-w-[40ch] text-[13px] text-text-soft">
              Positions fill from the top, so the open slots are always the tail of the
              board. Place a bid and you slot in wherever it ranks.
            </p>
            {bidPanel}
          </div>
        )}
      </div>

    </div>
  );
}
