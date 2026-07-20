"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// Emojis disponibles para el grid 3x3 (se barajan por partida)
const EMOJI_POOL = ["🎵", "🌟", "🔥", "💜", "🍊", "🎸", "⚡", "🌈", "🎯", "🚀", "🍭", "🎨"];

// Estados posibles del juego
type GameState = "idle" | "showing" | "input" | "gameover";

// Baraja un array (Fisher-Yates). No usa Math.random en render, solo en callbacks.
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const BEST_KEY = "vl_ritmo-emoji_best";

export default function JuegoRitmoEmoji() {
  // 9 emojis para el grid 3x3, fijos durante toda la partida
  const [gridEmojis, setGridEmojis] = useState<string[]>(() => shuffle(EMOJI_POOL).slice(0, 9));
  // Secuencia de índices (0-8) que el jugador debe replicar
  const [sequence, setSequence] = useState<number[]>([]);
  // Progreso del jugador dentro de la secuencia actual
  const [inputIndex, setInputIndex] = useState(0);
  // Estado del juego
  const [state, setState] = useState<GameState>("idle");
  // Índice de la celda que está parpadeando ahora (o null)
  const [activeCell, setActiveCell] = useState<number | null>(null);
  // Celda pulsada por el usuario (feedback visual)
  const [pressedCell, setPressedCell] = useState<number | null>(null);
  // Nivel actual = longitud de la secuencia. Score final = nivel alcanzado.
  const [score, setScore] = useState(0);
  // Mejor récord persistido
  const [best, setBest] = useState(0);
  // Tiempo restante (barra) durante la fase de input
  const [timeLeft, setTimeLeft] = useState(100);
  // Modal de ranking
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Refs para timeouts/intervalos, para poder limpiarlos
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carga el mejor récord al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BEST_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (!isNaN(n)) setBest(n);
      }
    } catch {
      // localStorage puede fallar en modo privado; se ignora
    }
  }, []);

  // Limpia todos los timeouts pendientes de la fase de display
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  // Detiene el temporizador de la barra de input
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      clearTimeouts();
      clearTimer();
    };
  }, [clearTimeouts, clearTimer]);

  // Reproduce visualmente la secuencia completa, luego pasa a fase de input
  const playSequence = useCallback(
    (seq: number[]) => {
      setState("showing");
      setActiveCell(null);
      clearTimeouts();

      const flashOn = 500; // ms encendida cada celda
      const flashOff = 250; // ms apagada entre celdas
      const step = flashOn + flashOff;

      seq.forEach((cell, i) => {
        const onT = setTimeout(() => setActiveCell(cell), i * step + 400);
        const offT = setTimeout(() => setActiveCell(null), i * step + 400 + flashOn);
        timeoutsRef.current.push(onT, offT);
      });

      // Al terminar la secuencia, habilita el input
      const endT = setTimeout(() => {
        setState("input");
        setInputIndex(0);
      }, seq.length * step + 400);
      timeoutsRef.current.push(endT);
    },
    [clearTimeouts]
  );

  // Añade un emoji nuevo a la secuencia y la reproduce
  const nextRound = useCallback(
    (prev: number[]) => {
      const next = [...prev, Math.floor(Math.random() * 9)];
      setSequence(next);
      setScore(next.length);
      playSequence(next);
    },
    [playSequence]
  );

  // Inicia una partida nueva
  const startGame = useCallback(() => {
    clearTimeouts();
    clearTimer();
    setGridEmojis(shuffle(EMOJI_POOL).slice(0, 9));
    setInputIndex(0);
    setActiveCell(null);
    setPressedCell(null);
    setState("showing");
    // Primera ronda: secuencia de 3 emojis
    const first = [
      Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 9),
    ];
    setSequence(first);
    setScore(first.length);
    playSequence(first);
  }, [clearTimeouts, clearTimer, playSequence]);

  // Termina la partida y persiste el récord si procede
  const endGame = useCallback(
    (finalScore: number) => {
      clearTimeouts();
      clearTimer();
      setState("gameover");
      setActiveCell(null);
      setBest((prevBest) => {
        if (finalScore > prevBest) {
          try {
            localStorage.setItem(BEST_KEY, String(finalScore));
          } catch {
            // se ignora si localStorage no está disponible
          }
          return finalScore;
        }
        return prevBest;
      });
    },
    [clearTimeouts, clearTimer]
  );

  // Temporizador de la fase de input: barra que decrece; si llega a 0 = game over
  useEffect(() => {
    if (state !== "input") {
      clearTimer();
      return;
    }
    // Reinicia la barra cada vez que empieza (o avanza) la fase de input
    setTimeLeft(100);
    const tickMs = 50;
    // Tiempo total proporcional a la longitud: más emojis, algo más de margen
    const totalMs = 2500 + sequence.length * 700;
    const decrement = (tickMs / totalMs) * 100;

    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const nt = t - decrement;
        if (nt <= 0) {
          clearTimer();
          // Se agotó el tiempo: game over con el nivel actual
          endGame(sequence.length);
          return 0;
        }
        return nt;
      });
    }, tickMs);

    return () => clearTimer();
    // Reinicia el timer cuando cambia inputIndex (cada acierto da aire nuevo)
  }, [state, inputIndex, sequence.length, clearTimer, endGame]);

  // Maneja la pulsación de una celda del grid
  const handleCellPress = useCallback(
    (cell: number) => {
      if (state !== "input") return;

      // Feedback visual breve
      setPressedCell(cell);
      const pt = setTimeout(() => setPressedCell(null), 180);
      timeoutsRef.current.push(pt);

      if (cell === sequence[inputIndex]) {
        // Acierto
        const newIndex = inputIndex + 1;
        if (newIndex === sequence.length) {
          // Secuencia completada: siguiente ronda con un emoji más
          clearTimer();
          setState("showing");
          const advT = setTimeout(() => {
            nextRound(sequence);
          }, 600);
          timeoutsRef.current.push(advT);
        } else {
          // Avanza dentro de la secuencia (esto reinicia la barra vía useEffect)
          setInputIndex(newIndex);
        }
      } else {
        // Fallo: game over con el nivel alcanzado
        endGame(sequence.length);
      }
    },
    [state, sequence, inputIndex, clearTimer, nextRound, endGame]
  );

  // Texto del estado superior según la fase
  const statusText =
    state === "showing"
      ? "👀 Memoriza la secuencia..."
      : state === "input"
      ? `Tu turno: ${inputIndex}/${sequence.length}`
      : state === "idle"
      ? "Pulsa para empezar"
      : "";

  const shareText = `He llegado al nivel ${score} en Ritmo Emoji 🎵 ¿Hasta qué nivel llegas tú?`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-500 text-white flex flex-col items-center px-4 py-6">
      {/* Cabecera */}
      <header className="w-full max-w-md flex items-center justify-between mb-4">
        <Link
          href="/juegos"
          className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          aria-label="Volver a la lista de juegos"
        >
          ← Juegos
        </Link>
        <div className="text-right">
          <p className="text-xs text-white/70 uppercase tracking-wide">Mejor récord</p>
          <p className="text-lg font-bold" aria-live="polite">
            {best > 0 ? `Nivel ${best}` : "—"}
          </p>
        </div>
      </header>

      {/* Título */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-extrabold flex items-center justify-center gap-2">
          <span aria-hidden="true">🎵</span> Ritmo Emoji
        </h1>
        <p className="text-white/80 text-sm mt-1">Sigue el patrón de emojis al ritmo</p>
      </div>

      {/* Panel de estado / nivel */}
      <div className="w-full max-w-md bg-white/15 backdrop-blur rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" aria-live="polite">
            {statusText}
          </span>
          <span className="text-sm font-bold bg-white/20 rounded-full px-3 py-1">
            Nivel {score}
          </span>
        </div>

        {/* Barra de tiempo (solo visible en fase de input) */}
        <div
          className="h-2 w-full bg-white/20 rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Tiempo restante"
          aria-valuenow={Math.round(state === "input" ? timeLeft : 0)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-white transition-[width] duration-75 ease-linear"
            style={{ width: `${state === "input" ? timeLeft : 0}%` }}
          />
        </div>
      </div>

      {/* Grid 3x3 de emojis */}
      <div
        className="grid grid-cols-3 gap-3 w-full max-w-md mb-4"
        role="group"
        aria-label="Tablero de emojis"
      >
        {gridEmojis.map((emoji, i) => {
          const isActive = activeCell === i;
          const isPressed = pressedCell === i;
          const interactive = state === "input";
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleCellPress(i)}
              disabled={!interactive}
              aria-label={`Emoji ${emoji}${isActive ? " (parpadeando)" : ""}`}
              className={[
                "aspect-square rounded-2xl flex items-center justify-center",
                "text-4xl sm:text-5xl select-none transition-all duration-150",
                "touch-manipulation shadow-md",
                isActive
                  ? "bg-white scale-105 ring-4 ring-white/80 shadow-white/50"
                  : isPressed
                  ? "bg-white/70 scale-95"
                  : "bg-white/20 hover:bg-white/30 active:bg-white/40",
                interactive ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          );
        })}
      </div>

      {/* Zona de acción según estado */}
      {state === "idle" && (
        <button
          type="button"
          onClick={startGame}
          className="w-full max-w-md bg-white text-fuchsia-600 font-extrabold text-lg rounded-2xl py-4 shadow-lg hover:bg-white/90 active:scale-95 transition-all"
        >
          ▶️ Empezar a jugar
        </button>
      )}

      {state === "gameover" && (
        <div className="w-full max-w-md bg-white/15 backdrop-blur rounded-2xl p-5 shadow-lg text-center">
          <p className="text-2xl font-extrabold mb-1">💥 ¡Game Over!</p>
          <p className="text-white/90 mb-1">
            Llegaste al <span className="font-bold">nivel {score}</span>
          </p>
          <p className="text-sm text-white/75 mb-4">
            Mejor récord: <span className="font-bold">nivel {best}</span>
            {score >= best && score > 0 && " 🎉 ¡Nuevo récord!"}
          </p>

          <button
            type="button"
            onClick={startGame}
            className="w-full bg-white text-fuchsia-600 font-extrabold text-lg rounded-2xl py-3 shadow-lg hover:bg-white/90 active:scale-95 transition-all mb-3"
          >
            🔁 Jugar otra vez
          </button>

          <div className="mb-3">
            <ShareButtons url="https://viralisima.com/juegos/ritmo-emoji" text={shareText} />
          </div>

          <button
            type="button"
            onClick={() => setShowLeaderboard(true)}
            className="w-full bg-white/20 hover:bg-white/30 font-bold rounded-2xl py-3 transition-colors"
          >
            🏆 Ver ranking
          </button>
        </div>
      )}

      {/* Instrucciones cuando aún no se juega */}
      {state === "idle" && (
        <p className="text-white/70 text-xs text-center mt-4 max-w-md">
          Memoriza la secuencia de emojis que parpadean y replícala en el mismo orden.
          Cada ronda añade un emoji más. ¡Un fallo y se acabó!
        </p>
      )}

      {/* Modal de ranking (renderizado condicional) */}
      {showLeaderboard && (
        <LeaderboardModal
          game="ritmo-emoji"
          score={score}
          unit="nivel"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
