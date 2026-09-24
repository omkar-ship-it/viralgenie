import { Nav } from "@/components/concept/Nav";
import { Hero } from "@/components/concept/Hero";
import { LoopDiagram } from "@/components/concept/LoopDiagram";
import { CustomerApp } from "@/components/concept/CustomerApp";
import { MerchantConsole } from "@/components/concept/MerchantConsole";
import { Playbook } from "@/components/concept/Playbook";

function SectionHeader({
  num,
  label,
  title,
  lede,
}: {
  num: string;
  label: string;
  title: string;
  lede: string;
}) {
  return (
    <>
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="mono rounded-md border border-border px-1.75 py-0.5 text-[12px] text-accent">
          {num}
        </span>
        <span className="text-[12px] tracking-[0.08em] text-text-soft uppercase">{label}</span>
      </div>
      <h2 className="mb-3 text-[clamp(24px,3vw,32px)]">{title}</h2>
      <p className="mb-11 max-w-[66ch] text-[15.5px] text-text-soft">{lede}</p>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />

      <section id="loop" className="mx-auto max-w-[1180px] border-t border-border px-6 py-22">
        <SectionHeader
          num="01"
          label="How it turns"
          title="Two loops, one shared incentive"
          lede="The bidding loop pays for reach and stocks the reward pool. The wishes loop turns individual asks into shareable brand moments. Both loops end where footfall is measured, which is the metric that funds the next bid."
        />
        <LoopDiagram />
      </section>

      <section id="customer" className="mx-auto max-w-[1180px] border-t border-border px-6 py-22">
        <SectionHeader
          num="02"
          label="Customer app"
          title="Three screens, one session"
          lede="The pool sells the visit, the game delivers the dopamine, the wish board keeps them coming back between campaigns."
        />
        <CustomerApp />
      </section>

      <section id="merchant" className="mx-auto max-w-[1180px] border-t border-border px-6 py-22">
        <SectionHeader
          num="03"
          label="Merchant console"
          title="Where the bidding actually happens"
          lede="Merchants see rank as something they're actively losing unless they act — the same live-auction pressure that makes outbid.lol compulsive, pointed at footfall instead of a leaderboard for its own sake."
        />
        <MerchantConsole />
      </section>

      <section id="playbook" className="mx-auto max-w-[1180px] border-t border-border px-6 py-22">
        <SectionHeader
          num="04"
          label="Recommendations"
          title="Six calls to make before building this"
          lede="In priority order — each one guards against the way outbid.lol-style auctions tend to break when the thing being won is a real reward instead of a leaderboard slot."
        />
        <Playbook />
      </section>

      <footer className="border-t border-border px-6 py-9 text-center text-[12.5px] text-text-soft">
        Prototype for internal review — ViralGenie marketplace concept · reuses existing
        genie/lamp mechanics and dashboard metrics language from LoyalGenie.
      </footer>
    </>
  );
}
