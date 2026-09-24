export type Pod = {
  id: string;
  name: string;
  category: string;
  area: string;
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
  totalStock: number;
};

export type Bid = {
  merchantId: string;
  podId: string;
  price: number;
  heldSinceISO: string;
};

export type WarEvent = {
  id: string;
  podId: string;
  winnerId: string;
  loserId: string | null;
  price: number;
  delta: number;
  atISO: string;
};

export type Wish = {
  id: string;
  customerName: string;
  category: string;
  text: string;
  status: "open" | "fulfilled";
  fulfilledByMerchantId?: string;
  fulfilledRewardLabel?: string;
  createdAtISO: string;
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
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const PODS: Pod[] = [
  { id: "cafes-koramangala", name: "Cafés · Koramangala", category: "Food & Beverage", area: "Koramangala" },
  { id: "salons-indiranagar", name: "Salons · Indiranagar", category: "Beauty & Wellness", area: "Indiranagar" },
  { id: "diners-hsr", name: "Diners · HSR Layout", category: "Food & Beverage", area: "HSR Layout" },
];

export const MERCHANTS: Merchant[] = [
  { id: "third-wave", podId: "cafes-koramangala", name: "Third Wave Coffee", emoji: "☕" },
  { id: "filter-fable", podId: "cafes-koramangala", name: "Filter & Fable", emoji: "☕" },
  { id: "brew-bros", podId: "cafes-koramangala", name: "Brew Bros", emoji: "☕" },
  { id: "glow-salon", podId: "salons-indiranagar", name: "Glow Salon & Spa", emoji: "💇" },
  { id: "bliss-studio", podId: "salons-indiranagar", name: "Bliss Studio", emoji: "💆" },
  { id: "trips-diner", podId: "diners-hsr", name: "Trip's Diner", emoji: "🍽️" },
  { id: "urban-tadka", podId: "diners-hsr", name: "Urban Tadka", emoji: "🍛" },
];

export const REWARD_ITEMS: RewardItem[] = [
  { id: "r-coffee", merchantId: "third-wave", podId: "cafes-koramangala", label: "Free filter coffee", totalStock: 50 },
  { id: "r-pastry", merchantId: "third-wave", podId: "cafes-koramangala", label: "20% off pastries", totalStock: 40 },
  { id: "r-tote", merchantId: "third-wave", podId: "cafes-koramangala", label: "Free merch tote", totalStock: 3 },
  { id: "r-coldbrew", merchantId: "filter-fable", podId: "cafes-koramangala", label: "Buy 1 get 1 cold brew", totalStock: 20 },
  { id: "r-service", merchantId: "glow-salon", podId: "salons-indiranagar", label: "20% off any service", totalStock: 30 },
  { id: "r-facial", merchantId: "bliss-studio", podId: "salons-indiranagar", label: "Free express facial", totalStock: 12 },
  { id: "r-bogo", merchantId: "trips-diner", podId: "diners-hsr", label: "Buy 1 get 1 mains", totalStock: 25 },
  { id: "r-dessert", merchantId: "urban-tadka", podId: "diners-hsr", label: "Free dessert with mains", totalStock: 18 },
];

export const INITIAL_STOCK: Record<string, number> = {
  "r-coffee": 18,
  "r-pastry": 29,
  "r-tote": 2,
  "r-coldbrew": 14,
  "r-service": 22,
  "r-facial": 8,
  "r-bogo": 19,
  "r-dessert": 11,
};

export const INITIAL_BIDS: Bid[] = [
  { merchantId: "third-wave", podId: "cafes-koramangala", price: 8000, heldSinceISO: daysAgo(4) },
  { merchantId: "filter-fable", podId: "cafes-koramangala", price: 5100, heldSinceISO: daysAgo(9) },
  { merchantId: "glow-salon", podId: "salons-indiranagar", price: 5400, heldSinceISO: daysAgo(6) },
  { merchantId: "trips-diner", podId: "diners-hsr", price: 4200, heldSinceISO: daysAgo(2) },
];

export const INITIAL_WISHES: Wish[] = [
  {
    id: "w-1",
    customerName: "Priya",
    category: "Food & Beverage",
    text: "a quiet corner to study with good coffee for finals week",
    status: "open",
    createdAtISO: daysAgo(1),
  },
  {
    id: "w-2",
    customerName: "Dev",
    category: "Food & Beverage",
    text: "a cold brew that doesn't taste watered down",
    status: "open",
    createdAtISO: daysAgo(0.5),
  },
  {
    id: "w-3",
    customerName: "Ananya",
    category: "Beauty & Wellness",
    text: "a relaxing haircut before my cousin's wedding",
    status: "fulfilled",
    fulfilledByMerchantId: "glow-salon",
    fulfilledRewardLabel: "Free haircut + blow-dry",
    createdAtISO: daysAgo(3),
  },
];

export const MIN_INCREMENT = 100;
export const MAX_ODDS_SHARE = 0.35;
export const STOCK_HOURS_TOTAL = 24;
