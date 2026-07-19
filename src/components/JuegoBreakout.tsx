"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_breakout_best";
const W = 700;
const H = 520;
const PAD_W = 96;
const PAD_H = 12;
const PAD_Y = H - 32;
const BALL_R = 7;
const B_COLS = 12;
const B_ROWS = 6;
const B_TOP = 60;
const B_H = 22;
const B_GAP = 4;
const MARGIN = 24;
const B_W = (W - MARGIN * 2 - B_GAP * (B_COLS - 1)) / B_COLS;
const ROW_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#c084fc"];
const ROW_PTS = [60, 50, 40, 30, 20, 10];

type Phase = "idle" | "playing" | "result";

export default function JuegoBreakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const g = useRef({
    px: W / 2,
    ball: { x: W / 2, y: PAD_Y - 20, vx: 4, vy: -4 },
    stuck: true,
    bricks: [] as boolean[],
    score: 0,
    lives: 3,
    level: 1,
    speed: 5,
    last: 0,
  });
  const keys = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const nuevosLadrillos = () => Array<boolean>(B_COLS * B_ROWS).fill(true);

  const lanzar = (dir: number) => {
    const st = g.current;
    st.ball.x = st.px;
    st.ball.y = PAD_Y - BALL_R - 2;
    const ang = (-Math.PI / 2) + dir * 0.4;
    st.ball.vx = Math.cos(ang) * st.speed;
    st.ball.vy = Math.sin(ang) * st.speed;
    st.stuck = false;
  };

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
    st.last = now;

    // paleta con teclado
    if (keys.current.left) st.px -= 8;
    if (keys.current.right) st.px += 8;
    st.px = Math.max(PAD_W / 2, Math.min(W - PAD_W / 2, st.px));

    const b = st.ball;
    if (st.stuck) {
      b.x = st.px; b.y = PAD_Y - BALL_R - 2;
    } else {
      b.x += b.vx; b.y += b.vy;
      // paredes
      if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx); }
      if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx); }
      if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy); }
      // paleta
      if (b.vy > 0 && b.y + BALL_R >= PAD_Y && b.y < PAD_Y + PAD_H && Math.abs(b.x - st.px) < PAD_W / 2 + BALL_R) {
        const off = (b.x - st.px) / (PAD_W / 2); // -1..1
        const ang = (-Math.PI / 2) + off * 1.05;
        b.vx = Math.cos(ang) * st.speed;
        b.vy = Math.sin(ang) * st.speed;
        b.y = PAD_Y - BALL_R;
      }
      // fondo -> vida
      if (b.y > H + 20) {
        st.lives--;
        if (st.lives <= 0) { end(); return; }
        st.stuck = true;
      }
      // ladrillos
      for (let i = 0; i < st.bricks.length; i++) {
        if (!st.bricks[i]) continue;
        const col = i % B_COLS, row = Math.floor(i / B_COLS);
        const bx = MARGIN + col * (B_W + B_GAP);
        const by = B_TOP + row * (B_H + B_GAP);
        if (b.x + BALL_R > bx && b.x - BALL_R < bx + B_W && b.y + BALL_R > by && b.y - BALL_R < by + B_H) {
          st.bricks[i] = false;
          st.score += ROW_PTS[row];
          // rebote según lado de entrada
          const prevX = b.x - b.vx, prevY = b.y - b.vy;
          if (prevY <= by || prevY >= by + B_H) b.vy = -b.vy; else b.vx = -b.vx;
          break;
        }
      }
      // nivel superado
      if (!st.bricks.some((v) => v)) {
        st.level++;
        st.speed += 0.6;
        st.bricks = nuevosLadrillos();
        st.stuck = true;
      }
    }

    // dibujo
    ctx.fillStyle = "#080a12";
    ctx.fillRect(0, 0, W, H);
    // ladrillos
    for (let i = 0; i < st.bricks.length; i++) {
      if (!st.bricks[i]) continue;
      const col = i % B_COLS, row = Math.floor(i / B_COLS);
      ctx.fillStyle = ROW_COLORS[row];
      ctx.fillRect(MARGIN + col * (B_W + B_GAP), B_TOP + row * (B_H + B_GAP), B_W, B_H);
    }
    // paleta
    ctx.fillStyle = "#7dd3fc";
    ctx.fillRect(st.px - PAD_W / 2, PAD_Y, PAD_W, PAD_H);
    // bola
    ctx.fillStyle = "#fde047";
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    // HUD
    ctx.fillStyle = "#e6faf0";
    ctx.font = "bold 20px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.fillText(String(st.score), 14, 28);
    ctx.textAlign = "center"; ctx.fillText("NIVEL " + st.level, W / 2, 28);
    ctx.textAlign = "right"; ctx.fillText("❤️".repeat(Math.max(0, st.lives)), W - 12, 28);
    if (st.stuck) {
      ctx.textAlign = "center"; ctx.font = "bold 16px ui-monospace, monospace";
      ctx.fillText("Toca / ESPACIO para lanzar", W / 2, PAD_Y - 40);
    }

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(loop);
  }, [end]);

  const start = () => {
    const st = g.current;
    st.px = W / 2;
    st.bricks = nuevosLadrillos();
    st.score = 0; st.lives = 3; st.level = 1; st.speed = 5; st.stuck = true; st.last = 0;
    st.ball = { x: W / 2, y: PAD_Y - 20, vx: 4, vy: -4 };
    setJustHitBest(false);
    phaseRef.current = "playing";
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowLeft", "ArrowRight", " "].includes(k)) e.preventDefault();
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = true;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = true;
      else if (k === " " && g.current.stuck && phaseRef.current === "playing") lanzar(0);
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = false;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // arrastrar el dedo/ratón sobre el canvas mueve la paleta
  const mover = (e: React.PointerEvent) => {
    if (phaseRef.current !== "playing") return;
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    g.current.px = Math.max(PAD_W / 2, Math.min(W - PAD_W / 2, x));
  };
  const tocar = (e: React.PointerEvent) => {
    mover(e);
    if (g.current.stuck) lanzar(0);
  };

  const level = (n: number) => {
    if (n >= 3000) return { label: "ROMPE-MUROS PRO", emoji: "🏆" };
    if (n >= 1500) return { label: "IMPARABLE", emoji: "🔥" };
    if (n >= 700) return { label: "MUY BUENO", emoji: "💪" };
    if (n >= 200) return { label: "NADA MAL", emoji: "⭐" };
    return { label: "APRENDIZ", emoji: "🧱" };
  };
  const shareText = phase === "result" ? `Hice ${finalScore} puntos en Breakout ${level(finalScore).emoji} — ¿me superas?` : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">← Juegos</Link>
        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest font-mono">BREAKOUT</h1>
          <p className="opacity-70 mt-1 text-sm">Rompe todos los ladrillos · récord: <strong>{best}</strong></p>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/15 bg-[#080a12]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerMove={mover}
            onPointerDown={tocar}
            className="w-full h-auto block touch-none cursor-pointer"
            style={{ aspectRatio: `${W}/${H}` }}
          />
          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-6">
              <div className="text-6xl mb-3">🧱</div>
              <p className="max-w-xs opacity-90 mb-2">Rebota la bola con la paleta y rompe todos los ladrillos. 3 vidas, niveles infinitos.</p>
              <p className="text-xs opacity-60 mb-6 font-mono">PC: ← → o ratón · ESPACIO lanzar · Móvil: arrastra el dedo</p>
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
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/breakout" />
            </div>
          )}
        </div>

        {showLeaderboard && (
          <LeaderboardModal game="breakout" score={finalScore} unit="puntos" scoreOrder="high" onClose={() => setShowLeaderboard(false)} />
        )}
      </div>
    </div>
  );
}
