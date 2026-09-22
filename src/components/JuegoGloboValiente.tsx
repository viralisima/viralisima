"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const DURACION = 45; // segundos de partida
const BEST_KEY = "vl_globo-valiente_best";
const URL_JUEGO = "https://viralisima.com/juegos/globo-valiente";
const VELOCIDAD_BASE = 22; // unidades de aire por segundo en el primer globo
const VELOCIDAD_EXTRA = 4; // incremento por cada globo usado (mete presión)
const CONFETI = ["💥", "🎊", "✨", "🧨", "💫", "🎉"];

type Fase = "idle" | "playing" | "over";

interface Particula {
  id: number;
  dx: number;
  dy: number;
  emoji: string;
}

/** Límite oculto 40-100, sesgado hacia valores altos para tentar al jugador */
function nuevoLimite(): number {
  return Math.round(40 + 60 * Math.pow(Math.random(), 0.6));
}

function generarParticulas(): Particula[] {
  return Array.from({ length: 10 }, (_, i) => {
    const angulo = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const radio = 70 + Math.random() * 70;
    return {
      id: i,
      dx: Math.cos(angulo) * radio,
      dy: Math.sin(angulo) * radio,
      emoji: CONFETI[Math.floor(Math.random() * CONFETI.length)],
    };
  });
}

