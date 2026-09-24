"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

const LOVED_KEY = "viralgenie-loved-brands";

function readLoved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(LOVED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

/** Customers' affection for a brand — one per brand per browser. */
export function LoveButton({
  brandId,
  size = "md",
  showCount = true,
}: {
  brandId: string;
  size?: "sm" | "md" | "lg";
  /** Off where the count is already shown next to the button. */
  showCount?: boolean;
}) {
  const loves = useAppStore((s) => s.loves[brandId] ?? 0);
  const loveBrand = useAppStore((s) => s.loveBrand);
  const [loved, setLoved] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    // Read after mount so the prerendered shell and first client paint match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoved(readLoved().has(brandId));
  }, [brandId]);

  function love() {
    if (loved) return;
    loveBrand(brandId);
    const next = readLoved().add(brandId);
    window.localStorage.setItem(LOVED_KEY, JSON.stringify(Array.from(next)));
    setLoved(true);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 600);
  }

  const pad =
    size === "lg" ? "px-5 py-2.5 text-[14px]" : size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3.5 py-1.5 text-[12.5px]";

  return (
    <button
      onClick={love}
      disabled={loved}
      aria-label={loved ? `You love this brand — ${loves} total` : `Show love for this brand — ${loves} so far`}
      className={`relative inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all ${pad} ${
        loved
          ? "border-transparent text-white"
          : "border-border bg-surface-raised text-text-soft hover:-translate-y-0.5 hover:border-[var(--cat-beauty)] hover:text-[var(--cat-beauty)]"
      }`}
      style={loved ? { background: "linear-gradient(120deg, var(--cat-beauty), var(--accent-deep))" } : undefined}
    >
      <span className={burst ? "love-burst" : ""}>{loved ? "❤️" : "🤍"}</span>
      {showCount ? (
        <span className="mono">{loves.toLocaleString("en-IN")}</span>
      ) : (
        <span className="text-[11px]">{loved ? "Loved" : "Love"}</span>
      )}
    </button>
  );
}
