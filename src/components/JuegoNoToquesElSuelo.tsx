"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------- Constantes del juego ----------
const BEST_KEY = "vl_no-toques-el-suelo_best";
const GAME_URL = "https://www.viralisima.com/juegos/no-toques-el-suelo";
const ALCANCE_X = 34; // distancia horizontal máxima del salto (% del ancho)
const ALCANCE_ARRIBA = 26; // subida máxima del salto (% del alto)
const DURACION_SALTO = 0.4; // segundos
const ALTURA_ARCO = 14; // altura extra de la parábola (%)
const MUEBLES_OBJETIVO = 5;
const LAVA_MAX = 60;

interface TipoMueble {
  nombre: string;
  emoji: string;
  w: number;
  color: string;
  vidaMul: number;
  colgante?: boolean;
}

const TIPOS: TipoMueble[] = [
  { nombre: "sofá", emoji: "🛋️", w: 22, color: "bg-rose-700", vidaMul: 1.25 },
  { nombre: "mesa", emoji: "🍵", w: 18, color: "bg-amber-800", vidaMul: 1.1 },
  { nombre: "silla", emoji: "🪑", w: 11, color: "bg-yellow-700", vidaMul: 0.85 },
  { nombre: "caja", emoji: "📦", w: 13, color: "bg-orange-300", vidaMul: 0.9 },
  { nombre: "cesta", emoji: "🧺", w: 11, color: "bg-lime-700", vidaMul: 0.8 },
  { nombre: "cojín", emoji: "🧸", w: 12, color: "bg-pink-500", vidaMul: 0.75 },
  { nombre: "lámpara", emoji: "💡", w: 9, color: "bg-yellow-200", vidaMul: 0.55, colgante: true },
];
const INDICE_LAMPARA = TIPOS.length - 1;

interface Mueble {
  id: number;
  tipo: number;
  x: number; // centro en % del ancho
  destinoX: number;
  top: number; // altura de la superficie en % desde abajo
  vida: number;
  vidaMax: number;
  hundiendo: boolean;
}

interface Salto {
  x0: number;
  y0: number;
  objetivo: number | null;
  xf: number;
  yf: number;
  inicio: number;
  corto: boolean;
}

interface Estado {
  muebles: Mueble[];
  actual: number | null;
  px: number;
  py: number;
  lava: number;
  t: number;
  salto: Salto | null;
  spawnCd: number;
  nextId: number;
  rng: () => number;
  muerte: string;
  muerto: boolean;
}

type Fase = "inicio" | "jugando" | "fin";

