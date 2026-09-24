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
  upvotes: number;
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
  { id: "boutiques-jayanagar", name: "Boutiques · Jayanagar", category: "Shopping", area: "Jayanagar", accent: "cat-shopping" },
  { id: "fun-whitefield", name: "Cinemas & Fun · Whitefield", category: "Entertainment", area: "Whitefield", accent: "cat-entertainment" },
  { id: "travel-marathahalli", name: "Travel Desk · Marathahalli", category: "Travel", area: "Marathahalli", accent: "cat-travel" },
];

export const CATEGORIES = Array.from(new Set(PODS.map((p) => p.category)));

export const CATEGORY_ICON: Record<string, string> = {
  "Food & Beverage": "☕",
  "Beauty & Wellness": "💆",
  Fitness: "🏋️",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Travel: "✈️",
};

export const CATEGORY_ACCENT: Record<string, string> = {
  "Food & Beverage": "cat-food",
  "Beauty & Wellness": "cat-beauty",
  Fitness: "cat-fitness",
  Shopping: "cat-shopping",
  Entertainment: "cat-entertainment",
  Travel: "cat-travel",
};

export const MERCHANTS: Merchant[] = [
  { id: "third-wave", podId: "cafes-koramangala", name: "Third Wave Coffee", emoji: "☕" },
  { id: "filter-fable", podId: "cafes-koramangala", name: "Filter & Fable", emoji: "☕" },
  { id: "brew-bros", podId: "cafes-koramangala", name: "Brew Bros", emoji: "☕" },
  { id: "trips-diner", podId: "diners-hsr", name: "Trip's Diner", emoji: "🍽️" },
  { id: "urban-tadka", podId: "diners-hsr", name: "Urban Tadka", emoji: "🍛" },
  { id: "glow-salon", podId: "salons-indiranagar", name: "Glow Salon & Spa", emoji: "💇" },
  { id: "bliss-studio", podId: "salons-indiranagar", name: "Bliss Studio", emoji: "💆" },
  { id: "fitzone", podId: "gyms-btm", name: "FitZone", emoji: "🏋️" },
  { id: "urban-threads", podId: "boutiques-jayanagar", name: "Urban Threads", emoji: "👗" },
  { id: "cinemax", podId: "fun-whitefield", name: "CineMax Whitefield", emoji: "🎬" },
  { id: "wanderwell", podId: "travel-marathahalli", name: "WanderWell Travels", emoji: "✈️" },
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
  { id: "r-off200", merchantId: "urban-threads", podId: "boutiques-jayanagar", label: "₹200 off any purchase", icon: "🛍️", totalStock: 35 },
  { id: "r-totebag", merchantId: "urban-threads", podId: "boutiques-jayanagar", label: "Free tote with ₹999+", icon: "👜", totalStock: 15 },
  { id: "r-popcorn", merchantId: "cinemax", podId: "fun-whitefield", label: "Free popcorn combo", icon: "🍿", totalStock: 30 },
  { id: "r-movie-bogo", merchantId: "cinemax", podId: "fun-whitefield", label: "Buy 1 get 1 movie ticket", icon: "🎟️", totalStock: 20 },
  { id: "r-cabvoucher", merchantId: "wanderwell", podId: "travel-marathahalli", label: "Free airport cab voucher", icon: "🚕", totalStock: 12 },
  { id: "r-getaway", merchantId: "wanderwell", podId: "travel-marathahalli", label: "₹500 off a weekend getaway", icon: "🧳", totalStock: 8 },
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
  "r-off200": 24,
  "r-totebag": 9,
  "r-popcorn": 21,
  "r-movie-bogo": 12,
  "r-cabvoucher": 5,
  "r-getaway": 3,
};

export const MAX_BRANDS_DISPLAYED = 100;

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
    upvotes: 14,
  },
  {
    id: "w-2",
    customerName: "Dev",
    category: "Food & Beverage",
    text: "a cold brew that doesn't taste watered down",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(12),
    upvotes: 6,
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
    upvotes: 22,
  },
  {
    id: "w-4",
    customerName: "Arjun",
    category: "Fitness",
    text: "one free personal training session before my first marathon",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(5),
    upvotes: 9,
  },
  {
    id: "w-5",
    customerName: "Meera",
    category: "Shopping",
    text: "a festive outfit for Diwali on a student budget",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(20),
    upvotes: 31,
  },
  {
    id: "w-6",
    customerName: "Rohit",
    category: "Entertainment",
    text: "movie tickets for my daughter's birthday weekend",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(3),
    upvotes: 4,
  },
  {
    id: "w-7",
    customerName: "Sana",
    category: "Travel",
    text: "a cheap weekend getaway before my exams start",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(30),
    upvotes: 17,
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
  "urban-threads": 300,
  cinemax: 500,
  wanderwell: 200,
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

// Roster chosen from the mechanics that actually move engagement numbers in
// live loyalty apps — spin wheel, scratch card, slot reels and mystery box
// are the four instant-win formats every major platform (CRED, Zomato,
// Starbucks Rewards) converges on; dice is the odd-one-out for variance.
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
  {
    id: "scratch-win",
    name: "Scratch & Win",
    icon: "🪙",
    tagline: "Scratch three panels to reveal your prize.",
    kind: "always-live" as const,
  },
  {
    id: "mystery-box",
    name: "Mystery Box",
    icon: "🎁",
    tagline: "Pick one of three boxes — no peeking.",
    kind: "always-live" as const,
  },
  {
    id: "lucky-reels",
    name: "Lucky Reels",
    icon: "🎰",
    tagline: "Three reels, one pull, instant reveal.",
    kind: "always-live" as const,
  },
];
