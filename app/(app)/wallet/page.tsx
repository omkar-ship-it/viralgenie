"use client";

import { useAppStore, useHasHydrated, MERCHANTS, PODS } from "@/lib/store";

export default function WalletPage() {
  const hydrated = useHasHydrated();
  const wins = useAppStore((s) => s.wins);
  const redeemWin = useAppStore((s) => s.redeemWin);

  if (!hydrated) {
    return <div className="mx-auto max-w-[720px] px-6 py-16 text-text-soft">Loading your wallet…</div>;
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-12">
      <span className="mb-3 block text-[12px] font-semibold tracking-[0.09em] text-gold uppercase">
        My Rewards
      </span>
      <h1 className="mb-3">Everything you&rsquo;ve won</h1>
      <p className="mb-9 max-w-[62ch] text-[15px] text-text-soft">
        Show the code at the merchant to redeem. Each code works once.
      </p>

      {wins.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-[13.5px] text-text-soft">
          Nothing yet — go play a pod to win your first reward.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {wins.map((w) => {
            const merchant = MERCHANTS.find((m) => m.id === w.merchantId);
            const pod = PODS.find((p) => p.id === w.podId);
            return (
              <div
                key={w.id}
                className={`flex items-center gap-4 rounded-xl border bg-surface-raised px-4.5 py-3.5 ${
                  w.redeemed ? "border-border opacity-60" : "border-gold"
                }`}
              >
                <span className="text-[22px] leading-none">{merchant?.emoji}</span>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">{w.rewardLabel}</div>
                  <div className="text-[12px] text-text-soft">
                    {merchant?.name} · {pod?.name}
                  </div>
                </div>
                <div className="mono rounded-lg bg-surface-sunken px-3 py-1.5 text-[13px] font-semibold text-accent-deep">
                  {w.redemptionCode}
                </div>
                {w.redeemed ? (
                  <span className="text-[11.5px] font-semibold text-text-soft">Redeemed</span>
                ) : (
                  <button
                    onClick={() => redeemWin(w.id)}
                    className="rounded-full border border-border px-3 py-1.5 text-[11.5px] font-semibold hover:bg-surface-sunken"
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
  );
}
