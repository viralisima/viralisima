"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------- Tipos ----------
type Nivel = 1 | 2 | 3;

interface Refran {
  e: string; // emojis
  r: string; // refrán o expresión
  p: string; // país de origen o donde es más popular
  n: Nivel; // dificultad
}

interface Pregunta {
  refran: Refran;
  opciones: string[];
}

type Fase = "inicio" | "jugando" | "fin";
type Feedback = { tipo: "ok" | "fail"; elegida: string } | null;

// ---------- Constantes ----------
const SLUG = "refranes-en-emoji";
const BEST_KEY = "vl_refranes-en-emoji_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/refranes-en-emoji";
const DURACION_MS = 60_000;
const PENALIZACION_MS = 2_000;
const RACHA_X2 = 5;
const PAUSA_FEEDBACK_MS = 550;

// ---------- Banco de refranes ----------
const BANCO: Refran[] = [
  // Nivel 1: los más conocidos en todo el mundo hispano
  { e: "🐦✋➡️💯🐦✈️", r: "Más vale pájaro en mano que ciento volando", p: "España", n: 1 },
  { e: "🐕🗣️🚫🦷", r: "Perro que ladra no muerde", p: "España", n: 1 },
  { e: "🌅⏰🙏🤲", r: "A quien madruga, Dios le ayuda", p: "España", n: 1 },
  { e: "👀🚫💔🚫", r: "Ojos que no ven, corazón que no siente", p: "España", n: 1 },
  { e: "📅💯🤒🚫", r: "No hay mal que dure cien años", p: "México", n: 1 },
  { e: "🌙🐈🐈🐈🟤", r: "De noche todos los gatos son pardos", p: "España", n: 1 },
  { e: "🐒👗🧵🐒", r: "Aunque la mona se vista de seda, mona se queda", p: "España", n: 1 },
  { e: "🤐🚫🪰", r: "En boca cerrada no entran moscas", p: "España", n: 1 },
  { e: "🪵➡️🪵🔍", r: "De tal palo, tal astilla", p: "España", n: 1 },
  { e: "🐎🎁🚫👀🦷", r: "A caballo regalado no se le mira el diente", p: "España", n: 1 },
  { e: "⛈️➡️🌤️😌", r: "Después de la tormenta viene la calma", p: "España", n: 1 },
  { e: "🐈🚶🐭💃", r: "Cuando el gato no está, los ratones bailan", p: "España", n: 1 },
  { e: "👁️👁️🦷🦷", r: "Ojo por ojo, diente por diente", p: "España", n: 1 },
  { e: "🏞️🔊💧", r: "Cuando el río suena, agua lleva", p: "Colombia", n: 1 },
  { e: "🐢💤🦐🌊➡️", r: "Camarón que se duerme se lo lleva la corriente", p: "México", n: 1 },
  { e: "⏰⬆️👍🚫♾️", r: "Más vale tarde que nunca", p: "España", n: 1 },
  { e: "🔊🔊🥜", r: "Mucho ruido y pocas nueces", p: "España", n: 1 },
  { e: "🌧️😊", r: "Al mal tiempo, buena cara", p: "España", n: 1 },
  { e: "🚫🍞🍰👍", r: "A falta de pan, buenas son tortas", p: "España", n: 1 },
  { e: "🗣️➡️✅📏", r: "Del dicho al hecho hay mucho trecho", p: "España", n: 1 },
  { e: "2️⃣🐦1️⃣🔫", r: "Matar dos pájaros de un tiro", p: "España", n: 1 },
  { e: "🍞😋✅", r: "Ser pan comido", p: "España", n: 1 },
  { e: "🦶💥😬", r: "Meter la pata", p: "España", n: 1 },
  { e: "🏠🪟💸", r: "Tirar la casa por la ventana", p: "España", n: 1 },
  { e: "☁️☁️🧍", r: "Estar en las nubes", p: "España", n: 1 },
  { e: "🐐🤪", r: "Estar como una cabra", p: "España", n: 1 },
  { e: "🐈➡️🐇", r: "Dar gato por liebre", p: "España", n: 1 },
  { e: "💰👁️😬", r: "Costar un ojo de la cara", p: "España", n: 1 },
  { e: "🍽️😋❤️😊", r: "Barriga llena, corazón contento", p: "España", n: 1 },
  { e: "😔➡️😊", r: "No hay mal que por bien no venga", p: "México", n: 1 },
  { e: "🔋🔋💪", r: "Ponerse las pilas", p: "México", n: 1 },
  { e: "🚫🥇✨", r: "No es oro todo lo que reluce", p: "España", n: 1 },
  { e: "🛡️➡️💊", r: "Más vale prevenir que curar", p: "España", n: 1 },
  { e: "🐦☀️🚫", r: "Una golondrina no hace verano", p: "España", n: 1 },
  { e: "😂🔚🏆", r: "El que ríe último ríe mejor", p: "Argentina", n: 1 },
  { e: "🐺🧥🐑", r: "Lobo con piel de oveja", p: "España", n: 1 },
  { e: "🤔☠️🐈", r: "La curiosidad mató al gato", p: "España", n: 1 },
  { e: "🧱👂👂", r: "Las paredes oyen", p: "España", n: 1 },
  { e: "🏷️⬇️💸⬆️", r: "Lo barato sale caro", p: "España", n: 1 },
  { e: "😈👴🧠", r: "Más sabe el diablo por viejo que por diablo", p: "México", n: 1 },
  // Nivel 2: refranes clásicos que hay que pensar un poco
  { e: "💧🚫🥤➡️🏞️", r: "Agua que no has de beber, déjala correr", p: "México", n: 2 },
  { e: "🫔☁️🍃⬇️", r: "El que nace para tamal, del cielo le caen las hojas", p: "México", n: 2 },
  { e: "👗🐢⏰🏃", r: "Vísteme despacio que tengo prisa", p: "España", n: 2 },
  { e: "🥚🥚🥚1️⃣🧺🚫", r: "No pongas todos los huevos en la misma canasta", p: "Colombia", n: 2 },
  { e: "🍞🟰🍞🍷🟰🍷", r: "Al pan, pan y al vino, vino", p: "España", n: 2 },
  { e: "🖐️🖐️🖐️🍽️✏️", r: "Muchas manos en un plato hacen mucho garabato", p: "México", n: 2 },
  { e: "🏘️🤏🔥🔥", r: "Pueblo chico, infierno grande", p: "Argentina", n: 2 },
  { e: "🔍3️⃣🦶🐈", r: "Buscarle tres pies al gato", p: "España", n: 2 },
  { e: "🥛💧🏊😵", r: "Ahogarse en un vaso de agua", p: "España", n: 2 },
  { e: "🦶🦶🪨", r: "Andar con pies de plomo", p: "España", n: 2 },
  { e: "💅🥩🤝", r: "Ser uña y carne", p: "España", n: 2 },
  { e: "✋💇😂", r: "Tomar el pelo", p: "España", n: 2 },
  { e: "🪵🔥📈", r: "Echar leña al fuego", p: "España", n: 2 },
  { e: "👁️🍔🙈", r: "Hacer la vista gorda", p: "España", n: 2 },
  { e: "⚔️🧍🧱😰", r: "Estar entre la espada y la pared", p: "España", n: 2 },
  { e: "🐑⚫", r: "Ser la oveja negra", p: "España", n: 2 },
  { e: "🌳🌿🗣️🔀", r: "Irse por las ramas", p: "España", n: 2 },
  { e: "🙏🍐🌳", r: "Pedir peras al olmo", p: "España", n: 2 },
  { e: "🦅👶👁️👁️❌", r: "Cría cuervos y te sacarán los ojos", p: "España", n: 2 },
  { e: "🐑❤️🐑", r: "Cada oveja con su pareja", p: "España", n: 2 },
  { e: "🤪🎤📌", r: "Cada loco con su tema", p: "España", n: 2 },
  { e: "🚶🤝👤🔍🫵", r: "Dime con quién andas y te diré quién eres", p: "España", n: 2 },
  { e: "👘🚫🧑‍🦲", r: "El hábito no hace al monje", p: "España", n: 2 },
  { e: "🤗📦📦📦✊😩", r: "El que mucho abarca, poco aprieta", p: "España", n: 2 },
  { e: "🏠⚒️🔪🪵", r: "En casa de herrero, cuchillo de palo", p: "España", n: 2 },
  { e: "🐈🧤🚫🐭", r: "Gato con guantes no caza ratones", p: "España", n: 2 },
  { e: "🌿😈♾️", r: "Hierba mala nunca muere", p: "España", n: 2 },
  { e: "🙈🚫👀", r: "No hay peor ciego que el que no quiere ver", p: "España", n: 2 },
  { e: "🌱💨🌪️", r: "Quien siembra vientos recoge tempestades", p: "España", n: 2 },
  { e: "👅❤️📖🚫", r: "Sobre gustos no hay nada escrito", p: "España", n: 2 },
  { e: "📌➡️📌", r: "Un clavo saca otro clavo", p: "España", n: 2 },
  { e: "👞🧑‍🔧👞", r: "Zapatero a tus zapatos", p: "España", n: 2 },
  { e: "🌊🌀🎣💰", r: "A río revuelto, ganancia de pescadores", p: "España", n: 2 },
  { e: "🌟😴", r: "Cría fama y échate a dormir", p: "España", n: 2 },
  { e: "🔥➡️🌫️", r: "Donde hubo fuego, cenizas quedan", p: "México", n: 2 },
  { e: "🐟👄☠️", r: "El pez por la boca muere", p: "España", n: 2 },
  { e: "🙏🔚📉", r: "La esperanza es lo último que se pierde", p: "España", n: 2 },
  { e: "2️⃣➡️3️⃣", r: "No hay dos sin tres", p: "España", n: 2 },
  { e: "🛣️🛣️🛣️🏛️", r: "Todos los caminos llevan a Roma", p: "España", n: 2 },
  { e: "🧥👕🫵", r: "Al que le quede el saco, que se lo ponga", p: "México", n: 2 },
  { e: "🥤🏜️😎", r: "Creerse la última Coca-Cola del desierto", p: "Colombia", n: 2 },
  { e: "😈👋⬆️😇❓", r: "Más vale malo conocido que bueno por conocer", p: "España", n: 2 },
  { e: "⚰️🕳️🧍🥐", r: "El muerto al hoyo y el vivo al bollo", p: "España", n: 2 },
  { e: "🚶🏙️🪑❌", r: "Quien fue a Sevilla perdió su silla", p: "España", n: 2 },
  { e: "🍲💪🔥", r: "A darle que es mole de olla", p: "México", n: 2 },
  { e: "🐕🥪🥪😩", r: "Como el perro de las dos tortas", p: "México", n: 2 },
  { e: "🐺🚶🌙🗣️", r: "El que con lobos anda, a aullar se enseña", p: "México", n: 2 },
  { e: "🧑‍🦲☁️🛫", r: "Irse el santo al cielo", p: "España", n: 2 },
  { e: "🫁➡️❤️", r: "Hacer de tripas corazón", p: "España", n: 2 },
  { e: "🔪🐔🥚🥇", r: "Matar la gallina de los huevos de oro", p: "España", n: 2 },
  { e: "😭🍼", r: "El que no llora no mama", p: "Argentina", n: 2 },
  { e: "🌳🌀🚫📏", r: "Árbol que nace torcido jamás su tronco endereza", p: "México", n: 2 },
  { e: "😴🏆🌿", r: "Dormirse en los laureles", p: "España", n: 2 },
  { e: "🗣️🤪👂🚫", r: "A palabras necias, oídos sordos", p: "España", n: 2 },
  { e: "👕🧼🏠", r: "La ropa sucia se lava en casa", p: "España", n: 2 },
  { e: "🎲🚫🏆🚫", r: "Quien no arriesga no gana", p: "Argentina", n: 2 },
  { e: "⏰⏰🌅🚫", r: "No por mucho madrugar amanece más temprano", p: "España", n: 2 },
  { e: "💰💰💰👜💥", r: "La avaricia rompe el saco", p: "España", n: 2 },
  { e: "🐕🦴🦟🦟", r: "A perro flaco todo son pulgas", p: "España", n: 2 },
  { e: "🧠👂🗣️🤏", r: "A buen entendedor, pocas palabras bastan", p: "España", n: 2 },
  // Nivel 3: dichos y expresiones muy locales de cada país
  { e: "🌵🍈👀", r: "Al nopal lo van a ver sólo cuando tiene tunas", p: "México", n: 3 },
  { e: "🦜💚🌍", r: "El que es perico donde quiera es verde", p: "México", n: 3 },
  { e: "🕯️🔥🧑‍🦲🚫", r: "Ni tanto que queme al santo, ni tanto que no lo alumbre", p: "México", n: 3 },
  { e: "🐓🎶❓", r: "Otro gallo cantaría", p: "España", n: 3 },
  { e: "🐷🪵📍", r: "Cada chancho a su estaca", p: "Chile", n: 3 },
  { e: "🙅🤝👍", r: "Mucho ayuda el que no estorba", p: "México", n: 3 },
  { e: "⛪🎉📅", r: "A cada capillita le llega su fiestecita", p: "México", n: 3 },
  { e: "🍳🗣️🍲", r: "El comal le dijo a la olla", p: "México", n: 3 },
  { e: "🤝🐦✈️", r: "Dando y dando, pajarito volando", p: "México", n: 3 },
  { e: "🖐️🖐️😩", r: "Estar hasta las manos", p: "Argentina", n: 3 },
  { e: "🥩🥩➡️", r: "Ir a los bifes", p: "Argentina", n: 3 },
  { e: "🍫📰🙄", r: "Chocolate por la noticia", p: "Argentina", n: 3 },
  { e: "🚫🥭💸", r: "No tener un mango", p: "Argentina", n: 3 },
  { e: "🥊🛏️😵", r: "Estar en la lona", p: "Argentina", n: 3 },
  { e: "🔥🍞😰", r: "Estar al horno", p: "Argentina", n: 3 },
  { e: "🧀🕺", r: "Ser un queso", p: "Argentina", n: 3 },
  { e: "🐄💰🤝", r: "Hacer la vaca", p: "Colombia", n: 3 },
  { e: "🍈🎯😬", r: "Dar papaya", p: "Colombia", n: 3 },
  { e: "😍🍽️💘", r: "Estar tragado", p: "Colombia", n: 3 },
  { e: "🪨😡💢", r: "Sacar la piedra", p: "Colombia", n: 3 },
  { e: "👁️🔍👀", r: "Pelar el ojo", p: "Colombia", n: 3 },
  { e: "🪵🐔💩", r: "Quedar como palo de gallinero", p: "Colombia", n: 3 },
  { e: "🚫🍹🚫🍋", r: "Ni chicha ni limonada", p: "Chile", n: 3 },
  { e: "🍲😒☕☕", r: "Al que no le gusta el caldo, le dan dos tazas", p: "Chile", n: 3 },
  { e: "✈️🧭❓", r: "Más perdido que el Teniente Bello", p: "Chile", n: 3 },
  { e: "🦆💸🚫", r: "Estar pato", p: "Chile", n: 3 },
  { e: "🐒🍺😵", r: "Andar con la mona", p: "Chile", n: 3 },
  { e: "🧨🤏😡", r: "Tener la mecha corta", p: "Perú", n: 3 },
  { e: "🥔😎💰", r: "Estar en la papa", p: "Perú", n: 3 },
  { e: "🌶️😡", r: "Estar hecho un ají", p: "Perú", n: 3 },
  { e: "🔊🥓🚫", r: "No hay que buscarle ruido al chicharrón", p: "México", n: 3 },
  { e: "🙏✊🚫🌊", r: "Dios aprieta pero no ahoga", p: "México", n: 3 },
  { e: "🗣️💎🫵❌", r: "Dime de qué presumes y te diré de qué careces", p: "España", n: 3 },
  { e: "👁️🌾👤", r: "Ver la paja en el ojo ajeno", p: "España", n: 3 },
  { e: "🏠🔼🧱", r: "Empezar la casa por el tejado", p: "España", n: 3 },
  { e: "👨‍🏫📘", r: "Cada maestrillo tiene su librillo", p: "España", n: 3 },
  { e: "👄❌🤷", r: "Quien tiene boca se equivoca", p: "España", n: 3 },
  { e: "🧥🔥😂👥", r: "Ande yo caliente y ríase la gente", p: "España", n: 3 },
  { e: "🚫🗣️💧🚫🥤", r: "Nunca digas de esta agua no beberé", p: "España", n: 3 },
  { e: "🏛️🚫1️⃣📅", r: "Roma no se hizo en un día", p: "España", n: 3 },
];

