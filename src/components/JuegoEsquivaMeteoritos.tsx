"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// Clave de localStorage para el mejor récord
const BEST_KEY = "vl_esquiva-meteoritos_best";

// Estados posibles del juego
type GameState = "idle" | "playing" | "over";

// Estructura de un meteorito en pantalla
interface Meteor {
  x: number;
  y: number;
  size: number;
  speed: number;
}

// Estructura de la nave del jugador
interface Ship {
  x: number;
  width: number;
  height: number;
}

export default function JuegoEsquivaMeteoritos() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Refs mutables usados dentro del bucle de animación (evitan re-render)
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const meteorsRef = useRef<Meteor[]>([]);
  const shipRef = useRef<Ship>({ x: 0, width: 44, height: 44 });
  const targetXRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>("idle");
  const elapsedRef = useRef<number>(0);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 360, h: 560 });

  // Mantener el ref de estado sincronizado con el state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Cargar el mejor récord al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (!Number.isNaN(parsed) && parsed > 0) setBest(parsed);
      }
    } catch {
      // localStorage no disponible: se ignora
    }
  }, []);

  // Ajustar el tamaño del canvas al contenedor (responsive) y a devicePixelRatio
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const cssW = parent.clientWidth;
    // Alto proporcional, limitado para que quepa bien en móvil
    const cssH = Math.min(Math.max(Math.round(cssW * 1.55), 380), 620);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sizeRef.current = { w: cssW, h: cssH };

    // Recolocar la nave si aún no está inicializada o quedó fuera de rango
    const ship = shipRef.current;
    if (ship.x === 0 || ship.x > cssW) {
      ship.x = cssW / 2;
      targetXRef.current = cssW / 2;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // Detección de colisión AABB simple
  const collides = (m: Meteor, ship: Ship, shipY: number, w: number): boolean => {
    // Cajas del meteorito y de la nave (con margen para ser más justo)
    const margin = 6;
    const mLeft = m.x - m.size / 2 + margin;
    const mRight = m.x + m.size / 2 - margin;
    const mTop = m.y - m.size / 2 + margin;
    const mBottom = m.y + m.size / 2 - margin;

    const sLeft = ship.x - ship.width / 2 + margin;
    const sRight = ship.x + ship.width / 2 - margin;
    const sTop = shipY;
    const sBottom = shipY + ship.height;

    // Clamp visual innecesario aquí; w se usa fuera si hiciera falta
    void w;

    return mRight > sLeft && mLeft < sRight && mBottom > sTop && mTop < sBottom;
  };

  // Bucle principal de render y lógica
  const loop = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const { w, h } = sizeRef.current;
      const elapsed = (now - startTimeRef.current) / 1000; // segundos
      elapsedRef.current = elapsed;

      // Dificultad progresiva: velocidad y frecuencia de aparición aumentan con el tiempo
      const difficulty = Math.min(elapsed / 30, 1); // se satura a los 30s
      const spawnInterval = 900 - difficulty * 620; // de 900ms a ~280ms
      const baseSpeed = 130 + difficulty * 260; // px/segundo

      // Aparición de nuevos meteoritos
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        const size = 26 + Math.floor((Math.sin(now) + 1) * 10); // 26..46 aprox
        const spawnCount = elapsed > 18 ? 2 : 1;
        for (let i = 0; i < spawnCount; i++) {
          const x = size / 2 + pseudoRandom(now + i * 97.3) * (w - size);
          meteorsRef.current.push({
            x,
            y: -size,
            size,
            speed: baseSpeed * (0.85 + pseudoRandom(now + i * 41.7) * 0.4),
          });
        }
      }

      // Delta de tiempo aproximado por frame (asumiendo ~60fps para el movimiento vertical)
      const dt = 1 / 60;

      // Suavizar el movimiento de la nave hacia el objetivo
      const ship = shipRef.current;
      ship.x += (targetXRef.current - ship.x) * 0.35;
      ship.x = Math.max(ship.width / 2, Math.min(w - ship.width / 2, ship.x));
      const shipY = h - ship.height - 14;

      // Actualizar meteoritos y comprobar colisiones
      let crashed = false;
      const meteors = meteorsRef.current;
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.y += m.speed * dt;
        if (m.y - m.size / 2 > h) {
          meteors.splice(i, 1);
          continue;
        }
        if (collides(m, ship, shipY, w)) {
          crashed = true;
          break;
        }
      }

      // Dibujar fondo (espacio con degradado)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#334155"); // slate-700
      grad.addColorStop(0.55, "#2563eb"); // blue-600
      grad.addColorStop(1, "#06b6d4"); // cyan-500
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Estrellas de fondo (decorativas, deterministas)
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let s = 0; s < 30; s++) {
        const sx = (pseudoRandom(s * 12.9) * w) | 0;
        const sy = ((pseudoRandom(s * 78.2) * h + elapsed * 30) % h) | 0;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Dibujar meteoritos como emoji
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const m of meteors) {
        ctx.font = `${m.size}px serif`;
        ctx.fillText("☄️", m.x, m.y);
      }

      // Dibujar la nave
      ctx.font = `${ship.height}px serif`;
      ctx.fillText("🚀", ship.x, shipY + ship.height / 2);

      // HUD: tiempo transcurrido
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`${Math.floor(elapsed)}s`, 14, 12);

      if (crashed) {
        endGame(Math.floor(elapsed));
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    },
    // endGame es estable (definido con useCallback abajo); se referencia vía closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Pseudo-aleatorio determinista basado en una semilla (evita Math.random en el loop de dibujo si molestara,
  // aquí simplemente da variedad estable por frame)
  function pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Finalizar la partida y persistir el récord
  const endGame = useCallback((finalSeconds: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    // Garantizar entero > 0
    const finalScore = Math.max(1, Math.floor(finalSeconds));
    setScore(finalScore);
    gameStateRef.current = "over";
    setGameState("over");

    setBest((prev) => {
      const next = finalScore > prev ? finalScore : prev;
      if (next !== prev) {
        try {
          localStorage.setItem(BEST_KEY, String(next));
        } catch {
          // se ignora si no hay localStorage
        }
      }
      return next;
    });
  }, []);

  // Iniciar una nueva partida
  const startGame = useCallback(() => {
    resizeCanvas();
    const { w } = sizeRef.current;

    meteorsRef.current = [];
    shipRef.current = { x: w / 2, width: 44, height: 44 };
    targetXRef.current = w / 2;

    const now = performance.now();
    startTimeRef.current = now;
    lastSpawnRef.current = now;
    elapsedRef.current = 0;

    setScore(0);
    setShowLeaderboard(false);
    gameStateRef.current = "playing";
    setGameState("playing");

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, resizeCanvas]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Convierte la posición del puntero/dedo a coordenada X dentro del canvas
  const updateTargetFromClientX = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    targetXRef.current = Math.max(0, Math.min(rect.width, x));
  }, []);

  // Handlers de puntero (cubren mouse y touch vía Pointer Events)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (gameStateRef.current !== "playing") return;
      updateTargetFromClientX(e.clientX);
    },
    [updateTargetFromClientX]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (gameStateRef.current !== "playing") return;
      // Capturar el puntero para seguir el arrastre aunque salga del canvas
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // algunos navegadores pueden lanzar; se ignora
      }
      updateTargetFromClientX(e.clientX);
    },
    [updateTargetFromClientX]
  );

  const shareText =
    best > 0
      ? `He sobrevivido ${best}s esquivando meteoritos ☄️🚀 ¿Puedes superarme?`
      : "¿Cuánto aguantas esquivando meteoritos? ☄️🚀";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-700 via-blue-600 to-cyan-500 flex flex-col items-center px-4 py-6">
      {/* Cabecera */}
      <header className="w-full max-w-md text-center text-white">
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/juegos"
            className="underline/50 hover:underline text-white/90"
            aria-label="Volver a la lista de juegos"
          >
            ← Juegos
          </Link>
          <span aria-hidden="true" className="text-white/70">
            viralisima.com
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold flex items-center justify-center gap-2">
          <span aria-hidden="true">☄️</span>
          Esquiva Meteoritos
        </h1>
        <p className="mt-1 text-white/85 text-sm">
          Mueve tu nave y sobrevive el máximo tiempo
        </p>
      </header>

      {/* Área de juego */}
      <main className="w-full max-w-md mt-5 flex flex-col items-center">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-slate-900">
          <canvas
            ref={canvasRef}
            className="block w-full touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            role="img"
            aria-label="Zona de juego: nave espacial esquivando meteoritos"
          />

          {/* Superposición de inicio */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm text-center px-6">
              <p className="text-5xl" aria-hidden="true">
                🚀
              </p>
              <p className="mt-4 text-white/90 text-sm leading-relaxed">
                Arrastra el dedo o el ratón en horizontal para mover la nave.
                Esquiva los meteoritos ☄️ el máximo tiempo posible.
              </p>
              <button
                onClick={startGame}
                className="mt-6 px-8 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold text-lg shadow-lg transition-colors"
                aria-label="Empezar a jugar"
              >
                ▶ Jugar
              </button>
            </div>
          )}

          {/* Superposición de fin de partida */}
          {gameState === "over" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm text-center px-6">
              <p className="text-4xl" aria-hidden="true">
                💥
              </p>
              <p className="mt-2 text-white/80 text-sm uppercase tracking-wide">
                Has chocado
              </p>
              <p className="mt-3 text-white text-2xl font-extrabold">
                {score} segundos
              </p>
              <p className="mt-1 text-cyan-200 text-sm">
                Mejor récord: {best}s
                {score >= best && score > 0 ? " 🎉 ¡Nuevo récord!" : ""}
              </p>
              <button
                onClick={startGame}
                className="mt-5 px-8 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold text-lg shadow-lg transition-colors"
                aria-label="Jugar otra vez"
              >
                🔄 Jugar otra vez
              </button>
            </div>
          )}
        </div>

        {/* Marcador siempre visible bajo el canvas */}
        <div className="w-full mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/15 text-white text-center py-3">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Tiempo
            </p>
            <p className="text-2xl font-bold">
              {gameState === "over" ? score : Math.floor(elapsedRef.current)}s
            </p>
          </div>
          <div className="rounded-xl bg-white/15 text-white text-center py-3">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Récord
            </p>
            <p className="text-2xl font-bold">{best}s</p>
          </div>
        </div>

        {/* Acciones tras terminar la partida */}
        {gameState === "over" && (
          <div className="w-full mt-4 flex flex-col items-center gap-4">
            <ShareButtons
              url="https://viralisima.com/juegos/esquiva-meteoritos"
              text={shareText}
            />
            <button
              onClick={() => setShowLeaderboard(true)}
              className="px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors"
              aria-label="Ver ranking de jugadores"
            >
              🏆 Ver ranking
            </button>
          </div>
        )}
      </main>

      {/* Modal de ranking (renderizado condicional) */}
      {showLeaderboard && (
        <LeaderboardModal
          game="esquiva-meteoritos"
          score={score}
          unit="segundos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
