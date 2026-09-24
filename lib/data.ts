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
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

export const PODS: Pod[] = [
  { id: "cafes-koramangala", name: "Cafés · Koramangala", category: "Food & Beverage", area: "Koramangala" },
  { id: "diners-hsr", name: "Diners · HSR Layout", category: "Food & Beverage", area: "HSR Layout" },
  { id: "salons-indiranagar", name: "Salons · Indiranagar", category: "Beauty & Wellness", area: "Indiranagar" },
  { id: "spas-jayanagar", name: "Spas · Jayanagar", category: "Beauty & Wellness", area: "Jayanagar" },
  { id: "gyms-btm", name: "Gyms · BTM Layout", category: "Fitness", area: "BTM Layout" },
  { id: "studios-whitefield", name: "Studios · Whitefield", category: "Fitness", area: "Whitefield" },
  { id: "boutiques-jayanagar", name: "Boutiques · Jayanagar", category: "Shopping", area: "Jayanagar" },
  { id: "malls-indiranagar", name: "Shops · Indiranagar", category: "Shopping", area: "Indiranagar" },
  { id: "fun-whitefield", name: "Cinemas & Fun · Whitefield", category: "Entertainment", area: "Whitefield" },
  { id: "nightlife-koramangala", name: "Nightlife · Koramangala", category: "Entertainment", area: "Koramangala" },
  { id: "travel-marathahalli", name: "Travel Desk · Marathahalli", category: "Travel", area: "Marathahalli" },
  { id: "stays-ecity", name: "Stays · Electronic City", category: "Travel", area: "Electronic City" },
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

type BrandSeed = {
  id: string;
  name: string;
  emoji: string;
  podId: string;
  rewards: Array<{ label: string; icon: string; total: number; left: number }>;
};

const BRANDS: BrandSeed[] = [
  // --- Food & Beverage ---
  { id: "third-wave", name: "Third Wave Coffee", emoji: "☕", podId: "cafes-koramangala", rewards: [
    { label: "Free filter coffee", icon: "☕", total: 50, left: 18 },
    { label: "20% off pastries", icon: "🥐", total: 40, left: 29 },
  ] },
  { id: "filter-fable", name: "Filter & Fable", emoji: "🫖", podId: "cafes-koramangala", rewards: [
    { label: "Buy 1 get 1 cold brew", icon: "🧊", total: 20, left: 13 },
  ] },
  { id: "brew-bros", name: "Brew Bros", emoji: "☕", podId: "cafes-koramangala", rewards: [
    { label: "Free espresso shot", icon: "⚡", total: 30, left: 22 },
  ] },
  { id: "bean-theory", name: "Bean Theory", emoji: "🌱", podId: "cafes-koramangala", rewards: [
    { label: "Free croissant with coffee", icon: "🥐", total: 25, left: 11 },
  ] },
  { id: "trips-diner", name: "Trip's Diner", emoji: "🍽️", podId: "diners-hsr", rewards: [
    { label: "Buy 1 get 1 mains", icon: "🍽️", total: 25, left: 19 },
  ] },
  { id: "urban-tadka", name: "Urban Tadka", emoji: "🍛", podId: "diners-hsr", rewards: [
    { label: "Free dessert with mains", icon: "🍰", total: 18, left: 11 },
  ] },
  { id: "thali-junction", name: "Thali Junction", emoji: "🍲", podId: "diners-hsr", rewards: [
    { label: "₹100 off unlimited thali", icon: "🪙", total: 30, left: 24 },
  ] },
  { id: "smoke-skillet", name: "Smoke & Skillet", emoji: "🍖", podId: "diners-hsr", rewards: [
    { label: "Free starter with any grill", icon: "🔥", total: 22, left: 9 },
  ] },

  // --- Beauty & Wellness ---
  { id: "glow-salon", name: "Glow Salon & Spa", emoji: "💇", podId: "salons-indiranagar", rewards: [
    { label: "20% off any service", icon: "💅", total: 30, left: 22 },
  ] },
  { id: "bliss-studio", name: "Bliss Studio", emoji: "💆", podId: "salons-indiranagar", rewards: [
    { label: "Free express facial", icon: "🧖", total: 12, left: 8 },
  ] },
  { id: "mane-room", name: "The Mane Room", emoji: "💈", podId: "salons-indiranagar", rewards: [
    { label: "Free beard trim", icon: "✂️", total: 20, left: 15 },
  ] },
  { id: "lumen-skin", name: "Lumen Skin Bar", emoji: "✨", podId: "salons-indiranagar", rewards: [
    { label: "₹300 off first facial", icon: "🪙", total: 16, left: 7 },
  ] },
  { id: "serene-ayur", name: "Serene Ayur Spa", emoji: "🌿", podId: "spas-jayanagar", rewards: [
    { label: "Free 20-min foot massage", icon: "🦶", total: 18, left: 12 },
  ] },
  { id: "calm-co", name: "Calm Co.", emoji: "🧘", podId: "spas-jayanagar", rewards: [
    { label: "Buy 1 get 1 aroma session", icon: "🕯️", total: 14, left: 6 },
  ] },
  { id: "nail-atelier", name: "Nail Atelier", emoji: "💅", podId: "spas-jayanagar", rewards: [
    { label: "Free nail art add-on", icon: "🎨", total: 24, left: 17 },
  ] },
  { id: "rejuve", name: "Rejuve Wellness", emoji: "🛁", podId: "spas-jayanagar", rewards: [
    { label: "₹500 off body spa", icon: "🪙", total: 10, left: 4 },
  ] },

  // --- Fitness ---
  { id: "fitzone", name: "FitZone", emoji: "🏋️", podId: "gyms-btm", rewards: [
    { label: "Free 1-day gym pass", icon: "🎫", total: 40, left: 27 },
    { label: "20% off annual membership", icon: "💪", total: 10, left: 6 },
  ] },
  { id: "iron-yard", name: "Iron Yard", emoji: "🏋️‍♂️", podId: "gyms-btm", rewards: [
    { label: "Free trainer session", icon: "🤝", total: 15, left: 9 },
  ] },
  { id: "pulse-studio", name: "Pulse Studio", emoji: "🚴", podId: "gyms-btm", rewards: [
    { label: "Free spin class", icon: "🚲", total: 20, left: 13 },
  ] },
  { id: "corelab", name: "CoreLab", emoji: "🤸", podId: "gyms-btm", rewards: [
    { label: "Free HIIT trial week", icon: "🔥", total: 12, left: 5 },
  ] },
  { id: "yoga-shala", name: "Yoga Shala", emoji: "🧘‍♀️", podId: "studios-whitefield", rewards: [
    { label: "Free drop-in yoga class", icon: "🪷", total: 25, left: 18 },
  ] },
  { id: "box-republic", name: "Box Republic", emoji: "🥊", podId: "studios-whitefield", rewards: [
    { label: "Free boxing intro class", icon: "🥊", total: 16, left: 10 },
  ] },
  { id: "runclub-blr", name: "RunClub BLR", emoji: "🏃", podId: "studios-whitefield", rewards: [
    { label: "Free gait analysis", icon: "👟", total: 14, left: 8 },
  ] },
  { id: "aqua-fit", name: "Aqua Fit", emoji: "🏊", podId: "studios-whitefield", rewards: [
    { label: "Free pool day pass", icon: "🩱", total: 18, left: 11 },
  ] },

  // --- Shopping ---
  { id: "urban-threads", name: "Urban Threads", emoji: "👗", podId: "boutiques-jayanagar", rewards: [
    { label: "₹200 off any purchase", icon: "🛍️", total: 35, left: 24 },
    { label: "Free tote with ₹999+", icon: "👜", total: 15, left: 9 },
  ] },
  { id: "loom-co", name: "Loom & Co.", emoji: "🧵", podId: "boutiques-jayanagar", rewards: [
    { label: "15% off handloom", icon: "🧶", total: 28, left: 19 },
  ] },
  { id: "streetkart", name: "StreetKart", emoji: "🧢", podId: "boutiques-jayanagar", rewards: [
    { label: "Free cap with ₹1499+", icon: "🧢", total: 20, left: 12 },
  ] },
  { id: "silver-lining", name: "Silver Lining", emoji: "💍", podId: "boutiques-jayanagar", rewards: [
    { label: "₹500 off silver jewellery", icon: "💎", total: 12, left: 5 },
  ] },
  { id: "sole-story", name: "Sole Story", emoji: "👟", podId: "malls-indiranagar", rewards: [
    { label: "₹300 off sneakers", icon: "👟", total: 26, left: 16 },
  ] },
  { id: "page-one", name: "Page One Books", emoji: "📚", podId: "malls-indiranagar", rewards: [
    { label: "Buy 2 get 1 free", icon: "📖", total: 30, left: 21 },
  ] },
  { id: "gadget-garage", name: "Gadget Garage", emoji: "🔌", podId: "malls-indiranagar", rewards: [
    { label: "Free screen guard fitting", icon: "📱", total: 22, left: 14 },
  ] },
  { id: "bloom-florals", name: "Bloom Florals", emoji: "💐", podId: "malls-indiranagar", rewards: [
    { label: "Free roses with ₹699+", icon: "🌹", total: 18, left: 10 },
  ] },

  // --- Entertainment ---
  { id: "cinemax", name: "CineMax Whitefield", emoji: "🎬", podId: "fun-whitefield", rewards: [
    { label: "Free popcorn combo", icon: "🍿", total: 30, left: 21 },
    { label: "Buy 1 get 1 movie ticket", icon: "🎟️", total: 20, left: 12 },
  ] },
  { id: "playzone", name: "PlayZone Arcade", emoji: "🎮", podId: "fun-whitefield", rewards: [
    { label: "Free 10 arcade tokens", icon: "🪙", total: 40, left: 28 },
  ] },
  { id: "laser-tag", name: "Laser Tag BLR", emoji: "🔫", podId: "fun-whitefield", rewards: [
    { label: "Free extra round", icon: "🎯", total: 16, left: 9 },
  ] },
  { id: "bowl-city", name: "Bowl City", emoji: "🎳", podId: "fun-whitefield", rewards: [
    { label: "Free shoes + 1 game", icon: "🎳", total: 24, left: 15 },
  ] },
  { id: "skybar-21", name: "Skybar 21", emoji: "🍸", podId: "nightlife-koramangala", rewards: [
    { label: "Free mocktail on entry", icon: "🍹", total: 26, left: 17 },
  ] },
  { id: "comedy-cellar", name: "The Comedy Cellar", emoji: "🎤", podId: "nightlife-koramangala", rewards: [
    { label: "Buy 1 get 1 standup ticket", icon: "🎭", total: 20, left: 11 },
  ] },
  { id: "vinyl-vibes", name: "Vinyl & Vibes", emoji: "🎧", podId: "nightlife-koramangala", rewards: [
    { label: "Free cover charge Friday", icon: "🎶", total: 18, left: 8 },
  ] },
  { id: "board-cafe", name: "Board Game Café", emoji: "🎲", podId: "nightlife-koramangala", rewards: [
    { label: "Free 1-hour table", icon: "♟️", total: 22, left: 13 },
  ] },

  // --- Travel ---
  { id: "wanderwell", name: "WanderWell Travels", emoji: "✈️", podId: "travel-marathahalli", rewards: [
    { label: "Free airport cab voucher", icon: "🚕", total: 12, left: 5 },
    { label: "₹500 off a weekend getaway", icon: "🧳", total: 8, left: 3 },
  ] },
  { id: "hillroute", name: "HillRoute Trips", emoji: "🏔️", podId: "travel-marathahalli", rewards: [
    { label: "₹1000 off trek package", icon: "🥾", total: 10, left: 4 },
  ] },
  { id: "citystay", name: "CityStay Rooms", emoji: "🛏️", podId: "travel-marathahalli", rewards: [
    { label: "Free breakfast upgrade", icon: "🍳", total: 20, left: 13 },
  ] },
  { id: "rideeasy", name: "RideEasy Rentals", emoji: "🛵", podId: "travel-marathahalli", rewards: [
    { label: "Free helmet + 2h ride", icon: "⛑️", total: 24, left: 16 },
  ] },
  { id: "nest-stays", name: "Nest Serviced Stays", emoji: "🏨", podId: "stays-ecity", rewards: [
    { label: "Free late checkout", icon: "🕐", total: 18, left: 11 },
  ] },
  { id: "backpackers", name: "Backpackers Bunk", emoji: "🎒", podId: "stays-ecity", rewards: [
    { label: "20% off dorm night", icon: "🛌", total: 26, left: 18 },
  ] },
  { id: "lakeview", name: "Lakeview Resort", emoji: "🌅", podId: "stays-ecity", rewards: [
    { label: "₹800 off weekend stay", icon: "🏞️", total: 9, left: 3 },
  ] },
  { id: "campfire-co", name: "CampFire Co.", emoji: "🔥", podId: "stays-ecity", rewards: [
    { label: "Free campsite add-on", icon: "⛺", total: 14, left: 7 },
  ] },
];

export const MERCHANTS: Merchant[] = BRANDS.map(({ id, name, emoji, podId }) => ({ id, name, emoji, podId }));

export const REWARD_ITEMS: RewardItem[] = BRANDS.flatMap((b) =>
  b.rewards.map((r, i) => ({
    id: `${b.id}-r${i + 1}`,
    merchantId: b.id,
    podId: b.podId,
    label: r.label,
    icon: r.icon,
    totalStock: r.total,
  }))
);

export const INITIAL_STOCK: Record<string, number> = Object.fromEntries(
  BRANDS.flatMap((b) => b.rewards.map((r, i) => [`${b.id}-r${i + 1}`, r.left]))
);

export const INITIAL_WALLETS: Record<string, number> = Object.fromEntries(
  // Deterministic spread of starting credits so the demo has both flush and
  // nearly-broke merchants without randomness at module scope.
  BRANDS.map((b, i) => [b.id, 100 + (i % 5) * 100])
);

// Love is a demand signal from customers, deliberately uncorrelated with how
// much stock a brand is giving away — otherwise "most loved" and "most
// generous" would be the same leaderboard twice.
export const INITIAL_LOVES: Record<string, number> = Object.fromEntries(
  BRANDS.map((b, i) => [b.id, 18 + ((i * 47) % 214)])
);

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
  {
    id: "w-8",
    customerName: "Kabir",
    category: "Beauty & Wellness",
    text: "a spa day for my mum's 50th — she's never had one",
    status: "open",
    claimPrice: 0,
    createdAtISO: hoursAgo(8),
    upvotes: 44,
  },
  {
    id: "w-9",
    customerName: "Ishaan",
    category: "Entertainment",
    text: "a birthday movie night for my hostel friends",
    status: "fulfilled",
    claimPrice: 300,
    claimedByMerchantId: "cinemax",
    fulfilledRewardLabel: "Buy 1 get 1 movie ticket",
    createdAtISO: daysAgo(6),
    upvotes: 38,
  },
  {
    id: "w-10",
    customerName: "Nisha",
    category: "Fitness",
    text: "a month of classes to get back into shape after an injury",
    status: "fulfilled",
    claimPrice: 200,
    claimedByMerchantId: "fitzone",
    fulfilledRewardLabel: "Free 1-day gym pass",
    createdAtISO: daysAgo(5),
    upvotes: 26,
  },
  {
    id: "w-11",
    customerName: "Faisal",
    category: "Food & Beverage",
    text: "a proper filter coffee for my dad who just moved to the city",
    status: "fulfilled",
    claimPrice: 400,
    claimedByMerchantId: "third-wave",
    fulfilledRewardLabel: "Free filter coffee",
    createdAtISO: daysAgo(4),
    upvotes: 51,
  },
  {
    id: "w-12",
    customerName: "Tara",
    category: "Shopping",
    text: "something nice to wear to my first job interview",
    status: "claimed",
    claimPrice: 200,
    claimedByMerchantId: "urban-threads",
    createdAtISO: hoursAgo(16),
    upvotes: 29,
  },
];