// ---------- Utilidades ----------

// Generador pseudoaleatorio con semilla (mulberry32) para barajar igual dentro de una partida
function crearRng(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
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

function contarPalabras(texto: string): number {
  return texto.trim().split(/\s+/).length;
}

// Cola de refranes ordenada por dificultad creciente (barajada dentro de cada nivel)
function crearCola(rng: () => number): Refran[] {
  const niveles: Nivel[] = [1, 2, 3];
  return niveles.flatMap((n) => barajar(BANCO.filter((x) => x.n === n), rng));
}

// Distractores: refranes de longitud parecida (en palabras) al correcto
function elegirDistractores(correcto: Refran, rng: () => number): string[] {
  const objetivo = contarPalabras(correcto.r);
  const candidatos = BANCO.filter((x) => x.r !== correcto.r)
    .map((x) => ({ r: x.r, d: Math.abs(contarPalabras(x.r) - objetivo) + rng() * 0.9 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 12)
    .map((x) => x.r);
  return barajar(candidatos, rng).slice(0, 3);
}

function construirPregunta(refran: Refran, rng: () => number): Pregunta {
  const opciones = barajar([refran.r, ...elegirDistractores(refran, rng)], rng);
  return { refran, opciones };
}

function leerRecord(): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(BEST_KEY);
  const n = v ? parseInt(v, 10) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatearTiempo(ms: number): string {
  const s = Math.max(0, ms) / 1000;
  return s.toFixed(1);
}

// Piezas de confeti (posición y color fijos por pieza)
const COLORES_CONFETI = ["#fbbf24", "#f97316", "#f43f5e", "#ffffff", "#fde68a", "#fb7185"];
const PIEZAS_CONFETI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  delay: (i % 7) * 0.06,
  duracion: 1.1 + ((i * 13) % 6) * 0.12,
  color: COLORES_CONFETI[i % COLORES_CONFETI.length],
  rot: (i * 53) % 360,
}));

