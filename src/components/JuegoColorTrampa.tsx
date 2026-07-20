"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_colortrampa_best";
const DURATION = 30000; // 30 s
const PENALTY = 1500; // fallo: -1,5 s
const MISMATCH_PROB = 0.78; // % de rondas donde tinta ≠ palabra (la "trampa")

type State = "idle" | "playing" | "result";

type Color = { id: string; name: string; hex: string };

const COLORS: Color[] = [
  { id: "rojo", name: "ROJO", hex: "#ef4444" },
  { id: "azul", name: "AZUL", hex: "#3b82f6" },
  { id: "verde", name: "VERDE", hex: "#22c55e" },
  { id: "amarillo", name: "AMARILLO", hex: "#eab308" },
  { id: "morado", name: "MORADO", hex: "#a855f7" },
];

function rnd(n: number) {
  return Math.floor(Math.random() * n);
}

// Genera una ronda: palabra (color) + tinta (color). La respuesta correcta es la TINTA.
function nuevaRonda() {
  const palabra = COLORS[rnd(COLORS.length)];
  let tinta = COLORS[rnd(COLORS.length)];
  if (Math.random() < MISMATCH_PROB) {
    // forzar que la tinta sea distinta de la palabra (la trampa)
    while (tinta.id === palabra.id) tinta = COLORS[rnd(COLORS.length)];
  }
  return { palabra, tinta };
}

export default function JuegoColorTrampa() {
  const [state, setState] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [ronda, setRonda] = useState(() => nuevaRonda());
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);

  const endRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const end = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState((prev) => {
      if (prev !== "playing") return prev;
      const final = scoreRef.current;
      setBest((b) => {
        if (final > b) {
          localStorage.setItem(STORAGE_KEY, String(final));
          setJustHitBest(true);
          return final;
        }
        return b;
      });
      return "result";
    });
  }, []);

  const tick = useCallback(() => {
    const remaining = Math.max(0, endRef.current - performance.now());
    setTimeLeft(Math.ceil(remaining / 1000));
    if (remaining <= 0) {
      end();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [end]);

  const start = () => {
    setJustHitBest(false);
    setScore(0);
    scoreRef.current = 0;
    setFlash(null);
    setRonda(nuevaRonda());
    setTimeLeft(30);
    setState("playing");
    endRef.current = performance.now() + DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };

  const responder = (colorId: string) => {
    if (state !== "playing") return;
    if (colorId === ronda.tinta.id) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFlash("ok");
    } else {
      endRef.current -= PENALTY; // fallo penaliza tiempo
      setFlash("err");
    }
    setRonda(nuevaRonda());
    window.setTimeout(() => setFlash(null), 160);
  };

  const level = (n: number) => {
    if (n >= 45) return { label: "GENIO DEL COLOR", emoji: "🌈" };
    if (n >= 35) return { label: "CEREBRO DE ACERO", emoji: "🧠" };
    if (n >= 25) return { label: "NADA MAL", emoji: "👍" };
    if (n >= 15) return { label: "TE PILLARON", emoji: "😅" };
    return { label: "CEREBRO CRUZADO", emoji: "🤯" };
  };

  const shareText =
    state === "result"
      ? `Conseguí ${score} aciertos en Color Trampa (test de Stroop) ${level(score).emoji} — ¿tu cerebro aguanta la trampa?`
      : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-800 via-violet-900 to-fuchsia-900 text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-80 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-6">
          <div className="text-5xl mb-2">🌈</div>
          <h1 className="text-3xl md:text-5xl font-black">Color Trampa</h1>
          <p className="opacity-90 mt-2 text-sm">
            Pulsa el <strong>color de la tinta</strong>, no lo que dice la palabra.
          </p>
        </div>

        <div className="flex justify-center gap-6 my-6 text-sm">
          <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            Récord: <strong>{best}</strong>
          </div>
        </div>

        {state === "idle" && (
          <div className="text-center mt-10">
            <p className="text-lg opacity-90 mb-4 max-w-md mx-auto">
              Verás una palabra escrita en un color. Ignora lo que{" "}
              <em>dice</em> y pulsa el botón del <strong>color con el que está pintada</strong>.
              Tienes 30 segundos. Cada fallo resta tiempo.
            </p>
            <div className="mb-8">
              <span className="text-3xl font-black" style={{ color: "#3b82f6" }}>
                ROJO
              </span>
              <span className="block text-xs opacity-70 mt-1">
                (aquí la respuesta correcta es AZUL 😉)
              </span>
            </div>
            <button
              onClick={start}
              className="bg-white text-slate-900 font-bold px-12 py-5 rounded-full text-xl hover:scale-105 transition-transform shadow-xl"
            >
              ▶ Empezar
            </button>
          </div>
        )}

        {state === "playing" && (
          <div className="text-center">
            <div className="flex justify-center gap-6 mb-6 font-mono">
              <div className="text-4xl font-black">{timeLeft}s</div>
              <div className="text-4xl font-black">{score} ✓</div>
            </div>

            <div
              className={`mx-auto mb-8 rounded-3xl bg-slate-900/70 border-4 transition-colors flex items-center justify-center h-40 md:h-48 max-w-lg ${
                flash === "ok"
                  ? "border-green-400"
                  : flash === "err"
                  ? "border-red-500"
                  : "border-white/10"
              }`}
            >
              <span
                className="text-6xl md:text-7xl font-black select-none"
                style={{ color: ronda.tinta.hex }}
              >
                {ronda.palabra.name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 md:gap-3 max-w-lg mx-auto">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => responder(c.id)}
                  aria-label={c.name}
                  className="aspect-square rounded-2xl font-black text-white text-[10px] md:text-xs uppercase shadow-lg active:scale-90 transition-transform flex items-end justify-center pb-2"
                  style={{ backgroundColor: c.hex, touchAction: "manipulation" }}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <p className="text-xs opacity-70 mt-4">
              Pulsa el color de la <strong>tinta</strong> ↑
            </p>
          </div>
        )}

        {state === "result" && (
          <div className="text-center mt-8">
            <div className="text-7xl mb-4">{level(score).emoji}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
              Resultado
            </div>
            <div className="text-8xl md:text-9xl font-black font-mono mb-1">{score}</div>
            <div className="text-xl opacity-90 mb-2">aciertos en 30 segundos</div>
            <div className="text-2xl font-bold mb-6">{level(score).label}</div>
            {justHitBest && (
              <div className="bg-yellow-400 text-slate-900 font-bold px-4 py-2 rounded-full inline-block mb-4">
                🏆 ¡Nuevo récord personal!
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
              <button
                onClick={start}
                className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
              >
                🔄 Otra ronda
              </button>
              {score > 0 && (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🏆 Ranking global
                </button>
              )}
            </div>
            <ShareButtons text={shareText} url="https://viralisima.com/juegos/color-trampa" />

            {showLeaderboard && (
              <LeaderboardModal
                game="color-trampa"
                score={score}
                unit="aciertos"
                scoreOrder="high"
                onClose={() => setShowLeaderboard(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
