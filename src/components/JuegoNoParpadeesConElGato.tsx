"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------------------------------------------------------------------------
// Constantes del juego
// ---------------------------------------------------------------------------
const SLUG = "no-parpadees-con-el-gato";
const CLAVE_RECORD = "vl_no-parpadees-con-el-gato_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/no-parpadees-con-el-gato";
const DURACION_MS = 60_000;
const VIDAS_INICIALES = 3;
const OBJETOS = ["🏺", "☕", "📱", "🪴"] as const;
const NOMBRES_OBJETOS = ["jarrón", "taza de café", "móvil", "maceta"] as const;

// Ventana de acierto: baja de 350 ms a 200 ms con el tiempo.
// Se suma un margen fijo de reacción (tiempo medio de reacción visual + latencia táctil)
// para que la ventana sea jugable en móvil.
const VENTANA_INICIAL = 350;
const VENTANA_FINAL = 200;
const MARGEN_REACCION = 260;

// Pausas del gato dormido (se acortan con el tiempo)
const PAUSA_INICIAL = 1700;
const PAUSA_FINAL = 650;

// Duración de las fintas (se acortan con el tiempo)
const FINTA_INICIAL = 520;
const FINTA_FINAL = 260;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type Fase = "inicio" | "jugando" | "fin";
type EstadoGato = "dormido" | "ojo" | "amago" | "ataque" | "pillado" | "burla";
type MotivoFin = "tiempo" | "vidas" | null;

interface Aviso {
  texto: string;
  tono: "bien" | "mal";
  id: number;
}

interface Estado {
  fase: Fase;
  puntos: number;
  vidas: number;
  restante: number;
  gato: EstadoGato;
  objetivo: number | null;
  tiembla: boolean;
  cayendo: boolean[];
  aviso: Aviso | null;
  avisoId: number;
  motivoFin: MotivoFin;
}

type Accion =
  | { tipo: "INICIAR" }
  | { tipo: "TICK"; restante: number }
  | { tipo: "GATO"; gato: EstadoGato; objetivo: number | null; tiembla: boolean }
  | { tipo: "ACIERTO" }
  | { tipo: "FALLO_TOQUE" }
  | { tipo: "CAE"; objetivo: number }
  | { tipo: "REPONER"; objetivo: number }
  | { tipo: "LIMPIAR_AVISO"; id: number }
  | { tipo: "FIN"; motivo: Exclude<MotivoFin, null> };

// ---------------------------------------------------------------------------
// Reducer (máquina de estados del gato y de la partida)
// ---------------------------------------------------------------------------
function estadoInicial(): Estado {
  return {
    fase: "inicio",
    puntos: 0,
    vidas: VIDAS_INICIALES,
    restante: DURACION_MS,
    gato: "dormido",
    objetivo: null,
    tiembla: false,
    cayendo: OBJETOS.map(() => false),
    aviso: null,
    avisoId: 0,
    motivoFin: null,
  };
}

function quitarVida(s: Estado, texto: string): Estado {
  const vidas = s.vidas - 1;
  const avisoId = s.avisoId + 1;
  const base: Estado = {
    ...s,
    vidas,
    avisoId,
    aviso: { texto, tono: "mal", id: avisoId },
  };
  if (vidas <= 0) {
    return { ...base, vidas: 0, fase: "fin", motivoFin: "vidas" };
  }
  return base;
}

function reducir(s: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case "INICIAR":
      return { ...estadoInicial(), fase: "jugando", avisoId: s.avisoId };
    case "TICK":
      if (s.fase !== "jugando") return s;
      return { ...s, restante: a.restante };
    case "GATO":
      if (s.fase !== "jugando") return s;
      return { ...s, gato: a.gato, objetivo: a.objetivo, tiembla: a.tiembla };
    case "ACIERTO": {
      if (s.fase !== "jugando") return s;
      const avisoId = s.avisoId + 1;
      return {
        ...s,
        puntos: s.puntos + 1,
        gato: "pillado",
        objetivo: null,
        tiembla: false,
        avisoId,
        aviso: { texto: "¡Pillado! +1", tono: "bien", id: avisoId },
      };
    }
    case "FALLO_TOQUE":
      if (s.fase !== "jugando") return s;
      return quitarVida(s, "¡Te ha engañado!");
    case "CAE": {
      if (s.fase !== "jugando") return s;
      const cayendo = [...s.cayendo];
      cayendo[a.objetivo] = true;
      return quitarVida(
        { ...s, cayendo, gato: "burla", objetivo: null, tiembla: false },
        `¡Adiós, ${NOMBRES_OBJETOS[a.objetivo]}!`
      );
    }
    case "REPONER": {
      const cayendo = [...s.cayendo];
      cayendo[a.objetivo] = false;
      return { ...s, cayendo };
    }
    case "LIMPIAR_AVISO":
      if (!s.aviso || s.aviso.id !== a.id) return s;
      return { ...s, aviso: null };
    case "FIN":
      if (s.fase !== "jugando") return s;
      return {
        ...s,
        fase: "fin",
        motivoFin: a.motivo,
        restante: a.motivo === "tiempo" ? 0 : s.restante,
      };
    default:
      return s;
  }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function interpolar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function vibrar(patron: number | number[]): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(patron);
    } catch {
      // algunos navegadores lanzan si no hay interacción previa
    }
  }
}

