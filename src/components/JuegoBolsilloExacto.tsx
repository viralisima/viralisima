"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const BEST_KEY = "vl_bolsillo-exacto_best";
const TOTAL_ROUNDS = 10;

/** Ancho de la zona objetivo (en % del carril) por ronda: se estrecha cada ronda */
function zoneWidthForRound(round: number): number {
  // Ronda 0 -> 26%, ronda 9 -> 7%
  const w = 26 - round * 2.1;
  return Math.max(7, w);
}

/** Velocidad de la moneda (% del carril por segundo) por ronda: aumenta cada ronda */
function speedForRound(round: number): number {
  return 42 + round * 9;
}

type Phase = "idle" | "playing" | "result" | "over";

interface RoundResult {
  round: number;
  points: number;
  perfect: boolean;
  hit: boolean;
}

export default function JuegoBolsilloExacto() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [coinPos, setCoinPos] = useState<number>(0); // 0..100 (% del carril)
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);

  // Refs para el bucle de animación (evitan re-crear el rAF en cada frame)
  const posRef = useRef<number>(0);
  const dirRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const roundRef = useRef<number>(0);
  const phaseRef = useRef<Phase>("idle");

  const zoneWidth = zoneWidthForRound(round);
  const zoneStart = 50 - zoneWidth / 2;

  // Cargar mejor récord
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BEST_KEY);
      if (raw !== null) {
        const parsed = parseInt(raw, 10);
        if (!Number.isNaN(parsed) && parsed > 0) setBest(parsed);
      }
    } catch {
      // localStorage no disponible: se juega sin récord persistente
    }
  }, []);

  // Mantener refs sincronizadas
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    lastTimeRef.current = 0;

    const step = (time: number) => {
      if (phaseRef.current !== "playing") {
        rafRef.current = null;
        return;
      }
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const speed = speedForRound(roundRef.current);
      let next = posRef.current + dirRef.current * speed * delta;

      // Rebote en los extremos del carril
      if (next >= 100) {
        next = 100 - (next - 100);
        dirRef.current = -1;
      } else if (next <= 0) {
        next = -next;
        dirRef.current = 1;
      }

      posRef.current = next;
      setCoinPos(next);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

  const startGame = useCallback(() => {
    setScore(0);
    setRound(0);
    setHistory([]);
    setLastResult(null);
    roundRef.current = 0;
    posRef.current = 0;
    dirRef.current = 1;
    setCoinPos(0);
    phaseRef.current = "playing";
    setPhase("playing");
    startLoop();
  }, [startLoop]);

  const finishGame = useCallback(
    (finalScore: number) => {
      stopLoop();
      phaseRef.current = "over";
      setPhase("over");
      const safeScore = Math.max(1, Math.round(finalScore));
      setScore(safeScore);
      setBest((prev) => {
        if (safeScore > prev) {
          try {
            window.localStorage.setItem(BEST_KEY, String(safeScore));
          } catch {
            // sin persistencia
          }
          return safeScore;
        }
        return prev;
      });
    },
    [stopLoop]
  );

  /** Soltar la moneda: calcula puntos según la distancia al centro de la zona */
  const drop = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    stopLoop();

    const currentRound = roundRef.current;
    const width = zoneWidthForRound(currentRound);
    const half = width / 2;
    const distance = Math.abs(posRef.current - 50);
    const hit = distance <= half;

    let points = 0;
    let perfect = false;

    if (hit) {
      const accuracy = 1 - distance / half; // 1 = centro exacto
      const base = 50 + currentRound * 10; // rondas avanzadas valen más
      points = Math.round(base * (0.4 + 0.6 * accuracy));
      perfect = accuracy >= 0.85;
      if (perfect) points *= 2; // bonus x2 por "perfecto"
    }

    const result: RoundResult = { round: currentRound, points, perfect, hit };
    setLastResult(result);
    setHistory((prev) => [...prev, result]);

    const newScore = score + points;
    setScore(newScore);

    if (currentRound + 1 >= TOTAL_ROUNDS) {
      window.setTimeout(() => finishGame(newScore), 700);
      phaseRef.current = "result";
      setPhase("result");
      return;
    }

    phaseRef.current = "result";
    setPhase("result");

    window.setTimeout(() => {
      const nextRound = currentRound + 1;
      roundRef.current = nextRound;
      setRound(nextRound);
      posRef.current = 0;
      dirRef.current = 1;
      setCoinPos(0);
      phaseRef.current = "playing";
      setPhase("playing");
      startLoop();
    }, 700);
  }, [score, startLoop, stopLoop, finishGame]);

  // Barra espaciadora / Enter para soltar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (phaseRef.current === "playing") {
          e.preventDefault();
          drop();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop]);

  const perfects = history.filter((r) => r.perfect).length;
  const shareText = `He conseguido ${score} puntos en Bolsillo Exacto 💰 (${perfects} perfectos de ${TOTAL_ROUNDS}). ¿Puedes superarme?`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-500 to-red-500 px-4 py-6 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <header className="text-center">
          <h1 className="text-3xl font-black drop-shadow-sm sm:text-4xl">
            💰 Bolsillo Exacto
          </h1>
          <p className="mt-1 text-sm font-medium text-white/90">
            Para la moneda justo en el objetivo
          </p>
        </header>

        {/* Marcador */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/25 p-3 text-center backdrop-blur-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/70">
              Ronda
            </p>
            <p className="text-lg font-bold">
              {Math.min(round + 1, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/70">
              Puntos
            </p>
            <p className="text-lg font-bold">{score}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/70">
              Récord
            </p>
            <p className="text-lg font-bold">{best}</p>
          </div>
        </div>

        {/* Zona de juego */}
        <section
          className="rounded-3xl bg-black/30 p-4 shadow-xl backdrop-blur-sm"
          aria-live="polite"
        >
          <div className="relative h-28 w-full overflow-hidden rounded-2xl border-2 border-white/30 bg-gradient-to-b from-amber-900/40 to-black/40">
            {/* Zona objetivo */}
            <div
              className="absolute inset-y-0 border-x-2 border-white/70 bg-emerald-400/30"
              style={{ left: `${zoneStart}%`, width: `${zoneWidth}%` }}
              aria-hidden="true"
            />
            {/* Centro exacto */}
            <div
              className="absolute inset-y-0 w-[2px] bg-white/80"
              style={{ left: "50%" }}
              aria-hidden="true"
            />
            {/* Moneda */}
            <div
              className="absolute top-1/2 text-3xl leading-none will-change-transform"
              style={{
                left: `${coinPos}%`,
                transform: "translate(-50%, -50%)",
              }}
              aria-hidden="true"
            >
              🪙
            </div>

            {/* Bolsillo */}
            <div
              className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl"
              aria-hidden="true"
            >
              👝
            </div>
          </div>

          <p className="mt-3 min-h-[24px] text-center text-sm font-semibold">
            {phase === "idle" && "Pulsa Empezar y suelta la moneda en la zona verde."}
            {phase === "playing" && "¡Suelta ahora!"}
            {phase === "result" && lastResult !== null && (
              <span>
                {lastResult.perfect
                  ? `✨ ¡PERFECTO! +${lastResult.points} puntos`
                  : lastResult.hit
                  ? `✅ +${lastResult.points} puntos`
                  : "❌ Fallaste la zona"}
              </span>
            )}
            {phase === "over" && "Partida terminada"}
          </p>
        </section>

        {/* Controles */}
        {phase === "idle" && (
          <button
            type="button"
            onClick={startGame}
            className="w-full rounded-2xl bg-white py-4 text-lg font-black text-amber-700 shadow-lg transition active:scale-95"
            aria-label="Empezar partida"
          >
            ▶️ Empezar
          </button>
        )}

        {(phase === "playing" || phase === "result") && (
          <button
            type="button"
            onClick={drop}
            disabled={phase !== "playing"}
            className="w-full rounded-2xl bg-white py-8 text-2xl font-black text-amber-700 shadow-lg transition active:scale-95 disabled:opacity-60"
            aria-label="Soltar la moneda"
          >
            🪙 ¡SOLTAR!
          </button>
        )}

        {/* Fin de partida */}
        {phase === "over" && (
          <div className="flex flex-col gap-3 rounded-3xl bg-black/30 p-5 text-center backdrop-blur-sm">
            <p className="text-sm uppercase tracking-wide text-white/80">
              Puntuación final
            </p>
            <p className="text-5xl font-black">{score}</p>
            <p className="text-sm font-medium text-white/90">puntos</p>
            <p className="text-sm text-white/90">
              ✨ {perfects} perfectos de {TOTAL_ROUNDS} rondas
            </p>
            <p className="text-sm font-semibold text-white">
              🏅 Mejor récord: {best} puntos
            </p>

            <button
              type="button"
              onClick={startGame}
              className="w-full rounded-2xl bg-white py-4 text-lg font-black text-amber-700 shadow-lg transition active:scale-95"
              aria-label="Jugar otra vez"
            >
              🔁 Jugar otra vez
            </button>

            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="w-full rounded-2xl border-2 border-white/70 py-3 text-base font-bold text-white transition active:scale-95"
              aria-label="Ver ranking global"
            >
              🏆 Ver ranking
            </button>

            <div className="pt-1">
              <ShareButtons
                url="https://viralisima.com/juegos/bolsillo-exacto"
                text={shareText}
              />
            </div>
          </div>
        )}

        <nav className="pt-2 text-center">
          <Link
            href="/juegos"
            className="text-sm font-semibold text-white/90 underline underline-offset-4"
          >
            ← Ver todos los juegos
          </Link>
        </nav>
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game="bolsillo-exacto"
          score={score}
          unit="puntos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </main>
  );
}