/** One-line descriptions, shown wherever a brand needs to sell itself. */
export const BRAND_TAGLINE: Record<string, string> = {
  "third-wave": "Single-origin pour-overs, all day",
  "filter-fable": "Slow brews and shelf-worn paperbacks",
  "brew-bros": "Fast espresso, no queue",
  "bean-theory": "Bakes out of the oven at 4",
  "trips-diner": "All-day breakfast, retro booths",
  "urban-tadka": "North Indian comfort plates",
  "thali-junction": "Unlimited thalis, one price",
  "smoke-skillet": "Charcoal grills and smoked sides",
  "glow-salon": "Cuts, colour and cold towels",
  "bliss-studio": "Facials on a lunch break",
  "mane-room": "Barbering, beards, hot shaves",
  "lumen-skin": "Dermat-led skin routines",
  "serene-ayur": "Ayurvedic oils, unhurried hands",
  "calm-co": "Aromatherapy in a quiet room",
  "nail-atelier": "Nail art that lasts a month",
  rejuve: "Long soaks and body therapy",
  fitzone: "Free weights and 6am classes",
  "iron-yard": "Powerlifting, proper coaching",
  "pulse-studio": "Spin classes with the lights down",
  corelab: "HIIT in forty-five minutes",
  "yoga-shala": "Ashtanga, beginners welcome",
  "box-republic": "Boxing drills, real bags",
  "runclub-blr": "Group runs and gait fixes",
  "aqua-fit": "Lap pool, heated year round",
  "urban-threads": "Everyday fits, weekly drops",
  "loom-co": "Handloom cotton, local weavers",
  streetkart: "Streetwear and sneakers",
  "silver-lining": "Silver jewellery, made to order",
  "sole-story": "Sneakers, sized properly",
  "page-one": "Books, with a reading corner",
  "gadget-garage": "Repairs while you wait",
  "bloom-florals": "Same-day bouquets",
  cinemax: "Four screens, recliner seats",
  playzone: "Arcade cabinets and air hockey",
  "laser-tag": "Two-floor laser arena",
  "bowl-city": "Ten lanes, late nights",
  "skybar-21": "Rooftop cocktails at sunset",
  "comedy-cellar": "Standup, five nights a week",
  "vinyl-vibes": "Records, DJs and cheap beer",
  "board-cafe": "300 board games, chai included",
  wanderwell: "Weekend trips, sorted",
  hillroute: "Guided treks in the Western Ghats",
  citystay: "Clean rooms near the metro",
  rideeasy: "Scooters and helmets on demand",
  "nest-stays": "Serviced studios, monthly rates",
  backpackers: "Bunks, hot showers, good wifi",
  lakeview: "Lakeside cottages, two hours out",
  "campfire-co": "Tents, bonfires, stargazing",
};

