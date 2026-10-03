"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Nivel = 1 | 2 | 3;

interface Objeto {
  emoji: string;
  nombre: string; // con artículo y en minúscula salvo nombres propios
  pesoKg: number;
  dato: string;
  nivel: Nivel;
}

interface Pesa {
  kg: number;
  etiqueta: string;
  emoji: string;
}

type Fase = "inicio" | "jugando" | "fin";

interface Estado {
  fase: Fase;
  objetos: Objeto[];
  ronda: number;
  colocadas: number[]; // índices de PESAS colocadas en el plato
  revelado: boolean;
  puntos: number[];
  estimaciones: number[];
  tiempo: number;
}

type Accion =
  | { type: "EMPEZAR"; objetos: Objeto[] }
  | { type: "PONER"; indice: number }
  | { type: "QUITAR"; indice: number }
  | { type: "VACIAR" }
  | { type: "PESAR" }
  | { type: "SIGUIENTE" }
  | { type: "TICK" }
  | { type: "REINICIAR" };

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const SLUG = "cuanto-pesa-tu-intuicion";
const CLAVE_RECORD = "vl_cuanto-pesa-tu-intuicion_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/cuanto-pesa-tu-intuicion";
const DURACION = 60;
const RONDAS = 8;
const MAX_PESAS = 40;
const MEDIO_BRAZO = 112; // px, la mitad del ancho del brazo de la balanza

// Pesas en escala logarítmica: de 1 g a 1.000 t
const PESAS: Pesa[] = [
  { kg: 0.001, etiqueta: "1 g", emoji: "🪶" },
  { kg: 0.01, etiqueta: "10 g", emoji: "🔑" },
  { kg: 0.1, etiqueta: "100 g", emoji: "🍏" },
  { kg: 1, etiqueta: "1 kg", emoji: "🧱" },
  { kg: 10, etiqueta: "10 kg", emoji: "🏋️" },
  { kg: 100, etiqueta: "100 kg", emoji: "🛢️" },
  { kg: 1000, etiqueta: "1 t", emoji: "🪨" },
  { kg: 10000, etiqueta: "10 t", emoji: "🚛" },
  { kg: 100000, etiqueta: "100 t", emoji: "🚢" },
  { kg: 1000000, etiqueta: "1.000 t", emoji: "🏔️" },
];

