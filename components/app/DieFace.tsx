"use client";

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Drawn with pips rather than the Unicode die characters (U+2680…), which
 * have no glyph in our font stack and render as empty boxes.
 */
export function DieFace({ value, size = 56, rolling = false }: { value: number; size?: number; rolling?: boolean }) {
  const pip = Math.round(size * 0.15);
  return (
    <span
      className={`dice ${rolling ? "rolling" : ""}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.14), borderRadius: Math.round(size * 0.22) }}
    >
      {Array.from({ length: 9 }, (_, cell) => (
        <span
          key={cell}
          className="pip"
          style={{ width: pip, height: pip, opacity: (PIP_LAYOUT[value] ?? PIP_LAYOUT[1]).includes(cell) ? 1 : 0 }}
        />
      ))}
    </span>
  );
}
