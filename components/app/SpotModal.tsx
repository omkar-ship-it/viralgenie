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
} from "@/lib/data";
import { BrandLogo } from "./BrandLogo";
import { LoveButton } from "./LoveButton";

/**
 * Opens when a board square is tapped: who's standing there, what you could
 * win from them, where to find them, and what it costs to take the square.
 */
export function SpotModal({ square, onClose }: { square: number | null; onClose: () => void }) {
  const spots = useAppStore((s) => s.spots);
  const stock = useAppStore((s) => s.stock);
  const spotClicks = useAppStore((s) => s.spotClicks);
  const wallets = useAppStore((s) => s.wallets);
  const activeMerchantId = useAppStore((s) => s.activeMerchantId);
  const claimSpot = useAppStore((s) => s.claimSpot);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (square === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [square, onClose]);

  if (square === null) return null;

  const spot = spots[square];
  const merchant = spot ? MERCHANTS.find((m) => m.id === spot.merchantId) : null;
  const pod = merchant ? PODS.find((p) => p.id === merchant.podId) : null;
  const accent = pod ? CATEGORY_ACCENT[pod.category] : "accent";
  const rewards = merchant ? REWARD_ITEMS.filter((r) => r.merchantId === merchant.id) : [];
  const prizesLive = rewards.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
  const nextPrice = spot ? spot.price + SPOT_INCREMENT : SPOT_BASE_PRICE;
  const balance = wallets[activeMerchantId] ?? 0;
  const bidder = MERCHANTS.find((m) => m.id === activeMerchantId);
  const links = merchant ? brandLinks(merchant.id) : null;

  function bid() {
    const res = claimSpot(square!, activeMerchantId);
    setFeedback(res);
    window.setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={merchant ? `${merchant.name}, spot ${square}` : `Open spot ${square}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {merchant && pod ? (
          <>
            <div className="h-1.5 w-full" style={{ background: `var(--${accent})` }} />

            <div className="px-6 pt-5 pb-6">
              <div className="flex items-start gap-4">
                <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="mono mb-1 text-[11px] text-text-soft">
                    Spot #{square} · held at ₹{spot!.price}
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
                  <div className="mono text-[17px] font-bold">{(spotClicks[square] ?? 0).toLocaleString("en-IN")}</div>
                  <div className="text-[10px] tracking-wide text-text-soft uppercase">Clicks</div>
                </div>
                <div className="rounded-xl bg-surface-sunken px-2 py-3">
                  <div className="mono text-[17px] font-bold" style={{ color: `var(--${accent})` }}>
                    {prizesLive}
                  </div>
                  <div className="text-[10px] tracking-wide text-text-soft uppercase">Rewards live</div>
                </div>
                <div className="rounded-xl bg-surface-sunken px-2 py-3">
                  <div className="mono text-[17px] font-bold text-accent-deep">₹{spot!.price}</div>
                  <div className="text-[10px] tracking-wide text-text-soft uppercase">Spot price</div>
                </div>
              </div>

              {/* what you could win */}
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

              {/* outbound links */}
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

              {/* in-app actions */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href={`/brands/${merchant.id}`}
                  className="btn-primary rounded-full px-4 py-2.5 text-[12.5px] font-semibold"
                >
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

              {/* take the square */}
              <div className="mt-5 rounded-xl bg-surface-sunken px-4 py-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-text-soft">
                    Bidding as <span className="font-semibold text-text">{bidder?.name}</span>
                  </span>
                  <span className="mono text-[12.5px] font-bold text-accent-deep">₹{balance}</span>
                </div>
                <button
                  onClick={bid}
                  disabled={balance < nextPrice || spot!.merchantId === activeMerchantId}
                  className="btn-primary w-full rounded-full py-2.5 text-[12.5px] font-semibold"
                >
                  {spot!.merchantId === activeMerchantId
                    ? "You already hold this spot"
                    : `Outbid for #${square} · ₹${nextPrice}`}
                </button>
                {balance < nextPrice && spot!.merchantId !== activeMerchantId && (
                  <p className="mt-1.5 text-center text-[10.5px] text-warn">
                    Not enough credits — top up on the board.
                  </p>
                )}
                {feedback && (
                  <p className={`mt-2 text-center text-[11.5px] font-semibold ${feedback.ok ? "text-good" : "text-warn"}`}>
                    {feedback.message}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ---- open spot ---- */
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="text-[40px]">🪧</div>
            <div className="mono mt-2 text-[11px] text-text-soft">Spot #{square}</div>
            <h2 className="mt-1 text-[22px] font-semibold">This square is empty</h2>
            <p className="mx-auto mt-2 max-w-[38ch] text-[13px] text-text-soft">
              Nobody is standing here, so the genie walks straight past it. Claim it and he
              can stop on your brand instead.
            </p>

            <div className="mt-5 rounded-xl bg-surface-sunken px-4 py-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[12px] text-text-soft">
                  Bidding as <span className="font-semibold text-text">{bidder?.name}</span>
                </span>
                <span className="mono text-[12.5px] font-bold text-accent-deep">₹{balance}</span>
              </div>
              <button
                onClick={bid}
                disabled={balance < nextPrice}
                className="btn-primary w-full rounded-full py-2.5 text-[12.5px] font-semibold"
              >
                Claim #{square} · ₹{nextPrice}
              </button>
              {balance < nextPrice && (
                <p className="mt-1.5 text-[10.5px] text-warn">Not enough credits — top up on the board.</p>
              )}
              {feedback && (
                <p className={`mt-2 text-[11.5px] font-semibold ${feedback.ok ? "text-good" : "text-warn"}`}>
                  {feedback.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
