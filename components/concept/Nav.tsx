"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#rankwars", label: "Rank Wars" },
  { href: "#loop", label: "Loop" },
  { href: "#customer", label: "Customer App" },
  { href: "#merchant", label: "Merchant Console" },
  { href: "#playbook", label: "Playbook" },
];

export function Nav() {
  const [active, setActive] = useState("#loop");

  useEffect(() => {
    const sections = LINKS.map((l) => document.querySelector(l.href)).filter(
      (el): el is Element => el !== null
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-surface/90 px-6 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-2.5 font-semibold">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] text-[15px]"
          style={{
            background: "linear-gradient(155deg, var(--accent), var(--accent-deep))",
            boxShadow: "var(--shadow)",
          }}
        >
          ✨
        </div>
        <span className="font-display text-[17px]">ViralGenie</span>
        <span className="ml-0.5 rounded-full border border-border px-2.5 py-0.5 text-[11px] tracking-wide text-text-soft uppercase">
          Marketplace concept
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
              active === link.href
                ? "bg-surface-sunken text-text"
                : "text-text-soft hover:bg-surface-sunken hover:text-text"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
