"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// Tipos del juego
type Fase = "inicio" | "jugando" | "fin";

interface TipoRuido {
  emoji: string;
  nombre: string;
}

interface FuenteRuido {
  id: number;
  emoji: string;
  nombre: string;
  x: number; // porcentaje horizontal
  y: number; // porcentaje vertical
  volumen: number; // 0-100
  velocidad: number; // puntos de volumen por segundo
  llena: boolean;
  silenciada: boolean;
  silenciadaEn: number;
}

interface EstadoJuego {
  fuentes: FuenteRuido[];
  sueno: number;
  tiempo: number;
  ultimo: number;
  acumSpawn: number;
  siguienteId: number;
}

interface Vista {
  fuentes: FuenteRuido[];
  sueno: number;
  tiempo: number;
}

// Constantes
const STORAGE_KEY = "vl_no-despiertes-a-la-abuela_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/no-despiertes-a-la-abuela";
const MAX_FUENTES = 14;
const SUENO_POR_ESCAPE = 6; // golpe al llenarse un medidor
const SUENO_POR_SEGUNDO = 14; // por cada fuente a tope, cada segundo
const RECUPERACION_POR_SEGUNDO = 3; // la abuela se vuelve a dormir si hay silencio
const DURACION_SILENCIO_MS = 450;

const TIPOS_RUIDO: TipoRuido[] = [
  { emoji: "🐓", nombre: "gallo" },
  { emoji: "🛵", nombre: "moto" },
  { emoji: "📞", nombre: "teléfono" },
  { emoji: "🐕", nombre: "perro" },
  { emoji: "📢", nombre: "vendedor" },
  { emoji: "🎺", nombre: "vecino con trompeta" },
];

const FRASES_ABUELA: string[] = [
  "¡Ni en el pueblo hay tanto ruido!",
  "¡Una siesta! ¡Sólo pedía una siesta!",
  "¿Quién ha dejado entrar al gallo en casa?",
  "¡Como vuelva a sonar ese teléfono, lo tiro por la ventana!",
  "¡Ven aquí, que te vas a enterar!",
  "¡Esto en mis tiempos no pasaba!",
  "¡Si me despierto otra vez, no hay merienda!",
  "¡Que alguien calle a ese perro o lo hago yo!",
  "¡Ay, mi madre, qué juventud!",
  "¡El de la trompeta se va a acordar de mí!",
  "¡Tengo la chancla y no tengo miedo de usarla!",
  "¡Cinco minutitos más, que no es tanto pedir!",
];

const aleatorio = (min: number, max: number): number => min + Math.random() * (max - min);

// Genera una posición pegada a uno de los cuatro bordes, lejos de la abuela
const posicionEnBorde = (): { x: number; y: number } => {
  const lado = Math.floor(Math.random() * 4);
  switch (lado) {
    case 0:
      return { x: aleatorio(12, 88), y: aleatorio(10, 20) };
    case 1:
      return { x: aleatorio(12, 88), y: aleatorio(80, 90) };
    case 2:
      return { x: aleatorio(10, 22), y: aleatorio(18, 82) };
    default:
      return { x: aleatorio(78, 90), y: aleatorio(18, 82) };
  }
};

const emojiAbuela = (sueno: number): string => {
  if (sueno < 40) return "😴";
  if (sueno < 75) return "😪";
  return "😠";
};

const colorMedidor = (volumen: number): string => {
  if (volumen < 50) return "bg-emerald-400";
  if (volumen < 80) return "bg-amber-400";
  return "bg-red-500";
};

const estadoInicial = (): EstadoJuego => ({
  fuentes: [],
  sueno: 0,
  tiempo: 0,
  ultimo: 0,
  acumSpawn: 800, // la primera fuente aparece enseguida
  siguienteId: 1,
});

