"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";
import { holdBtn, tapBtn } from "@/lib/controls";

const STORAGE_KEY = "vl_bloques_best";
const COLS = 10;
const ROWS = 20;
const CELL = 30;
const BOARD_W = COLS * CELL; // 300
const PANEL = 130;
const W = BOARD_W + PANEL; // 430
const H = ROWS * CELL; // 600

type Phase = "idle" | "playing" | "result";
type Matrix = number[][];
type Piece = { m: Matrix; c: string; x: number; y: number };

const SHAPES: Record<string, { c: string; m: Matrix }> = {
  I: { c: "#22d3ee", m: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { c: "#facc15", m: [[1, 1], [1, 1]] },
  T: { c: "#c084fc", m: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { c: "#4ade80", m: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { c: "#f87171", m: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { c: "#60a5fa", m: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { c: "#fb923c", m: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
};
const LINE_PTS = [0, 100, 300, 500, 800];

const rotarM = (m: Matrix): Matrix =>
  m.map((row, i) => row.map((_, j) => m[m.length - 1 - j][i]));

export default function JuegoBloques() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const g = useRef({
    board: [] as (string | 0)[][],
    piece: null as Piece | null,
    next: null as Piece | null,
    bag: [] as string[],
    score: 0,
    lines: 0,
    level: 1,
    gravAcc: 0,
    hAcc: 0,
    prevDir: 0,
    dasCharged: false,
    last: 0,
  });
  const keys = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const nuevoTablero = () =>
    Array.from({ length: ROWS }, () => Array<string | 0>(COLS).fill(0));

  const colisiona = (m: Matrix, x: number, y: number) => {
    const b = g.current.board;
    for (let r = 0; r < m.length; r++)
      for (let c = 0; c < m[r].length; c++)
        if (m[r][c]) {
          const bx = x + c, by = y + r;
          if (bx < 0 || bx >= COLS || by >= ROWS) return true;
          if (by >= 0 && b[by][bx]) return true;
        }
    return false;
  };

  const sacarPieza = (): Piece => {
    const st = g.current;
    if (st.bag.length === 0) st.bag = Object.keys(SHAPES).sort(() => Math.random() - 0.5);
    const k = st.bag.pop() as string;
    const m = SHAPES[k].m.map((row) => [...row]);
    return { m, c: SHAPES[k].c, x: Math.floor((COLS - m[0].length) / 2), y: 0 };
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

  const spawn = useCallback(() => {
    const st = g.current;
    st.piece = st.next ?? sacarPieza();
    st.next = sacarPieza();
    if (colisiona(st.piece.m, st.piece.x, st.piece.y)) end();
  }, [end]);

  const fijarYlimpiar = useCallback(() => {
    const st = g.current;
    const p = st.piece!;
    for (let r = 0; r < p.m.length; r++)
      for (let c = 0; c < p.m[r].length; c++)
        if (p.m[r][c] && p.y + r >= 0) st.board[p.y + r][p.x + c] = p.c;
    // limpiar líneas completas
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (st.board[r].every((v) => v)) {
        st.board.splice(r, 1);
        st.board.unshift(Array<string | 0>(COLS).fill(0));
        cleared++;
        r++; // revisar la misma fila otra vez
      }
    }
    if (cleared) {
      st.lines += cleared;
      st.score += LINE_PTS[cleared] * st.level;
      st.level = Math.floor(st.lines / 10) + 1;
    }
    spawn();
  }, [spawn]);

  const rotar = useCallback(() => {
    const st = g.current;
    const p = st.piece;
    if (!p || phaseRef.current !== "playing") return;
    const nm = rotarM(p.m);
    for (const dx of [0, -1, 1, -2, 2]) {
      if (!colisiona(nm, p.x + dx, p.y)) { p.m = nm; p.x += dx; return; }
    }
  }, []);

  const hardDrop = useCallback(() => {
    const st = g.current;
    const p = st.piece;
    if (!p || phaseRef.current !== "playing") return;
    let d = 0;
    while (!colisiona(p.m, p.x, p.y + 1)) { p.y++; d++; }
    st.score += d * 2;
    fijarYlimpiar();
  }, [fijarYlimpiar]);

  const dibujarCelda = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x + 1, y + 1, CELL - 2, 4);
  };

  const loop = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const st = g.current;
    const p = st.piece;
    const dt = st.last ? now - st.last : 16;
    st.last = now;

    if (p) {
      // ---- movimiento lateral con DAS ----
      const dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir !== 0) {
        if (dir !== st.prevDir) {
          if (!colisiona(p.m, p.x + dir, p.y)) p.x += dir;
          st.hAcc = 0; st.dasCharged = false;
        } else {
          st.hAcc += dt;
          const delay = st.dasCharged ? 55 : 170;
          if (st.hAcc >= delay) {
            if (!colisiona(p.m, p.x + dir, p.y)) p.x += dir;
            st.hAcc = 0; st.dasCharged = true;
          }
        }
      }
      st.prevDir = dir;

      // ---- gravedad (con soft drop) ----
      st.gravAcc += dt;
      let interval = Math.max(80, 800 - (st.level - 1) * 65);
      if (keys.current.down) interval = Math.min(interval, 45);
      if (st.gravAcc >= interval) {
        st.gravAcc = 0;
        if (!colisiona(p.m, p.x, p.y + 1)) {
          p.y++;
          if (keys.current.down) st.score += 1;
        } else {
          fijarYlimpiar();
        }
      }
    }

    // ================= DIBUJO =================
    ctx.fillStyle = "#0a0b12";
    ctx.fillRect(0, 0, W, H);

    // rejilla del tablero
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke(); }
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(BOARD_W, r * CELL); ctx.stroke(); }

    // pila fija
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (st.board[r][c]) dibujarCelda(ctx, c * CELL, r * CELL, st.board[r][c] as string);

    // pieza fantasma (dónde caerá)
    if (p) {
      let gy = p.y;
      while (!colisiona(p.m, p.x, gy + 1)) gy++;
      ctx.globalAlpha = 0.22;
      for (let r = 0; r < p.m.length; r++)
        for (let c = 0; c < p.m[r].length; c++)
          if (p.m[r][c]) dibujarCelda(ctx, (p.x + c) * CELL, (gy + r) * CELL, p.c);
      ctx.globalAlpha = 1;
      // pieza actual
      for (let r = 0; r < p.m.length; r++)
        for (let c = 0; c < p.m[r].length; c++)
          if (p.m[r][c] && p.y + r >= 0) dibujarCelda(ctx, (p.x + c) * CELL, (p.y + r) * CELL, p.c);
    }

    // ---- panel lateral ----
    ctx.fillStyle = "#e6faf0";
    ctx.textAlign = "left";
    ctx.font = "bold 13px ui-monospace, Menlo, monospace";
    const px = BOARD_W + 16;
    ctx.fillText("PUNTOS", px, 30);
    ctx.font = "bold 20px ui-monospace, Menlo, monospace";
    ctx.fillText(String(st.score), px, 52);
    ctx.font = "bold 13px ui-monospace, Menlo, monospace";
    ctx.fillText("LÍNEAS  " + st.lines, px, 84);
    ctx.fillText("NIVEL   " + st.level, px, 104);
    ctx.fillText("SIGUIENTE", px, 140);
    if (st.next) {
      const nm = st.next.m;
      const sz = 18;
      const ox = px, oy = 150;
      for (let r = 0; r < nm.length; r++)
        for (let c = 0; c < nm[r].length; c++)
          if (nm[r][c]) {
            ctx.fillStyle = st.next.c;
            ctx.fillRect(ox + c * sz, oy + r * sz, sz - 2, sz - 2);
          }
    }

    if (phaseRef.current === "playing") rafRef.current = requestAnimationFrame(loop);
  }, [fijarYlimpiar]);

  const start = () => {
    const st = g.current;
    st.board = nuevoTablero();
    st.bag = [];
    st.next = null;
    st.piece = null;
    st.score = 0;
    st.lines = 0;
    st.level = 1;
    st.gravAcc = 0;
    st.hAcc = 0;
    st.prevDir = 0;
    st.dasCharged = false;
    st.last = 0;
    spawn();
    setJustHitBest(false);
    phaseRef.current = "playing";
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  // teclado
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(k)) e.preventDefault();
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = true;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = true;
      else if (k === "ArrowDown" || k === "s" || k === "S") keys.current.down = true;
      else if ((k === "ArrowUp" || k === "w" || k === "W") && !e.repeat) rotar();
      else if (k === " " && !e.repeat) hardDrop();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === "ArrowLeft" || k === "a" || k === "A") keys.current.left = false;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.current.right = false;
      else if (k === "ArrowDown" || k === "s" || k === "S") keys.current.down = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [rotar, hardDrop]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const hold = (k: string) => holdBtn(() => { keys.current[k] = true; }, () => { keys.current[k] = false; });
  const tap = tapBtn;
  const btn =
    "select-none touch-none flex items-center justify-center rounded-2xl bg-white/15 border border-white/25 active:bg-white/35 text-2xl font-black h-16 w-16";

  const level = (n: number) => {
    if (n >= 20000) return { label: "MAESTRO DEL BLOQUE", emoji: "🏆" };
    if (n >= 10000) return { label: "IMPARABLE", emoji: "🔥" };
    if (n >= 4000) return { label: "MUY BUENO", emoji: "💪" };
    if (n >= 1000) return { label: "NADA MAL", emoji: "⭐" };
    return { label: "APRENDIZ", emoji: "🧱" };
  };

  const shareText =
    phase === "result"
      ? `Hice ${finalScore} puntos en Bloques ${level(finalScore).emoji} — ¿superas mi récord?`
      : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-black text-white">
      <div className="max-w-md mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-70 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest font-mono">BLOQUES</h1>
          <p className="opacity-70 mt-1 text-sm">
            Encaja las piezas · récord: <strong>{best}</strong>
          </p>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden border border-white/15 bg-[#0a0b12]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-auto block touch-none"
            style={{ aspectRatio: `${W}/${H}` }}
          />

          {phase === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-center px-6">
              <div className="text-6xl mb-3">🧱</div>
              <p className="max-w-xs opacity-90 mb-2">
                Coloca las piezas que caen y completa líneas para hacerlas desaparecer.
                Cuanto más subes de nivel, más rápido caen.
              </p>
              <p className="text-xs opacity-60 mb-6 font-mono">
                PC: ← → mover · ↑ girar · ↓ bajar · ESPACIO soltar
              </p>
              <button
                onClick={start}
                className="bg-white text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform"
              >
                ▶ JUGAR
              </button>
            </div>
          )}

          {phase === "result" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center px-6">
              <div className="text-6xl mb-2">{level(finalScore).emoji}</div>
              <div className="text-xs uppercase tracking-widest opacity-70">Fin de la partida</div>
              <div className="text-5xl md:text-6xl font-black font-mono my-1">{finalScore}</div>
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
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/bloques" />
            </div>
          )}
        </div>

        {phase === "playing" && (
          <div className="flex justify-between items-center mt-4 md:hidden">
            <div className="flex gap-2">
              <button aria-label="Izquierda" className={btn} {...hold("left")}>◀</button>
              <button aria-label="Derecha" className={btn} {...hold("right")}>▶</button>
              <button aria-label="Bajar" className={btn} {...hold("down")}>▼</button>
            </div>
            <div className="flex gap-2">
              <button aria-label="Girar" className={btn} {...tap(rotar)}>⟳</button>
              <button aria-label="Soltar" className={`${btn} bg-white/20`} {...tap(hardDrop)}>⤓</button>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <LeaderboardModal
            game="bloques"
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