export default function JuegoGloboValiente() {
  // ---- Estado visible ----
  const [fase, setFase] = useState<Fase>("idle");
  const [aire, setAire] = useState(0);
  const [banco, setBanco] = useState(0);
  const [globos, setGlobos] = useState(0);
  const [reventados, setReventados] = useState(0);
  const [tiempo, setTiempo] = useState(DURACION);
  const [mejorPct, setMejorPct] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [explotando, setExplotando] = useState(false);
  const [particulas, setParticulas] = useState<Particula[]>([]);
  const [inflando, setInflando] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [esRecord, setEsRecord] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // ---- Refs para el bucle de animación (evitan closures obsoletos) ----
  const faseRef = useRef<Fase>("idle");
  const aireRef = useRef(0);
  const limiteRef = useRef(nuevoLimite());
  const bancoRef = useRef(0);
  const globosRef = useRef(0);
  const mejorPctRef = useRef(0);
  const inflandoRef = useRef(false);
  const explotandoRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inicioRef = useRef(0);
  const ultimoTsRef = useRef(0);

  // Cargar récord local
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(BEST_KEY);
      if (guardado) setBest(parseInt(guardado, 10) || 0);
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const prepararGlobo = useCallback(() => {
    aireRef.current = 0;
    setAire(0);
    limiteRef.current = nuevoLimite();
  }, []);

  const terminar = useCallback(() => {
    if (faseRef.current !== "playing") return;
    faseRef.current = "over";
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // El aire del globo en curso se guarda si no ha reventado
    if (inflandoRef.current && !explotandoRef.current) {
      bancoRef.current += Math.floor(aireRef.current);
    }
    inflandoRef.current = false;
    setInflando(false);

    const final = Math.max(1, Math.round(bancoRef.current));
    setBanco(bancoRef.current);
    setScore(final);
    setTiempo(0);

    let nuevoRecord = false;
    try {
      const previo = parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10) || 0;
      if (final > previo) {
        localStorage.setItem(BEST_KEY, String(final));
        nuevoRecord = true;
        setBest(final);
      } else {
        setBest(previo);
      }
    } catch {
      /* sin persistencia */
    }
    setEsRecord(nuevoRecord);
    setFase("over");
  }, []);

  const explotar = useCallback(() => {
    explotandoRef.current = true;
    inflandoRef.current = false;
    setInflando(false);
    setExplotando(true);
    setParticulas(generarParticulas());
    const perdido = Math.floor(aireRef.current);
    setMensaje(`💥 ¡Reventó! Perdiste ${perdido} puntos de aire`);
    setReventados((r) => r + 1);
    globosRef.current += 1;
    setGlobos(globosRef.current);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([80, 40, 140]);
      } catch {
        /* sin vibración */
      }
    }
    timeoutRef.current = setTimeout(() => {
      explotandoRef.current = false;
      setExplotando(false);
      setParticulas([]);
      if (faseRef.current === "playing") prepararGlobo();
    }, 750);
  }, [prepararGlobo]);

  const loop = useCallback(
    (ts: number) => {
      if (faseRef.current !== "playing") return;
      const dt = Math.min(0.05, (ts - ultimoTsRef.current) / 1000);
      ultimoTsRef.current = ts;

      const restante = Math.max(0, DURACION - (ts - inicioRef.current) / 1000);
      setTiempo(restante);

      if (inflandoRef.current && !explotandoRef.current) {
        const velocidad = VELOCIDAD_BASE + globosRef.current * VELOCIDAD_EXTRA;
        aireRef.current += velocidad * dt;
        if (aireRef.current >= limiteRef.current) {
          aireRef.current = limiteRef.current;
          setAire(aireRef.current);
          explotar();
        } else {
          setAire(aireRef.current);
        }
      }

      if (restante <= 0) {
        terminar();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [explotar, terminar]
  );

  const empezar = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    faseRef.current = "playing";
    bancoRef.current = 0;
    globosRef.current = 0;
    mejorPctRef.current = 0;
    inflandoRef.current = false;
    explotandoRef.current = false;
    setBanco(0);
    setGlobos(0);
    setReventados(0);
    setMejorPct(0);
    setMensaje("Mantén pulsado el globo para inflarlo");
    setExplotando(false);
    setParticulas([]);
    setInflando(false);
    setScore(0);
    setEsRecord(false);
    setShowLeaderboard(false);
    setTiempo(DURACION);
    prepararGlobo();
    setFase("playing");
    const ahora = performance.now();
    inicioRef.current = ahora;
    ultimoTsRef.current = ahora;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, prepararGlobo]);

  const empezarInflar = useCallback(() => {
    if (faseRef.current !== "playing" || explotandoRef.current) return;
    inflandoRef.current = true;
    setInflando(true);
  }, []);

  const soltar = useCallback(() => {
    if (faseRef.current !== "playing") return;
    if (!inflandoRef.current || explotandoRef.current) return;
    inflandoRef.current = false;
    setInflando(false);
    const ganado = Math.floor(aireRef.current);
    if (ganado <= 0) return;
    const pct = Math.round((aireRef.current / limiteRef.current) * 100);
    bancoRef.current += ganado;
    setBanco(bancoRef.current);
    if (pct > mejorPctRef.current) {
      mejorPctRef.current = pct;
      setMejorPct(pct);
    }
    globosRef.current += 1;
    setGlobos(globosRef.current);
    setMensaje(
      pct >= 90
        ? `🧊 +${ganado} · ¡Te plantaste al ${pct} % del límite! Sangre fría`
        : pct >= 70
        ? `✅ +${ganado} · te plantaste al ${pct} % del límite`
        : `🐣 +${ganado} · sólo al ${pct} % del límite… ¿prudente o cobarde?`
    );
    prepararGlobo();
  }, [prepararGlobo]);

  // Si el dedo/ratón se suelta fuera del área, también cuenta como soltar
  useEffect(() => {
    if (fase !== "playing") return;
    const onUp = () => soltar();
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [fase, soltar]);

  // Teclado: barra espaciadora mantiene el inflado
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat) empezarInflar();
      }
    },
    [empezarInflar]
  );
  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        soltar();
      }
    },
    [soltar]
  );

  const escala = 1 + (aire / 100) * 1.7;
  const tiempoPct = (tiempo / DURACION) * 100;
  const tiempoTexto = Math.ceil(tiempo);
  const tenso = aire > 55 && !explotando;

  const textoCompartir = `🎈 Globo Valiente: ${score} puntos en 45 s. ${
    mejorPct > 0 ? `Me planté al ${mejorPct} % del límite sin reventar` : "No aguanté ni un globo"
  }${reventados > 0 ? ` y reventé ${reventados}` : ""}. ¿Tienes más sangre fría que yo?`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white flex flex-col items-center px-4 py-6">
      <style>{`
        @keyframes vl-wobble {
          0%,100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-2px) rotate(-1.5deg); }
          75% { transform: translateX(2px) rotate(1.5deg); }
        }
        @keyframes vl-pop {
          0% { transform: scale(1); opacity: 1; }
          40% { transform: scale(1.35); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes vl-confeti {
          0% { transform: translate(0,0) scale(0.6); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(1.3); opacity: 0; }
        }
        .vl-wobble { animation: vl-wobble 0.18s ease-in-out infinite; }
        .vl-pop { animation: vl-pop 0.55s ease-out forwards; }
        .vl-confeti { animation: vl-confeti 0.7s ease-out forwards; }
      `}</style>

      <header className="w-full max-w-md text-center mb-4">
        <Link
          href="/juegos"
          className="inline-block text-sm text-white/80 hover:text-white underline underline-offset-4 mb-2"
        >
          ← Todos los juegos
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow">
          🎈 Globo Valiente
        </h1>
        <p className="text-white/90 mt-1">Infla, aguanta… ¿te plantas o revientas?</p>
      </header>

      {/* ---------- PANTALLA INICIAL ---------- */}
      {fase === "idle" && (
        <section className="w-full max-w-md bg-white/15 backdrop-blur rounded-3xl p-6 shadow-xl text-center">
          <div className="text-7xl mb-4" aria-hidden="true">
            🎈
          </div>
          <ul className="text-left text-white/95 space-y-2 mb-6 text-sm sm:text-base">
            <li>👆 <strong>Mantén pulsado</strong> el globo para inflarlo.</li>
            <li>🤫 Cada globo tiene un <strong>límite oculto</strong> distinto.</li>
            <li>✋ <strong>Suelta</strong> antes de que reviente para guardar el aire.</li>
            <li>💥 Si revienta, pierdes todo lo de ese globo.</li>
            <li>⏱️ Tienes <strong>45 segundos</strong>. Cada globo se infla más rápido.</li>
          </ul>
          {best > 0 && (
            <p className="mb-4 text-sm text-white/90">
              🏅 Tu mejor marca: <strong>{best} puntos</strong>
            </p>
          )}
          <button
            type="button"
            onClick={empezar}
            className="w-full py-4 rounded-2xl bg-white text-fuchsia-600 font-black text-xl shadow-lg active:scale-95 transition"
          >
            ▶ Empezar
          </button>
        </section>
      )}

      {/* ---------- PARTIDA ---------- */}
      {fase === "playing" && (
        <section className="w-full max-w-md flex flex-col items-center">
          {/* Marcador */}
          <div className="w-full grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="bg-white/15 rounded-2xl py-2">
              <div className="text-xs uppercase tracking-wide text-white/80">Banco</div>
              <div className="text-2xl font-black" aria-live="polite">
                {Math.floor(banco)}
              </div>
            </div>
            <div className="bg-white/15 rounded-2xl py-2">
              <div className="text-xs uppercase tracking-wide text-white/80">Tiempo</div>
              <div
                className={`text-2xl font-black ${tiempoTexto <= 10 ? "text-yellow-200 animate-pulse" : ""}`}
              >
                {tiempoTexto}s
              </div>
            </div>
            <div className="bg-white/15 rounded-2xl py-2">
              <div className="text-xs uppercase tracking-wide text-white/80">Globos</div>
              <div className="text-2xl font-black">{globos}</div>
            </div>
          </div>

          {/* Barra de tiempo */}
          <div
            className="w-full h-2 bg-white/25 rounded-full overflow-hidden mb-3"
            role="progressbar"
            aria-label="Tiempo restante"
            aria-valuemin={0}
            aria-valuemax={DURACION}
            aria-valuenow={tiempoTexto}
          >
            <div
              className="h-full bg-white rounded-full transition-[width] duration-100"
              style={{ width: `${tiempoPct}%` }}
            />
          </div>

          <p className="min-h-[2.5rem] text-center text-sm sm:text-base font-semibold px-2 mb-2" aria-live="polite">
            {mensaje}
          </p>

          {/* Área del globo */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Mantén pulsado para inflar el globo, suelta para guardar el aire"
            onPointerDown={(e) => {
              e.preventDefault();
              empezarInflar();
            }}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onPointerLeave={soltar}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onContextMenu={(e) => e.preventDefault()}
            className={`relative w-full h-72 sm:h-80 rounded-3xl bg-white/10 border-2 ${
              inflando ? "border-white" : "border-white/30"
            } flex items-center justify-center overflow-hidden select-none touch-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/60`}
          >
            {/* Globo */}
            {!explotando && (
              <div
                className={`text-6xl leading-none will-change-transform ${tenso ? "vl-wobble" : ""}`}
                style={{
                  transform: `scale(${escala})`,
                  transition: inflando ? "none" : "transform 0.2s ease-out",
                }}
                aria-hidden="true"
              >
                🎈
              </div>
            )}

            {/* Estallido */}
            {explotando && (
              <>
                <div
                  className="absolute text-7xl vl-pop"
                  style={{ transform: `scale(${escala})` }}
                  aria-hidden="true"
                >
                  💥
                </div>
                {particulas.map((p) => (
                  <span
                    key={p.id}
                    className="absolute text-2xl vl-confeti pointer-events-none"
                    style={
                      {
                        "--dx": `${p.dx}px`,
                        "--dy": `${p.dy}px`,
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  >
                    {p.emoji}
                  </span>
                ))}
              </>
            )}

            {/* Aire acumulado en este globo */}
            <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
              <span className="inline-block bg-black/30 rounded-full px-3 py-1 text-sm font-bold">
                Aire: {Math.floor(aire)}
              </span>
            </div>
            {!inflando && !explotando && (
              <div className="absolute top-3 left-0 right-0 text-center text-xs text-white/80 pointer-events-none">
                Mantén pulsado aquí
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-white/80 text-center">
            Velocidad de inflado: x{((VELOCIDAD_BASE + globos * VELOCIDAD_EXTRA) / VELOCIDAD_BASE).toFixed(1)}
            {mejorPct > 0 && ` · Mejor plante: ${mejorPct} %`}
          </p>
        </section>
      )}

      {/* ---------- FIN DE PARTIDA ---------- */}
      {fase === "over" && (
        <section className="w-full max-w-md bg-white/15 backdrop-blur rounded-3xl p-6 shadow-xl text-center">
          <div className="text-6xl mb-2" aria-hidden="true">
            {esRecord ? "🏆" : reventados > globos / 2 ? "💥" : "🎈"}
          </div>
          <h2 className="text-xl font-bold mb-1">¡Se acabó el tiempo!</h2>
          <p className="text-5xl font-black my-3" aria-live="polite">
            {score} <span className="text-2xl font-bold">puntos</span>
          </p>
          {esRecord && (
            <p className="text-yellow-200 font-bold mb-2">🎉 ¡Nuevo récord personal!</p>
          )}
          <p className="text-sm text-white/90 mb-1">
            🏅 Mejor récord: <strong>{best} puntos</strong>
          </p>
          <p className="text-sm text-white/90 mb-4">
            {globos} globos · {reventados} reventados ·{" "}
            {mejorPct > 0 ? `te plantaste como máximo al ${mejorPct} % del límite` : "ninguno salvado"}
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={empezar}
              className="w-full py-3 rounded-2xl bg-white text-fuchsia-600 font-black text-lg shadow-lg active:scale-95 transition"
            >
              🔁 Jugar otra vez
            </button>
            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="w-full py-3 rounded-2xl bg-fuchsia-700/70 hover:bg-fuchsia-700 font-bold text-lg shadow active:scale-95 transition"
              aria-label="Ver ranking de puntuaciones"
            >
              🏆 Ver ranking
            </button>
            <ShareButtons url={URL_JUEGO} text={textoCompartir} />
          </div>
        </section>
      )}

      {showLeaderboard && (
        <LeaderboardModal
          game="globo-valiente"
          score={score}
          unit="puntos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