export default function JuegoNoDespiertesALaAbuela() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [vista, setVista] = useState<Vista>({ fuentes: [], sueno: 0, tiempo: 0 });
  const [score, setScore] = useState<number>(0);
  const [mejor, setMejor] = useState<number>(0);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [frase, setFrase] = useState<string>(FRASES_ABUELA[0]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const juegoRef = useRef<EstadoJuego>(estadoInicial());
  const rafRef = useRef<number | null>(null);
  const mejorRef = useRef<number>(0);

  // Carga del récord guardado
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(STORAGE_KEY);
      const valor = guardado ? parseInt(guardado, 10) : 0;
      if (Number.isFinite(valor) && valor > 0) {
        setMejor(valor);
        mejorRef.current = valor;
      }
    } catch {
      // localStorage no disponible (modo privado, etc.)
    }
  }, []);

  // Limpieza del bucle al desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const terminar = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const g = juegoRef.current;
    const final = Math.max(1, Math.floor(g.tiempo));
    setScore(final);
    setFrase(FRASES_ABUELA[Math.floor(Math.random() * FRASES_ABUELA.length)]);

    if (final > mejorRef.current) {
      mejorRef.current = final;
      setMejor(final);
      setNuevoRecord(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(final));
      } catch {
        // sin persistencia disponible
      }
    } else {
      setNuevoRecord(false);
    }

    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([200, 80, 300]);
    }

    setVista({ fuentes: [], sueno: 100, tiempo: g.tiempo });
    setFase("fin");
  }, []);

  const bucle = useCallback(
    (ahora: number) => {
      const g = juegoRef.current;
      if (g.ultimo === 0) g.ultimo = ahora;
      // Se limita el salto de tiempo para no penalizar al volver de otra pestaña
      const dt = Math.min(0.1, (ahora - g.ultimo) / 1000);
      g.ultimo = ahora;
      g.tiempo += dt;
      const t = g.tiempo;

      // Aparición de nuevas fuentes, cada vez más rápido
      g.acumSpawn += dt * 1000;
      const intervalo = Math.max(350, 1400 - t * 15);
      const activas = g.fuentes.filter((f) => !f.silenciada).length;
      if (g.acumSpawn >= intervalo) {
        g.acumSpawn = 0;
        if (activas < MAX_FUENTES) {
          const tipo = TIPOS_RUIDO[Math.floor(Math.random() * TIPOS_RUIDO.length)];
          const pos = posicionEnBorde();
          g.fuentes.push({
            id: g.siguienteId++,
            emoji: tipo.emoji,
            nombre: tipo.nombre,
            x: pos.x,
            y: pos.y,
            volumen: 0,
            velocidad: 20 + t * 0.9 + Math.random() * 10,
            llena: false,
            silenciada: false,
            silenciadaEn: 0,
          });
        }
      }

      // Subida de volumen y efecto sobre el sueño
      let ruidosas = 0;
      g.fuentes = g.fuentes
        .filter((f) => !(f.silenciada && ahora - f.silenciadaEn > DURACION_SILENCIO_MS))
        .map((f) => {
          if (f.silenciada) return f;
          const volumen = Math.min(100, f.volumen + f.velocidad * dt);
          let llena = f.llena;
          if (volumen >= 100) {
            if (!llena) {
              llena = true;
              g.sueno += SUENO_POR_ESCAPE;
            }
            ruidosas += 1;
          }
          return { ...f, volumen, llena };
        });

      if (ruidosas > 0) {
        g.sueno += ruidosas * SUENO_POR_SEGUNDO * dt;
      } else {
        g.sueno = Math.max(0, g.sueno - RECUPERACION_POR_SEGUNDO * dt);
      }
      g.sueno = Math.min(100, g.sueno);

      if (g.sueno >= 100) {
        terminar();
        return;
      }

      setVista({ fuentes: g.fuentes, sueno: g.sueno, tiempo: g.tiempo });
      rafRef.current = requestAnimationFrame(bucle);
    },
    [terminar]
  );

  const empezar = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    juegoRef.current = estadoInicial();
    setVista({ fuentes: [], sueno: 0, tiempo: 0 });
    setScore(0);
    setNuevoRecord(false);
    setShowLeaderboard(false);
    setFase("jugando");
    rafRef.current = requestAnimationFrame(bucle);
  }, [bucle]);

  // Silenciar una fuente (idempotente: pointerdown y click pueden llegar los dos)
  const silenciar = useCallback((id: number) => {
    const g = juegoRef.current;
    const ahora = performance.now();
    let cambiado = false;
    g.fuentes = g.fuentes.map((f) => {
      if (f.id !== id || f.silenciada) return f;
      cambiado = true;
      return { ...f, silenciada: true, silenciadaEn: ahora };
    });
    if (cambiado) {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(15);
      }
      setVista({ fuentes: g.fuentes, sueno: g.sueno, tiempo: g.tiempo });
    }
  }, []);

  const segundos = Math.floor(vista.tiempo);
  const textoCompartir = `Aguanté ${score} s de siesta sin despertar a la abuela 😴🩴 «${frase}» ¿Tú cuánto aguantas?`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-3 py-4 text-white sm:px-6">
      <style>{`
        @keyframes vl-zzz {
          0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(28px, -60px) scale(1.3); opacity: 0; }
        }
        @keyframes vl-silencio {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1.35); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        @keyframes vl-aparece {
          0% { transform: translate(-50%, -50%) scale(0); }
          70% { transform: translate(-50%, -50%) scale(1.15); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes vl-temblor {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(-10deg); }
          75% { transform: translate(-50%, -50%) rotate(10deg); }
        }
        @keyframes vl-respira {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .vl-zzz { animation: vl-zzz 2.4s ease-out infinite; }
        .vl-silencio { animation: vl-silencio ${DURACION_SILENCIO_MS}ms ease-out forwards; }
        .vl-aparece { animation: vl-aparece 250ms ease-out; }
        .vl-temblor { animation: vl-temblor 180ms linear infinite; }
        .vl-respira { animation: vl-respira 2.4s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        {/* Cabecera */}
        <header className="flex items-center justify-between gap-2">
          <Link
            href="/juegos"
            className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Volver a la lista de juegos"
          >
            ← Juegos
          </Link>
          <h1 className="truncate text-center text-lg font-extrabold drop-shadow sm:text-2xl">
            😴 No despiertes a la abuela
          </h1>
          <span className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold" aria-label={`Récord: ${mejor} segundos`}>
            🏆 {mejor}s
          </span>
        </header>

        {fase === "inicio" && (
          <section className="flex flex-col items-center gap-4 rounded-3xl bg-white/15 p-6 text-center shadow-xl backdrop-blur">
            <div className="vl-respira text-8xl" aria-hidden="true">
              😴
            </div>
            <p className="text-lg font-semibold">La abuela duerme la siesta. Que nadie haga ruido.</p>
            <ul className="space-y-1 text-left text-sm text-white/90">
              <li>🐓🛵📞🐕📢🎺 Van apareciendo cosas ruidosas por los bordes.</li>
              <li>🤫 Tócalas antes de que se les llene el medidor.</li>
              <li>😪 Cada ruido que se te escapa sube el medidor de sueño.</li>
              <li>🩴 Si llega al máximo, la abuela se despierta… con la chancla.</li>
            </ul>
            <p className="text-xs text-white/75">Duración: 30-90 segundos</p>
            <button
              type="button"
              onClick={empezar}
              className="min-h-[56px] w-full rounded-2xl bg-white px-6 py-3 text-xl font-extrabold text-purple-700 shadow-lg transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
            >
              Empezar la siesta
            </button>
          </section>
        )}

        {fase === "jugando" && (
          <>
            {/* Marcadores */}
            <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-xs font-semibold">
                  <span>Medidor de sueño</span>
                  <span>{Math.floor(vista.sueno)}%</span>
                </div>
                <div
                  className="h-4 w-full overflow-hidden rounded-full bg-black/30"
                  role="progressbar"
                  aria-label="Medidor de sueño de la abuela"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.floor(vista.sueno)}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-100 ${
                      vista.sueno < 40 ? "bg-emerald-400" : vista.sueno < 75 ? "bg-amber-400" : "bg-red-500"
                    }`}
                    style={{ width: `${vista.sueno}%` }}
                  />
                </div>
              </div>
              <div className="text-right" aria-live="off">
                <div className="text-2xl font-extrabold tabular-nums">{segundos}s</div>
                <div className="text-[10px] uppercase tracking-wide text-white/80">de siesta</div>
              </div>
            </div>

            {/* Zona de juego */}
            <div
              className="relative h-[68vh] max-h-[560px] min-h-[380px] w-full touch-none select-none overflow-hidden rounded-3xl bg-indigo-950/40 shadow-2xl ring-2 ring-white/20"
              role="application"
              aria-label="Habitación de la abuela. Toca los ruidos para silenciarlos."
            >
              {/* Abuela en el centro */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="relative">
                  <span
                    className={`block text-7xl sm:text-8xl ${vista.sueno >= 75 ? "vl-temblor" : "vl-respira"}`}
                    style={vista.sueno >= 75 ? { transform: "translate(0,0)" } : undefined}
                    aria-label={`Abuela ${vista.sueno < 40 ? "profundamente dormida" : vista.sueno < 75 ? "medio dormida" : "a punto de despertarse"}`}
                    role="img"
                  >
                    {emojiAbuela(vista.sueno)}
                  </span>
                  {vista.sueno < 75 && (
                    <div className="absolute -right-4 -top-2" aria-hidden="true">
                      <span className="vl-zzz absolute text-xl font-bold text-white/90">Z</span>
                      <span className="vl-zzz absolute text-lg font-bold text-white/80" style={{ animationDelay: "0.8s" }}>
                        z
                      </span>
                      <span className="vl-zzz absolute text-base font-bold text-white/70" style={{ animationDelay: "1.6s" }}>
                        z
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-3xl" aria-hidden="true">
                  🛋️
                </div>
              </div>

              {/* Fuentes de ruido */}
              {vista.fuentes.map((f) =>
                f.silenciada ? (
                  <div
                    key={f.id}
                    className="vl-silencio pointer-events-none absolute flex h-16 w-16 items-center justify-center text-4xl"
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                    aria-hidden="true"
                  >
                    🤫
                  </div>
                ) : (
                  <button
                    key={f.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      silenciar(f.id);
                    }}
                    onClick={() => silenciar(f.id)}
                    className={`absolute flex h-16 w-16 flex-col items-center justify-center rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white ${
                      f.llena ? "vl-temblor bg-red-500/40" : "vl-aparece bg-white/15"
                    }`}
                    style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%, -50%)" }}
                    aria-label={`Silenciar ${f.nombre}, volumen ${Math.floor(f.volumen)} por ciento`}
                  >
                    <span className="text-3xl leading-none" aria-hidden="true">
                      {f.emoji}
                    </span>
                    <span className="mt-1 h-1.5 w-11 overflow-hidden rounded-full bg-black/40" aria-hidden="true">
                      <span
                        className={`block h-full ${colorMedidor(f.volumen)}`}
                        style={{ width: `${f.volumen}%` }}
                      />
                    </span>
                    {f.llena && (
                      <span className="absolute -top-3 rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold" aria-hidden="true">
                        ¡RUIDO!
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
            <p className="text-center text-xs text-white/80">Toca cada ruido para ponerle un 🤫</p>
          </>
        )}

        {fase === "fin" && (
          <section
            className="flex flex-col items-center gap-4 rounded-3xl bg-white/15 p-6 text-center shadow-xl backdrop-blur"
            aria-live="polite"
          >
            <div className="text-7xl" aria-hidden="true">
              😠🩴
            </div>
            <p className="rounded-2xl bg-white px-4 py-3 text-lg font-bold italic text-purple-700 shadow">
              «{frase}»
            </p>
            <div>
              <p className="text-sm uppercase tracking-wide text-white/80">Aguantaste</p>
              <p className="text-5xl font-extrabold tabular-nums drop-shadow">{score} s</p>
              <p className="text-sm text-white/90">de siesta</p>
            </div>
            <p className="text-base font-semibold">
              {nuevoRecord ? "🎉 ¡Nuevo récord!" : `🏆 Tu mejor récord: ${mejor} segundos`}
            </p>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={empezar}
                className="min-h-[52px] flex-1 rounded-2xl bg-white px-5 py-3 text-lg font-extrabold text-purple-700 shadow-lg transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              >
                Jugar otra vez
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="min-h-[52px] flex-1 rounded-2xl bg-purple-900/60 px-5 py-3 text-lg font-bold text-white shadow-lg ring-2 ring-white/40 transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
                aria-label="Ver ranking de No despiertes a la abuela"
              >
                🏆 Ver ranking
              </button>
            </div>

            <div className="w-full">
              <p className="mb-2 text-sm font-semibold">Reta a tus primos y hermanos:</p>
              <ShareButtons url={URL_JUEGO} text={textoCompartir} />
            </div>
          </section>
        )}
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game="no-despiertes-a-la-abuela"
          score={score}
          unit="segundos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
