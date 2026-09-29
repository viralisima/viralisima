"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------------------------------------------------------------------------
// Configuración general
// ---------------------------------------------------------------------------

const CLAVE_RECORD = "vl_mama-dice_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/mama-dice";
const DURACION_PARTIDA_MS = 60_000;
const VIDAS_INICIALES = 3;
const TIEMPO_INICIAL_MS = 2500;
const TIEMPO_MINIMO_MS = 700;
const FACTOR_ACELERACION = 0.92;
// Tiempo extra tras un fallo para que dé tiempo a leer el regaño
const RESPIRO_TRAS_FALLO_MS = 500;
// Evita que un doble toque accidental conteste a la orden siguiente
const BLOQUEO_TOQUE_MS = 120;

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Fase = "inicio" | "jugando" | "fin";
type RegionId = "es" | "mx" | "ar" | "co" | "cl";
type MotivoFin = "vidas" | "tiempo";

interface Region {
  id: RegionId;
  nombre: string;
  bandera: string;
  coletillas: string[];
  reganos: string[];
}

interface Objeto {
  emoji: string;
  nombre: string;
}

interface OrdenNueva {
  id: number;
  // true solo si la orden empieza exactamente por «Mamá dice:»
  conPrefijo: boolean;
  // «NO toques el …»
  negativa: boolean;
  // Texto delante de la orden («Mamá dice:», «Papá dice:», «» …)
  prefijo: string;
  objetivo: Objeto;
  botones: Objeto[];
  coletilla: string;
}

interface Orden extends OrdenNueva {
  duracion: number;
  desde: number;
}

interface Feedback {
  id: number;
  tipo: "bien" | "mal";
  texto: string;
}

interface Estado {
  fase: Fase;
  orden: Orden | null;
  vidas: number;
  aciertos: number;
  tiempoLimite: number;
  segundos: number;
  feedback: Feedback | null;
  motivoFin: MotivoFin | null;
}

type Accion =
  | { tipo: "INICIAR"; orden: OrdenNueva; ahora: number }
  | {
      tipo: "RESPONDER";
      ordenId: number;
      emoji: string | null;
      siguiente: OrdenNueva;
      ahora: number;
      regano: string;
    }
  | { tipo: "TICK"; segundos: number };

// ---------------------------------------------------------------------------
// Datos: objetos, trampas y frases de mamá por país
// ---------------------------------------------------------------------------

const OBJETOS: Objeto[] = [
  { emoji: "🍌", nombre: "plátano" },
  { emoji: "🧦", nombre: "calcetín" },
  { emoji: "🥦", nombre: "brócoli" },
  { emoji: "🍎", nombre: "manzana" },
  { emoji: "🧸", nombre: "osito de peluche" },
  { emoji: "📱", nombre: "móvil" },
  { emoji: "🍕", nombre: "pizza" },
  { emoji: "🧹", nombre: "escoba" },
  { emoji: "🥄", nombre: "cuchara" },
  { emoji: "🍪", nombre: "galleta" },
  { emoji: "👟", nombre: "zapatilla" },
  { emoji: "🥛", nombre: "vaso de leche" },
  { emoji: "🧽", nombre: "esponja" },
  { emoji: "🎮", nombre: "mando de la consola" },
];

// Prefijos trampa: nada de esto es «Mamá dice». Los vacíos se repiten para que salgan más.
const TRAMPAS: string[] = [
  "",
  "",
  "",
  "Papá dice:",
  "La abuela dice:",
  "Tu hermano dice:",
  "La vecina dice:",
  "Mamá diría:",
];