// ---------- Utilidades ----------
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function semillaDiaria(): number {
  const d = new Date();
  const texto = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-lava`;
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function alcanzable(px: number, py: number, x: number, top: number): boolean {
  return Math.abs(x - px) <= ALCANCE_X && top - py <= ALCANCE_ARRIBA;
}

function huecoLibre(g: Estado, x: number, w: number): boolean {
  if (x - w / 2 < 1 || x + w / 2 > 99) return false;
  return g.muebles.every(
    (o) => o.hundiendo || Math.abs(o.destinoX - x) >= (TIPOS[o.tipo].w + w) / 2 + 3
  );
}

function crearEstado(semilla: number): Estado {
  const g: Estado = {
    muebles: [],
    actual: 1,
    px: 50,
    py: 30,
    lava: 6,
    t: 0,
    salto: null,
    spawnCd: 1.2,
    nextId: 4,
    rng: mulberry32(semilla),
    muerte: "",
    muerto: false,
  };
  g.muebles.push(
    { id: 1, tipo: 0, x: 50, destinoX: 50, top: 30, vida: 5, vidaMax: 5, hundiendo: false },
    { id: 2, tipo: 2, x: 20, destinoX: 20, top: 24, vida: 6, vidaMax: 6, hundiendo: false },
    { id: 3, tipo: 3, x: 80, destinoX: 80, top: 36, vida: 6, vidaMax: 6, hundiendo: false }
  );
  return g;
}

// Genera un mueble nuevo que entra desde un lateral
function generarMueble(g: Estado): void {
  const r = g.rng;
  const hayLampara = g.muebles.some((m) => TIPOS[m.tipo].colgante);
  const tipo =
    g.t > 8 && !hayLampara && r() < 0.15 ? INDICE_LAMPARA : Math.floor(r() * (TIPOS.length - 1));
  const k = TIPOS[tipo];
  const minTop = g.lava + 7;

  const alcanzables = g.muebles.filter(
    (m) => m.id !== g.actual && !m.hundiendo && alcanzable(g.px, g.py, m.destinoX, m.top)
  ).length;

  let x: number | null = null;
  let top = 0;

  // Si no queda ningún mueble a tu alcance, se coloca uno cerca para que siempre haya salida
  if (alcanzables === 0) {
    for (let i = 0; i < 12 && x === null; i++) {
      const dir = r() < 0.5 ? -1 : 1;
      const cand = g.px + dir * (10 + r() * (ALCANCE_X - 14));
      if (huecoLibre(g, cand, k.w)) x = cand;
    }
    if (x !== null) top = clamp(g.py - 10 + r() * 20, minTop, k.colgante ? 90 : 84);
  }
  if (x === null) {
    for (let i = 0; i < 14 && x === null; i++) {
      const cand = k.w / 2 + 2 + r() * (96 - k.w);
      if (huecoLibre(g, cand, k.w)) x = cand;
    }
    if (x === null) return;
    top = k.colgante
      ? clamp(minTop + 14 + r() * 14, minTop, 90)
      : clamp(minTop + r() * 24, minTop, 84);
  }

  const vida = (3.2 + r() * 2.8) * k.vidaMul * Math.max(0.55, 1 - g.t / 150);
  const inicioX = k.colgante ? x : x < 50 ? -k.w : 100 + k.w;
  g.muebles.push({
    id: g.nextId++,
    tipo,
    x: inicioX,
    destinoX: x,
    top,
    vida,
    vidaMax: vida,
    hundiendo: false,
  });
}

function morir(g: Estado, motivo: string): void {
  if (g.muerto) return;
  g.muerto = true;
  g.muerte = motivo;
  g.actual = null;
  g.salto = null;
  g.py = Math.max(0, g.lava - 2);
}

// Avanza la simulación dt segundos
function paso(g: Estado, dt: number): void {
  if (g.muerto) return;
  g.t += dt;

  const velLava = Math.min(1.3, 0.4 + g.t * 0.015);
  g.lava = Math.min(LAVA_MAX, g.lava + velLava * dt);
  const desgaste = 1 + g.t / 50;

  for (const m of g.muebles) {
    m.x += (m.destinoX - m.x) * Math.min(1, dt * 4);
    if (!m.hundiendo) {
      m.vida -= dt * (m.id === g.actual ? desgaste : 0.3);
      if (m.vida <= 0) {
        m.vida = 0;
        m.hundiendo = true;
      }
    } else {
      m.top -= dt * (TIPOS[m.tipo].colgante ? 40 : 10);
    }
  }

  g.muebles = g.muebles.filter((m) => m.top > g.lava - 4 || m.id === g.actual);

  if (g.actual !== null) {
    const m = g.muebles.find((o) => o.id === g.actual);
    if (!m || m.top <= g.lava + 0.3) {
      morir(g, "Tu mueble se hundió en la lava");
      return;
    }
    g.px = m.x;
    g.py = m.top;
  }

  if (g.salto) {
    const s = g.salto;
    const p = Math.min(1, (g.t - s.inicio) / DURACION_SALTO);
    let destino: Mueble | undefined;
    if (s.objetivo !== null) {
      destino = g.muebles.find((o) => o.id === s.objetivo);
      if (destino) {
        s.xf = destino.x;
        s.yf = destino.top;
      }
    } else {
      s.yf = g.lava;
    }
    g.px = s.x0 + (s.xf - s.x0) * p;
    g.py = s.y0 + (s.yf - s.y0) * p + 4 * ALTURA_ARCO * p * (1 - p);
    if (p >= 1) {
      if (destino && destino.top > g.lava + 0.3) {
        g.actual = destino.id;
        g.salto = null;
        g.px = destino.x;
        g.py = destino.top;
      } else {
        morir(
          g,
          s.corto ? "Te quedaste corto y caíste a la lava" : "El mueble se hundió antes de que llegaras"
        );
        return;
      }
    }
  }

  g.spawnCd -= dt;
  const vivos = g.muebles.filter((m) => !m.hundiendo).length;
  if (vivos < MUEBLES_OBJETIVO && g.spawnCd <= 0) {
    generarMueble(g);
    g.spawnCd = 0.6 + g.rng() * 0.8;
  }
}

// ---------- Componente ----------
export default function JuegoNoToquesElSuelo() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [, setTick] = useState(0);
  const [score, setScore] = useState(0);
  const [segundosExactos, setSegundosExactos] = useState(0);
  const [best, setBest] = useState(0);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [retoDiario, setRetoDiario] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const gRef = useRef<Estado>(crearEstado(1));

  useEffect(() => {
    try {
      const guardado = Number(localStorage.getItem(BEST_KEY));
      if (Number.isFinite(guardado) && guardado > 0) setBest(Math.floor(guardado));
    } catch {
      // localStorage no disponible
    }
  }, []);

  const terminar = useCallback(() => {
    const g = gRef.current;
    const final = Math.max(1, Math.floor(g.t));
    setScore(final);
    setSegundosExactos(g.t);
    setMotivo(g.muerte);
    let anterior = 0;
    try {
      anterior = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      anterior = 0;
    }
    if (final > anterior) {
      setNuevoRecord(anterior > 0);
      setBest(final);
      try {
        localStorage.setItem(BEST_KEY, String(final));
      } catch {
        // sin persistencia
      }
    } else {
      setNuevoRecord(false);
      setBest(anterior);
    }
    setFase("fin");
  }, []);

  useEffect(() => {
    if (fase !== "jugando") return;
    let raf = 0;
    let ultimo = performance.now();
    const frame = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;
      paso(gRef.current, dt);
      setTick((n) => (n + 1) % 1000000);
      if (gRef.current.muerto) {
        terminar();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [fase, terminar]);

  const empezar = useCallback(() => {
    const semilla = retoDiario ? semillaDiaria() : Math.floor(Math.random() * 2 ** 32);
    gRef.current = crearEstado(semilla);
    setShowLeaderboard(false);
    setNuevoRecord(false);
    setScore(0);
    setFase("jugando");
  }, [retoDiario]);

  const saltarA = useCallback(
    (id: number) => {
      const g = gRef.current;
      if (fase !== "jugando" || g.muerto || g.salto || id === g.actual) return;
      const m = g.muebles.find((o) => o.id === id);
      if (!m) return;
      const dx = m.x - g.px;
      if (alcanzable(g.px, g.py, m.x, m.top)) {
        g.salto = { x0: g.px, y0: g.py, objetivo: id, xf: m.x, yf: m.top, inicio: g.t, corto: false };
      } else {
        // Salto fallido: avanza un trozo y cae a la lava
        const dir = dx === 0 ? 1 : Math.sign(dx);
        const avance = Math.abs(dx) > ALCANCE_X ? ALCANCE_X * 0.8 : Math.abs(dx) * 0.7;
        g.salto = {
          x0: g.px,
          y0: g.py,
          objetivo: null,
          xf: clamp(g.px + dir * avance, 2, 98),
          yf: g.lava,
          inicio: g.t,
          corto: true,
        };
      }
      g.actual = null;
    },
    [fase]
  );

  const g = gRef.current;
  const shareText = `🌋 El suelo es lava: aguanté ${score} segundos saltando de mueble en mueble. ¿Y tú cuánto duras?`;
  const iconoJugador = g.muerto ? "🫠" : g.salto ? "🤸" : "🧍";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 px-3 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        <header className="flex items-center justify-between text-white">
          <Link
            href="/juegos"
            className="rounded-full bg-black/25 px-3 py-1 text-sm font-semibold hover:bg-black/40"
            aria-label="Volver a la lista de juegos"
          >
            ← Juegos
          </Link>
          <div className="text-right text-sm font-semibold">
            Récord: <span className="tabular-nums">{best}</span> s
          </div>
        </header>

        <div className="text-center text-white drop-shadow">
          <h1 className="text-3xl font-black sm:text-4xl">🌋 El suelo es lava</h1>
          <p className="text-sm opacity-90 sm:text-base">
            Salta de mueble en mueble antes de que la lava te alcance
          </p>
        </div>

        {/* Escenario */}
        <div
          className="relative w-full select-none overflow-hidden rounded-2xl border-4 border-black/30 bg-gradient-to-b from-amber-100 to-orange-200 shadow-2xl"
          style={{ aspectRatio: "3 / 4", touchAction: "manipulation" }}
          role="application"
          aria-label="Salón con lava. Toca un mueble para saltar a él"
        >
          {/* Decoración del salón */}
          <div className="pointer-events-none absolute left-[8%] top-[10%] h-[18%] w-[24%] rounded border-4 border-amber-900 bg-sky-300">
            <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-amber-900" />
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-amber-900" />
          </div>
          <div className="pointer-events-none absolute right-[10%] top-[12%] flex h-[12%] w-[18%] items-center justify-center rounded border-4 border-yellow-700 bg-emerald-200 text-2xl">
            🖼️
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[3%] bg-amber-900/60" />

          {/* Muebles */}
          {g.muebles.map((m) => {
            const k = TIPOS[m.tipo];
            const enAlcance =
              fase === "jugando" &&
              m.id !== g.actual &&
              !g.salto &&
              alcanzable(g.px, g.py, m.x, m.top);
            const esActual = m.id === g.actual;
            const pctVida = m.vidaMax > 0 ? m.vida / m.vidaMax : 0;
            const colorVida =
              pctVida > 0.5 ? "bg-green-500" : pctVida > 0.25 ? "bg-yellow-400" : "bg-red-600";
            const altoColgante = 6;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => saltarA(m.id)}
                disabled={fase !== "jugando"}
                aria-label={`Saltar a ${k.nombre}${enAlcance ? "" : esActual ? " (estás encima)" : " (fuera de alcance)"}`}
                className={`absolute z-10 flex flex-col items-center rounded-t-lg border-t-4 border-black/30 ${k.color} transition-[box-shadow,opacity] duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-white ${
                  enAlcance ? "ring-4 ring-yellow-300" : ""
                } ${m.hundiendo ? "opacity-80" : ""} ${
                  fase === "jugando" && !enAlcance && !esActual ? "brightness-90" : ""
                }`}
                style={{
                  left: `${m.x - k.w / 2}%`,
                  width: `${k.w}%`,
                  bottom: k.colgante ? `${m.top - altoColgante}%` : 0,
                  height: k.colgante ? `${altoColgante}%` : `${Math.max(0, m.top)}%`,
                }}
              >
                {k.colgante && (
                  <span
                    className="pointer-events-none absolute bottom-full left-1/2 w-0.5 -translate-x-1/2 bg-neutral-700"
                    style={{ height: `${((100 - m.top) / altoColgante) * 100}%` }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="pointer-events-none absolute -top-3 left-[10%] h-1.5 w-[80%] overflow-hidden rounded-full bg-black/30"
                  aria-hidden="true"
                >
                  <span
                    className={`block h-full ${colorVida}`}
                    style={{ width: `${Math.max(0, pctVida) * 100}%` }}
                  />
                </span>
                <span className="pointer-events-none mt-0.5 text-2xl sm:text-3xl" aria-hidden="true">
                  {m.hundiendo ? "🫧" : k.emoji}
                </span>
              </button>
            );
          })}

          {/* Jugador */}
          <div
            className="pointer-events-none absolute z-30 text-3xl sm:text-4xl"
            style={{
              left: `${g.px}%`,
              bottom: `${g.py}%`,
              transform: "translateX(-50%)",
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            {iconoJugador}
          </div>

          {/* Lava */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-red-700 via-orange-600 to-yellow-400 opacity-95"
            style={{ height: `${g.lava}%` }}
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 top-0 h-2 animate-pulse bg-yellow-200/80" />
          </div>

          {/* Marcador en juego */}
          {fase === "jugando" && (
            <div
              className="absolute left-1/2 top-[4%] z-40 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 text-xl font-black text-white tabular-nums"
              aria-live="off"
            >
              ⏱️ {g.t.toFixed(1)} s
            </div>
          )}

          {/* Pantalla de inicio */}
          {fase === "inicio" && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/55 p-5 text-center text-white">
              <div className="text-6xl" aria-hidden="true">
                🌋
              </div>
              <ul className="space-y-1 text-sm sm:text-base">
                <li>👆 Toca el mueble al que quieres saltar.</li>
                <li>✨ Los que brillan en amarillo están a tu alcance.</li>
                <li>⏳ Cada mueble aguanta unos segundos y se hunde.</li>
                <li>🔥 La lava sube sin parar. ¡No te quedes quieto!</li>
              </ul>
              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={retoDiario}
                  onChange={(e) => setRetoDiario(e.target.checked)}
                  className="h-4 w-4 accent-orange-500"
                />
                Reto del día (mismo salón para todos)
              </label>
              <button
                type="button"
                onClick={empezar}
                className="rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 px-8 py-3 text-lg font-black shadow-lg transition hover:scale-105 active:scale-95"
              >
                ▶️ Empezar
              </button>
            </div>
          )}
        </div>

        {/* Resultado */}
        {fase === "fin" && (
          <section
            className="rounded-2xl bg-white/95 p-5 text-center shadow-xl"
            aria-live="polite"
            aria-label="Resultado de la partida"
          >
            <p className="text-sm font-semibold text-red-600">🔥 {motivo}</p>
            <p className="mt-2 text-5xl font-black text-neutral-900 tabular-nums">
              {score} <span className="text-2xl font-bold">segundos</span>
            </p>
            <p className="text-xs text-neutral-500 tabular-nums">
              Tiempo exacto: {segundosExactos.toFixed(1).replace(".", ",")} s
            </p>
            {nuevoRecord && (
              <p className="mt-2 font-bold text-orange-600">🎉 ¡Nuevo récord personal!</p>
            )}
            <p className="mt-1 text-neutral-700">
              Mejor récord: <span className="font-bold tabular-nums">{best}</span> segundos
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={empezar}
                className="rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 px-6 py-3 font-black text-white shadow transition hover:scale-105 active:scale-95"
              >
                🔁 Jugar otra vez
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="rounded-full bg-neutral-900 px-6 py-3 font-bold text-white shadow transition hover:scale-105 active:scale-95"
                aria-label="Ver ranking de El suelo es lava"
              >
                🏆 Ver ranking
              </button>
            </div>

            <div className="mt-4">
              <ShareButtons url={GAME_URL} text={shareText} />
            </div>
          </section>
        )}

        {showLeaderboard && (
          <LeaderboardModal
            game="no-toques-el-suelo"
            score={score}
            unit="segundos"
            scoreOrder="high"
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
  );
}