// --- Brandboard: 100 numbered spots, snakes-and-ladders geometry ---
export const BRANDBOARD_SPOTS = 100;
export const SPOT_BASE_PRICE = 100;
export const SPOT_INCREMENT = 100;

export type Spot = { merchantId: string; price: number };

/**
 * Seeded deterministically (no Math.random at module scope, which would
 * desync server and client render). Leaves roughly a third of the board
 * open so there's something to bid for, and lets some brands hold more
 * than one square, exactly like holding several listings on outbid.lol.
 */
export const INITIAL_SPOTS: Record<number, Spot> = (() => {
  const spots: Record<number, Spot> = {};
  for (let square = 1; square <= BRANDBOARD_SPOTS; square++) {
    if ((square * 7) % 10 >= 7) continue; // ~30% left open
    const brand = BRANDS[(square * 13) % BRANDS.length];
    spots[square] = { merchantId: brand.id, price: SPOT_BASE_PRICE + ((square * 17) % 6) * SPOT_INCREMENT };
  }
  return spots;
})();

/** Seeded so the board shows real engagement rather than a wall of zeros. */
export const INITIAL_SPOT_CLICKS: Record<number, number> = (() => {
  const clicks: Record<number, number> = {};
  for (let square = 1; square <= BRANDBOARD_SPOTS; square++) {
    if (!INITIAL_SPOTS[square]) continue;
    clicks[square] = 40 + ((square * 89) % 700);
  }
  return clicks;
})();

