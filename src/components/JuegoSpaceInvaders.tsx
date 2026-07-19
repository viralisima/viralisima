"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_invaders_best";
const W = 800;
const H = 600;
const COLS = 11;
const ROWS = 5;
const A_DX = 46; // separación horizontal
const A_DY = 40; // separación vertical
const A_SIZE = 30;
const PLAYER_Y = H - 46;

type Phase = "idle" | "playing" | "result";
type Alien = { x: number; y: number; alive: boolean; row: number; col: number };
type Bunker = { bx: number; by: number; cells: boolean[][] };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const EMOJI = ["🛸", "👾", "👾", "👽", "👽"]; // por fila (arriba vale más)
const PTS = [30, 20, 20, 10, 10];
const BK_COLS = 8, BK_ROWS = 5, BK_CELL = 8;

export default function JuegoSpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const g = useRef({
    px: W / 2,
    pInv: 0,
    pBullet: null as { x: number; y: number } | null,
    aliens: [] as Alien[],
    bombs: [] as { x: number; y: number }[],
    bunkers: [] as Bunker[],
    ufo: null as { x: number; dir: number } | null,
    dir: 1,
    stepAcc: 0,
    stepInterval: 700,
    anim: false,
    bombAcc: 0,
    ufoAcc: 0,
    score: 0,
    lives: 3,
    wave: 1,
    fireLock: false,
    last: 0,
  });
  const keys = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const nuevaOleada = useCallback((wave: number) => {
    const st = g.current;
    const aliens: Alien[] = [];
    const startX = 100;
    const startY = 70 + Math.min(wave - 1, 4) * 16; // cada oleada empieza más abajo
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        aliens.push({ x: startX + c * A_DX, y: startY + r * A_DY, alive: true, row: r, col: c });
    st.aliens = aliens;
    st.dir = 1;
    st.bombs = [];
    st.pBullet = null;
    st.stepInterval = Math.max(180, 620 - (wave - 1) * 60);
    st.stepAcc = 0;
  }, []);

  const nuevosBunkers = () => {
    const bunkers: Bunker[] = [];
    const total = 4;
    const gap = W / total;
    for (let i = 0; i < total; i++) {
      const cells: boolean[][] = [];
      for (let r = 0; r < BK_ROWS; r++) {
        cells.push([]);
        for (let c = 0; c < BK_COLS; c++) {
          // hueco en la base central (forma de arco)
          const hueco = r >= BK_ROWS - 2 && c >= 3 && c <= 4;
          cells[r].push(!hueco);
        }
      }
      bunkers.push({ bx: gap * i + gap / 2 - (BK_COLS * BK_CELL) / 2, by: H - 130, cells });
    }
    return bunkers;
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

  // impacto de un proyectil contra un búnker; devuelve true si choca
  const golpeaBunker = (x: number, y: number) => {
    for (const bk of g.current.bunkers) {
      const c = Math.floor((x - bk.bx) / BK_CELL);
      const r = Math.floor((y - bk.by) / BK_CELL);
      if (r >= 0 && r < BK_ROWS && c >= 0 && c < BK_COLS && bk.cells[r][c]) {
        bk.cells[r][c] = false;
        // daño en cruz para que se desmorone
        if (bk.cells[r][c - 1] !== undefined && Math.random() < 0.5) bk.cells[r][c - 1] = false;
        if (bk.cells[r][c + 1] !== undefined && Math.random() < 0.5) bk.cells[r][c + 1] = false;
        return true;
      }
    }
    return false;
  };

  const loop = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const st = g.current;
    const dt = st.last ? now - st.last : 16;
    st.last = now;

    // ---- jugador ----
    if (keys.current.left) st.px -= 6;
    if (keys.current.right) st.px += 6;
    st.px = Math.max(24, Math.min(W - 24, st.px));
    if (st.pInv > 0) st.pInv--;
    if (keys.current.fire && !st.fireLock && !st.pBullet) {
      st.pBullet = { x: st.px, y: PLAYER_Y - 16 };
      st.fireLock = true;
    }
    if (!keys.current.fire) st.fireLock = false;

    // ---- bala jugador ----
    if (st.pBullet) {
      st.pBullet.y -= 10;
      if (st.pBullet.y < 0) st.pBullet = null;
      else if (golpeaBunker(st.pBullet.x, st.pBullet.y)) st.pBullet = null;
    }

    // ---- movimiento por pasos de la formación ----
    st.stepAcc += dt;
    const vivos = st.aliens.filter((a) => a.alive);
    const interval = Math.max(120, st.stepInterval * (vivos.length / (COLS * ROWS)) + 90);
    if (st.stepAcc >= interval && vivos.length) {
      st.stepAcc = 0;
      st.anim = !st.anim;
      let minX = Infinity, maxX = -Infinity;
      for (const a of vivos) { minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x); }
      const tocaBorde = (st.dir > 0 && maxX + A_SIZE > W - 12) || (st.dir < 0 && minX < 12);
      if (tocaBorde) {
        st.dir *= -1;
        for (const a of st.aliens) a.y += 20;
      } else {
        for (const a of st.aliens) a.x += 14 * st.dir;
      }
      // ¿llegaron abajo? -> fin
      for (const a of vivos) if (a.y + A_SIZE >= PLAYER_Y - 10) { end(); return; }
    }

    // ---- bombas alienígenas ----
    st.bombAcc += dt;
    if (st.bombAcc > rnd(650, 1200) && st.bombs.length < 3 && vivos.length) {
      st.bombAcc = 0;
      // columna al azar con alienígenas vivos -> el más bajo
      const cols = [...new Set(vivos.map((a) => a.col))];
      const col = cols[Math.floor(rnd(0, cols.length))];
      const dispara = vivos.filter((a) => a.col === col).sort((a, b) => b.y - a.y)[0];
      if (dispara) st.bombs.push({ x: dispara.x, y: dispara.y + A_SIZE });
    }
    for (let i = st.bombs.length - 1; i >= 0; i--) {
      const b = st.bombs[i];
      b.y += 4.5;
      if (b.y > H) { st.bombs.splice(i, 1); continue; }
      if (golpeaBunker(b.x, b.y)) { st.bombs.splice(i, 1); continue; }
      if (st.pInv <= 0 && Math.abs(b.x - st.px) < 20 && Math.abs(b.y - PLAYER_Y) < 16) {
        st.bombs.splice(i, 1);
        st.lives--;
        st.pInv = 100;
        if (st.lives <= 0) { end(); return; }
      }
    }

    // ---- OVNI bonus ----
    st.ufoAcc += dt;
    if (!st.ufo && st.ufoAcc > 16000) {
      st.ufoAcc = 0;
      const fromLeft = Math.random() < 0.5;
      st.ufo = { x: fromLeft ? -30 : W + 30, dir: fromLeft ? 1 : -1 };
    }
    if (st.ufo) {
      st.ufo.x += st.ufo.dir * 3;
      if (st.ufo.x < -40 || st.ufo.x > W + 40) st.ufo = null;
    }

    // ---- colisión bala jugador ----
    if (st.pBullet) {
      // OVNI
      if (st.ufo && Math.abs(st.pBullet.x - st.ufo.x) < 20 && st.pBullet.y < 50) {
        st.score += 100; st.ufo = null; st.pBullet = null;
      }
    }
    if (st.pBullet) {
      for (const a of st.aliens) {
        if (a.alive && Math.abs(a.x - st.pBullet.x) < A_SIZE / 2 && Math.abs(a.y - st.pBullet.y) < A_SIZE / 2) {
          a.alive = false;
          st.score += PTS[a.row];
          st.pBullet = null;
          break;
        }
      }
    }

    // ---- oleada superada ----
    if (!st.aliens.some((a) => a.alive)) {
      st.wave++;
      nuevaOleada(st.wave);
    }

    // ================= DIBUJO =================
    ctx.fillStyle = "#04050a";
    ctx.fillRect(0, 0, W, H);

    // búnkeres
    ctx.fillStyle = "#4ade80";
    for (const bk of st.bunkers)
      for (let r = 0; r < BK_ROWS; r++)
        for (let c = 0; c < BK_COLS; c++)
          if (bk.cells[r][c]) ctx.fillRect(bk.bx + c * BK_CELL, bk.by + r * BK_CELL, BK_CELL, BK_CELL);

    // alienígenas (emoji, con bobeo de animación)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${A_SIZE}px serif`;
    const bob = st.anim ? 2 : -2;
    for (const a of st.aliens) if (a.alive) ctx.fillText(EMOJI[a.row], a.x, a.y + bob);

    // OVNI
    if (st.ufo) ctx.fillText("🛸", st.ufo.x, 34);

    // bombas
    ctx.fillStyle = "#f87171";
    for (const b of st.bombs) ctx.fillRect(b.x - 2, b.y - 6, 4, 12);

    // bala jugador
    if (st.pBullet) { ctx.fillStyle = "#fde047"; ctx.fillRect(st.pBullet.x - 2, st.pBullet.y - 8, 4, 14); }

    // cañón del jugador
    if (st.pInv <= 0 || Math.floor(st.pInv / 6) % 2 === 0) {
      ctx.fillStyle = "#7dd3fc";
      ctx.fillRect(st.px - 20, PLAYER_Y + 4, 40, 12);
      ctx.fillRect(st.px - 4, PLAYER_Y - 8, 8, 12);
    }

    // HUD
    ctx.fillStyle = "#e6faf0";
    ctx.font = "bold 22px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(String(st.score).padStart(6, "0"), 16, 26);
    ctx.textAlign = "right";
    ctx.fillText("OLEADA " + st.wave, W - 16, 26);
    ctx.textAlign = "left";
    ctx.fillText("🚀".repeat(Math.max(0, st.lives)), 16, 52);

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(loop);
  }, [end, nuevaOleada]);

  const start = () => {
    const st = g.current;
    st.px = W / 2;
    st.pInv = 0;
    st.pBullet = null;
    st.bombs = [];
    st.ufo = null;
    st.bunkers = nuevosBunkers();
    st.score = 0;
    st.lives = 3;
    st.wave = 1;
    st.fireLock = false;
    st.bombAcc = 0;
    st.ufoAcc = 0;
    st.last = 0;
    nuevaOleada(1);
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
      " ": "fire",
    };
    const down = (e: KeyboardEvent) => {
      const k = map[e.key];
      if (k) { keys.current[k] = true; if (e.key === " " || e.key.startsWith("Arrow")) e.preventDefault(); }
    };
    const up = (e: KeyboardEvent) => { const k = map[e.key]; if (k) keys.current[k] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const hold = (k: string) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); keys.current[k] = true; },
    onPointerUp: (e: React.PointerEvent) => { e.preventDefault(); keys.current[k] = false; },
    onPointerLeave: () => { keys.current[k] = false; },
    onPointerCancel: () => { keys.current[k] = false; },
  });
  const btn =
    "select-none touch-none flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 active:bg-white/30 text-2xl font-black w-16 h-16";

  const level = (n: number) => {
    if (n >= 5000) return { label: "HÉROE DE LA GALAXIA", emoji: "🏆" };
    if (n >= 2500) return { label: "COMANDANTE", emoji: "🛸" };
    if (n >= 1200) return { label: "ARTILLERO PRO", emoji: "👾" };
    if (n >= 500) return { label: "NADA MAL", emoji: "⭐" };
    return { label: "RECLUTA", emoji: "🚀" };
  };

  const shareText =
    phase === "result"
      ? `Hice ${finalScore} puntos en Space Invaders ${level(finalScore).emoji} — ¿defiendes la Tierra mejor que yo?`
      : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest font-mono">SPACE INVADERS</h1>
          <p className="opacity-70 mt-1 text-sm">
            Arcade clásico · récord: <strong>{best}</strong>
          </p>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/15 bg-[#04050a]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-auto block"
            style={{ aspectRatio: `${W}/${H}` }}
          />

          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-6">
              <div className="text-6xl mb-3">👾</div>
              <p className="max-w-sm opacity-90 mb-2">
                Destruye la invasión antes de que llegue abajo. Refúgiate tras los búnkeres.
                ¡Dispara al 🛸 para 100 puntos extra!
              </p>
              <p className="text-xs opacity-60 mb-6 font-mono">
                PC: ← → mover · ESPACIO disparar · Móvil: botones abajo
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
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/space-invaders" />
            </div>
          )}
        </div>

        {phase === "playing" && (
          <div className="flex justify-between items-center mt-4 md:hidden">
            <div className="flex gap-2">
              <button aria-label="Izquierda" className={btn} {...hold("left")}>◀</button>
              <button aria-label="Derecha" className={btn} {...hold("right")}>▶</button>
            </div>
            <button aria-label="Disparar" className={`${btn} bg-white/20 w-20`} {...hold("fire")}>🔫</button>
          </div>
        )}

        {showLeaderboard && (
          <LeaderboardModal
            game="space-invaders"
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
