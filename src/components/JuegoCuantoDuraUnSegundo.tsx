"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ——— Configuración del juego ———
const STORAGE_KEY = "vl_cuanto-dura-un-segundo_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/cuanto-dura-un-segundo";
const RONDAS = 5;
// Tiempo mínimo entre dos acciones para evitar dobles toques accidentales
const GUARDA_MS = 250;
// Error por debajo del cual consideramos que la ronda está "clavada"
const UMBRAL_CLAVADO_MS = 20;

type Fase = "inicio" | "preparado" | "corriendo" | "resultado" | "fin";

// ——— Utilidades ———

// Fecha local en formato AAAA-MM-DD: todos los jugadores del mismo día comparten objetivos
function claveDelDia(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Hash FNV-1a de 32 bits para convertir un texto en semilla
function semillaDe(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Generador pseudoaleatorio determinista (mulberry32)
function mulberry32(semilla: number): () => number {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Cinco objetivos distintos entre 1,0 s y 10,0 s en pasos de 0,5 s, iguales para todos el mismo día
function objetivosDelDia(clave: string): number[] {
  const rng = mulberry32(semillaDe(`cuanto-dura-un-segundo:${clave}`));
  const candidatos: number[] = [];
  for (let v = 10; v <= 100; v += 5) candidatos.push(v * 100);
  // Barajado Fisher-Yates con la semilla del día
  for (let i = candidatos.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = candidatos[i];
    candidatos[i] = candidatos[j];
    candidatos[j] = tmp;
  }
  return candidatos.slice(0, RONDAS);
}

// 7500 → "7,5 s"
function formatoObjetivo(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

// 7432.4 → "7,43 s"
function formatoMedido(ms: number): string {
  return `${(ms / 1000).toFixed(2).replace(".", ",")} s`;
}

function formatoMs(ms: number): string {
  return `${Math.round(ms).toLocaleString("es-ES")} ms`;
}

function textoDesvio(objetivo: number, medido: number): string {
  const diff = medido - objetivo;
  const abs = Math.abs(diff);
  if (abs < UMBRAL_CLAVADO_MS) return `¡Clavado! Solo ${formatoMs(abs)} de desvío 🎯`;
  return diff < 0 ? `Te has adelantado ${formatoMs(abs)}` : `Te has pasado ${formatoMs(abs)}`;
}

function mensajeFinal(errorMedio: number): { titulo: string; texto: string } {
  if (errorMedio < 60)
    return { titulo: "Reloj atómico 🧬", texto: "Tu cerebro lleva un cronómetro suizo. Esto no es normal." };
  if (errorMedio < 150)
    return { titulo: "Metrónomo humano 🎯", texto: "Muy poca gente baja de aquí. Presume sin miedo." };
  if (errorMedio < 300)
    return { titulo: "Buen oído para el tiempo ⏳", texto: "Tu reloj interno es fiable… casi siempre." };
  if (errorMedio < 600)
    return { titulo: "Reloj a su aire 🙃", texto: "Los segundos se te estiran y se te encogen. Pide la revancha." };
  if (errorMedio < 1200)
    return { titulo: "Otra zona horaria 🌍", texto: "Tu reloj interno va con jet lag permanente." };
  return { titulo: "El tiempo es relativo 🌀", texto: "Einstein estaría orgulloso. Tu cronómetro, no tanto." };
}

function leerRecord(): number | null {
  try {
    const valor = window.localStorage.getItem(STORAGE_KEY);
    if (!valor) return null;
    const n = parseInt(valor, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function guardarRecord(valor: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(valor));
  } catch {
    // Modo privado o almacenamiento lleno: se ignora sin romper el juego
  }
}

// ——— Componente ———

export default function JuegoCuantoDuraUnSegundo() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [ronda, setRonda] = useState<number>(0);
  const [objetivos, setObjetivos] = useState<number[]>([]);
  const [tiempos, setTiempos] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [mejor, setMejor] = useState<number | null>(null);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [claveHoy, setClaveHoy] = useState<string>("");

  // Instante (performance.now) en que empezó la ronda actual
  const inicioRef = useRef<number>(0);
  // Instante de la última acción aceptada, para la guarda anti doble toque
  const ultimaAccionRef = useRef<number>(0);
  // Instante de la última pulsación de teclado, para no duplicarla con el click sintético
  const ultimaTeclaRef = useRef<number>(-Infinity);

  // Cargar récord y fecha solo en cliente (evita desajustes de hidratación)
  useEffect(() => {
    setMejor(leerRecord());
    setClaveHoy(claveDelDia());
  }, []);

  const empezarPartida = useCallback(() => {
    const clave = claveDelDia();
    setClaveHoy(clave);
    setObjetivos(objetivosDelDia(clave));
    setTiempos([]);
    setRonda(0);
    setScore(0);
    setNuevoRecord(false);
    setShowLeaderboard(false);
    ultimaAccionRef.current = performance.now();
    setFase("preparado");
  }, []);

  const terminarPartida = useCallback(
    (medidos: number[]) => {
      const suma = medidos.reduce((acc, m, i) => acc + Math.abs(m - objetivos[i]), 0);
      // El score debe ser un entero > 0
      const final = Math.max(1, Math.round(suma));
      setScore(final);
      const anterior = leerRecord();
      if (anterior === null || final < anterior) {
        guardarRecord(final);
        setMejor(final);
        setNuevoRecord(true);
      } else {
        setMejor(anterior);
        setNuevoRecord(false);
      }
      setFase("fin");
    },
    [objetivos]
  );

  // Acción única del botón grande; t es el instante medido con performance.now()
  const accion = useCallback(
    (t: number) => {
      if (t - ultimaAccionRef.current < GUARDA_MS) return;

      if (fase === "preparado") {
        ultimaAccionRef.current = t;
        inicioRef.current = t;
        setFase("corriendo");
        return;
      }

      if (fase === "corriendo") {
        ultimaAccionRef.current = t;
        const medido = t - inicioRef.current;
        setTiempos((prev) => [...prev, medido]);
        setFase("resultado");
        return;
      }

      if (fase === "resultado") {
        ultimaAccionRef.current = t;
        if (ronda + 1 < RONDAS) {
          setRonda(ronda + 1);
          setFase("preparado");
        } else {
          terminarPartida(tiempos);
        }
      }
    },
    [fase, ronda, tiempos, terminarPartida]
  );

  // Ratón y táctil: se mide en pointerdown, no en click, para no sumar el retardo del click
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const t = performance.now();
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      accion(t);
    },
    [accion]
  );

  // Teclado: Espacio o Enter
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== " " && e.key !== "Enter") return;
      const t = performance.now();
      e.preventDefault();
      if (e.repeat) return;
      ultimaTeclaRef.current = t;
      accion(t);
    },
    [accion]
  );

  // Activación por tecnologías de asistencia (click sintético con detail 0)
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.detail !== 0) return;
      const t = performance.now();
      if (t - ultimaTeclaRef.current < 1000) return;
      accion(t);
    },
    [accion]
  );

  const objetivoActual = objetivos[ronda] ?? 0;
  const medidoActual = tiempos[ronda];
  const errorAcumulado = tiempos.reduce((acc, m, i) => acc + Math.abs(m - objetivos[i]), 0);
  const errorMedio = tiempos.length > 0 ? errorAcumulado / tiempos.length : 0;
  const maxBarra = Math.max(1, ...objetivos, ...tiempos);
  const final = mensajeFinal(errorMedio);

  const textoCompartir = `⏱️ He parado el reloj a ciegas con ${score.toLocaleString(
    "es-ES"
  )} ms de error en ${RONDAS} rondas (${formatoMs(errorMedio)} por ronda). ¿Tu reloj interno es mejor? Reto del día 👇`;

  // Texto y etiqueta accesible del botón grande según la fase
  let etiquetaBoton = "";
  let contenidoBoton: React.ReactNode = null;
  if (fase === "preparado") {
    etiquetaBoton = `Ronda ${ronda + 1} de ${RONDAS}. Objetivo ${formatoObjetivo(
      objetivoActual
    )}. Toca para empezar el cronómetro oculto.`;
    contenidoBoton = (
      <>
        <span className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Objetivo
        </span>
        <span className="text-6xl font-black tabular-nums sm:text-7xl">
          {formatoObjetivo(objetivoActual)}
        </span>
        <span className="mt-2 rounded-full bg-white/20 px-4 py-2 text-base font-bold">
          👆 Toca para empezar
        </span>
      </>
    );
  } else if (fase === "corriendo") {
    etiquetaBoton = `Cronómetro en marcha y oculto. Toca cuando creas que han pasado ${formatoObjetivo(
      objetivoActual
    )}.`;
    contenidoBoton = (
      <>
        <span className="text-6xl" aria-hidden="true">
          🙈
        </span>
        <span className="text-2xl font-black">Cronómetro oculto</span>
        <span className="text-base text-white/90">
          Toca cuando creas que han pasado{" "}
          <strong className="font-black">{formatoObjetivo(objetivoActual)}</strong>
        </span>
      </>
    );
  } else if (fase === "resultado" && medidoActual !== undefined) {
    const ultima = ronda + 1 >= RONDAS;
    etiquetaBoton = `Has parado en ${formatoMedido(medidoActual)}. ${textoDesvio(
      objetivoActual,
      medidoActual
    )}. ${ultima ? "Toca para ver el resultado final." : "Toca para la siguiente ronda."}`;
    contenidoBoton = (
      <>
        <span className="text-sm font-semibold uppercase tracking-widest text-white/80">
          Has parado en
        </span>
        <span className="text-6xl font-black tabular-nums sm:text-7xl">
          {formatoMedido(medidoActual)}
        </span>
        <span className="text-lg font-bold">{textoDesvio(objetivoActual, medidoActual)}</span>
        <span className="mt-2 rounded-full bg-white/20 px-4 py-2 text-base font-bold">
          {ultima ? "🏁 Ver resultado" : "➡️ Siguiente ronda"}
        </span>
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 text-slate-900">
      <div className="mb-4 flex items-center justify-between text-sm">
        <Link href="/juegos" className="font-semibold text-indigo-600 hover:underline">
          ← Más juegos
        </Link>
        {claveHoy && (
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            Reto del día · {claveHoy.split("-").reverse().join("/")}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 p-1 shadow-xl">
        <div className="rounded-[1.35rem] bg-white/5 p-4 text-white sm:p-6">
          {/* Cabecera */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-black sm:text-3xl">
              <span aria-hidden="true">⏱️ </span>¿Cuánto dura un segundo?
            </h1>
            <p className="mt-1 text-sm text-white/85 sm:text-base">
              Para el reloj a ciegas justo en el tiempo que te pedimos
            </p>
          </div>

          {/* Región para lectores de pantalla */}
          <p className="sr-only" aria-live="polite">
            {fase === "preparado" &&
              `Ronda ${ronda + 1}. Objetivo ${formatoObjetivo(objetivoActual)}.`}
            {fase === "corriendo" && "Cronómetro en marcha."}
            {fase === "resultado" &&
              medidoActual !== undefined &&
              `${formatoMedido(medidoActual)}. ${textoDesvio(objetivoActual, medidoActual)}.`}
            {fase === "fin" && `Partida terminada. Error total ${formatoMs(score)}.`}
          </p>

          {/* Pantalla de inicio */}
          {fase === "inicio" && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="text-7xl" aria-hidden="true">
                ⏱️
              </div>
              <ul className="space-y-2 text-left text-sm sm:text-base">
                <li>🎯 Te damos un tiempo objetivo (por ejemplo 7,5 s).</li>
                <li>👆 Tocas para empezar y el cronómetro desaparece.</li>
                <li>🛑 Vuelve a tocar cuando creas que ha pasado ese tiempo.</li>
                <li>
                  📉 {RONDAS} rondas. Tu puntuación es la suma de milisegundos de error:{" "}
                  <strong>cuanto menos, mejor</strong>.
                </li>
              </ul>
              {mejor !== null && (
                <p className="rounded-full bg-white/15 px-4 py-1 text-sm font-semibold">
                  🏅 Tu mejor récord: {formatoMs(mejor)}
                </p>
              )}
              <button
                type="button"
                onClick={empezarPartida}
                className="w-full rounded-2xl bg-white px-6 py-4 text-lg font-black text-indigo-700 shadow-lg transition hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              >
                ▶️ Empezar (≈45 segundos)
              </button>
              <p className="text-xs text-white/75">
                Los objetivos son los mismos para todo el mundo hoy. Sin contar en voz alta, ¿eh? 😉
              </p>
            </div>
          )}

          {/* Rondas en juego */}
          {(fase === "preparado" || fase === "corriendo" || fase === "resultado") && (
            <div className="flex flex-col gap-4">
              {/* Progreso de rondas */}
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>
                  Ronda {ronda + 1} / {RONDAS}
                </span>
                <span className="tabular-nums">Error acumulado: {formatoMs(errorAcumulado)}</span>
              </div>
              <div className="flex gap-1.5" aria-hidden="true">
                {Array.from({ length: RONDAS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                      i < tiempos.length
                        ? "bg-white"
                        : i === ronda
                        ? "bg-white/60"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label={etiquetaBoton}
                onPointerDown={onPointerDown}
                onKeyDown={onKeyDown}
                onClick={onClick}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                className={`flex min-h-[18rem] w-full select-none flex-col items-center justify-center gap-3 rounded-3xl border-2 px-4 py-8 text-center shadow-inner transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 sm:min-h-[20rem] ${
                  fase === "corriendo"
                    ? "border-white/40 bg-slate-900/80 active:scale-[0.98]"
                    : fase === "resultado"
                    ? "border-white/30 bg-white/15 active:scale-[0.98]"
                    : "border-white/30 bg-white/10 active:scale-[0.98]"
                }`}
              >
                {contenidoBoton}
              </button>

              <p className="text-center text-xs text-white/75">
                También puedes usar la barra espaciadora o Enter.
              </p>
            </div>
          )}

          {/* Pantalla final */}
          {fase === "fin" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl bg-white/15 p-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                  Error total
                </p>
                <p className="text-5xl font-black tabular-nums sm:text-6xl">{formatoMs(score)}</p>
                <p className="mt-1 text-sm text-white/85">
                  Media por ronda: <strong>{formatoMs(errorMedio)}</strong>
                </p>
                {nuevoRecord ? (
                  <p className="mt-3 inline-block rounded-full bg-yellow-300 px-4 py-1 text-sm font-black text-yellow-900">
                    🎉 ¡Nuevo récord personal!
                  </p>
                ) : (
                  mejor !== null && (
                    <p className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold">
                      🏅 Tu mejor récord: {formatoMs(mejor)}
                    </p>
                  )
                )}
              </div>

              <div className="text-center">
                <p className="text-xl font-black">{final.titulo}</p>
                <p className="text-sm text-white/90">{final.texto}</p>
              </div>

              {/* Barras por ronda: objetivo frente a lo que has parado */}
              <div className="rounded-2xl bg-white p-4 text-slate-800">
                <div className="mb-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-4 rounded bg-slate-300" aria-hidden="true" />
                    Objetivo
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-2.5 w-4 rounded bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500"
                      aria-hidden="true"
                    />
                    Tú
                  </span>
                </div>
                <ol className="space-y-3">
                  {objetivos.map((obj, i) => {
                    const medido = tiempos[i] ?? 0;
                    const error = Math.abs(medido - obj);
                    return (
                      <li
                        key={i}
                        aria-label={`Ronda ${i + 1}: objetivo ${formatoObjetivo(
                          obj
                        )}, has parado en ${formatoMedido(medido)}, error ${formatoMs(error)}`}
                      >
                        <div className="mb-1 flex items-baseline justify-between text-xs">
                          <span className="font-bold">
                            R{i + 1} · {formatoObjetivo(obj)}
                          </span>
                          <span className="tabular-nums text-slate-500">
                            {formatoMedido(medido)} ·{" "}
                            <strong
                              className={
                                error < 150
                                  ? "text-emerald-600"
                                  : error < 500
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              }
                            >
                              {medido < obj ? "−" : "+"}
                              {formatoMs(error)}
                            </strong>
                          </span>
                        </div>
                        <div className="space-y-1" aria-hidden="true">
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-slate-300 transition-all duration-700"
                              style={{ width: `${(obj / maxBarra) * 100}%` }}
                            />
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 transition-all duration-700"
                              style={{ width: `${(medido / maxBarra) * 100}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={empezarPartida}
                  className="flex-1 rounded-2xl bg-white px-6 py-4 text-lg font-black text-indigo-700 shadow-lg transition hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                >
                  🔁 Jugar otra vez
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(true)}
                  aria-label="Ver ranking de ¿Cuánto dura un segundo?"
                  className="flex-1 rounded-2xl border-2 border-white bg-white/10 px-6 py-4 text-lg font-black text-white transition hover:bg-white/20 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                >
                  🏆 Ver ranking
                </button>
              </div>

              <div className="rounded-2xl bg-white p-4 text-slate-800">
                <p className="mb-2 text-center text-sm font-bold">
                  Reta a tus amigos: ¿quién tiene el mejor reloj interno? 👇
                </p>
                <ShareButtons url={URL_JUEGO} text={textoCompartir} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game="cuanto-dura-un-segundo"
          score={score}
          unit="ms"
          scoreOrder="low"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
