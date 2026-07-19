"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_snake_best";
const GRID = 24;
const CELL = 25;
const W = GRID * CELL; // 600
const H = GRID * CELL;

type Phase = "idle" | "playing" | "result";
type Cell = { x: number; y: number };

const rndCell = (): Cell => ({ x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) });

export default function JuegoSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const g = useRef({
    snake: [] as Cell[],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 5, y: 5 } as Cell,
    score: 0,
    acc: 0,
    interval: 130,
    last: 0,
  });
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const ponComida = () => {
    const st = g.current;
    let c: Cell;
    do { c = rndCell(); } while (st.snake.some((s) => s.x === c.x && s.y === c.y));
    st.food = c;
  };

  const setDir = useCallback((x: number, y: number) => {
    const d = g.current.dir;
    if (d.x === -x && d.y === -y) return; // no reversa
    g.current.nextDir = { x, y };
  }, []);

  const end = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const score = g.current.score;
    setFinalScore(score);
    setBest((b) => {
      if (score > b) { localStorage.setItem(STORAGE_KEY, String(score)); setJustHitBest(true); return score; }
      return b;
    });
    phaseRef.current = "result";
    setPhase("result");
  }, []);

  const loop = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const st = g.current;
    const dt = st.last ? now - st.last : 16;
    st.last = now;
    st.acc += dt;

    if (st.acc >= st.interval) {
      st.acc = 0;
      st.dir = st.nextDir;
      const head = st.snake[0];
      const nh = { x: head.x + st.dir.x, y: head.y + st.dir.y };
      if (nh.x < 0 || nh.x >= GRID || nh.y < 0 || nh.y >= GRID ||
          st.snake.some((s) => s.x === nh.x && s.y === nh.y)) { end(); return; }
      st.snake.unshift(nh);
      if (nh.x === st.food.x && nh.y === st.food.y) {
        st.score += 10;
        st.interval = Math.max(70, st.interval - 2);
        ponComida();
      } else {
        st.snake.pop();
      }
    }

    // dibujo
    ctx.fillStyle = "#0a1410";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }
    // comida
    ctx.font = `${CELL - 4}px serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🍎", st.food.x * CELL + CELL / 2, st.food.y * CELL + CELL / 2 + 1);
    // serpiente
    st.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? "#a3e635" : "#4ade80";
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    // HUD
    ctx.fillStyle = "#e6faf0";
    ctx.font = "bold 22px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(String(st.score), 14, 30);

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(loop);
  }, [end]);

  const start = () => {
    const st = g.current;
    st.snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
    st.dir = { x: 1, y: 0 };
    st.nextDir = { x: 1, y: 0 };
    st.score = 0;
    st.interval = 130;
    st.acc = 0;
    st.last = 0;
    ponComida();
    setJustHitBest(false);
    phaseRef.current = "playing";
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") { e.preventDefault(); setDir(0, -1); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); setDir(0, 1); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { e.preventDefault(); setDir(-1, 0); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { e.preventDefault(); setDir(1, 0); }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [setDir]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const dpad = (x: number, y: number) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); setDir(x, y); },
  });
  const btn = "select-none touch-none flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 active:bg-white/30 text-2xl font-black h-14 w-14";

  const level = (n: number) => {
    if (n >= 500) return { label: "SERPIENTE LEGENDARIA", emoji: "🐍" };
    if (n >= 300) return { label: "IMPARABLE", emoji: "🔥" };
    if (n >= 150) return { label: "MUY BUENO", emoji: "💪" };
    if (n >= 50) return { label: "NADA MAL", emoji: "⭐" };
    return { label: "APRENDIZ", emoji: "🌱" };
  };
  const shareText = phase === "result" ? `Hice ${finalScore} puntos en Snake ${level(finalScore).emoji} — ¿me superas?` : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">← Juegos</Link>
        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest font-mono">SNAKE</h1>
          <p className="opacity-70 mt-1 text-sm">Come y crece · récord: <strong>{best}</strong></p>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/15 bg-[#0a1410]">
          <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" style={{ aspectRatio: `${W}/${H}` }} />
          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-6">
              <div className="text-6xl mb-3">🐍</div>
              <p className="max-w-xs opacity-90 mb-2">Come manzanas para crecer. No choques con las paredes ni contigo mismo.</p>
              <p className="text-xs opacity-60 mb-6 font-mono">PC: flechas / WASD · Móvil: cruceta abajo</p>
              <button onClick={start} className="bg-white text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform">▶ JUGAR</button>
            </div>
          )}
          {phase === "result" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center px-6">
              <div className="text-6xl mb-2">{level(finalScore).emoji}</div>
              <div className="text-xs uppercase tracking-widest opacity-70">Game Over</div>
              <div className="text-6xl md:text-7xl font-black font-mono my-1">{finalScore}</div>
              <div className="text-lg font-bold mb-1">{level(finalScore).label}</div>
              {justHitBest && <div className="bg-yellow-400 text-black font-bold px-4 py-1.5 rounded-full inline-block my-2">🏆 ¡Nuevo récord!</div>}
              <div className="flex flex-col sm:flex-row gap-3 my-4 justify-center">
                <button onClick={start} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">🔄 Otra partida</button>
                {finalScore > 0 && <button onClick={() => setShowLeaderboard(true)} className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">🏆 Ranking global</button>}
              </div>
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/snake" />
            </div>
          )}
        </div>

        {phase === "playing" && (
          <div className="flex justify-center mt-4 md:hidden">
            <div className="grid grid-cols-3 gap-2 w-fit">
              <span /><button aria-label="Arriba" className={btn} {...dpad(0, -1)}>▲</button><span />
              <button aria-label="Izquierda" className={btn} {...dpad(-1, 0)}>◀</button>
              <button aria-label="Abajo" className={btn} {...dpad(0, 1)}>▼</button>
              <button aria-label="Derecha" className={btn} {...dpad(1, 0)}>▶</button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <LeaderboardModal game="snake" score={finalScore} unit="puntos" scoreOrder="high" onClose={() => setShowLeaderboard(false)} />
        )}
      </div>
    </div>
  );
}
