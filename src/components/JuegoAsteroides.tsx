"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_asteroides_best";
const W = 800;
const H = 600;

type Phase = "idle" | "playing" | "result";

type Vec = { x: number; y: number };
type Ship = Vec & { a: number; vx: number; vy: number; inv: number; thrust: boolean };
type Bullet = Vec & { vx: number; vy: number; life: number };
type Roid = Vec & { vx: number; vy: number; r: number; verts: number[]; rot: number; vr: number };

const TWO_PI = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function nuevoAsteroide(x: number, y: number, r: number): Roid {
  const n = 10 + Math.floor(rnd(0, 4));
  const verts: number[] = [];
  for (let i = 0; i < n; i++) verts.push(rnd(0.72, 1.15)); // radios irregulares (look retro)
  const ang = rnd(0, TWO_PI);
  const sp = rnd(0.5, 1.6) * (60 / r); // los pequeños van más rápido
  return {
    x, y, r,
    vx: Math.cos(ang) * sp,
    vy: Math.sin(ang) * sp,
    verts,
    rot: rnd(0, TWO_PI),
    vr: rnd(-0.02, 0.02),
  };
}

export default function JuegoAsteroides() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // estado del juego fuera de React (mutado cada frame)
  const g = useRef({
    ship: null as Ship | null,
    bullets: [] as Bullet[],
    roids: [] as Roid[],
    score: 0,
    lives: 3,
    level: 1,
    fireLock: false,
  });
  const keys = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const wrap = (o: Vec) => {
    if (o.x < 0) o.x += W;
    else if (o.x > W) o.x -= W;
    if (o.y < 0) o.y += H;
    else if (o.y > H) o.y -= H;
  };

  const spawnLevel = useCallback((n: number) => {
    const roids: Roid[] = [];
    for (let i = 0; i < n + 3; i++) {
      // aparecen lejos del centro (donde revive la nave)
      let x = 0, y = 0;
      do {
        x = rnd(0, W);
        y = rnd(0, H);
      } while (Math.hypot(x - W / 2, y - H / 2) < 180);
      roids.push(nuevoAsteroide(x, y, 60));
    }
    g.current.roids = roids;
  }, []);

  const nuevaNave = (): Ship => ({
    x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, inv: 120, thrust: false,
  });

  const disparar = () => {
    const s = g.current.ship;
    if (!s || g.current.bullets.length >= 5) return;
    g.current.bullets.push({
      x: s.x + Math.cos(s.a) * 14,
      y: s.y + Math.sin(s.a) * 14,
      vx: Math.cos(s.a) * 8 + s.vx,
      vy: Math.sin(s.a) * 8 + s.vy,
      life: 55,
    });
  };

  const romper = (idx: number) => {
    const a = g.current.roids[idx];
    // puntos: grande 20, mediano 50, pequeño 100
    g.current.score += a.r > 45 ? 20 : a.r > 25 ? 50 : 100;
    g.current.roids.splice(idx, 1);
    if (a.r > 25) {
      const nr = a.r / 2;
      for (let k = 0; k < 2; k++) {
        const child = nuevoAsteroide(a.x, a.y, nr);
        child.vx += rnd(-0.5, 0.5);
        child.vy += rnd(-0.5, 0.5);
        g.current.roids.push(child);
      }
    }
  };

  const end = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const score = g.current.score;
    setFinalScore(score);
    setBest((b) => {
      if (score > b) {
        localStorage.setItem(STORAGE_KEY, String(score));
        setJustHitBest(true);
        return score;
      }
      return b;
    });
    phaseRef.current = "result";
    setPhase("result");
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = g.current;
    const s = st.ship;

    // --- update nave ---
    if (s) {
      if (keys.current.left) s.a -= 0.09;
      if (keys.current.right) s.a += 0.09;
      s.thrust = !!keys.current.thrust;
      if (s.thrust) {
        s.vx += Math.cos(s.a) * 0.14;
        s.vy += Math.sin(s.a) * 0.14;
      }
      s.vx *= 0.99; // fricción suave
      s.vy *= 0.99;
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > 7) { s.vx = (s.vx / sp) * 7; s.vy = (s.vy / sp) * 7; }
      s.x += s.vx; s.y += s.vy; wrap(s);
      if (s.inv > 0) s.inv--;

      if (keys.current.fire && !st.fireLock) { disparar(); st.fireLock = true; }
      if (!keys.current.fire) st.fireLock = false;
    }

    // --- update balas ---
    for (let i = st.bullets.length - 1; i >= 0; i--) {
      const b = st.bullets[i];
      b.x += b.vx; b.y += b.vy; wrap(b);
      if (--b.life <= 0) st.bullets.splice(i, 1);
    }

    // --- update asteroides ---
    for (const a of st.roids) {
      a.x += a.vx; a.y += a.vy; a.rot += a.vr; wrap(a);
    }

    // --- colisiones bala/asteroide ---
    for (let i = st.roids.length - 1; i >= 0; i--) {
      const a = st.roids[i];
      for (let j = st.bullets.length - 1; j >= 0; j--) {
        const b = st.bullets[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < a.r) {
          st.bullets.splice(j, 1);
          romper(i);
          break;
        }
      }
    }

    // --- colisión nave/asteroide ---
    if (s && s.inv <= 0) {
      for (let i = 0; i < st.roids.length; i++) {
        const a = st.roids[i];
        if (Math.hypot(a.x - s.x, a.y - s.y) < a.r + 10) {
          st.lives--;
          if (st.lives <= 0) { st.ship = null; end(); return; }
          st.ship = nuevaNave();
          break;
        }
      }
    }

    // --- nivel superado ---
    if (st.roids.length === 0) {
      st.level++;
      spawnLevel(st.level + 2);
    }

    // --- dibujo ---
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, W, H);

    // asteroides
    ctx.strokeStyle = "#9df7c4";
    ctx.lineWidth = 2;
    for (const a of st.roids) {
      ctx.beginPath();
      for (let k = 0; k < a.verts.length; k++) {
        const ang = a.rot + (k / a.verts.length) * TWO_PI;
        const rr = a.r * a.verts[k];
        const px = a.x + Math.cos(ang) * rr;
        const py = a.y + Math.sin(ang) * rr;
        k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // balas
    ctx.fillStyle = "#fef08a";
    for (const b of st.bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, TWO_PI);
      ctx.fill();
    }

    // nave
    if (s && (s.inv <= 0 || Math.floor(s.inv / 6) % 2 === 0)) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-11, -9);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-11, 9);
      ctx.closePath();
      ctx.stroke();
      if (s.thrust && Math.floor(performance.now() / 60) % 2 === 0) {
        ctx.strokeStyle = "#fb923c";
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(-16, 0);
        ctx.lineTo(-6, 4);
        ctx.stroke();
      }
      ctx.restore();
    }

    // HUD
    ctx.fillStyle = "#e6faf0";
    ctx.font = "bold 22px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(String(st.score).padStart(6, "0"), 16, 32);
    ctx.textAlign = "right";
    ctx.fillText("NIVEL " + st.level, W - 16, 32);
    // vidas (naves)
    for (let i = 0; i < st.lives; i++) {
      ctx.save();
      ctx.translate(24 + i * 22, 56);
      ctx.rotate(-Math.PI / 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(9, 0); ctx.lineTo(-7, -6); ctx.lineTo(-7, 6);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(loop);
  }, [end, spawnLevel]);

  const start = () => {
    const st = g.current;
    st.ship = nuevaNave();
    st.bullets = [];
    st.score = 0;
    st.lives = 3;
    st.level = 1;
    st.fireLock = false;
    spawnLevel(3);
    setJustHitBest(false);
    phaseRef.current = "playing";
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  // teclado
  useEffect(() => {
    const map: Record<string, string> = {
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
      ArrowUp: "thrust", w: "thrust", W: "thrust",
      " ": "fire",
    };
    const down = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (k) { keys.current[k] = true; if (e.key === " " || e.key.startsWith("Arrow")) e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (k) keys.current[k] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // botón táctil: mantener pulsado activa la tecla
  const hold = (k: string) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); keys.current[k] = true; },
    onPointerUp: (e: React.PointerEvent) => { e.preventDefault(); keys.current[k] = false; },
    onPointerLeave: () => { keys.current[k] = false; },
    onPointerCancel: () => { keys.current[k] = false; },
  });

  const btn =
    "select-none touch-none flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 active:bg-white/30 text-2xl font-black w-16 h-16";

  const level = (n: number) => {
    if (n >= 5000) return { label: "LEYENDA DEL ARCADE", emoji: "👾" };
    if (n >= 2500) return { label: "AS DEL ESPACIO", emoji: "🚀" };
    if (n >= 1200) return { label: "PILOTO EXPERTO", emoji: "🛸" };
    if (n >= 500) return { label: "NADA MAL", emoji: "⭐" };
    return { label: "RECLUTA", emoji: "🌑" };
  };

  const shareText =
    phase === "result"
      ? `Hice ${finalScore} puntos en Asteroides ${level(finalScore).emoji} — ¿superas mi récord?`
      : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest font-mono">ASTEROIDES</h1>
          <p className="opacity-70 mt-1 text-sm">
            Arcade clásico · récord: <strong>{best}</strong>
          </p>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/15 bg-[#05060a]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-auto block"
            style={{ aspectRatio: `${W}/${H}`, imageRendering: "pixelated" }}
          />

          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-6">
              <div className="text-6xl mb-3">🚀</div>
              <p className="max-w-sm opacity-90 mb-2">
                Destruye los asteroides sin chocar. Los grandes se parten en pequeños.
                3 vidas, niveles infinitos.
              </p>
              <p className="text-xs opacity-60 mb-6 font-mono">
                PC: ← → girar · ↑ propulsar · ESPACIO disparar · Móvil: botones abajo
              </p>
              <button
                onClick={start}
                className="bg-white text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform"
              >
                ▶ INSERTAR MONEDA
              </button>
            </div>
          )}

          {phase === "result" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center px-6">
              <div className="text-6xl mb-2">{level(finalScore).emoji}</div>
              <div className="text-xs uppercase tracking-widest opacity-70">Game Over</div>
              <div className="text-6xl md:text-7xl font-black font-mono my-1">{finalScore}</div>
              <div className="text-lg font-bold mb-1">{level(finalScore).label}</div>
              {justHitBest && (
                <div className="bg-yellow-400 text-black font-bold px-4 py-1.5 rounded-full inline-block my-2">
                  🏆 ¡Nuevo récord!
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 my-4 justify-center">
                <button
                  onClick={start}
                  className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🔄 Otra partida
                </button>
                {finalScore > 0 && (
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                  >
                    🏆 Ranking global
                  </button>
                )}
              </div>
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/asteroides" />
            </div>
          )}
        </div>

        {/* controles táctiles (móvil) */}
        {phase === "playing" && (
          <div className="flex justify-between items-center mt-4 md:hidden">
            <div className="flex gap-2">
              <button aria-label="Girar izquierda" className={btn} {...hold("left")}>⟲</button>
              <button aria-label="Girar derecha" className={btn} {...hold("right")}>⟳</button>
            </div>
            <div className="flex gap-2">
              <button aria-label="Propulsar" className={btn} {...hold("thrust")}>🔥</button>
              <button aria-label="Disparar" className={`${btn} bg-white/20`} {...hold("fire")}>●</button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <LeaderboardModal
            game="asteroides"
            score={finalScore}
            unit="puntos"
            scoreOrder="high"
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
  );
}