/** Same square for everyone on a given day — a shared daily ritual. */
export function genieStartSquare(dayKey: string) {
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) h = (h * 31 + dayKey.charCodeAt(i)) % 9973;
  return (h % BRANDBOARD_SPOTS) + 1;
}

/** Board is numbered from the bottom-left and snakes, like the real game. */
export function squareToCell(square: number) {
  const index = square - 1;
  const rowFromBottom = Math.floor(index / 10);
  const withinRow = index % 10;
  const col = rowFromBottom % 2 === 0 ? withinRow : 9 - withinRow;
  return { row: 9 - rowFromBottom, col };
}

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

export type GameDef = {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  /** chance = always pays out; skill = you have to actually land it */
  kind: "chance" | "skill";
  gradient: [string, string];
};

// Roster drawn from the formats branded-minigame platforms actually ship:
// instant-win reveals (wheel, scratch, slot, box, plinko) plus the skill
// formats (reaction/timer, tap rush, memory match) that make a player feel
// responsible for the win rather than just lucky.
export const GAME_LIBRARY: GameDef[] = [
  { id: "rub-the-lamp", name: "Rub the Lamp", icon: "🧞", tagline: "Spin the wheel for an instant prize.", kind: "chance", gradient: ["#7C3AED", "#3B1F7A"] },
  { id: "scratch-win", name: "Scratch & Win", icon: "🪙", tagline: "Scratch three panels to reveal your prize.", kind: "chance", gradient: ["#B9860A", "#7A4B00"] },
  { id: "lucky-reels", name: "Lucky Reels", icon: "🎰", tagline: "Three reels, one pull, instant reveal.", kind: "chance", gradient: ["#B8306F", "#6B1240"] },
  { id: "mystery-box", name: "Mystery Box", icon: "🎁", tagline: "Pick one of three boxes — no peeking.", kind: "chance", gradient: ["#2354A6", "#12306B"] },
  { id: "roll-the-dice", name: "Roll the Dice", icon: "🎲", tagline: "Two dice, one roll, pure chance.", kind: "chance", gradient: ["#0F8B6C", "#064B3A"] },
  { id: "plinko-drop", name: "Plinko Drop", icon: "⚪", tagline: "Drop the ball and watch it bounce home.", kind: "chance", gradient: ["#1789A6", "#0A4B5C"] },
  { id: "timer-stop", name: "Timer Stop", icon: "⏱️", tagline: "Stop the sweep inside the glowing zone.", kind: "skill", gradient: ["#C2540B", "#7A3306"] },
  { id: "tap-rush", name: "Tap Rush", icon: "👆", tagline: "Hit 5 targets before the clock runs out.", kind: "skill", gradient: ["#A6237E", "#5E0F47"] },
  { id: "memory-match", name: "Memory Match", icon: "🃏", tagline: "Find all three pairs in eight flips.", kind: "skill", gradient: ["#4C1D95", "#1E0B44"] },
];
