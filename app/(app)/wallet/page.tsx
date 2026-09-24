"use client";

import Link from "next/link";
import { useAppStore, useHasHydrated, MERCHANTS, PODS } from "@/lib/store";
import { CATEGORY_ACCENT } from "@/lib/data";
import { BrandLogo } from "@/components/app/BrandLogo";

export default function WalletPage() {
  const hydrated = useHasHydrated();
  const wins = useAppStore((s) => s.wins);
  const redeemWin = useAppStore((s) => s.redeemWin);

  if (!hydrated) {
    return <div className="mx-auto max-w-[760px] px-6 py-24 text-text-soft">Loading your wallet…</div>;
  }

  const unredeemed = wins.filter((w) => !w.redeemed).length;

  return (
    <div className="relative">
      <div className="aurora" style={{ opacity: 0.3 }} />
      <div className="relative mx-auto max-w-[760px] px-6 pt-14 pb-20">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1 text-[11.5px] font-semibold tracking-wide text-text-soft uppercase">
          My rewards
        </span>
        <h1 className="text-[clamp(28px,4.5vw,42px)] leading-[1.05] font-semibold">
          {wins.length === 0 ? "Nothing in the wallet yet" : `${unredeemed} ready to redeem`}
        </h1>
        <p className="mt-3 mb-9 max-w-[56ch] text-[15px] text-text-soft">
          Show the code at the counter. Each one works exactly once.
        </p>

        {wins.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <div className="text-[34px]">🎟️</div>
            <p className="mt-3 text-[14px] text-text-soft">
              Win your first prize and it&rsquo;ll land here.
            </p>
            <Link href="/games" className="btn-primary mt-5 inline-block rounded-full px-6 py-2.5 text-[13px] font-semibold">
              Play a game
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {wins.map((w) => {
              const merchant = MERCHANTS.find((m) => m.id === w.merchantId);
              const pod = PODS.find((p) => p.id === w.podId);
              const accent = pod ? CATEGORY_ACCENT[pod.category] : "accent";
              return (
                <div
                  key={w.id}
                  className="relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-surface-raised px-5 py-4"
                  style={{
                    borderColor: w.redeemed ? "var(--border)" : `var(--${accent})`,
                    boxShadow: "var(--shadow)",
                    opacity: w.redeemed ? 0.6 : 1,
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{ background: `var(--${accent})` }}
                  />
                  {merchant && (
                    <BrandLogo id={merchant.id} name={merchant.name} emoji={merchant.emoji} size="md" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-semibold">{w.rewardLabel}</div>
                    <div className="truncate text-[12px] text-text-soft">
                      {merchant?.name} · {pod?.name}
                    </div>
                  </div>
                  <div
                    className="mono rounded-lg border border-dashed px-3 py-2 text-[14px] font-bold"
                    style={{ borderColor: `var(--${accent})`, color: `var(--${accent})` }}
                  >
                    {w.redemptionCode}
                  </div>
                  {w.redeemed ? (
                    <span className="text-[11.5px] font-semibold text-text-soft">Redeemed</span>
                  ) : (
                    <button
                      onClick={() => redeemWin(w.id)}
                      className="rounded-full border border-border px-3.5 py-2 text-[11.5px] font-semibold transition-colors hover:border-accent"
                    >
                      Mark redeemed
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
