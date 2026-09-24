"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Every game owns its own interaction and calls onFinish(success) exactly once.
 * Chance games always finish true; skill games finish false when you miss.
 */
export type GameProps = {
  onFinish: (success: boolean) => void;
  disabled: boolean;
};

const REEL_SYMBOLS = ["🍒", "⭐", "💎", "🔔", "🍋", "7️⃣"];
const SCRATCH_SYMBOLS = ["🍀", "⭐", "💎", "🎉", "🔔"];
const MEMORY_SYMBOLS = ["🧞", "🎁", "💎"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Stable callback that fires the parent's handler at most once per round. */
function useOnce(onFinish: (success: boolean) => void) {
  const done = useRef(false);
  const latest = useRef(onFinish);

  useEffect(() => {
    latest.current = onFinish;
  });

  return useCallback((success: boolean) => {
    if (done.current) return;
    done.current = true;
    latest.current(success);
  }, []);
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn-primary rounded-full px-7 py-3 text-[14px] font-semibold">
      {children}
    </button>
  );
}

/* ------------------------------- wheel ------------------------------- */

export function WheelGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning || disabled) return;
    setSpinning(true);
    const turn = 1080 + Math.floor(Math.random() * 360);
    if (wheelRef.current) wheelRef.current.style.transform = `rotate(${turn}deg)`;
    window.setTimeout(() => finish(true), reducedMotion() ? 0 : 2600);
  }

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="relative">
        <div className="wheel-pin" />
        <div className="wheel" ref={wheelRef} style={{ width: 230, height: 230 }}>
          <div className="wheel-hub" style={{ width: 54, height: 54, fontSize: 24 }}>
            🧞
          </div>
        </div>
      </div>
      <PrimaryButton onClick={spin} disabled={spinning || disabled}>
        {spinning ? "Spinning…" : "🧞 Rub the Lamp"}
      </PrimaryButton>
    </div>
  );
}

/* -------------------------------- dice ------------------------------- */

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DiceGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [rolling, setRolling] = useState(false);
  const [pips, setPips] = useState(() => [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);

  useEffect(() => {
    if (!rolling) return;
    const id = window.setInterval(
      () => setPips([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]),
      90
    );
    return () => window.clearInterval(id);
  }, [rolling]);

  function roll() {
    if (rolling || disabled) return;
    setRolling(true);
    window.setTimeout(
      () => {
        setRolling(false);
        finish(true);
      },
      reducedMotion() ? 0 : 950
    );
  }

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex gap-4">
        {pips.map((count, i) => (
          <div key={i} className={`dice ${rolling ? "rolling" : ""}`}>
            {Array.from({ length: 9 }, (_, cell) => (
              <div key={cell} className="pip" style={{ opacity: PIP_LAYOUT[count].includes(cell) ? 1 : 0 }} />
            ))}
          </div>
        ))}
      </div>
      <PrimaryButton onClick={roll} disabled={rolling || disabled}>
        {rolling ? "Rolling…" : "🎲 Roll the dice"}
      </PrimaryButton>
    </div>
  );
}

/* -------------------------------- reels ------------------------------ */

export function ReelsGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [spinning, setSpinning] = useState(false);
  const [symbols, setSymbols] = useState(() => [pick(REEL_SYMBOLS), pick(REEL_SYMBOLS), pick(REEL_SYMBOLS)]);

  useEffect(() => {
    if (!spinning) return;
    const id = window.setInterval(
      () => setSymbols([pick(REEL_SYMBOLS), pick(REEL_SYMBOLS), pick(REEL_SYMBOLS)]),
      80
    );
    return () => window.clearInterval(id);
  }, [spinning]);

  function pull() {
    if (spinning || disabled) return;
    setSpinning(true);
    window.setTimeout(
      () => {
        setSpinning(false);
        finish(true);
      },
      reducedMotion() ? 0 : 1400
    );
  }

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="reels-row">
        {symbols.map((sym, i) => (
          <div key={i} className={`reel-window ${spinning ? "spinning" : ""}`}>
            {sym}
          </div>
        ))}
      </div>
      <PrimaryButton onClick={pull} disabled={spinning || disabled}>
        {spinning ? "Pulling…" : "🎰 Pull the lever"}
      </PrimaryButton>
    </div>
  );
}

/* ------------------------------- scratch ----------------------------- */