// Nivel 1 = cotidiano, 2 = grande o curioso, 3 = absurdo
const OBJETOS: Objeto[] = [
  // Nivel 1
  { emoji: "📱", nombre: "un smartphone", pesoKg: 0.19, dato: "un móvil de gama alta pesa unos 190 g: más o menos lo mismo que una naranja grande.", nivel: 1 },
  { emoji: "🍉", nombre: "una sandía", pesoKg: 5, dato: "una sandía normal pesa unos 5 kg, y el 92 % de ese peso es agua.", nivel: 1 },
  { emoji: "🍌", nombre: "un plátano", pesoKg: 0.12, dato: "un plátano pesa unos 120 g, y la piel ya es más o menos un tercio.", nivel: 1 },
  { emoji: "🥚", nombre: "un huevo de gallina", pesoKg: 0.06, dato: "un huevo talla L pesa entre 63 y 73 g; uno normal ronda los 60 g.", nivel: 1 },
  { emoji: "💻", nombre: "un portátil", pesoKg: 1.8, dato: "un portátil normal pesa unos 1,8 kg; los primeros «portátiles» de los 80 pasaban de 10 kg.", nivel: 1 },
  { emoji: "🏀", nombre: "un balón de baloncesto", pesoKg: 0.62, dato: "el balón oficial de la NBA pesa unos 620 g.", nivel: 1 },
  { emoji: "🐔", nombre: "una gallina", pesoKg: 2.5, dato: "una gallina adulta pesa unos 2,5 kg, y pone casi un huevo diario.", nivel: 1 },
  { emoji: "🧸", nombre: "un osito de peluche", pesoKg: 0.3, dato: "un osito de peluche mediano pesa unos 300 g, casi todo relleno.", nivel: 1 },
  { emoji: "🪙", nombre: "una moneda de 1 €", pesoKg: 0.0075, dato: "una moneda de 1 € pesa 7,5 g: con 133 monedas ya tienes un kilo.", nivel: 1 },
  { emoji: "🍕", nombre: "una pizza familiar", pesoKg: 0.9, dato: "una pizza familiar ronda los 900 g, y el queso es buena parte.", nivel: 1 },
  { emoji: "🧠", nombre: "un cerebro humano", pesoKg: 1.4, dato: "el cerebro pesa unos 1,4 kg (el 2 % del cuerpo) y gasta el 20 % de la energía.", nivel: 1 },
  { emoji: "🐦", nombre: "un colibrí", pesoKg: 0.003, dato: "un colibrí pesa unos 3 g, menos que una moneda de 1 céntimo.", nivel: 1 },
  { emoji: "🎂", nombre: "una tarta de cumpleaños", pesoKg: 2, dato: "una tarta para 12 personas pesa unos 2 kg.", nivel: 1 },
  // Nivel 2
  { emoji: "🐘", nombre: "un elefante africano", pesoKg: 6000, dato: "un elefante africano pesa unas 6 toneladas, y solo su corazón pesa unos 20 kg.", nivel: 2 },
  { emoji: "🦒", nombre: "una jirafa", pesoKg: 1200, dato: "una jirafa pesa unos 1.200 kg, y solo la lengua mide 50 cm.", nivel: 2 },
  { emoji: "🐄", nombre: "una vaca", pesoKg: 650, dato: "una vaca lechera pesa unos 650 kg y bebe hasta 100 litros de agua al día.", nivel: 2 },
  { emoji: "🎹", nombre: "un piano de cola", pesoKg: 450, dato: "un piano de cola de concierto pesa unos 450 kg: hacen falta 4 personas para moverlo.", nivel: 2 },
  { emoji: "🚗", nombre: "un coche", pesoKg: 1300, dato: "un utilitario pesa unos 1.300 kg; los eléctricos pesan cientos de kilos más por la batería.", nivel: 2 },
  { emoji: "🦍", nombre: "un gorila", pesoKg: 160, dato: "un gorila macho pesa unos 160 kg y es unas 10 veces más fuerte que una persona.", nivel: 2 },
  { emoji: "🐧", nombre: "un pingüino emperador", pesoKg: 30, dato: "un pingüino emperador pesa unos 30 kg y puede bucear a más de 500 m.", nivel: 2 },
  { emoji: "🦈", nombre: "un tiburón blanco", pesoKg: 1100, dato: "un tiburón blanco pesa más de una tonelada: tanto como un coche.", nivel: 2 },
  { emoji: "🐱", nombre: "un gato dormido", pesoKg: 4.5, dato: "un gato pesa unos 4,5 kg… y dormido se nota más, porque se queda muerto en tus brazos.", nivel: 2 },
  { emoji: "🛁", nombre: "una bañera llena", pesoKg: 230, dato: "una bañera llena pesa unos 230 kg: 180 litros de agua más la propia bañera.", nivel: 2 },
  { emoji: "🎃", nombre: "la calabaza récord", pesoKg: 1247, dato: "la calabaza más grande del mundo (2023) pesó 1.247 kg, más que un coche.", nivel: 2 },
  { emoji: "🦖", nombre: "un Tyrannosaurus rex", pesoKg: 8000, dato: "un T-Rex adulto pesaba unas 8 toneladas, más que un elefante.", nivel: 2 },
  { emoji: "💎", nombre: "el diamante Cullinan", pesoKg: 0.621, dato: "el diamante en bruto más grande jamás hallado, el Cullinan, pesaba 621 g (3.106 quilates).", nivel: 2 },
  { emoji: "🐙", nombre: "un pulpo gigante", pesoKg: 15, dato: "un pulpo gigante del Pacífico pesa unos 15 kg… y tiene tres corazones.", nivel: 2 },
  { emoji: "🧍", nombre: "una persona adulta", pesoKg: 70, dato: "una persona de 70 kg lleva unos 42 litros de agua dentro.", nivel: 2 },
  // Nivel 3
  { emoji: "☁️", nombre: "una nube cúmulo", pesoKg: 500000, dato: "una nube cúmulo mediana pesa unas 500 toneladas de agua… y aun así flota.", nivel: 3 },
  { emoji: "🌕", nombre: "la Luna en miniatura (1:1.000.000)", pesoKg: 73500, dato: "una Luna a escala 1:1.000.000 mediría 3,5 m y pesaría 73,5 toneladas.", nivel: 3 },
  { emoji: "🌍", nombre: "la Tierra en miniatura (1:1.000 millones)", pesoKg: 0.006, dato: "una Tierra a escala 1:1.000 millones sería una canica de 1,3 cm y pesaría solo 6 g.", nivel: 3 },
  { emoji: "🌞", nombre: "el Sol en miniatura (1:1.000 millones)", pesoKg: 1990, dato: "un Sol a escala 1:1.000 millones mediría 1,4 m y pesaría casi 2 toneladas.", nivel: 3 },
  { emoji: "🐋", nombre: "una ballena azul", pesoKg: 150000, dato: "una ballena azul pesa unas 150 toneladas; solo la lengua pesa como un elefante.", nivel: 3 },
  { emoji: "✈️", nombre: "un Boeing 747 vacío", pesoKg: 180000, dato: "un Boeing 747 vacío pesa unas 180 toneladas, y puede despegar con más de 400.", nivel: 3 },
  { emoji: "🗽", nombre: "la Estatua de la Libertad", pesoKg: 204000, dato: "la Estatua de la Libertad pesa unas 204 toneladas, y su piel de cobre tiene solo 2,4 mm de grosor.", nivel: 3 },
  { emoji: "🗼", nombre: "la Torre Eiffel", pesoKg: 10100000, dato: "la Torre Eiffel pesa unas 10.100 toneladas, aunque el hierro solo son 7.300.", nivel: 3 },
  { emoji: "🌳", nombre: "la secuoya General Sherman", pesoKg: 1900000, dato: "la secuoya General Sherman, el árbol más grande del mundo, pesa unas 1.900 toneladas.", nivel: 3 },
  { emoji: "⚓", nombre: "el ancla del Titanic", pesoKg: 15750, dato: "el ancla principal del Titanic pesaba 15,75 toneladas: hicieron falta 20 caballos para moverla.", nivel: 3 },
  { emoji: "🔔", nombre: "la campana del Big Ben", pesoKg: 13700, dato: "la campana del Big Ben pesa 13,7 toneladas, y tiene una grieta desde 1859.", nivel: 3 },
  { emoji: "🦕", nombre: "un argentinosaurio", pesoKg: 70000, dato: "el argentinosaurio, uno de los dinosaurios más grandes, pesaba unas 70 toneladas.", nivel: 3 },
];

