"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_pong_best";
const W = 700;
const H = 460;
const PAD_W = 12;
const PAD_H = 82;
const BALL_R = 8;
const P_X = 24; // paleta jugador (izquierda)
const AI_X = W - 24 - PAD_W;

type Phase = "idle" | "playing" | "result";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export default function JuegoPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const g = useRef({
    py: H / 2 - PAD_H / 2,
    ay: H / 2 - PAD_H / 2,
    ball: { x: W / 2, y: H / 2, vx: 5, vy: 2 },
    speed: 5,
    score: 0, // peloteos devueltos
    lives: 3, // goles encajados permitidos
    last: 0,
  });
  const keys = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const saque = (haciaJugador: boolean) => {
    const st = g.current;
    st.speed = 5;
    st.ball = {
      x: W / 2, y: H / 2,
      vx: (haciaJugador ? -1 : 1) * st.speed,
      vy: rnd(-2.5, 2.5),
    };
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

    // paleta jugador con teclado
    if (keys.current.up) st.py -= 7;
    if (keys.current.down) st.py += 7;
    st.py = Math.max(0, Math.min(H - PAD_H, st.py));

    // IA (imperfecta: se acelera con la bola pero con tope, así se le puede ganar)
    const objetivo = st.ball.y - PAD_H / 2;
    const aiSpeed = Math.min(6.2, 3.2 + st.speed * 0.35);
    if (st.ay + PAD_H / 2 < st.ball.y - 8) st.ay += aiSpeed;
    else if (st.ay + PAD_H / 2 > st.ball.y + 8) st.ay -= aiSpeed;
    st.ay = Math.max(0, Math.min(H - PAD_H, st.ay));
    void objetivo;

    const b = st.ball;
    b.x += b.vx; b.y += b.vy;
    if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy); }
    if (b.y > H - BALL_R) { b.y = H - BALL_R; b.vy = -Math.abs(b.vy); }

    // paleta jugador
    if (b.vx < 0 && b.x - BALL_R <= P_X + PAD_W && b.x > P_X && b.y > st.py && b.y < st.py + PAD_H) {
      st.speed = Math.min(12, st.speed + 0.35);
      const off = (b.y - (st.py + PAD_H / 2)) / (PAD_H / 2);
      b.vx = Math.abs(Math.cos(off * 0.9) * st.speed);
      b.vy = off * st.speed * 0.8;
      b.x = P_X + PAD_W + BALL_R;
      st.score += 1; // peloteo devuelto
    }
    // paleta IA
    if (b.vx > 0 && b.x + BALL_R >= AI_X && b.x < AI_X + PAD_W && b.y > st.ay && b.y < st.ay + PAD_H) {
      st.speed = Math.min(12, st.speed + 0.35);
      const off = (b.y - (st.ay + PAD_H / 2)) / (PAD_H / 2);
      b.vx = -Math.abs(Math.cos(off * 0.9) * st.speed);
      b.vy = off * st.speed * 0.8;
      b.x = AI_X - BALL_R;
    }

    // goles
    if (b.x < -20) { // el jugador falla
      st.lives--;
      if (st.lives <= 0) { end(); return; }
      saque(true);
    } else if (b.x > W + 20) { // la IA falla -> bonus
      st.score += 5;
      saque(false);
    }

    // dibujo
    ctx.fillStyle = "#080a12";
    ctx.fillRect(0, 0, W, H);
    // red central
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.setLineDash([8, 12]); ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
    // paletas
    ctx.fillStyle = "#7dd3fc"; ctx.fillRect(P_X, st.py, PAD_W, PAD_H);
    ctx.fillStyle = "#f87171"; ctx.fillRect(AI_X, st.ay, PAD_W, PAD_H);
    // bola
    ctx.fillStyle = "#fde047";
    ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); ctx.fill();
    // HUD
    ctx.fillStyle = "#e6faf0";
    ctx.font = "bold 20px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left"; ctx.fillText("PELOTEOS " + st.score, 16, 28);
    ctx.textAlign = "right"; ctx.fillText("❤️".repeat(Math.max(0, st.lives)), W - 12, 28);

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(loop);
  }, [end]);

  const start = () => {
    const st = g.current;
    st.py = H / 2 - PAD_H / 2;
    st.ay = H / 2 - PAD_H / 2;
    st.score = 0; st.lives = 3; st.speed = 5; st.last = 0;
    saque(Math.random() < 0.5);
    setJustHitBest(false);
    phaseRef.current = "playing";
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowUp", "ArrowDown"].includes(k)) e.preventDefault();
      if (k === "ArrowUp" || k === "w" || k === "W") keys.current.up = true;
      else if (k === "ArrowDown" || k === "s" || k === "S") keys.current.down = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowUp" || k === "w" || k === "W") keys.current.up = false;
      else if (k === "ArrowDown" || k === "s" || k === "S") keys.current.down = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // arrastrar el dedo/ratón mueve la paleta del jugador
  const mover = (e: React.PointerEvent) => {
    if (phaseRef.current !== "playing") return;
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * H;
    g.current.py = Math.max(0, Math.min(H - PAD_H, y - PAD_H / 2));
  };

  const level = (n: number) => {
    if (n >= 100) return { label: "MURO IMPENETRABLE", emoji: "🏆" };
    if (n >= 50) return { label: "IMPARABLE", emoji: "🔥" };
    if (n >= 25) return { label: "MUY BUENO", emoji: "💪" };
    if (n >= 10) return { label: "NADA MAL", emoji: "⭐" };
    return { label: "APRENDIZ", emoji: "🏓" };
  };
  const shareText = phase === "result" ? `Aguanté ${finalScore} peloteos en Pong ${level(finalScore).emoji} — ¿ganas a la máquina mejor que yo?` : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">← Juegos</Link>
        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest font-mono">PONG</h1>
          <p className="opacity-70 mt-1 text-sm">Contra la máquina · récord: <strong>{best}</strong></p>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/15 bg-[#080a12]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerMove={mover}
            onPointerDown={mover}
            className="w-full h-auto block touch-none cursor-pointer"
            style={{ aspectRatio: `${W}/${H}` }}
          />
          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-6">
              <div className="text-6xl mb-3">🏓</div>
              <p className="max-w-xs opacity-90 mb-2">Devuelve la bola a la máquina. La bola acelera con cada golpe. Encajas 3 goles y pierdes.</p>
              <p className="text-xs opacity-60 mb-6 font-mono">PC: ↑ ↓ o ratón · Móvil: arrastra el dedo</p>
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
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/pong" />
            </div>
          )}
        </div>

        {showLeaderboard && (
          <LeaderboardModal game="pong" score={finalScore} unit="peloteos" scoreOrder="high" onClose={() => setShowLeaderboard(false)} />
        )}
      </div>
    </div>
  );
}
