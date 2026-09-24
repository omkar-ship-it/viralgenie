"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  PODS,
  MERCHANTS,
  REWARD_ITEMS,
  INITIAL_STOCK,
  INITIAL_BIDS,
  INITIAL_WISHES,
  MIN_INCREMENT,
  MAX_ODDS_SHARE,
  type Bid,
  type Wish,
  type WarEvent,
  type WinRecord,
} from "./data";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function redemptionCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

type State = {
  _hasHydrated: boolean;
  bids: Bid[];
  stock: Record<string, number>;
  wishes: Wish[];
  warEvents: WarEvent[];
  wins: WinRecord[];
  activeMerchantId: string;

  setHasHydrated: (v: boolean) => void;
  setActiveMerchant: (merchantId: string) => void;

  podRanking: (podId: string) => Array<{ merchantId: string; price: number; heldSinceISO: string }>;
  merchantStock: (merchantId: string) => number;
  outbid: (podId: string, merchantId: string) => { ok: boolean; message: string };
  addStock: (rewardId: string, qty: number) => void;
  playGame: (podId: string) => { rewardId: string; rewardLabel: string; merchantId: string; redemptionCode: string } | null;
  addWish: (customerName: string, category: string, text: string) => void;
  fulfillWish: (wishId: string, merchantId: string, rewardLabel: string) => void;
  redeemWin: (winId: string) => void;
};

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      bids: INITIAL_BIDS,
      stock: INITIAL_STOCK,
      wishes: INITIAL_WISHES,
      warEvents: [],
      wins: [],
      activeMerchantId: MERCHANTS[0].id,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setActiveMerchant: (merchantId) => set({ activeMerchantId: merchantId }),

      podRanking: (podId) => {
        return get()
          .bids.filter((b) => b.podId === podId && b.price > 0)
          .sort((a, b) => b.price - a.price)
          .map((b) => ({ merchantId: b.merchantId, price: b.price, heldSinceISO: b.heldSinceISO }));
      },

      merchantStock: (merchantId) => {
        const { stock } = get();
        return REWARD_ITEMS.filter((r) => r.merchantId === merchantId).reduce(
          (sum, r) => sum + (stock[r.id] ?? 0),
          0
        );
      },

      outbid: (podId, merchantId) => {
        const ranking = get().podRanking(podId);
        const leader = ranking[0];
        const currentPrice = leader?.price ?? 0;
        const nextPrice = Math.max(MIN_INCREMENT, currentPrice + MIN_INCREMENT);

        if (get().merchantStock(merchantId) <= 0) {
          return { ok: false, message: "Add reward stock before you can hold a rank — an empty pool can't defend #1." };
        }
        if (leader?.merchantId === merchantId) {
          return { ok: false, message: "You already hold #1 in this pod." };
        }

        set((s) => ({
          bids: [
            ...s.bids.filter((b) => !(b.podId === podId && b.merchantId === merchantId)),
            { podId, merchantId, price: nextPrice, heldSinceISO: new Date().toISOString() },
          ],
          warEvents: [
            {
              id: uid("war"),
              podId,
              winnerId: merchantId,
              loserId: leader?.merchantId ?? null,
              price: nextPrice,
              delta: nextPrice - currentPrice,
              atISO: new Date().toISOString(),
            },
            ...s.warEvents,
          ].slice(0, 20),
        }));
        return { ok: true, message: `You're now #1 at ₹${nextPrice.toLocaleString("en-IN")}.` };
      },

      addStock: (rewardId, qty) => {
        set((s) => ({ stock: { ...s.stock, [rewardId]: (s.stock[rewardId] ?? 0) + qty } }));
      },

      playGame: (podId) => {
        const ranking = get().podRanking(podId);
        const rankedMerchantIds = new Set(ranking.map((r) => r.merchantId));
        const { stock } = get();
        const podRewards = REWARD_ITEMS.filter(
          (r) => r.podId === podId && (stock[r.id] ?? 0) > 0 && rankedMerchantIds.has(r.merchantId)
        );
        if (podRewards.length === 0) return null;

        const priceByMerchant = new Map(ranking.map((r) => [r.merchantId, r.price]));
        const totalPrice = ranking.reduce((sum, r) => sum + r.price, 0) || 1;

        const weighted = podRewards.map((r) => {
          const price = priceByMerchant.get(r.merchantId) ?? 0;
          const cappedShare = Math.min(MAX_ODDS_SHARE, price / totalPrice);
          return { reward: r, weight: Math.max(0.02, cappedShare) };
        });

        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * totalWeight;
        let picked = weighted[weighted.length - 1].reward;
        for (const w of weighted) {
          roll -= w.weight;
          if (roll <= 0) {
            picked = w.reward;
            break;
          }
        }

        const code = redemptionCode();
        const win: WinRecord = {
          id: uid("win"),
          podId,
          rewardId: picked.id,
          rewardLabel: picked.label,
          merchantId: picked.merchantId,
          wonAtISO: new Date().toISOString(),
          redemptionCode: code,
          redeemed: false,
        };

        set((s) => {
          const nextStock = { ...s.stock, [picked.id]: Math.max(0, (s.stock[picked.id] ?? 0) - 1) };
          const winnerRemainingStock = REWARD_ITEMS.filter((r) => r.merchantId === picked.merchantId).reduce(
            (sum, r) => sum + (nextStock[r.id] ?? 0),
            0
          );
          const isLeader = ranking[0]?.merchantId === picked.merchantId;
          const demote = isLeader && winnerRemainingStock <= 0;

          return {
            stock: nextStock,
            wins: [win, ...s.wins],
            bids: demote ? s.bids.filter((b) => !(b.podId === podId && b.merchantId === picked.merchantId)) : s.bids,
            warEvents: demote
              ? [
                  {
                    id: uid("war"),
                    podId,
                    winnerId: "__stockout__",
                    loserId: picked.merchantId,
                    price: 0,
                    delta: 0,
                    atISO: new Date().toISOString(),
                  },
                  ...s.warEvents,
                ].slice(0, 20)
              : s.warEvents,
          };
        });

        return { rewardId: picked.id, rewardLabel: picked.label, merchantId: picked.merchantId, redemptionCode: code };
      },

      addWish: (customerName, category, text) => {
        set((s) => ({
          wishes: [
            {
              id: uid("wish"),
              customerName,
              category,
              text,
              status: "open",
              createdAtISO: new Date().toISOString(),
            },
            ...s.wishes,
          ],
        }));
      },

      fulfillWish: (wishId, merchantId, rewardLabel) => {
        set((s) => ({
          wishes: s.wishes.map((w) =>
            w.id === wishId
              ? { ...w, status: "fulfilled", fulfilledByMerchantId: merchantId, fulfilledRewardLabel: rewardLabel }
              : w
          ),
        }));
      },

      redeemWin: (winId) => {
        set((s) => ({
          wins: s.wins.map((w) => (w.id === winId ? { ...w, redeemed: true } : w)),
        }));
      },
    }),
    {
      name: "viralgenie-store-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        bids: s.bids,
        stock: s.stock,
        wishes: s.wishes,
        warEvents: s.warEvents,
        wins: s.wins,
        activeMerchantId: s.activeMerchantId,
      }),
    }
  )
);

export function useHasHydrated() {
  return useAppStore((s) => s._hasHydrated);
}

export { PODS, MERCHANTS, REWARD_ITEMS };