export function ScratchGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [symbols] = useState(() => [pick(SCRATCH_SYMBOLS), pick(SCRATCH_SYMBOLS), pick(SCRATCH_SYMBOLS)]);

  function scratch(i: number) {
    if (disabled || revealed[i]) return;
    const next = [...revealed];
    next[i] = true;
    setRevealed(next);
    if (next.every(Boolean)) window.setTimeout(() => finish(true), 300);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="scratch-row">
        {symbols.map((sym, i) => (
          <button
            key={i}
            onClick={() => scratch(i)}
            className={`scratch-cell ${revealed[i] ? "revealed" : ""}`}
            aria-label={`Scratch panel ${i + 1}`}
          >
            {sym}
            <span className="scratch-cover">?</span>
          </button>
        ))}
      </div>
      <p className="text-[13px] text-text-soft">Scratch all three panels.</p>
    </div>
  );
}

/* ----------------------------- mystery box --------------------------- */

export function MysteryBoxGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [picked, setPicked] = useState<number | null>(null);

  function choose(i: number) {
    if (disabled || picked !== null) return;
    setPicked(i);
    window.setTimeout(() => finish(true), reducedMotion() ? 0 : 600);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="box-row">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            disabled={picked !== null}
            className={`mystery-box ${picked === i ? "picked" : ""} ${picked !== null && picked !== i ? "faded" : ""}`}
            aria-label={`Pick box ${i + 1}`}
          >
            🎁
          </button>
        ))}
      </div>
      <p className="text-[13px] text-text-soft">Pick a box — one of them is yours.</p>
    </div>
  );
}

/* -------------------------------- plinko ----------------------------- */

const PLINKO_ROWS = 6;

export function PlinkoGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [pos, setPos] = useState({ x: 130, y: 14 });
  const [dropping, setDropping] = useState(false);

  function drop() {
    if (dropping || disabled) return;
    setDropping(true);

    let x = 130;
    const path: Array<{ x: number; y: number }> = [];
    for (let row = 0; row < PLINKO_ROWS; row++) {
      x += Math.random() < 0.5 ? -19 : 19;
      x = Math.max(28, Math.min(232, x));
      path.push({ x, y: 48 + row * 33 });
    }
    path.push({ x, y: 238 });

    if (reducedMotion()) {
      setPos(path[path.length - 1]);
      finish(true);
      return;
    }

    path.forEach((p, i) => window.setTimeout(() => setPos(p), i * 210));
    window.setTimeout(() => finish(true), path.length * 210 + 220);
  }

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="plinko-board">
        {Array.from({ length: PLINKO_ROWS }, (_, row) =>
          Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, i) => (
            <span
              key={`${row}-${i}`}
              className="peg"
              style={{ left: (row % 2 === 0 ? 35 : 54) + i * 38, top: 62 + row * 33 }}
            />
          ))
        )}
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="plinko-slot" style={{ left: i * 52, width: 52 }}>
            🎁
          </span>
        ))}
        <span
          className="plinko-ball"
          style={{ left: pos.x, top: pos.y, transition: "left .2s ease-out, top .2s ease-in" }}
        />
      </div>
      <PrimaryButton onClick={drop} disabled={dropping || disabled}>
        {dropping ? "Dropping…" : "⚪ Drop the ball"}
      </PrimaryButton>
    </div>
  );
}

/* ------------------------------ timer stop --------------------------- */

const ZONE_WIDTH = 17;

export function TimerStopGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [zoneStart] = useState(() => 12 + Math.random() * 60);
  const [pos, setPos] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const step = () => {
      posRef.current += dirRef.current * 1.15;
      if (posRef.current >= 100) {
        posRef.current = 100;
        dirRef.current = -1;
      }
      if (posRef.current <= 0) {
        posRef.current = 0;
        dirRef.current = 1;
      }
      setPos(posRef.current);
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [running]);

  function start() {
    if (disabled || running || result !== null) return;
    setRunning(true);
  }

  function stop() {
    if (!running) return;
    setRunning(false);
    const hit = posRef.current >= zoneStart && posRef.current <= zoneStart + ZONE_WIDTH;
    setResult(hit);
    window.setTimeout(() => finish(hit), 450);
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="timer-track">
        <span className="timer-zone" style={{ left: `${zoneStart}%`, width: `${ZONE_WIDTH}%` }} />
        <span className="timer-marker" style={{ left: `calc(${pos}% - 2px)` }} />
      </div>
      <p className="text-[13px] text-text-soft">
        {result === null
          ? "Stop the marker inside the green zone to win."
          : result
            ? "Nailed it — right in the zone."
            : "Missed the zone by a hair."}
      </p>
      <PrimaryButton onClick={running ? stop : start} disabled={disabled || result !== null}>
        {running ? "⏱️ Stop!" : "⏱️ Start the sweep"}
      </PrimaryButton>
    </div>
  );
}

