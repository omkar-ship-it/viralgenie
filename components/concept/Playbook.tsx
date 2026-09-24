const PILLARS = [
  {
    title: "Segment the ladder — never one national leaderboard",
    body: "Run a separate, always-live rank ladder per category × neighbourhood (e.g. “Food & Beverage · Koramangala”), each with its own #1 to dethrone. A single global ladder lets one large chain buy every #1 slot in the city forever; segmented pods let a local café actually take its own neighbourhood.",
    tag: "Guards against whale dominance",
  },
  {
    title: "Bid buys odds-weight, not a guaranteed prize",
    body: "Rank should set the payout probability in the spin/dice/lamp mechanic, not hand out the reward outright — cap any single sponsor's odds share (e.g. 35%) so the pool still feels generous and random to players even when one merchant has held #1 for weeks.",
    tag: "Keeps the game feeling fair",
  },
  {
    title: "Charge on outbid, not on a schedule — but require live stock to hold it",
    body: "No auction window means no anti-snipe to design — just charge the instant a bid exceeds the current holder's price, final and non-refundable, exactly like outbid.lol. The one addition outbid.lol doesn't need: auto-demote a merchant the moment their reward stock hits zero, regardless of what they paid, so #1 can never mean “nothing left to redeem.”",
    tag: "Trust in the ladder itself",
  },
  {
    title: "Wishes get a merchant first-look window, then go public",
    body: "Route a new wish to the 1–2 best-matched local merchants for a short window before opening it to the whole category — protects the wish from becoming a spam free-for-all and gives a merchant time to fulfil it before it's visible that they passed.",
    tag: "Protects the goodwill mechanic",
  },
  {
    title: "Publish every dethroning — merchants are the real audience",
    body: "outbid.lol's virality came from other founders watching the leaderboard change and jumping in themselves, not from end users. A public, screenshot-worthy “Rank Wars” feed of every outbid event (who paid what to take #1 from whom) is what pulls the next merchant in — plus a push notification the moment you're dethroned (“you dropped to #2 in Koramangala”).",
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
