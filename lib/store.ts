"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  PODS,
  MERCHANTS,
  REWARD_ITEMS,
  INITIAL_STOCK,
  INITIAL_WISHES,
  INITIAL_WALLETS,
  INITIAL_LOVES,
  INITIAL_BOARD_BIDS,
  INITIAL_BRAND_CLICKS,
  SPOT_BASE_PRICE,
  rankBoard,
  WISH_BASE_PRICE,
  WISH_INCREMENT,
  WISH_PACK_SINGLE,
  WISH_PACK_BULK,
  type Wish,
  type WishWarEvent,
  type WinRecord,
  type BoardBid,
} from "./data";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function redemptionCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

type State = {
  _hasHydrated: boolean;
  stock: Record<string, number>;
  wishes: Wish[];
  wallets: Record<string, number>;
  wishWarEvents: WishWarEvent[];
  wins: WinRecord[];
  loves: Record<string, number>;
  boardBids: Record<string, BoardBid>;
  brandClicks: Record<string, number>;
  totalPlaysThisWeek: number;
  activeMerchantId: string;

  setHasHydrated: (v: boolean) => void;
  setActiveMerchant: (merchantId: string) => void;

  topUpWallet: (merchantId: string, pack: "single" | "bulk") => void;
  claimOrOutbidWish: (wishId: string, merchantId: string) => { ok: boolean; message: string };
  fulfillWish: (wishId: string, merchantId: string, rewardLabel: string) => { ok: boolean; message: string };
  addWish: (customerName: string, category: string, text: string) => void;
  upvoteWish: (wishId: string) => void;
  loveBrand: (merchantId: string) => void;
  placeBoardBid: (merchantId: string, price: number) => { ok: boolean; message: string };
  registerBrandClick: (merchantId: string) => void;
  playBrand: (merchantId: string) => { rewardLabel: string; redemptionCode: string } | null;
  addStock: (rewardId: string, qty: number) => void;
  playGame: (podId: string) => { rewardId: string; rewardLabel: string; merchantId: string; redemptionCode: string } | null;
  redeemWin: (winId: string) => void;
};

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      stock: INITIAL_STOCK,
      wishes: INITIAL_WISHES,
      wallets: INITIAL_WALLETS,
      wishWarEvents: [],
      wins: [],
      loves: INITIAL_LOVES,
      boardBids: INITIAL_BOARD_BIDS,
      brandClicks: INITIAL_BRAND_CLICKS,
      totalPlaysThisWeek: 0,
      activeMerchantId: MERCHANTS[0].id,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setActiveMerchant: (merchantId) => set({ activeMerchantId: merchantId }),

      topUpWallet: (merchantId, pack) => {
        const amount = pack === "bulk" ? WISH_PACK_BULK.priceRs : WISH_PACK_SINGLE.priceRs;
        set((s) => ({ wallets: { ...s.wallets, [merchantId]: (s.wallets[merchantId] ?? 0) + amount } }));
      },

      claimOrOutbidWish: (wishId, merchantId) => {
        const wish = get().wishes.find((w) => w.id === wishId);
        if (!wish) return { ok: false, message: "That wish no longer exists." };
        if (wish.status === "fulfilled") return { ok: false, message: "This wish has already been granted." };
        if (wish.claimedByMerchantId === merchantId) return { ok: false, message: "You already hold this wish." };

        const nextPrice = wish.claimPrice === 0 ? WISH_BASE_PRICE : wish.claimPrice + WISH_INCREMENT;
        const balance = get().wallets[merchantId] ?? 0;
        if (balance < nextPrice) {
          return { ok: false, message: `Not enough wish credits — top up (₹${nextPrice} needed).` };
        }

        const previousHolder = wish.claimedByMerchantId ?? null;
        set((s) => ({
          wallets: { ...s.wallets, [merchantId]: s.wallets[merchantId] - nextPrice },
          wishes: s.wishes.map((w) =>
            w.id === wishId ? { ...w, status: "claimed", claimPrice: nextPrice, claimedByMerchantId: merchantId } : w
          ),
          wishWarEvents: [
            {
              id: uid("wwar"),
              wishId,
              winnerId: merchantId,
              loserId: previousHolder,
              price: nextPrice,
              delta: nextPrice - wish.claimPrice,
              atISO: new Date().toISOString(),
            },
            ...s.wishWarEvents,
          ].slice(0, 30),
        }));
        return {
          ok: true,
          message: previousHolder
            ? `Outbid it for ₹${nextPrice} — bids are final, just like outbid.lol.`
            : `Claimed for ₹${nextPrice}.`,
        };
      },

      fulfillWish: (wishId, merchantId, rewardLabel) => {
        const wish = get().wishes.find((w) => w.id === wishId);
        if (!wish) return { ok: false, message: "That wish no longer exists." };
        if (wish.claimedByMerchantId !== merchantId) {
          return { ok: false, message: "Claim this wish before you can fulfil it." };
        }
        set((s) => ({
          wishes: s.wishes.map((w) =>
            w.id === wishId ? { ...w, status: "fulfilled", fulfilledRewardLabel: rewardLabel } : w
          ),
        }));
        return { ok: true, message: "Granted — the customer's been notified." };
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
              claimPrice: 0,
              createdAtISO: new Date().toISOString(),
              upvotes: 0,
            },
            ...s.wishes,
          ],
        }));
      },

      upvoteWish: (wishId) => {
        set((s) => ({
          wishes: s.wishes.map((w) => (w.id === wishId ? { ...w, upvotes: w.upvotes + 1 } : w)),
        }));
      },

      loveBrand: (merchantId) => {
        set((s) => ({ loves: { ...s.loves, [merchantId]: (s.loves[merchantId] ?? 0) + 1 } }));
      },

      registerBrandClick: (merchantId) => {
        set((s) => ({ brandClicks: { ...s.brandClicks, [merchantId]: (s.brandClicks[merchantId] ?? 0) + 1 } }));
      },

      /**
       * One bid per brand. Raising it re-ranks the whole board, so there is
       * never a gap: claimed positions stay contiguous from rank 1.
       */
      placeBoardBid: (merchantId, price) => {
        const current = get().boardBids[merchantId];
        if (current && price <= current.price) {
          return { ok: false, message: `Your bid is already ₹${current.price} — go higher to move up.` };
        }
        if (price < SPOT_BASE_PRICE) {
          return { ok: false, message: `Bids start at ₹${SPOT_BASE_PRICE}.` };
        }
        const balance = get().wallets[merchantId] ?? 0;
        if (balance < price) return { ok: false, message: `Not enough credits — ₹${price} needed.` };

        set((s) => ({
          wallets: { ...s.wallets, [merchantId]: (s.wallets[merchantId] ?? 0) - price },
          boardBids: { ...s.boardBids, [merchantId]: { price, since: Date.now() } },
        }));

        const position = rankBoard(get().boardBids).find((r) => r.merchantId === merchantId)?.position ?? null;
        return {
          ok: true,
          message: position === 1 ? `You're #1 at ₹${price}. Bids are final.` : `Bid ₹${price} — you're at #${position}.`,
        };
      },

      /** Draw from one specific brand's stock — the Brandboard landing prize. */
      playBrand: (merchantId) => {
        const { stock } = get();
        const available = REWARD_ITEMS.filter((r) => r.merchantId === merchantId && (stock[r.id] ?? 0) > 0);
        if (available.length === 0) return null;

        const total = available.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
        let roll = Math.random() * total;
        let picked = available[available.length - 1];
        for (const r of available) {
          roll -= stock[r.id] ?? 0;
          if (roll <= 0) {
            picked = r;
            break;
          }
        }

        const code = redemptionCode();
        set((s) => ({
          stock: { ...s.stock, [picked.id]: Math.max(0, (s.stock[picked.id] ?? 0) - 1) },
          wins: [
            {
              id: uid("win"),
              podId: picked.podId,
              rewardId: picked.id,
              rewardLabel: picked.label,
              merchantId,
              wonAtISO: new Date().toISOString(),
              redemptionCode: code,
              redeemed: false,
            },
            ...s.wins,
          ],
          totalPlaysThisWeek: s.totalPlaysThisWeek + 1,
        }));
        return { rewardLabel: picked.label, redemptionCode: code };
      },

      addStock: (rewardId, qty) => {
        set((s) => ({ stock: { ...s.stock, [rewardId]: (s.stock[rewardId] ?? 0) + qty } }));
      },

      playGame: (podId) => {
        const { stock } = get();
        const podRewards = REWARD_ITEMS.filter((r) => r.podId === podId && (stock[r.id] ?? 0) > 0);
        if (podRewards.length === 0) return null;

        const totalStock = podRewards.reduce((sum, r) => sum + (stock[r.id] ?? 0), 0);
        let roll = Math.random() * totalStock;
        let picked = podRewards[podRewards.length - 1];
        for (const r of podRewards) {
          roll -= stock[r.id] ?? 0;
          if (roll <= 0) {
            picked = r;
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

        set((s) => ({
          stock: { ...s.stock, [picked.id]: Math.max(0, (s.stock[picked.id] ?? 0) - 1) },
          wins: [win, ...s.wins],
          totalPlaysThisWeek: s.totalPlaysThisWeek + 1,
        }));

        return { rewardId: picked.id, rewardLabel: picked.label, merchantId: picked.merchantId, redemptionCode: code };
      },

      redeemWin: (winId) => {
        set((s) => ({
          wins: s.wins.map((w) => (w.id === winId ? { ...w, redeemed: true } : w)),
        }));
      },
    }),
    {
      name: "viralgenie-store-v8",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        stock: s.stock,
        wishes: s.wishes,
        wallets: s.wallets,
        wishWarEvents: s.wishWarEvents,
        wins: s.wins,
        loves: s.loves,
        boardBids: s.boardBids,
        brandClicks: s.brandClicks,
        totalPlaysThisWeek: s.totalPlaysThisWeek,
        activeMerchantId: s.activeMerchantId,
      }),
    }
  )
);

export function useHasHydrated() {
  return useAppStore((s) => s._hasHydrated);
}

export { PODS, MERCHANTS, REWARD_ITEMS };
