type Node = { x: number; label: string; sub: string; highlight?: boolean };

const NODE_W = 150;
const NODE_H = 60;
const NODE_Y = 55;

function LoopRow({
  markerId,
  nodes,
  returnLabel,
}: {
  markerId: string;
  nodes: Node[];
  returnLabel: string;
}) {
  return (
    <svg viewBox="0 0 1000 210" role="img" aria-label={returnLabel} className="block h-auto w-full">
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <polygon points="0,0 8,4 0,8" fill="currentColor" />
        </marker>
      </defs>
      <g fontFamily="var(--font-body), sans-serif" fill="currentColor">
        {nodes.map((n, i) => (
          <g key={i}>
            <rect
              x={n.x}
              y={NODE_Y}
              width={NODE_W}
              height={NODE_H}
              rx="10"
              fill="none"
              stroke={n.highlight ? "var(--gold)" : "currentColor"}
              opacity={n.highlight ? 1 : 0.5}
            />
            <text
              x={n.x + NODE_W / 2}
              y={NODE_Y + 25}
              textAnchor="middle"
              fontSize="12.5"
              fontWeight="600"
              fill={n.highlight ? "var(--gold)" : "currentColor"}
            >
              {n.label}
            </text>
            <text
              x={n.x + NODE_W / 2}
              y={NODE_Y + 42}
              textAnchor="middle"
              fontSize="10.5"
              opacity="0.65"
            >
              {n.sub}
            </text>
          </g>
        ))}
        {nodes.slice(0, -1).map((n, i) => (
          <line
            key={i}
            x1={n.x + NODE_W}
            y1={NODE_Y + 30}
            x2={nodes[i + 1].x - 4}
            y2={NODE_Y + 30}
            stroke="currentColor"
            markerEnd={`url(#${markerId})`}
          />
        ))}
        <path
          d={`M ${nodes[nodes.length - 1].x + NODE_W / 2} ${NODE_Y + NODE_H} C ${
            nodes[nodes.length - 1].x + NODE_W / 2
          } 175, ${nodes[0].x + NODE_W / 2} 175, ${nodes[0].x + NODE_W / 2} ${NODE_Y + NODE_H}`}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 4"
          markerEnd={`url(#${markerId})`}
        />
        <text x="500" y="195" textAnchor="middle" fontSize="11" opacity="0.7">
          {returnLabel}
        </text>
      </g>
    </svg>
  );
}

const POOL_NODES: Node[] = [
  { x: 20, label: "Merchants", sub: "bid + sponsor" },
  { x: 220, label: "Reward Pool", sub: "ranked & weighted", highlight: true },
  { x: 420, label: "Customer Plays", sub: "spin / dice / lamp" },
  { x: 620, label: "Wins Reward", sub: "pool payout" },
  { x: 820, label: "Redeems In-Store", sub: "QR / PIN scan" },
];

const WISH_NODES: Node[] = [
  { x: 20, label: "Customer", sub: "posts a wish" },
  { x: 220, label: "Marketplace", sub: "matches by category / geo" },
  { x: 420, label: "Merchant", sub: "fulfills or passes" },
  { x: 620, label: "Customer", sub: "redeems + shares" },
  { x: 820, label: "Brand Reach", sub: "UGC + goodwill", highlight: true },
];

export function LoopDiagram() {
  return (
    <>
      <figure className="mb-10">
        <p className="font-display mb-1 text-[15px] font-semibold">Reward Pool Loop</p>
        <LoopRow
          markerId="arrow-pool"
          nodes={POOL_NODES}
          returnLabel="footfall + revenue funds next week's bid"
        />
        <figcaption className="mt-2.5 max-w-[70ch] text-[13px] text-text-soft">
          Bid amount buys rank and a share of the pool&rsquo;s payout odds; the loop only
          continues if redemptions actually happen.
        </figcaption>
      </figure>

      <figure className="mb-10">
        <p className="font-display mb-1 text-[15px] font-semibold">Wishes Loop</p>
        <LoopRow
          markerId="arrow-wish"
          nodes={WISH_NODES}
          returnLabel="goodwill and shares raise the merchant's next bid"
        />
        <figcaption className="mt-2.5 max-w-[70ch] text-[13px] text-text-soft">
          Fulfillment cost is inventory, not cash — the payoff is an organic share plus a
          warmer reason to keep bidding on rank.
        </figcaption>
      </figure>
    </>
  );
}