const REGIONES: Region[] = [
  {
    id: "es",
    nombre: "España",
    bandera: "🇪🇸",
    coletillas: [
      "¡Porque lo digo yo!",
      "¡Que no te lo repito!",
      "¡A la de tres!",
      "¡Venga, que es para hoy!",
      "¡Como tenga que ir yo…!",
    ],
    reganos: [
      "¡Te lo he dicho mil veces!",
      "¡Así no se hace, hijo!",
      "¡Cuando venga tu padre…!",
      "¡Ni caso me haces!",
    ],
  },
  {
    id: "mx",
    nombre: "México",
    bandera: "🇲🇽",
    coletillas: [
      "¡Porque lo digo yo!",
      "¡Ahorita, no mañana!",
      "¡Y no me estés haciendo caras!",
      "¡A la una, a las dos…!",
      "¡Ándale, mijo!",
    ],
    reganos: [
      "¡Ay, mijo, otra vez!",
      "¡Ya sabía yo!",
      "¡Te voy a dar tu chancla!",
      "¡No me estés contestando!",
    ],
  },
  {
    id: "ar",
    nombre: "Argentina",
    bandera: "🇦🇷",
    coletillas: [
      "¡Porque lo digo yo!",
      "¡Dale, que no tengo todo el día!",
      "¡No me hagas ir para allá!",
      "¡Ya, nene!",
      "¡Si lo busco yo y lo encuentro…!",
    ],
    reganos: [
      "¡No te puedo creer!",
      "¡Siempre lo mismo con vos!",
      "¡Qué cabeza la tuya!",
      "¡Andá a tu cuarto!",
    ],
  },
  {
    id: "co",
    nombre: "Colombia",
    bandera: "🇨🇴",
    coletillas: [
      "¡Porque lo digo yo!",
      "¡Hágale pues!",
      "¡Mijo, no me haga repetir!",
      "¡Ya mismo!",
      "¡Y no me conteste!",
    ],
    reganos: [
      "¡Ay, mijo, qué pena!",
      "¡Usted sí es mucho caso!",
      "¡Me va a sacar canas!",
      "¡Pilas, pues!",
    ],
  },
  {
    id: "cl",
    nombre: "Chile",
    bandera: "🇨🇱",
    coletillas: [
      "¡Porque lo digo yo!",
      "¡Ya po!",
      "¡No me hagai repetirlo!",
      "¡Al tiro!",
      "¡Mira que te estoy viendo!",
    ],
    reganos: [
      "¡Ya, pero pone atención!",
      "¡Te pasaste!",
      "¡Otra vez la misma cuestión!",
      "¡Pucha, oye!",
    ],
  },
];

const FRASES_ACIERTO: string[] = ["¡Muy bien!", "¡Eso es!", "¡Así me gusta!", "¡Perfecto!", "¡Qué obediente!"];

const ESTADO_INICIAL: Estado = {
  fase: "inicio",
  orden: null,
  vidas: VIDAS_INICIALES,
  aciertos: 0,
  tiempoLimite: TIEMPO_INICIAL_MS,
  segundos: DURACION_PARTIDA_MS / 1000,
  feedback: null,
  motivoFin: null,
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function elegir<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

function mezclar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function vibrar(patron: number | number[]): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(patron);
    } catch {
      // Algunos navegadores lo bloquean: no pasa nada
    }
  }
}

function leerRecord(): number {
  try {
    const valor = Number(window.localStorage.getItem(CLAVE_RECORD));
    return Number.isFinite(valor) && valor > 0 ? Math.floor(valor) : 0;
  } catch {
    return 0;
  }
}

function generarOrden(id: number, region: Region): OrdenNueva {
  const botones = mezclar(OBJETOS).slice(0, 4);
  const objetivo = elegir(botones);
  const conPrefijo = Math.random() < 0.55;
  const negativa = Math.random() < (conPrefijo ? 0.25 : 0.3);
  const prefijo = conPrefijo ? "Mamá dice:" : elegir(TRAMPAS);
  return { id, conPrefijo, negativa, prefijo, objetivo, botones, coletilla: elegir(region.coletillas) };
}

// emoji === null significa que se agotó el tiempo sin tocar nada
function evaluar(orden: OrdenNueva, emoji: string | null): boolean {
  if (!orden.conPrefijo) return emoji === null; // trampa: lo correcto es no hacer nada
  if (orden.negativa) return emoji !== orden.objetivo.emoji; // «NO toques»: vale cualquier cosa menos ese
  return emoji === orden.objetivo.emoji;
}

function explicarFallo(orden: OrdenNueva, emoji: string | null): string {
  if (!orden.conPrefijo) return "¡Trampa! No empezaba por «Mamá dice».";
  if (orden.negativa) return "¡Mamá dijo que NO!";
  if (emoji === null) return "¡Demasiado lento!";
  return `¡Era el ${orden.objetivo.emoji}!`;
}

function explicarAcierto(orden: OrdenNueva, emoji: string | null): string {
  if (emoji === null && !orden.conPrefijo) return "¡Bien! Eso no lo dijo mamá 😏";
  if (emoji === null && orden.negativa) return "¡Bien, ni lo tocaste!";
  return elegir(FRASES_ACIERTO);
}

function textoOrden(orden: OrdenNueva): string {
  const verbo = orden.negativa ? "NO toques el" : orden.prefijo ? "toca el" : "Toca el";
  return orden.prefijo ? `${orden.prefijo} ${verbo}` : verbo;
}