// ---------- Componente ----------
export default function JuegoRefranesEnEmoji() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [pregunta, setPregunta] = useState<Pregunta | null>(null);
  const [aciertos, setAciertos] = useState(0); // puntos (con bonus de racha)
  const [numAciertos, setNumAciertos] = useState(0); // aciertos sin bonus
  const [fallos, setFallos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(DURACION_MS);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [sacudir, setSacudir] = useState(false);
  const [confetiKey, setConfetiKey] = useState(0);
  const [ultimoFallado, setUltimoFallado] = useState<Refran | null>(null);
  const [record, setRecord] = useState(0);
  const [esNuevoRecord, setEsNuevoRecord] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Refs para el bucle del temporizador (evitan closures obsoletas)
  const finEnRef = useRef<number>(0);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colaRef = useRef<Refran[]>([]);
  const indiceRef = useRef(0);
  const rngRef = useRef<() => number>(() => Math.random());
  const bloqueadoRef = useRef(false);
  const rachaRef = useRef(0);
  const aciertosRef = useRef(0);
  const mejorRachaRef = useRef(0);
  const faseRef = useRef<Fase>("inicio");

  useEffect(() => {
    setRecord(leerRecord());
  }, []);

  useEffect(() => {
    faseRef.current = fase;
  }, [fase]);

  const limpiarTemporizadores = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => limpiarTemporizadores(), [limpiarTemporizadores]);

  const siguientePregunta = useCallback(() => {
    if (indiceRef.current >= colaRef.current.length) {
      // Si se agota el banco (muy improbable en 60 s), volvemos a barajar todo
      colaRef.current = barajar(BANCO, rngRef.current);
      indiceRef.current = 0;
    }
    const refran = colaRef.current[indiceRef.current];
    indiceRef.current += 1;
    setPregunta(construirPregunta(refran, rngRef.current));
    setFeedback(null);
    bloqueadoRef.current = false;
  }, []);

  const terminar = useCallback(() => {
    if (faseRef.current === "fin") return;
    limpiarTemporizadores();
    bloqueadoRef.current = true;
    const final = aciertosRef.current;
    const previo = leerRecord();
    if (final > previo) {
      window.localStorage.setItem(BEST_KEY, String(final));
      setRecord(final);
      setEsNuevoRecord(final > 0);
    } else {
      setRecord(previo);
      setEsNuevoRecord(false);
    }
    setTiempoRestante(0);
    setFase("fin");
  }, [limpiarTemporizadores]);

  const empezar = useCallback(() => {
    limpiarTemporizadores();
    const semilla = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    rngRef.current = crearRng(semilla);
    colaRef.current = crearCola(rngRef.current);
    indiceRef.current = 0;
    rachaRef.current = 0;
    aciertosRef.current = 0;
    mejorRachaRef.current = 0;
    setAciertos(0);
    setNumAciertos(0);
    setFallos(0);
    setRacha(0);
    setMejorRacha(0);
    setUltimoFallado(null);
    setEsNuevoRecord(false);
    setShowLeaderboard(false);
    setFeedback(null);
    setSacudir(false);
    setTiempoRestante(DURACION_MS);
    finEnRef.current = Date.now() + DURACION_MS;
    setFase("jugando");
    siguientePregunta();

    // Temporizador basado en Date.now() para que no derive en móvil
    intervaloRef.current = setInterval(() => {
      const resto = finEnRef.current - Date.now();
      if (resto <= 0) {
        setTiempoRestante(0);
        terminar();
      } else {
        setTiempoRestante(resto);
      }
    }, 100);
  }, [limpiarTemporizadores, siguientePregunta, terminar]);

  const responder = useCallback(
    (opcion: string) => {
      if (bloqueadoRef.current || !pregunta || faseRef.current !== "jugando") return;
      bloqueadoRef.current = true;
      const correcta = opcion === pregunta.refran.r;

      if (correcta) {
        const nuevaRacha = rachaRef.current + 1;
        rachaRef.current = nuevaRacha;
        const puntos = nuevaRacha >= RACHA_X2 ? 2 : 1;
        aciertosRef.current += puntos;
        if (nuevaRacha > mejorRachaRef.current) mejorRachaRef.current = nuevaRacha;
        setRacha(nuevaRacha);
        setMejorRacha(mejorRachaRef.current);
        setAciertos(aciertosRef.current);
        setNumAciertos((n) => n + 1);
        setFeedback({ tipo: "ok", elegida: opcion });
        if (nuevaRacha >= RACHA_X2 && nuevaRacha % RACHA_X2 === 0) {
          setConfetiKey((k) => k + 1);
        }
      } else {
        rachaRef.current = 0;
        setRacha(0);
        setFallos((f) => f + 1);
        setUltimoFallado(pregunta.refran);
        setFeedback({ tipo: "fail", elegida: opcion });
        setSacudir(true);
        finEnRef.current -= PENALIZACION_MS;
        const resto = finEnRef.current - Date.now();
        setTiempoRestante(Math.max(0, resto));
        if (resto <= 0) {
          terminar();
          return;
        }
      }

      timeoutRef.current = setTimeout(() => {
        setSacudir(false);
        if (faseRef.current === "jugando") siguientePregunta();
      }, PAUSA_FEEDBACK_MS);
    },
    [pregunta, siguientePregunta, terminar]
  );

  const porcentajeTiempo = Math.max(0, Math.min(100, (tiempoRestante / DURACION_MS) * 100));
  const multiplicadorActivo = racha >= RACHA_X2;
  const textoCompartir = `🧉 He sacado ${aciertos} aciertos en Refranes en Emoji con una racha de ${mejorRacha}${
    ultimoFallado ? ` (me pilló «${ultimoFallado.r}»)` : ""
  }. ¿Cuántos dichos entiendes tú?`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center p-4 text-white select-none">
      <style>{`
        @keyframes vl-sacudida {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .vl-sacudir { animation: vl-sacudida 0.4s ease-in-out; }
        @keyframes vl-confeti-caer {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .vl-confeti {
          position: fixed; top: 0; width: 10px; height: 16px; border-radius: 2px;
          animation-name: vl-confeti-caer; animation-timing-function: ease-in;
          animation-fill-mode: forwards; pointer-events: none; z-index: 40;
        }
        @keyframes vl-aparecer {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .vl-aparecer { animation: vl-aparecer 0.25s ease-out; }
      `}</style>

      {confetiKey > 0 && (
        <div key={confetiKey} aria-hidden="true">
          {PIEZAS_CONFETI.map((p) => (
            <span
              key={p.id}
              className="vl-confeti"
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duracion}s`,
                transform: `rotate(${p.rot}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-5 sm:p-6 ring-1 ring-white/20">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/juegos" className="text-sm text-white/80 hover:text-white underline-offset-2 hover:underline">
            ← Más juegos
          </Link>
          <span className="text-xs text-white/70">🏅 Récord: {record}</span>
        </div>

        {/* Pantalla de inicio */}
        {fase === "inicio" && (
          <div className="text-center vl-aparecer">
            <div className="text-6xl mb-2" aria-hidden="true">🧉</div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Refranes en Emoji</h1>
            <p className="text-white/90 mb-5">
              Adivina el dicho escondido detrás de tres emojis antes de que se acabe el tiempo.
            </p>
            <div className="bg-black/20 rounded-2xl p-4 text-left text-sm space-y-2 mb-6">
              <p>⏱️ Tienes <strong>60 segundos</strong>.</p>
              <p>✅ Cada acierto suma <strong>+1</strong> y encadena racha.</p>
              <p>🔥 A partir de <strong>5 seguidos</strong>, cada acierto vale <strong>x2</strong>.</p>
              <p>❌ Cada fallo te quita <strong>2 segundos</strong> del reloj.</p>
              <p>🌎 Dichos de España, México, Argentina, Colombia, Chile y Perú, cada vez más difíciles.</p>
            </div>
            <div className="text-4xl mb-5 tracking-wider" aria-hidden="true">🐦✋ ➡️ 💯🐦✈️</div>
            <button
              type="button"
              onClick={empezar}
              className="w-full py-4 rounded-2xl bg-white text-rose-600 font-bold text-lg shadow-lg active:scale-95 transition touch-manipulation"
              aria-label="Empezar a jugar"
            >
              ▶️ Empezar
            </button>
          </div>
        )}

        {/* Pantalla de juego */}
        {fase === "jugando" && pregunta && (
          <div className={sacudir ? "vl-sacudir" : ""}>
            {/* Marcadores */}
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-black/25 rounded-full px-3 py-1 font-semibold" aria-label={`${aciertos} aciertos`}>
                  ✅ {aciertos}
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    multiplicadorActivo ? "bg-yellow-300 text-rose-700" : "bg-black/25"
                  }`}
                  aria-label={`Racha de ${racha}`}
                >
                  🔥 {racha}
                  {multiplicadorActivo && <span className="ml-1">x2</span>}
                </span>
              </div>
              <span
                className={`font-mono font-bold text-lg tabular-nums ${tiempoRestante < 10_000 ? "text-yellow-200" : ""}`}
                aria-live="polite"
                aria-label={`Quedan ${formatearTiempo(tiempoRestante)} segundos`}
              >
                ⏱️ {formatearTiempo(tiempoRestante)}
              </span>
            </div>

            {/* Barra de tiempo */}
            <div className="h-2 w-full bg-black/25 rounded-full overflow-hidden mb-5" aria-hidden="true">
              <div
                className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
                  tiempoRestante < 10_000 ? "bg-yellow-300" : "bg-white"
                }`}
                style={{ width: `${porcentajeTiempo}%` }}
              />
            </div>

            {/* Emojis */}
            <div
              key={pregunta.refran.r}
              className="vl-aparecer bg-white/95 text-gray-900 rounded-3xl py-6 px-4 text-center shadow-lg mb-4"
            >
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">¿Qué refrán es?</p>
              <p className="text-4xl sm:text-5xl leading-snug tracking-wide break-words" role="img" aria-label="Emojis del refrán">
                {pregunta.refran.e}
              </p>
              <p className="text-xs text-gray-500 mt-3 h-4">
                {feedback ? `🌎 ${pregunta.refran.p}` : `Nivel ${pregunta.refran.n} · ${numAciertos + fallos + 1}ª pregunta`}
              </p>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-1 gap-3" role="group" aria-label="Opciones de respuesta">
              {pregunta.opciones.map((op) => {
                const esCorrecta = op === pregunta.refran.r;
                const esElegida = feedback?.elegida === op;
                let clases = "bg-white/90 text-gray-900 hover:bg-white";
                if (feedback) {
                  if (esCorrecta) clases = "bg-emerald-500 text-white ring-2 ring-white";
                  else if (esElegida) clases = "bg-rose-700 text-white line-through";
                  else clases = "bg-white/40 text-gray-700";
                }
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => responder(op)}
                    disabled={feedback !== null}
                    className={`w-full min-h-[56px] px-4 py-3 rounded-2xl font-semibold text-sm sm:text-base text-left shadow active:scale-[0.98] transition touch-manipulation disabled:cursor-default ${clases}`}
                    aria-label={`Responder: ${op}`}
                  >
                    {op}
                  </button>
                );
              })}
            </div>

            <p className="text-center text-xs text-white/70 mt-4" aria-live="polite">
              {feedback?.tipo === "ok" && (multiplicadorActivo ? "¡Acierto x2! 🔥" : "¡Acierto! ✅")}
              {feedback?.tipo === "fail" && "Fallo: −2 segundos ⏱️"}
              {!feedback && "Toca el refrán correcto"}
            </p>
          </div>
        )}

        {/* Pantalla final */}
        {fase === "fin" && (
          <div className="text-center vl-aparecer">
            <div className="text-5xl mb-2" aria-hidden="true">{aciertos >= 20 ? "🏆" : aciertos >= 10 ? "🎉" : "🧉"}</div>
            <h2 className="text-2xl font-extrabold mb-1">¡Tiempo!</h2>
            <p className="text-white/80 text-sm mb-4">
              {aciertos >= 20
                ? "Eres la abuela de todos los refranes."
                : aciertos >= 10
                ? "Sabes más dichos que un almanaque."
                : aciertos > 0
                ? "Ya tienes cultura de sobremesa, sigue así."
                : "Ningún refrán esta vez. ¡Al que madruga…!"}
            </p>

            <div className="bg-white/95 text-gray-900 rounded-3xl p-5 shadow-lg mb-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">Puntuación</p>
              <p className="text-6xl font-black text-rose-600 leading-none my-2">{aciertos}</p>
              <p className="text-sm text-gray-600 mb-3">aciertos</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-amber-50 rounded-xl p-2">
                  <p className="text-xs text-gray-500">Respondidos</p>
                  <p className="font-bold">{numAciertos}/{numAciertos + fallos}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-2">
                  <p className="text-xs text-gray-500">Mejor racha</p>
                  <p className="font-bold">🔥 {mejorRacha}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-2">
                  <p className="text-xs text-gray-500">Récord</p>
                  <p className="font-bold">🏅 {record}</p>
                </div>
              </div>
              {esNuevoRecord && (
                <p className="mt-3 text-sm font-bold text-emerald-600">🎊 ¡Nuevo récord personal!</p>
              )}
            </div>

            {ultimoFallado && (
              <div className="bg-black/25 rounded-2xl p-4 mb-4 text-left">
                <p className="text-xs uppercase tracking-widest text-white/70 mb-1">El que te pilló</p>
                <p className="text-2xl mb-1" aria-hidden="true">{ultimoFallado.e}</p>
                <p className="font-semibold">«{ultimoFallado.r}»</p>
                <p className="text-xs text-white/70 mt-1">🌎 {ultimoFallado.p}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={empezar}
                className="w-full py-4 rounded-2xl bg-white text-rose-600 font-bold text-lg shadow-lg active:scale-95 transition touch-manipulation"
                aria-label="Jugar otra vez"
              >
                🔁 Jugar otra vez
              </button>

              {aciertos > 0 && (
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full py-3 rounded-2xl bg-black/25 hover:bg-black/35 font-semibold shadow active:scale-95 transition touch-manipulation"
                  aria-label="Ver ranking de jugadores"
                >
                  🏆 Ver ranking
                </button>
              )}

              <div className="pt-2">
                <p className="text-xs text-white/70 mb-2">Reta a alguien de otro país 👇</p>
                <ShareButtons url={URL_JUEGO} text={textoCompartir} />
              </div>
            </div>
          </div>
        )}
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game={SLUG}
          score={aciertos}
          unit="aciertos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
