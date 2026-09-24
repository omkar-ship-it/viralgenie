"use client";

/**
 * Brands have no real logo files here, so we mint a stable one: a squircle
 * with a hue derived from the brand id (same brand, same colours, every
 * render) plus its initials and a small emoji badge.
 */
function hue(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

function initials(name: string) {
  const words = name.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  const letters = words.slice(0, 2).map((w) => w[0].toUpperCase());
  return letters.join("") || name.slice(0, 2).toUpperCase();
}

const SIZES = {
  sm: { box: 30, font: 11, badge: 13, badgeFont: 8 },
  md: { box: 40, font: 14, badge: 16, badgeFont: 10 },
  lg: { box: 58, font: 20, badge: 22, badgeFont: 13 },
};

export function BrandLogo({
  id,
  name,
  emoji,
  size = "md",
}: {
  id: string;
  name: string;
  emoji: string;
  size?: keyof typeof SIZES;
}) {
  const h = hue(id);
  const s = SIZES[size];

  return (
    <span
      className="logo-mark"
      style={{
        width: s.box,
        height: s.box,
        fontSize: s.font,
        background: `linear-gradient(140deg, hsl(${h} 62% 46%), hsl(${(h + 34) % 360} 66% 30%))`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
      <span
        className="logo-badge"
        style={{ width: s.badge, height: s.badge, fontSize: s.badgeFont }}
      >
        {emoji}
      </span>
    </span>
  );
}
