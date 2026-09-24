const PILLARS = [
  {
    title: "Segment the auction — never one national ladder",
    body: "Run rank auctions per category × neighbourhood (e.g. “Food & Beverage · Koramangala”), on a weekly cadence matching campaign cycles already in the vendor wizard. A single global ladder lets one large chain buy every #1 slot in the city; segmented pods let a local café actually win its own neighbourhood.",
    tag: "Guards against whale dominance",
  },
  {
    title: "Bid buys odds-weight, not a guaranteed prize",
    body: "Rank should set the payout probability in the spin/dice/lamp mechanic, not hand out the reward outright — cap any single sponsor's odds share (e.g. 35%) so the pool still feels generous and random to players even when one merchant is winning the bid war.",
    tag: "Keeps the game feeling fair",
  },
  {
    title: "Pay-on-win escrow with anti-snipe",
    body: "Charge the merchant's card only when their bid wins the window, and extend the countdown by 60–90 seconds on any bid in the final minute — the same anti-sniping outbid.lol-style auctions need to stop a last-second bid from making every earlier bidder feel cheated.",
    tag: "Trust in the auction itself",
  },
  {
    title: "Wishes get a merchant first-look window, then go public",
    body: "Route a new wish to the 1–2 best-matched local merchants for a short window before opening it to the whole category — protects the wish from becoming a spam free-for-all and gives a merchant time to fulfil it before it's visible that they passed.",
    tag: "Protects the goodwill mechanic",
  },
  {
    title: "Make rank changes and grants shareable events, not just UI states",
    body: "A push notification when a merchant is outbid (“you dropped to #2 in Koramangala”), a share card auto-generated the moment a wish is granted, and an in-app “your play just moved Third Wave to #1” moment for the customer whose spin tipped the pool — these are the actual viral loop, not the leaderboard itself.",
    tag: "This is the growth engine",
  },
  {
    title: "Every rupee bid must trace to Repeat Visit Rate",
    body: "Reuse the existing dashboard's hero metric rather than inventing a rank-specific vanity number — add Cost per Redemption and Rank ROI (impressions ÷ ₹ spent) next to it so a merchant can answer “was outbidding worth it” in the same terms they already trust the dashboard for.",
    tag: "Ties back to what Omkar sells",
  },
];

export function Playbook() {
  return (
    <div className="flex flex-col">
      {PILLARS.map((p, i) => (
        <div
          key={p.title}
          className="grid grid-cols-[56px_1fr] gap-5 border-t border-border py-6.5 first:border-t-0"
        >
          <div className="font-display text-[26px] leading-none font-semibold text-accent">
            {i + 1}
          </div>
          <div>
            <h3 className="mb-2 text-[17px]">{p.title}</h3>
            <p className="max-w-[70ch] text-[14.5px] text-text-soft">{p.body}</p>
            <span className="mt-2.5 inline-block rounded-full bg-surface-sunken px-2.5 py-0.5 text-[11px] font-semibold text-accent-deep">
              {p.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