/* ------------------------------- tap rush ---------------------------- */

const TAP_TARGET = 5;
const TAP_SECONDS = 8;

export function TapRushGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [running, setRunning] = useState(false);
  const [active, setActive] = useState(-1);
  const [hits, setHits] = useState(0);
  const [left, setLeft] = useState(TAP_SECONDS);
  const hitsRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const deadline = Date.now() + TAP_SECONDS * 1000;
    const move = window.setInterval(() => setActive(Math.floor(Math.random() * 9)), 750);
    const tick = window.setInterval(() => {
      const remain = Math.ceil((deadline - Date.now()) / 1000);
      setLeft(Math.max(0, remain));
      if (remain <= 0) {
        window.clearInterval(move);
        window.clearInterval(tick);
        setRunning(false);
        setActive(-1);
        finish(hitsRef.current >= TAP_TARGET);
      }
    }, 250);
    return () => {
      window.clearInterval(move);
      window.clearInterval(tick);
    };
  }, [running, finish]);

  function start() {
    if (disabled || running) return;
    setRunning(true);
    setActive(Math.floor(Math.random() * 9));
  }

  function tap(i: number) {
    if (!running || i !== active) return;
    hitsRef.current += 1;
    setHits(hitsRef.current);
    setActive(-1);
    if (hitsRef.current >= TAP_TARGET) {
      setRunning(false);
      finish(true);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-5 text-[13px]">
        <span className="mono font-semibold text-accent-deep">
          {hits}/{TAP_TARGET} hits
        </span>
        <span className="mono font-semibold" style={{ color: left <= 3 ? "var(--warn)" : "var(--text-soft)" }}>
          {Math.max(0, left)}s left
        </span>
      </div>
      <div className="tap-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            className={`tap-cell ${active === i ? "active" : ""}`}
            aria-label={`Target ${i + 1}`}
          >
            {active === i ? "🧞" : ""}
          </button>
        ))}
      </div>
      {!running && (
        <PrimaryButton onClick={start} disabled={disabled}>
          👆 Start the rush
        </PrimaryButton>
      )}
    </div>
  );
}

/* ----------------------------- memory match -------------------------- */

const MAX_FLIPS = 8;

export function MemoryMatchGame({ onFinish, disabled }: GameProps) {
  const finish = useOnce(onFinish);
  const [deck] = useState(() =>
    [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS]
      .map((sym) => ({ sym, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((x, i) => ({ id: i, sym: x.sym }))
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [flips, setFlips] = useState(0);
  const busy = useRef(false);

  function flip(id: number) {
    if (disabled || busy.current) return;
    if (flipped.includes(id) || matched.includes(id)) return;

    const next = [...flipped, id];
    setFlipped(next);
    const usedFlips = flips + 1;
    setFlips(usedFlips);

    if (next.length < 2) return;

    busy.current = true;
    const [a, b] = next;
    const isPair = deck[a].sym === deck[b].sym;

    window.setTimeout(() => {
      if (isPair) {
        const nextMatched = [...matched, a, b];
        setMatched(nextMatched);
        if (nextMatched.length === deck.length) {
          finish(true);
          return;
        }
      } else if (usedFlips >= MAX_FLIPS) {
        setFlipped([]);
        busy.current = false;
        finish(false);
        return;
      }
      setFlipped([]);
      busy.current = false;
    }, 650);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="mono text-[13px] font-semibold text-accent-deep">
        {flips}/{MAX_FLIPS} flips used · {matched.length / 2}/3 pairs
      </div>
      <div className="memory-grid">
        {deck.map((card) => {
          const isUp = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              className={`memory-card ${matched.includes(card.id) ? "matched" : isUp ? "flipped" : ""}`}
              aria-label={isUp ? `Card showing ${card.sym}` : "Hidden card"}
            >
              {isUp ? card.sym : "?"}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-text-soft">Find all three pairs within eight flips.</p>
    </div>
  );
}

/* ------------------------------ dispatcher --------------------------- */

export const GAME_COMPONENTS: Record<string, React.ComponentType<GameProps>> = {
  "rub-the-lamp": WheelGame,
  "roll-the-dice": DiceGame,
  "lucky-reels": ReelsGame,
  "scratch-win": ScratchGame,
  "mystery-box": MysteryBoxGame,
  "plinko-drop": PlinkoGame,
  "timer-stop": TimerStopGame,
  "tap-rush": TapRushGame,
  "memory-match": MemoryMatchGame,
};
