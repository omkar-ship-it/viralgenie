export type Pod = {
  id: string;
  name: string;
  category: string;
  area: string;
  accent: string; // CSS color token name for category-coded UI
};

export type Merchant = {
  id: string;
  podId: string;
  name: string;
  emoji: string;
};

export type RewardItem = {
  id: string;
  merchantId: string;
  podId: string;
  label: string;
  icon: string;
  totalStock: number;
};

export type WishStatus = "open" | "claimed" | "fulfilled";

export type Wish = {
  id: string;
  customerName: string;
  category: string;
  text: string;
  status: WishStatus;
  claimPrice: number; // 0 = unclaimed
  claimedByMerchantId?: string;
  fulfilledRewardLabel?: string;
  createdAtISO: string;
};

export type WishWarEvent = {
  id: string;
  wishId: string;
  winnerId: string;
  loserId: string | null;
  price: number;
  delta: number;
  atISO: string;
};

export type WinRecord = {
  id: string;
  podId: string;
  rewardId: string;
  rewardLabel: string;
  merchantId: string;
  wonAtISO: string;
  redemptionCode: string;
  redeemed: boolean;
  bonus?: boolean;
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

export const PODS: Pod[] = [
  { id: "cafes-koramangala", name: "Cafés · Koramangala", category: "Food & Beverage", area: "Koramangala", accent: "cat-food" },
  { id: "diners-hsr", name: "Diners · HSR Layout", category: "Food & Beverage", area: "HSR Layout", accent: "cat-food" },
  { id: "salons-indiranagar", name: "Salons · Indiranagar", category: "Beauty & Wellness", area: "Indiranagar", accent: "cat-beauty" },
  { id: "gyms-btm", name: "Gyms · BTM Layout", category: "Fitness", area: "BTM Layout", accent: "cat-fitness" },
];

export const CATEGORIES = Array.from(new Set(PODS.map((p) => p.category)));

export const MERCHANTS: Merchant[] = [
  { id: "third-wave", podId: "cafes-koramangala", name: "Third Wave Coffee", emoji: "☕" },
  { id: "filter-fable", podId: "cafes-koramangala", name: "Filter & Fable", emoji: "☕" },
  { id: "brew-bros", podId: "cafes-koramangala", name: "Brew Bros", emoji: "☕" },
  { id: "trips-diner", podId: "diners-hsr", name: "Trip's Diner", emoji: "🍽️" },
  { id: "urban-tadka", podId: "diners-hsr", name: "Urban Tadka", emoji: "🍛" },
  { id: "glow-salon", podId: "salons-indiranagar", name: "Glow Salon & Spa", emoji: "💇" },
  { id: "bliss-studio", podId: "salons-indiranagar", name: "Bliss Studio", emoji: "💆" },
  { id: "fitzone", podId: "gyms-btm", name: "FitZone", emoji: "🏋️" },
];

export const REWARD_ITEMS: RewardItem[] = [
  { id: "r-coffee", merchantId: "third-wave", podId: "cafes-koramangala", label: "Free filter coffee", icon: "☕", totalStock: 50 },
  { id: "r-pastry", merchantId: "third-wave", podId: "cafes-koramangala", label: "20% off pastries", icon: "🥐", totalStock: 40 },
  { id: "r-tote", merchantId: "third-wave", podId: "cafes-koramangala", label: "Free merch tote", icon: "👜", totalStock: 3 },
  { id: "r-coldbrew", merchantId: "filter-fable", podId: "cafes-koramangala", label: "Buy 1 get 1 cold brew", icon: "🧊", totalStock: 20 },
  { id: "r-bogo", merchantId: "trips-diner", podId: "diners-hsr", label: "Buy 1 get 1 mains", icon: "🍽️", totalStock: 25 },
  { id: "r-dessert", merchantId: "urban-tadka", podId: "diners-hsr", label: "Free dessert with mains", icon: "🍰", totalStock: 18 },
  { id: "r-service", merchantId: "glow-salon", podId: "salons-indiranagar", label: "20% off any service", icon: "💅", totalStock: 30 },
  { id: "r-facial", merchantId: "bliss-studio", podId: "salons-indiranagar", label: "Free express facial", icon: "🧖", totalStock: 12 },
  { id: "r-daypass", merchantId: "fitzone", podId: "gyms-btm", label: "Free 1-day gym pass", icon: "🎫", totalStock: 40 },
  { id: "r-membership", merchantId: "fitzone", podId: "gyms-btm", label: "20% off annual membership", icon: "💪", totalStock: 10 },
];

export const INITIAL_STOCK: Record<string, number> = {
  "r-coffee": 18,
  "r-pastry": 29,
  "r-tote": 2,
  "r-coldbrew": 13,
  "r-bogo": 19,
  "r-dessert": 11,
  "r-service": 22,
  "r-facial": 8,
  "r-daypass": 27,
  "r-membership": 6,
};

export const INITIAL_WISHES: Wish[] = [
  {
    id: "w-1",
    customerName: "Priya",
    category: "Food & Beverage",
    text: "a quiet corner to study with good coffee for finals week",
    status: "claimed",
    claimPrice: 100,
    claimedByMerchantId: "third-wave",
    createdAtISO: daysAgo(1),
  },
  {
    id: "w-2",
    customerName: "Dev",
    category: "Food & Beverage",
    text: "a cold brew that doesn't taste watered down",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(12),
  },
  {
    id: "w-3",
    customerName: "Ananya",
    category: "Beauty & Wellness",
    text: "a relaxing haircut before my cousin's wedding",
    status: "fulfilled",
    claimPrice: 100,
    claimedByMerchantId: "glow-salon",
    fulfilledRewardLabel: "Free haircut + blow-dry",
    createdAtISO: daysAgo(3),
  },
  {
    id: "w-4",
    customerName: "Arjun",
    category: "Fitness",
    text: "one free personal training session before my first marathon",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(5),
  },
];

export const INITIAL_WALLETS: Record<string, number> = {
  "third-wave": 400,
  "filter-fable": 200,
  "brew-bros": 100,
  "trips-diner": 300,
  "urban-tadka": 100,
  "glow-salon": 200,
  "bliss-studio": 300,
  fitzone: 400,
};

// --- Wish pricing (the only place money moves, per outbid.lol) ---
export const WISH_BASE_PRICE = 100;
export const WISH_INCREMENT = 100;
export const WISH_PACK_SINGLE = { credits: 1, priceRs: 100 };
export const WISH_PACK_BULK = { credits: 10, priceRs: 1000 };

// --- Games: live vs scheduled ---
export type GameWindow = { state: "live" | "scheduled"; startsAt: Date; endsAt: Date };

// NOTE: these are functions, not precomputed constants — they must be called
// at render time (client-side, after mount) so the result reflects "now" and
// never gets baked into a stale server-prerendered value.
export function dailyWindow(startHour: number, endHour: number): GameWindow {
  const now = new Date();
  const start = new Date(now);
  start.setHours(startHour, 0, 0, 0);
  const end = new Date(now);
  end.setHours(endHour, 0, 0, 0);
  if (now >= start && now < end) return { state: "live", startsAt: start, endsAt: end };
  if (now >= end) {
    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 1);
  }
  return { state: "scheduled", startsAt: start, endsAt: end };
}

export function nextWeekday(targetDay: number, hour: number): Date {
  const now = new Date();
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  let diff = (targetDay - now.getDay() + 7) % 7;
  if (diff === 0 && now >= d) diff = 7;
  d.setDate(d.getDate() + diff);
  return d;
}

export const COMMUNITY_UNLOCK_TARGET = 25;

export const GAME_LIBRARY = [
  {
    id: "rub-the-lamp",
    name: "Rub the Lamp",
    icon: "🧞",
    tagline: "Spin for an instant prize from the live pool.",
    kind: "always-live" as const,
  },
  {
    id: "roll-the-dice",
    name: "Roll the Dice",
    icon: "🎲",
    tagline: "Higher variance — snake eyes doubles your prize.",
    kind: "always-live" as const,
  },
];