function leerRecord(): number {
  if (typeof window === "undefined") return 0;
  try {
    const valor = Number.parseInt(window.localStorage.getItem(CLAVE_RECORD) ?? "0", 10);
    return Number.isFinite(valor) && valor > 0 ? valor : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function JuegoNoParpadeesConElGato() {
  const [estado, dispatch] = useReducer(reducir, undefined, estadoInicial);
  const [mejor, setMejor] = useState<number>(0);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Copia síncrona del estado para leerla dentro de los timers sin esperar al render
  const estadoRef = useRef<Estado>(estado);
  const gatoTimerRef = useRef<number | null>(null);
  const intervaloRef = useRef<number | null>(null);
  const reponerTimersRef = useRef<number[]>([]);
  const inicioRef = useRef<number>(0);
  const guardadoRef = useRef<boolean>(false);
  const siguienteRef = useRef<() => void>(() => undefined);

  // Despacha y actualiza la referencia en el mismo instante
  const enviar = useCallback((accion: Accion) => {
    estadoRef.current = reducir(estadoRef.current, accion);
    dispatch(accion);
  }, []);

  // Récord guardado al montar
  useEffect(() => {
    setMejor(leerRecord());
  }, []);

  const dificultad = useCallback((): number => {
    const transcurrido = performance.now() - inicioRef.current;
    return Math.min(1, Math.max(0, transcurrido / DURACION_MS));
  }, []);

  const programarGato = useCallback((fn: () => void, ms: number) => {
    if (gatoTimerRef.current !== null) window.clearTimeout(gatoTimerRef.current);
    gatoTimerRef.current = window.setTimeout(fn, ms);
  }, []);

  const pararTodo = useCallback(() => {
    if (gatoTimerRef.current !== null) {
      window.clearTimeout(gatoTimerRef.current);
      gatoTimerRef.current = null;
    }
    if (intervaloRef.current !== null) {
      window.clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
    reponerTimersRef.current.forEach((id) => window.clearTimeout(id));
    reponerTimersRef.current = [];
  }, []);

  const objetoAlAzar = useCallback((): number | null => {
    const libres = estadoRef.current.cayendo
      .map((cae, i) => (cae ? -1 : i))
      .filter((i) => i >= 0);
    if (libres.length === 0) return null;
    return libres[Math.floor(Math.random() * libres.length)];
  }, []);

  // El gato vuelve a "dormir" y espera un rato aleatorio
  const dormir = useCallback(() => {
    if (estadoRef.current.fase !== "jugando") return;
    enviar({ tipo: "GATO", gato: "dormido", objetivo: null, tiembla: false });
    const d = dificultad();
    const pausa = interpolar(PAUSA_INICIAL, PAUSA_FINAL, d) * (0.55 + Math.random() * 0.9);
    programarGato(() => siguienteRef.current(), pausa);
  }, [enviar, dificultad, programarGato]);

  // El objeto no se salvó: cae al suelo
  const escapado = useCallback(() => {
    const s = estadoRef.current;
    if (s.fase !== "jugando" || s.gato !== "ataque" || s.objetivo === null) return;
    const objetivo = s.objetivo;
    enviar({ tipo: "CAE", objetivo });
    vibrar([90, 50, 90]);
    const id = window.setTimeout(() => {
      enviar({ tipo: "REPONER", objetivo });
    }, 1100);
    reponerTimersRef.current.push(id);
    if (estadoRef.current.fase === "jugando") programarGato(dormir, 750);
  }, [enviar, programarGato, dormir]);

  // Siguiente movimiento: finta (ojo o amago) o ataque real
  const siguiente = useCallback(() => {
    if (estadoRef.current.fase !== "jugando") return;
    const d = dificultad();
    const probFinta = interpolar(0.28, 0.55, d);

    if (Math.random() < probFinta) {
      // Al principio casi todas las fintas son "abrir un ojo"; luego, amagos con la pata
      const esAmago = Math.random() < interpolar(0.35, 0.8, d);
      const objetivo = esAmago ? objetoAlAzar() : null;
      // Los amagos tardíos también hacen temblar el objeto: más engañosos
      const tiembla = objetivo !== null && Math.random() < interpolar(0, 0.45, d);
      enviar({
        tipo: "GATO",
        gato: objetivo !== null ? "amago" : "ojo",
        objetivo,
        tiembla,
      });
      const duracion = interpolar(FINTA_INICIAL, FINTA_FINAL, d) * (0.8 + Math.random() * 0.4);
      programarGato(dormir, duracion);
      return;
    }

    const objetivo = objetoAlAzar();
    if (objetivo === null) {
      dormir();
      return;
    }
    enviar({ tipo: "GATO", gato: "ataque", objetivo, tiembla: true });
    const ventana = interpolar(VENTANA_INICIAL, VENTANA_FINAL, d) + MARGEN_REACCION;
    programarGato(escapado, ventana);
  }, [dificultad, objetoAlAzar, enviar, programarGato, dormir, escapado]);

  useEffect(() => {
    siguienteRef.current = siguiente;
  }, [siguiente]);

  // Toque del jugador sobre el gato
  const tocar = useCallback(() => {
    const s = estadoRef.current;
    if (s.fase !== "jugando") return;
    if (s.gato === "ataque") {
      enviar({ tipo: "ACIERTO" });
      vibrar(25);
      programarGato(dormir, 480);
      return;
    }
    if (s.gato === "dormido" || s.gato === "ojo" || s.gato === "amago") {
      enviar({ tipo: "FALLO_TOQUE" });
      vibrar([120, 60, 120]);
    }
    // En "pillado" y "burla" se ignoran los toques
  }, [enviar, programarGato, dormir]);

  const iniciar = useCallback(() => {
    pararTodo();
    guardadoRef.current = false;
    setNuevoRecord(false);
    setShowLeaderboard(false);
    enviar({ tipo: "INICIAR" });
    inicioRef.current = performance.now();
    intervaloRef.current = window.setInterval(() => {
      const restante = Math.max(0, DURACION_MS - (performance.now() - inicioRef.current));
      enviar({ tipo: "TICK", restante });
      if (restante <= 0) enviar({ tipo: "FIN", motivo: "tiempo" });
    }, 100);
    // Primer respiro antes de que el gato empiece a moverse
    programarGato(() => siguienteRef.current(), 1400);
  }, [pararTodo, enviar, programarGato]);

  // Fin de partida: parar timers y guardar récord
  useEffect(() => {
    if (estado.fase !== "fin" || guardadoRef.current) return;
    guardadoRef.current = true;
    pararTodo();
    const puntos = estado.puntos;
    const previo = leerRecord();
    if (puntos > previo) {
      try {
        window.localStorage.setItem(CLAVE_RECORD, String(puntos));
      } catch {
        // almacenamiento no disponible (modo privado)
      }
      setMejor(puntos);
      setNuevoRecord(true);
    } else {
      setMejor(previo);
    }
  }, [estado.fase, estado.puntos, pararTodo]);

  // Borrar el aviso tras un momento
  useEffect(() => {
    if (!estado.aviso) return;
    const id = estado.aviso.id;
    const t = window.setTimeout(() => enviar({ tipo: "LIMPIAR_AVISO", id }), 700);
    return () => window.clearTimeout(t);
  }, [estado.aviso, enviar]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => pararTodo();
  }, [pararTodo]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const segundos = Math.ceil(estado.restante / 1000);
  const corazones = "❤️".repeat(estado.vidas) + "🖤".repeat(VIDAS_INICIALES - estado.vidas);

  const caraGato: Record<EstadoGato, string> = {
    dormido: "🐈",
    ojo: "🐈",
    amago: "😼",
    ataque: "😼",
    pillado: "🙀",
    burla: "😹",
  };

  const bocadillo: Record<EstadoGato, string> = {
    dormido: "💤",
    ojo: "👁️",
    amago: "",
    ataque: "",
    pillado: "❗",
    burla: "😏",
  };

  const anilloAviso =
    estado.aviso?.tono === "bien"
      ? "ring-4 ring-emerald-400"
      : estado.aviso?.tono === "mal"
        ? "ring-4 ring-rose-600"
        : "ring-0";

  const textoCompartir =
    estado.puntos > 0
      ? `He pillado ${estado.puntos} ${estado.puntos === 1 ? "vez" : "veces"} al gato intentando tirar cosas de la mesa 🐈☕ ¿Le aguantas tú la mirada?`
      : "El gato me ha tirado todo de la mesa 🐈💥 ¿A ti también te engaña?";

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 px-3 py-5 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <header className="flex items-center justify-between">
          <Link
            href="/juegos"
            className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Volver a todos los juegos"
          >
            ← Juegos
          </Link>
          <span className="rounded-full bg-black/20 px-3 py-1.5 text-sm font-semibold">
            🏅 Récord: {mejor}
          </span>
        </header>

        <div className="text-center">
          <h1 className="text-3xl font-black drop-shadow-sm sm:text-4xl">
            <span aria-hidden="true">🐈 </span>No le quites el ojo al gato
          </h1>
          <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
            El gato tira cosas de la mesa cuando no lo miras. Píllalo.
          </p>
        </div>

        {/* ------------------------- Pantalla inicial ------------------------- */}
        {estado.fase === "inicio" && (
          <section className="flex flex-col gap-4 rounded-3xl bg-white/15 p-5 shadow-xl backdrop-blur">
            <ul className="space-y-2 text-sm leading-relaxed sm:text-base">
              <li>
                <span aria-hidden="true">😼🐾 </span>Cuando el gato estire la pata y el objeto se tambalee,{" "}
                <strong>tócalo</strong>: +1 acierto.
              </li>
              <li>
                <span aria-hidden="true">👁️ </span>Si lo tocas mientras duerme o solo amaga, pierdes una vida.
              </li>
              <li>
                <span aria-hidden="true">💥 </span>Si algo cae al suelo, también pierdes una vida.
              </li>
              <li>
                <span aria-hidden="true">⏱️ </span>60 segundos y 3 vidas. Cada vez finge más rápido.
              </li>
            </ul>
            <button
              type="button"
              onClick={iniciar}
              className="w-full rounded-2xl bg-white py-4 text-lg font-black text-orange-600 shadow-lg transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
            >
              Empezar a vigilar
            </button>
          </section>
        )}

        {/* ------------------------- Partida en curso ------------------------- */}
        {estado.fase === "jugando" && (
          <section className="flex flex-col gap-3">
            <div className="grid grid-cols-3 items-center gap-2 text-center font-bold">
              <div className="rounded-2xl bg-black/20 py-2" aria-label={`Quedan ${segundos} segundos`}>
                ⏱️ {segundos}s
              </div>
              <div className="rounded-2xl bg-black/20 py-2" aria-live="polite" aria-label={`${estado.puntos} aciertos`}>
                🎯 {estado.puntos}
              </div>
              <div className="rounded-2xl bg-black/20 py-2" aria-label={`${estado.vidas} vidas restantes`}>
                {corazones}
              </div>
            </div>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                tocar();
              }}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  tocar();
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Tocar al gato para pillarlo"
              className={`relative h-[22rem] w-full touch-manipulation select-none overflow-hidden rounded-3xl bg-amber-50 text-left shadow-2xl transition-shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-white ${anilloAviso}`}
            >
              {/* Pared */}
              <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-orange-100 to-amber-100" aria-hidden="true" />

              {/* Gato */}
              <div className="absolute left-1/2 top-4 -translate-x-1/2 text-center" aria-hidden="true">
                <div className="relative">
                  <span
                    className={`block text-7xl transition-transform duration-150 sm:text-8xl ${
                      estado.gato === "ataque" || estado.gato === "amago" ? "scale-110" : "scale-100"
                    } ${estado.gato === "pillado" ? "-translate-y-2" : ""}`}
                  >
                    {caraGato[estado.gato]}
                  </span>
                  {bocadillo[estado.gato] && (
                    <span className="absolute -right-6 -top-2 rounded-full bg-white px-2 py-0.5 text-xl shadow">
                      {bocadillo[estado.gato]}
                    </span>
                  )}
                </div>
              </div>

              {/* Objetos sobre la mesa */}
              <div className="absolute inset-x-3 top-[9.5rem] grid grid-cols-4" aria-hidden="true">
                {OBJETOS.map((obj, i) => {
                  const esObjetivo = estado.objetivo === i;
                  const pata = esObjetivo && (estado.gato === "ataque" || estado.gato === "amago");
                  const tiembla = esObjetivo && estado.tiembla;
                  const cae = estado.cayendo[i];
                  let transform = "translateY(0) rotate(0deg)";
                  if (cae) transform = "translateY(120px) rotate(110deg)";
                  else if (tiembla) transform = "translateX(-5px) rotate(-14deg)";
                  return (
                    <div key={obj} className="relative flex h-20 items-end justify-center">
                      {pata && (
                        <span
                          className={`absolute left-1/2 top-0 -translate-x-1/2 text-3xl transition-transform duration-100 ${
                            estado.gato === "ataque" ? "translate-y-3" : "translate-y-0"
                          }`}
                        >
                          🐾
                        </span>
                      )}
                      <span
                        className="block text-4xl sm:text-5xl"
                        style={{
                          transform,
                          opacity: cae ? 0.25 : 1,
                          transition: cae
                            ? "transform 500ms cubic-bezier(.55,0,1,.45), opacity 900ms ease-in"
                            : "transform 120ms ease-out, opacity 250ms ease-out",
                        }}
                      >
                        {obj}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mesa */}
              <div className="absolute inset-x-2 top-[14.5rem] h-4 rounded-md bg-amber-800 shadow-md" aria-hidden="true" />
              <div className="absolute left-8 top-[15.5rem] h-16 w-3 bg-amber-900" aria-hidden="true" />
              <div className="absolute right-8 top-[15.5rem] h-16 w-3 bg-amber-900" aria-hidden="true" />

              {/* Suelo */}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-orange-200 to-orange-300" aria-hidden="true" />

              {/* Aviso */}
              {estado.aviso && (
                <div
                  key={estado.aviso.id}
                  role="status"
                  className={`absolute inset-x-0 bottom-14 mx-auto w-max rounded-full px-4 py-1.5 text-base font-black shadow-lg ${
                    estado.aviso.tono === "bien" ? "bg-emerald-500 text-white" : "bg-rose-600 text-white"
                  }`}
                >
                  {estado.aviso.texto}
                </div>
              )}
            </button>

            <p className="text-center text-sm font-semibold text-white/90">
              Toca al gato <strong>solo</strong> cuando empuje algo. No te fíes de sus amagos.
            </p>
          </section>
        )}

        {/* ------------------------- Fin de partida ------------------------- */}
        {estado.fase === "fin" && (
          <section className="flex flex-col items-center gap-4 rounded-3xl bg-white/15 p-5 text-center shadow-xl backdrop-blur">
            <div className="text-6xl" aria-hidden="true">
              {estado.motivoFin === "vidas" ? "😹" : "🙀"}
            </div>
            <p className="text-base font-semibold text-white/90">
              {estado.motivoFin === "vidas"
                ? "El gato ha ganado esta vez."
                : "¡Se acabó el tiempo! El gato se rinde… por ahora."}
            </p>
            <div>
              <p className="text-sm uppercase tracking-wide text-white/80">Tu puntuación</p>
              <p className="text-6xl font-black drop-shadow" aria-live="polite">
                {estado.puntos}
              </p>
              <p className="text-sm font-semibold text-white/90">aciertos</p>
            </div>
            <p className="rounded-full bg-black/20 px-4 py-1.5 text-sm font-bold">
              {nuevoRecord ? "🎉 ¡Nuevo récord!" : `🏅 Tu mejor récord: ${mejor} aciertos`}
            </p>

            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={iniciar}
                className="w-full rounded-2xl bg-white py-3.5 text-lg font-black text-orange-600 shadow-lg transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
              >
                Jugar otra vez
              </button>
              {estado.puntos > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full rounded-2xl bg-black/25 py-3 text-base font-bold text-white transition hover:bg-black/35 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                  aria-label="Ver ranking de No le quites el ojo al gato"
                >
                  🏆 Ver ranking
                </button>
              ) : (
                <p className="text-sm text-white/85">Pilla al gato al menos una vez para entrar en el ranking.</p>
              )}
            </div>

            <div className="w-full">
              <ShareButtons url={URL_JUEGO} text={textoCompartir} />
            </div>
          </section>
        )}
      </div>

      {showLeaderboard && estado.puntos > 0 && (
        <LeaderboardModal
          game={SLUG}
          score={estado.puntos}
          unit="aciertos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </main>
  );
}