function rango(score: number): string {
  if (score === 0) return "Hijo rebelde 😈";
  if (score < 5) return "Aprendiz de obediente 🐣";
  if (score < 15) return "Hijo modelo 😇";
  if (score < 25) return "El favorito de mamá 💖";
  return "Leyenda de la casa 👑";
}

// ---------------------------------------------------------------------------
// Reducer (puro: todo lo aleatorio llega en la acción)
// ---------------------------------------------------------------------------

function reducir(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "INICIAR":
      return {
        ...ESTADO_INICIAL,
        fase: "jugando",
        orden: { ...accion.orden, duracion: TIEMPO_INICIAL_MS, desde: accion.ahora },
      };

    case "RESPONDER": {
      const { orden } = estado;
      if (estado.fase !== "jugando" || !orden || orden.id !== accion.ordenId) return estado;

      if (evaluar(orden, accion.emoji)) {
        const tiempoLimite = Math.max(TIEMPO_MINIMO_MS, Math.round(estado.tiempoLimite * FACTOR_ACELERACION));
        return {
          ...estado,
          aciertos: estado.aciertos + 1,
          tiempoLimite,
          orden: { ...accion.siguiente, duracion: tiempoLimite, desde: accion.ahora },
          feedback: { id: accion.ordenId, tipo: "bien", texto: explicarAcierto(orden, accion.emoji) },
        };
      }

      const vidas = estado.vidas - 1;
      const feedback: Feedback = {
        id: accion.ordenId,
        tipo: "mal",
        texto: `${explicarFallo(orden, accion.emoji)} ${accion.regano}`,
      };
      if (vidas <= 0) {
        return { ...estado, vidas: 0, fase: "fin", motivoFin: "vidas", feedback };
      }
      return {
        ...estado,
        vidas,
        orden: {
          ...accion.siguiente,
          duracion: estado.tiempoLimite + RESPIRO_TRAS_FALLO_MS,
          desde: accion.ahora,
        },
        feedback,
      };
    }

    case "TICK":
      if (estado.fase !== "jugando") return estado;
      if (accion.segundos <= 0) return { ...estado, segundos: 0, fase: "fin", motivoFin: "tiempo" };
      if (accion.segundos === estado.segundos) return estado;
      return { ...estado, segundos: accion.segundos };

    default:
      return estado;
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function JuegoMamaDice() {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);
  const [regionId, setRegionId] = useState<RegionId>("es");
  const [mejor, setMejor] = useState<number>(0);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const idRef = useRef<number>(0);
  const inicioRef = useRef<number>(0);
  const guardadoRef = useRef<boolean>(false);
  const barraRef = useRef<HTMLDivElement>(null);

  const region = REGIONES.find((r) => r.id === regionId) ?? REGIONES[0];
  const { orden, fase } = estado;

  const dispatch = useCallback((accion: Accion) => {
    setEstado((prev) => reducir(prev, accion));
  }, []);

  const nuevaOrden = useCallback((): OrdenNueva => {
    idRef.current += 1;
    return generarOrden(idRef.current, region);
  }, [region]);

  // Récord guardado en este dispositivo
  useEffect(() => {
    setMejor(leerRecord());
  }, []);

  const iniciar = useCallback(() => {
    guardadoRef.current = false;
    setNuevoRecord(false);
    setShowLeaderboard(false);
    inicioRef.current = performance.now();
    dispatch({ tipo: "INICIAR", orden: nuevaOrden(), ahora: performance.now() });
  }, [dispatch, nuevaOrden]);

  const responder = useCallback(
    (actual: Orden, emoji: string | null) => {
      if (!evaluar(actual, emoji)) vibrar([120, 60, 120]);
      dispatch({
        tipo: "RESPONDER",
        ordenId: actual.id,
        emoji,
        siguiente: nuevaOrden(),
        ahora: performance.now(),
        regano: elegir(region.reganos),
      });
    },
    [dispatch, nuevaOrden, region],
  );

  // Reloj global de 60 segundos
  useEffect(() => {
    if (fase !== "jugando") return;
    const intervalo = window.setInterval(() => {
      const restante = DURACION_PARTIDA_MS - (performance.now() - inicioRef.current);
      dispatch({ tipo: "TICK", segundos: Math.max(0, Math.ceil(restante / 1000)) });
    }, 200);
    return () => window.clearInterval(intervalo);
  }, [fase, dispatch]);

  // Tiempo de cada orden: si se agota, se evalúa como «no hacer nada»
  useEffect(() => {
    if (fase !== "jugando" || !orden) return;
    const temporizador = window.setTimeout(() => responder(orden, null), orden.duracion);
    return () => window.clearTimeout(temporizador);
  }, [fase, orden, responder]);

  // Barra de tiempo de la orden (animación CSS reiniciada a mano)
  useEffect(() => {
    const barra = barraRef.current;
    if (fase !== "jugando" || !orden || !barra) return;
    barra.style.transition = "none";
    barra.style.transform = "scaleX(1)";
    void barra.offsetWidth; // fuerza el reflow para reiniciar la transición
    barra.style.transition = `transform ${orden.duracion}ms linear`;
    barra.style.transform = "scaleX(0)";
  }, [fase, orden]);

  // Guardar récord al terminar
  useEffect(() => {
    if (fase !== "fin" || guardadoRef.current) return;
    guardadoRef.current = true;
    const score = estado.aciertos;
    const previo = leerRecord();
    if (score > 0 && score > previo) {
      setMejor(score);
      setNuevoRecord(true);
      try {
        window.localStorage.setItem(CLAVE_RECORD, String(score));
      } catch {
        // localStorage no disponible (modo privado, etc.)
      }
    } else {
      setMejor(previo);
    }
  }, [fase, estado.aciertos]);

  const tocar = (emoji: string) => {
    if (fase !== "jugando" || !orden) return;
    if (performance.now() - orden.desde < BLOQUEO_TOQUE_MS) return;
    responder(orden, emoji);
  };

  const score = estado.aciertos;
  const textoCompartir =
    score > 0
      ? `¡Obedecí a mamá ${score} veces en «Mamá Dice» 🧑‍🍳! ¿Y tú? Solo vale si lo dice mamá…`
      : "¿Eres capaz de obedecer a mamá? Juega a «Mamá Dice» 🧑‍🍳 ¡porque lo digo yo!";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-4">
        <header className="mb-4 flex items-center justify-between">
          <Link
            href="/juegos"
            className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold hover:bg-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
          >
            ← Más juegos
          </Link>
          <span className="text-sm font-semibold opacity-90">⏱️ 60 segundos</span>
        </header>

        {/* ------------------------------ INICIO ------------------------------ */}
        {fase === "inicio" && (
          <main className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-2 text-7xl" aria-hidden="true">
              🧑‍🍳
            </div>
            <h1 className="text-4xl font-black drop-shadow-sm">Mamá Dice</h1>
            <p className="mt-2 text-lg font-medium opacity-95">Obedece solo cuando lo dice mamá… ¡y rápido!</p>

            <ul className="mt-6 w-full space-y-2 rounded-3xl bg-white/15 p-4 text-left text-base backdrop-blur-sm">
              <li>
                ✅ Si empieza por <strong>«Mamá dice»</strong>, obedece.
              </li>
              <li>🙅 Si no empieza exactamente así, <strong>no toques nada</strong>.</li>
              <li>🚫 «Mamá dice: NO toques el 🥦» → ni se te ocurra tocarlo.</li>
              <li>❤️ Tienes 3 vidas y cada acierto va más rápido.</li>
            </ul>

            <fieldset className="mt-6 w-full">
              <legend className="mb-2 text-sm font-semibold opacity-90">¿De dónde es tu mamá?</legend>
              <div className="flex flex-wrap justify-center gap-2">
                {REGIONES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegionId(r.id)}
                    aria-pressed={regionId === r.id}
                    aria-label={`Frases de mamá de ${r.nombre}`}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 ${
                      regionId === r.id ? "bg-white text-rose-600 shadow" : "bg-white/15 hover:bg-white/25"
                    }`}
                  >
                    <span aria-hidden="true">{r.bandera}</span> {r.nombre}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={iniciar}
              className="mt-8 w-full rounded-full bg-white px-6 py-4 text-xl font-black text-rose-600 shadow-xl transition active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            >
              ¡Sí, mamá! Empezar
            </button>
            {mejor > 0 && (
              <p className="mt-3 text-sm opacity-90">
                Tu récord: <strong>{mejor}</strong> aciertos
              </p>
            )}
          </main>
        )}

        {/* ------------------------------ JUGANDO ------------------------------ */}
        {fase === "jugando" && orden && (
          <main className="flex flex-1 flex-col">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/15 px-4 py-2 text-lg font-bold backdrop-blur-sm">
              <span aria-label={`${estado.vidas} vidas`}>
                {"❤️".repeat(estado.vidas)}
                {"🤍".repeat(VIDAS_INICIALES - estado.vidas)}
              </span>
              <span aria-label={`${estado.aciertos} aciertos`}>✅ {estado.aciertos}</span>
              <span
                aria-label={`${estado.segundos} segundos restantes`}
                className={estado.segundos <= 10 ? "text-yellow-200" : ""}
              >
                ⏱️ {estado.segundos}s
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25" aria-hidden="true">
              <div ref={barraRef} className="h-full w-full origin-left rounded-full bg-yellow-300" />
            </div>

            <section
              className="mt-4 flex min-h-[9.5rem] flex-col items-center justify-center rounded-3xl bg-black/15 px-4 py-4 text-center"
              aria-live="assertive"
              aria-atomic="true"
            >
              <p key={orden.id} className="text-2xl font-extrabold leading-snug sm:text-3xl">
                {orden.prefijo && <span className="block">{orden.prefijo}</span>}
                <span>
                  {orden.negativa ? (
                    <>
                      <span className="rounded bg-white/25 px-1">NO</span> toques el
                    </>
                  ) : orden.prefijo ? (
                    "toca el"
                  ) : (
                    "Toca el"
                  )}{" "}
                  <span className="align-middle text-5xl" aria-hidden="true">
                    {orden.objetivo.emoji}
                  </span>
                </span>
                <span className="sr-only">
                  {textoOrden(orden)} {orden.objetivo.nombre}
                </span>
              </p>
              <p className="mt-1 text-sm italic opacity-85">{orden.coletilla}</p>
            </section>

            <div className="mt-2 flex h-8 items-center justify-center" aria-live="polite">
              {estado.feedback && (
                <p
                  key={estado.feedback.id}
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    estado.feedback.tipo === "bien" ? "bg-emerald-500/80" : "bg-black/35"
                  }`}
                >
                  {estado.feedback.texto}
                </p>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3 sm:gap-4">
              {orden.botones.map((b, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => tocar(b.emoji)}
                  aria-label={`Tocar ${b.nombre}`}
                  className="flex aspect-square select-none items-center justify-center rounded-3xl bg-white/90 text-6xl shadow-lg transition active:scale-95 active:bg-white touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 sm:text-7xl"
                >
                  <span aria-hidden="true">{b.emoji}</span>
                </button>
              ))}
            </div>
          </main>
        )}

        {/* ------------------------------ FIN ------------------------------ */}
        {fase === "fin" && (
          <main className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="text-6xl" aria-hidden="true">
              {estado.motivoFin === "vidas" ? "🥄" : "⏰"}
            </div>
            <h2 className="mt-2 text-2xl font-black">
              {estado.motivoFin === "vidas" ? "¡Castigado sin postre!" : "¡Se acabó el tiempo!"}
            </h2>
            {estado.feedback?.tipo === "mal" && estado.motivoFin === "vidas" && (
              <p className="mt-1 text-sm opacity-90">{estado.feedback.texto}</p>
            )}

            <div className="mt-6 w-full rounded-3xl bg-white/15 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Obedeciste a mamá</p>
              <p className="text-7xl font-black leading-none" aria-label={`${score} aciertos`}>
                {score}
              </p>
              <p className="mt-1 text-lg font-semibold">aciertos</p>
              <p className="mt-3 text-xl font-bold">{rango(score)}</p>
              {nuevoRecord ? (
                <p className="mt-3 rounded-full bg-yellow-300 px-3 py-1 font-black text-rose-700">🎉 ¡Nuevo récord!</p>
              ) : (
                <p className="mt-3 text-base opacity-95">
                  Mejor récord: <strong>{mejor}</strong> aciertos
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={iniciar}
              className="mt-6 w-full rounded-full bg-white px-6 py-4 text-xl font-black text-rose-600 shadow-xl transition active:scale-95 touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            >
              🔁 Jugar otra vez
            </button>

            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              disabled={score <= 0}
              aria-label={score > 0 ? "Ver ranking" : "Ver ranking (necesitas al menos un acierto)"}
              className="mt-3 w-full rounded-full bg-black/25 px-6 py-3 text-lg font-bold transition hover:bg-black/35 active:scale-95 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
            >
              🏆 Ver ranking
            </button>
            {score <= 0 && <p className="mt-1 text-xs opacity-85">Consigue al menos un acierto para entrar en el ranking.</p>}

            <div className="mt-6 w-full">
              <p className="mb-2 text-sm font-semibold opacity-90">Reta a tus primos:</p>
              <ShareButtons url={URL_JUEGO} text={textoCompartir} />
            </div>
          </main>
        )}
      </div>

      {showLeaderboard && score > 0 && (
        <LeaderboardModal
          game="mama-dice"
          score={score}
          unit="aciertos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