const ESTADO_INICIAL: Estado = {
  fase: "inicio",
  objetos: [],
  ronda: 0,
  colocadas: [],
  revelado: false,
  puntos: [],
  estimaciones: [],
  tiempo: DURACION,
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

// Generador pseudoaleatorio con semilla (para el reto del día)
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

function barajar<T>(lista: T[], rng: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// 3 cotidianos, 3 curiosos y 2 absurdos, en orden de rareza creciente
function elegirObjetos(retoDiario: boolean): Objeto[] {
  let rng: () => number = Math.random;
  if (retoDiario) {
    const hoy = new Date();
    const semilla = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
    rng = mulberry32(semilla);
  }
  const deNivel = (n: Nivel, cuantos: number): Objeto[] =>
    barajar(OBJETOS.filter((o) => o.nivel === n), rng).slice(0, cuantos);
  return [...deNivel(1, 3), ...deNivel(2, 3), ...deNivel(3, 2)].slice(0, RONDAS);
}

function sumaPesas(colocadas: number[]): number {
  return colocadas.reduce((total, i) => total + PESAS[i].kg, 0);
}

function puntuar(estimadoKg: number, realKg: number): number {
  if (estimadoKg <= 0) return 0;
  const error = Math.abs(Math.log10(estimadoKg / realKg));
  return Math.max(0, Math.round(100 - error * 50));
}

function formatearNumero(valor: number): string {
  const decimales = valor < 10 ? 2 : valor < 100 ? 1 : 0;
  return valor.toLocaleString("es-ES", { maximumFractionDigits: decimales });
}

function formatearPeso(kg: number): string {
  if (kg <= 0) return "0 g";
  if (kg < 1) return `${formatearNumero(kg * 1000)} g`;
  if (kg < 1000) return `${formatearNumero(kg)} kg`;
  return `${formatearNumero(kg / 1000)} t`;
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function mensajeRonda(puntos: number, estimado: number, real: number): string {
  if (puntos >= 90) return "🎯 ¡Clavado!";
  if (puntos >= 70) return "👏 ¡Muy cerca!";
  return estimado > real ? "📈 Te has pasado" : "📉 Te has quedado corto";
}

// ---------------------------------------------------------------------------
// Reducer (aplicado sobre useState)
// ---------------------------------------------------------------------------

function reducer(estado: Estado, accion: Accion): Estado {
  switch (accion.type) {
    case "EMPEZAR":
      return { ...ESTADO_INICIAL, fase: "jugando", objetos: accion.objetos };
    case "PONER":
      if (estado.fase !== "jugando" || estado.revelado || estado.colocadas.length >= MAX_PESAS) return estado;
      return { ...estado, colocadas: [...estado.colocadas, accion.indice] };
    case "QUITAR": {
      if (estado.fase !== "jugando" || estado.revelado) return estado;
      const pos = estado.colocadas.lastIndexOf(accion.indice);
      if (pos === -1) return estado;
      const colocadas = [...estado.colocadas];
      colocadas.splice(pos, 1);
      return { ...estado, colocadas };
    }
    case "VACIAR":
      if (estado.fase !== "jugando" || estado.revelado) return estado;
      return { ...estado, colocadas: [] };
    case "PESAR": {
      if (estado.fase !== "jugando" || estado.revelado || estado.colocadas.length === 0) return estado;
      const objeto = estado.objetos[estado.ronda];
      const estimado = sumaPesas(estado.colocadas);
      return {
        ...estado,
        revelado: true,
        puntos: [...estado.puntos, puntuar(estimado, objeto.pesoKg)],
        estimaciones: [...estado.estimaciones, estimado],
      };
    }
    case "SIGUIENTE":
      if (estado.fase !== "jugando" || !estado.revelado) return estado;
      if (estado.ronda + 1 >= estado.objetos.length) return { ...estado, fase: "fin" };
      return { ...estado, ronda: estado.ronda + 1, colocadas: [], revelado: false };
    case "TICK": {
      // El reloj se para mientras se muestra el resultado de la ronda
      if (estado.fase !== "jugando" || estado.revelado) return estado;
      const tiempo = estado.tiempo - 1;
      if (tiempo <= 0) return { ...estado, tiempo: 0, fase: "fin" };
      return { ...estado, tiempo };
    }
    case "REINICIAR":
      return ESTADO_INICIAL;
    default:
      return estado;
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function JuegoCuantoPesaTuIntuicion() {
  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);
  const [mejor, setMejor] = useState<number>(0);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [retoDiario, setRetoDiario] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const guardadoRef = useRef<boolean>(false);

  const dispatch = useCallback((accion: Accion) => {
    setEstado((prev) => reducer(prev, accion));
  }, []);

  const total = Math.max(1, Math.round(estado.puntos.reduce((a, b) => a + b, 0)));

  // Cargar el récord guardado
  useEffect(() => {
    try {
      const guardado = Number(window.localStorage.getItem(CLAVE_RECORD));
      if (Number.isFinite(guardado) && guardado > 0) setMejor(Math.round(guardado));
    } catch {
      // localStorage no disponible (modo privado, etc.)
    }
  }, []);

  // Temporizador global
  useEffect(() => {
    if (estado.fase !== "jugando") return;
    const id = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(id);
  }, [estado.fase, dispatch]);

  // Paso automático a la siguiente ronda tras pesar
  useEffect(() => {
    if (estado.fase !== "jugando" || !estado.revelado) return;
    const id = window.setTimeout(() => dispatch({ type: "SIGUIENTE" }), 3200);
    return () => window.clearTimeout(id);
  }, [estado.fase, estado.revelado, estado.ronda, dispatch]);

  // Guardar el récord al terminar
  useEffect(() => {
    if (estado.fase !== "fin" || guardadoRef.current) return;
    guardadoRef.current = true;
    try {
      const previo = Number(window.localStorage.getItem(CLAVE_RECORD)) || 0;
      if (total > previo) {
        window.localStorage.setItem(CLAVE_RECORD, String(total));
        setMejor(total);
        setNuevoRecord(true);
      } else {
        setMejor(previo);
      }
    } catch {
      setMejor((m) => Math.max(m, total));
    }
  }, [estado.fase, total]);

  const empezar = useCallback(() => {
    guardadoRef.current = false;
    setNuevoRecord(false);
    setShowLeaderboard(false);
    dispatch({ type: "EMPEZAR", objetos: elegirObjetos(retoDiario) });
  }, [dispatch, retoDiario]);

  // -------------------------------------------------------------------------
  // Datos derivados de la ronda actual
  // -------------------------------------------------------------------------

  const objeto: Objeto | undefined = estado.objetos[estado.ronda];
  const estimado = sumaPesas(estado.colocadas);
  const puntosRonda = estado.revelado ? estado.puntos[estado.ronda] ?? 0 : 0;

  let angulo = 0;
  if (estado.revelado && objeto && estimado > 0) {
    angulo = Math.max(-22, Math.min(22, Math.log10(estimado / objeto.pesoKg) * 14));
  }
  const duracionMs = Math.round(500 + Math.abs(angulo) * 45);
  const desplazamiento = Math.sin((angulo * Math.PI) / 180) * MEDIO_BRAZO;

  // Pesas agrupadas para el plato derecho
  const grupos = PESAS.map((pesa, indice) => ({
    pesa,
    indice,
    cantidad: estado.colocadas.filter((c) => c === indice).length,
  })).filter((g) => g.cantidad > 0);

  // Dato más sorprendente: la ronda en la que más fallaste
  let sorpresa: Objeto | undefined;
  let mayorError = -1;
  estado.estimaciones.forEach((est, i) => {
    const obj = estado.objetos[i];
    if (!obj || est <= 0) return;
    const error = Math.abs(Math.log10(est / obj.pesoKg));
    if (error > mayorError) {
      mayorError = error;
      sorpresa = obj;
    }
  });
  if (!sorpresa) {
    sorpresa = estado.objetos.find((o) => o.nivel === 3) ?? estado.objetos[0];
  }

  const textoCompartir = sorpresa
    ? `⚖️ He hecho ${total} puntos en «¿Cuánto pesa?». ${sorpresa.emoji} ¿Sabías que ${sorpresa.nombre} pesa ${formatearPeso(sorpresa.pesoKg)}? ¿Tienes mejor ojo que yo?`
    : `⚖️ He hecho ${total} puntos en «¿Cuánto pesa?». ¿Tienes mejor ojo que yo?`;

  const transicionPlato = `transform ${duracionMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-[3px] shadow-xl">
        <div className="rounded-[calc(1.5rem-3px)] bg-white/95 p-4 sm:p-6">
          {/* ---------------- INICIO ---------------- */}
          {estado.fase === "inicio" && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 text-6xl" aria-hidden="true">
                ⚖️
              </div>
              <h1 className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                ¿Cuánto pesa?
              </h1>
              <p className="mt-2 text-base text-stone-600">
                Equilibra la balanza a ojo antes de que se acabe el tiempo
              </p>

              <ul className="mt-5 space-y-2 text-left text-sm text-stone-700">
                <li>🐘 Aparece un objeto en un plato de la balanza.</li>
                <li>🧱 Toca las pesas para ponerlas en el otro plato.</li>
                <li>⚖️ Pulsa «Pesar» y mira hacia dónde se inclina.</li>
                <li>⏱️ 8 rondas en 60 segundos. Hasta 100 puntos por ronda.</li>
              </ul>

              <label className="mt-5 flex cursor-pointer select-none items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={retoDiario}
                  onChange={(e) => setRetoDiario(e.target.checked)}
                  className="h-4 w-4 accent-orange-500"
                />
                📅 Reto del día (los mismos objetos para todos)
              </label>

              {mejor > 0 && (
                <p className="mt-4 text-sm text-stone-500">
                  🏅 Tu récord: <strong className="text-stone-800">{mejor} puntos</strong>
                </p>
              )}

              <button
                type="button"
                onClick={empezar}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition active:scale-95 sm:w-auto"
              >
                Empezar a pesar
              </button>
            </div>
          )}

          {/* ---------------- JUGANDO ---------------- */}
          {estado.fase === "jugando" && objeto && (
            <div className="flex flex-col">
              {/* Marcador */}
              <div className="flex items-center justify-between text-sm font-semibold text-stone-700">
                <span>
                  Ronda {estado.ronda + 1}/{estado.objetos.length}
                </span>
                <span
                  className={estado.tiempo <= 10 ? "text-rose-600" : ""}
                  aria-label={`Quedan ${estado.tiempo} segundos`}
                >
                  ⏱️ {estado.tiempo}s
                </span>
                <span>{estado.puntos.reduce((a, b) => a + b, 0)} pts</span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-200"
                role="progressbar"
                aria-label="Tiempo restante"
                aria-valuemin={0}
                aria-valuemax={DURACION}
                aria-valuenow={estado.tiempo}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(estado.tiempo / DURACION) * 100}%` }}
                />
              </div>

              <h2 className="mt-4 text-center text-lg font-bold text-stone-800 sm:text-xl">
                ¿Cuánto pesa {objeto.nombre}?
              </h2>

              {/* Balanza */}
              <div className="relative mx-auto mt-2 h-60 w-72 select-none" aria-hidden="true">
                {/* Base y columna */}
                <div className="absolute bottom-0 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-stone-800" />
                <div className="absolute bottom-3 left-1/2 top-10 w-3 -translate-x-1/2 rounded bg-stone-700" />
                <div className="absolute left-1/2 top-8 z-20 h-5 w-5 -translate-x-1/2 rounded-full bg-amber-500 ring-4 ring-stone-800" />

                {/* Brazo */}
                <div
                  className="absolute left-8 top-10 z-10 h-2.5 rounded-full bg-stone-800"
                  style={{
                    width: MEDIO_BRAZO * 2,
                    transform: `rotate(${angulo}deg)`,
                    transformOrigin: "center",
                    transition: transicionPlato,
                  }}
                />

                {/* Plato izquierdo: el objeto */}
                <div
                  className="absolute left-8 top-11 flex flex-col items-center"
                  style={{ transform: `translate(-50%, ${-desplazamiento}px)`, transition: transicionPlato }}
                >
                  <div className="h-10 w-0.5 bg-stone-500" />
                  <div className="flex h-14 w-24 items-end justify-center text-5xl leading-none">{objeto.emoji}</div>
                  <div className="h-2 w-24 rounded-b-full bg-gradient-to-r from-amber-400 to-orange-500" />
                </div>

                {/* Plato derecho: las pesas */}
                <div
                  className="absolute top-11 flex flex-col items-center"
                  style={{
                    left: 32 + MEDIO_BRAZO * 2,
                    transform: `translate(-50%, ${desplazamiento}px)`,
                    transition: transicionPlato,
                  }}
                >
                  <div className="h-10 w-0.5 bg-stone-500" />
                  <div className="flex h-14 w-28 flex-wrap-reverse content-start items-end justify-center gap-0.5 overflow-hidden text-xl leading-none">
                    {grupos.length === 0 ? (
                      <span className="text-xs text-stone-400">vacío</span>
                    ) : (
                      grupos.map((g) => (
                        <span key={g.indice} className="flex items-end">
                          {g.pesa.emoji}
                          {g.cantidad > 1 && <span className="text-[10px] font-bold text-stone-600">×{g.cantidad}</span>}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="h-2 w-24 rounded-b-full bg-gradient-to-r from-orange-500 to-rose-500" />
                </div>
              </div>

              {/* Resumen de lo colocado (botones para quitar) */}
              <div className="mt-1 text-center">
                <p className="text-sm text-stone-600">
                  En tu plato: <strong className="text-stone-900">{formatearPeso(estimado)}</strong>
                </p>
                {grupos.length > 0 && !estado.revelado && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {grupos.map((g) => (
                      <button
                        key={g.indice}
                        type="button"
                        onClick={() => dispatch({ type: "QUITAR", indice: g.indice })}
                        aria-label={`Quitar una pesa de ${g.pesa.etiqueta} (tienes ${g.cantidad})`}
                        className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-rose-100 active:scale-95"
                      >
                        {g.pesa.emoji} {g.pesa.etiqueta} ×{g.cantidad} ✕
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Resultado de la ronda o controles */}
              {estado.revelado ? (
                <div
                  className="mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-4 text-center"
                  aria-live="polite"
                >
                  <p className="text-lg font-bold text-stone-800">
                    {mensajeRonda(puntosRonda, estimado, objeto.pesoKg)}{" "}
                    <span className="text-orange-600">+{puntosRonda}</span>
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    Peso real: <strong>{formatearPeso(objeto.pesoKg)}</strong> · Tú: {formatearPeso(estimado)}
                  </p>
                  <p className="mt-2 text-sm text-stone-600">💡 {capitalizar(objeto.dato)}</p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SIGUIENTE" })}
                    className="mt-3 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition active:scale-95"
                  >
                    {estado.ronda + 1 >= estado.objetos.length ? "Ver resultado" : "Siguiente ronda →"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-5 gap-2" role="group" aria-label="Pesas disponibles">
                    {PESAS.map((pesa, i) => (
                      <button
                        key={pesa.etiqueta}
                        type="button"
                        onClick={() => dispatch({ type: "PONER", indice: i })}
                        disabled={estado.colocadas.length >= MAX_PESAS}
                        aria-label={`Añadir pesa de ${pesa.etiqueta}`}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-orange-200 bg-white py-2 shadow-sm transition hover:border-orange-400 active:scale-90 disabled:opacity-40"
                      >
                        <span className="text-2xl leading-none" aria-hidden="true">
                          {pesa.emoji}
                        </span>
                        <span className="mt-1 text-[11px] font-semibold text-stone-700">{pesa.etiqueta}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "VACIAR" })}
                      disabled={estado.colocadas.length === 0}
                      aria-label="Vaciar el plato de pesas"
                      className="flex-1 rounded-2xl border-2 border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700 transition active:scale-95 disabled:opacity-40"
                    >
                      🗑️ Vaciar
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "PESAR" })}
                      disabled={estado.colocadas.length === 0}
                      aria-label="Pesar y comprobar el resultado"
                      className="flex-[2] rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-4 py-3 text-lg font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-40"
                    >
                      ⚖️ Pesar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---------------- FIN ---------------- */}
          {estado.fase === "fin" && (
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                {estado.tiempo <= 0 && estado.puntos.length < estado.objetos.length ? "⏰ ¡Se acabó el tiempo!" : "🏁 ¡Partida terminada!"}
              </p>
              <p className="mt-2 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-6xl font-extrabold text-transparent">
                {total}
              </p>
              <p className="text-lg font-semibold text-stone-700">puntos</p>

              {nuevoRecord ? (
                <p className="mt-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-bold text-amber-800">🎉 ¡Nuevo récord!</p>
              ) : (
                <p className="mt-2 text-sm text-stone-500">
                  🏅 Tu récord: <strong className="text-stone-800">{Math.max(mejor, total)} puntos</strong>
                </p>
              )}

              {sorpresa && (
                <div className="mt-5 w-full rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-600">🤯 El dato que más te ha sorprendido</p>
                  <p className="mt-2 text-4xl" aria-hidden="true">
                    {sorpresa.emoji}
                  </p>
                  <p className="mt-1 font-bold text-stone-800">
                    {capitalizar(sorpresa.nombre)}: {formatearPeso(sorpresa.pesoKg)}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{capitalizar(sorpresa.dato)}</p>
                </div>
              )}

              {/* Resumen de rondas */}
              <ul className="mt-4 w-full divide-y divide-stone-100 text-left text-sm" aria-label="Resumen de rondas">
                {estado.objetos.map((obj, i) => {
                  const est = estado.estimaciones[i];
                  const pts = estado.puntos[i];
                  return (
                    <li key={`${obj.nombre}-${i}`} className="flex items-center gap-2 py-2">
                      <span className="text-2xl" aria-hidden="true">
                        {obj.emoji}
                      </span>
                      <span className="flex-1">
                        <span className="block font-medium text-stone-800">{capitalizar(obj.nombre)}</span>
                        <span className="block text-xs text-stone-500">
                          Real {formatearPeso(obj.pesoKg)} · {est !== undefined ? `Tú ${formatearPeso(est)}` : "Sin pesar"}
                        </span>
                      </span>
                      <span className="font-bold text-orange-600">{pts !== undefined ? `+${pts}` : "—"}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={empezar}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-5 py-3 text-lg font-bold text-white shadow-lg transition active:scale-95"
                >
                  🔄 Jugar otra vez
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(true)}
                  aria-label="Ver ranking de puntuaciones"
                  className="flex-1 rounded-2xl bg-stone-900 px-5 py-3 text-lg font-bold text-white shadow-lg transition active:scale-95"
                >
                  🏆 Ver ranking
                </button>
              </div>

              <div className="mt-4 w-full">
                <ShareButtons url={URL_JUEGO} text={textoCompartir} />
              </div>

              <Link href="/juegos" className="mt-4 text-sm font-semibold text-orange-600 underline-offset-2 hover:underline">
                ← Más juegos
              </Link>
            </div>
          )}
        </div>
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game={SLUG}
          score={total}
          unit="puntos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
