"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------- Tipos ----------
type Efecto = [number, number, number]; // [oro, ánimo, cosecha]

interface Peticion {
  texto: string;
  emoji: string;
  efectoSi: Efecto;
  efectoNo: Efecto;
}

type Fase = "inicio" | "jugando" | "fin";
type Decision = "si" | "no" | "ignorada";

interface Registro {
  peticion: Peticion;
  decision: Decision;
}

// ---------- Constantes ----------
const DURACION = 60;
const TIEMPO_PETICION = 4; // segundos para responder antes de que el súbdito se vaya
const UMBRAL_SWIPE = 60;
const BARRA_MAX = 10;
const BARRA_INICIAL = 6;
const STORAGE_KEY = "vl_rey-por-un-minuto_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/rey-por-un-minuto";

const NOMBRES_BARRAS = ["Oro", "Ánimo", "Cosecha"] as const;
const EMOJIS_BARRAS = ["💰", "😊", "🌾"] as const;
const COLORES_BARRAS = [
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-lime-400 to-green-500",
] as const;

// Banco de peticiones absurdas
const PETICIONES: Peticion[] = [
  { texto: "Quiero convertir el río en limonada", emoji: "🧙", efectoSi: [-2, 3, -3], efectoNo: [0, -1, 1] },
  { texto: "Propongo un impuesto a los gatos", emoji: "🐱", efectoSi: [3, -3, 0], efectoNo: [-1, 1, 0] },
  { texto: "Que los lunes sean festivos para siempre", emoji: "🎉", efectoSi: [-2, 3, -2], efectoNo: [1, -2, 1] },
  { texto: "Necesito 300 ovejas para mi coro", emoji: "🐑", efectoSi: [-2, 2, -2], efectoNo: [0, -1, 1] },
  { texto: "Declaremos la guerra a las nubes", emoji: "⚔️", efectoSi: [-3, 1, -1], efectoNo: [0, 0, 1] },
  { texto: "Quiero casarme con el dragón del monte", emoji: "🐉", efectoSi: [-1, 2, 1], efectoNo: [0, -1, -1] },
  { texto: "Pinta el castillo de rosa chicle", emoji: "🎨", efectoSi: [-3, 3, 0], efectoNo: [1, -1, 0] },
  { texto: "Prohibamos las escaleras, dan miedo", emoji: "😨", efectoSi: [-1, 1, -2], efectoNo: [0, -1, 0] },
  { texto: "Un puente de queso sobre el pantano", emoji: "🧀", efectoSi: [-3, 2, -1], efectoNo: [1, -1, 0] },
  { texto: "Que las gallinas paguen alquiler", emoji: "🐔", efectoSi: [2, -1, -3], efectoNo: [-1, 1, 1] },
  { texto: "Quiero ser nombrado Duque de los Charcos", emoji: "🤴", efectoSi: [-1, 2, 0], efectoNo: [0, -2, 0] },
  { texto: "Cambiemos la moneda por bellotas", emoji: "🌰", efectoSi: [-3, 1, 2], efectoNo: [1, -1, 0] },
  { texto: "Fiesta de espuma en la plaza mayor", emoji: "🫧", efectoSi: [-2, 3, 0], efectoNo: [1, -2, 0] },
  { texto: "Mi vaca exige un trono propio", emoji: "🐄", efectoSi: [-2, 2, 1], efectoNo: [0, -1, -1] },
  { texto: "Que la lluvia solo caiga de noche", emoji: "🌧️", efectoSi: [-1, 2, -2], efectoNo: [0, -1, 1] },
  { texto: "Sustituye la guardia por patos armados", emoji: "🦆", efectoSi: [2, 1, -2], efectoNo: [-1, 0, 0] },
  { texto: "Quiero una estatua mía hecha de pan", emoji: "🥖", efectoSi: [-2, 2, -2], efectoNo: [0, -1, 1] },
  { texto: "Exijo que el sol salga por el oeste", emoji: "🌅", efectoSi: [-1, 1, -3], efectoNo: [0, -1, 0] },
  { texto: "Impuesto a los estornudos", emoji: "🤧", efectoSi: [3, -3, 0], efectoNo: [-1, 1, 0] },
  { texto: "Un desfile de calabazas gigantes", emoji: "🎃", efectoSi: [-1, 3, -1], efectoNo: [0, -2, 1] },
  { texto: "Quiero abrir una taberna en la catedral", emoji: "🍺", efectoSi: [3, 2, 0], efectoNo: [-1, -1, 0] },
  { texto: "Las abejas piden jubilación anticipada", emoji: "🐝", efectoSi: [0, 2, -3], efectoNo: [0, -1, 2] },
  { texto: "Cambiar el himno por un maullido", emoji: "🎶", efectoSi: [0, 3, 0], efectoNo: [0, -1, 0] },
  { texto: "Alquilar el castillo para bodas de trolls", emoji: "🧌", efectoSi: [3, -2, -1], efectoNo: [-1, 1, 0] },
  { texto: "Quiero plantar espaguetis en mi huerto", emoji: "🍝", efectoSi: [-1, 1, -2], efectoNo: [0, 0, 1] },
  { texto: "Que el bufón sea ministro de economía", emoji: "🤡", efectoSi: [-3, 3, 0], efectoNo: [1, -1, 0] },
  { texto: "Vender la luna a un mercader extranjero", emoji: "🌙", efectoSi: [3, -2, -2], efectoNo: [-1, 1, 1] },
  { texto: "Una piscina de monedas para los niños", emoji: "🪙", efectoSi: [-3, 3, 0], efectoNo: [1, -2, 0] },
  { texto: "Que los cerdos aprendan a leer", emoji: "🐷", efectoSi: [-2, 1, 1], efectoNo: [0, 0, -1] },
  { texto: "Prohibir el color verde en el reino", emoji: "🟩", efectoSi: [0, -2, -3], efectoNo: [0, 1, 1] },
  { texto: "Quiero cobrar peaje en mi propia puerta", emoji: "🚪", efectoSi: [2, -2, 0], efectoNo: [-1, 1, 0] },
  { texto: "Concurso de gritos a medianoche", emoji: "📣", efectoSi: [-1, 3, -1], efectoNo: [0, -1, 1] },
  { texto: "Regar los campos con vino", emoji: "🍷", efectoSi: [-3, 3, -2], efectoNo: [1, -1, 1] },
  { texto: "Que el molino gire al revés por moda", emoji: "🌀", efectoSi: [-1, 2, -3], efectoNo: [0, -1, 1] },
  { texto: "Mi hijo quiere ser caballo", emoji: "🐴", efectoSi: [0, 2, 0], efectoNo: [0, -2, 0] },
  { texto: "Impuesto al aire de la montaña", emoji: "🏔️", efectoSi: [3, -3, -1], efectoNo: [-1, 1, 0] },
  { texto: "Construir una torre para tocar las estrellas", emoji: "🗼", efectoSi: [-3, 2, -1], efectoNo: [1, -1, 0] },
  { texto: "Que las cabras vigilen las murallas", emoji: "🐐", efectoSi: [1, 1, -2], efectoNo: [-1, 0, 1] },
  { texto: "Un día sin gravedad, por favor", emoji: "🪂", efectoSi: [-2, 3, -3], efectoNo: [0, -1, 1] },
  { texto: "Ponerle sombrero a cada árbol", emoji: "🎩", efectoSi: [-2, 2, -1], efectoNo: [0, -1, 0] },
  { texto: "Quiero criar tiburones en el pozo", emoji: "🦈", efectoSi: [-1, 1, -3], efectoNo: [0, -1, 1] },
  { texto: "Vender los sueños del pueblo a un mago", emoji: "🔮", efectoSi: [3, -3, 0], efectoNo: [-1, 1, 0] },
  { texto: "Que la sopa sea la moneda oficial", emoji: "🍲", efectoSi: [-2, 2, 1], efectoNo: [0, -1, 0] },
  { texto: "Una carrera de caracoles con apuestas", emoji: "🐌", efectoSi: [2, 2, -1], efectoNo: [-1, -1, 0] },
  { texto: "Quiero ser el sabio oficial del reino", emoji: "🧓", efectoSi: [-1, 1, 1], efectoNo: [0, -1, 0] },
  { texto: "Que los espantapájaros tengan salario", emoji: "🎃", efectoSi: [-3, 1, 2], efectoNo: [1, 0, -1] },
  { texto: "Prohibir los gallos madrugadores", emoji: "🐓", efectoSi: [0, 2, -3], efectoNo: [0, -1, 1] },
  { texto: "Cambiar los caminos por toboganes", emoji: "🛝", efectoSi: [-3, 3, -1], efectoNo: [1, -1, 0] },
  { texto: "Un banquete de 40 días seguidos", emoji: "🍗", efectoSi: [-3, 3, -3], efectoNo: [1, -2, 1] },
  { texto: "Que el rey cante cada mañana en la plaza", emoji: "🎤", efectoSi: [0, 3, 0], efectoNo: [0, -2, 0] },
  { texto: "Quiero domesticar la niebla", emoji: "🌫️", efectoSi: [-1, 1, -1], efectoNo: [0, 0, 0] },
  { texto: "Impuesto a los sombreros altos", emoji: "🎓", efectoSi: [2, -2, 0], efectoNo: [-1, 1, 0] },
  { texto: "Que las brujas hagan las cosechas", emoji: "🧹", efectoSi: [-2, -1, 3], efectoNo: [0, 1, -1] },
  { texto: "Regalar una cabra a cada recién nacido", emoji: "👶", efectoSi: [-2, 3, 1], efectoNo: [1, -2, 0] },
  { texto: "Cerrar el mercado los días con viento", emoji: "🌬️", efectoSi: [-3, 1, 0], efectoNo: [1, -1, 0] },
  { texto: "Cambiar los ratones por hámsters de oro", emoji: "🐹", efectoSi: [-3, 2, 1], efectoNo: [1, -1, 0] },
  { texto: "Quiero exportar barro a los elfos", emoji: "🧝", efectoSi: [3, 0, -2], efectoNo: [-1, 0, 1] },
  { texto: "Que el verdugo haga de payaso", emoji: "🪓", efectoSi: [0, 3, 0], efectoNo: [0, -1, 0] },
  { texto: "Una muralla de girasoles", emoji: "🌻", efectoSi: [-2, 2, 2], efectoNo: [0, -1, 0] },
  { texto: "Prohibir las siestas después de comer", emoji: "😴", efectoSi: [1, -3, 2], efectoNo: [-1, 2, -1] },
  { texto: "Que cada nube pague por pasar", emoji: "☁️", efectoSi: [2, -1, -2], efectoNo: [0, 0, 1] },
  { texto: "Quiero un unicornio para arar", emoji: "🦄", efectoSi: [-3, 2, 2], efectoNo: [1, -1, 0] },
  { texto: "Convertir la mazmorra en spa", emoji: "🧖", efectoSi: [-2, 3, 0], efectoNo: [1, -1, 0] },
  { texto: "Que los peces paguen por nadar", emoji: "🐟", efectoSi: [2, -1, -1], efectoNo: [0, 0, 0] },
  { texto: "Un festival de tirar tomates al rey", emoji: "🍅", efectoSi: [0, 3, -2], efectoNo: [0, -2, 1] },
  { texto: "Contratar un ogro como jardinero", emoji: "👹", efectoSi: [-2, -1, 3], efectoNo: [0, 1, -1] },
  { texto: "Cambiar la corona por un cubo", emoji: "🪣", efectoSi: [2, 1, 0], efectoNo: [0, -1, 0] },
  { texto: "Que llueva pan los domingos", emoji: "🍞", efectoSi: [-3, 3, 1], efectoNo: [1, -2, 0] },
  { texto: "Un ejército de espantapájaros bailarines", emoji: "💃", efectoSi: [-2, 2, 1], efectoNo: [0, -1, 0] },
  { texto: "Prohibir contar hasta más de diez", emoji: "🔢", efectoSi: [-3, 1, -1], efectoNo: [1, 0, 0] },
  { texto: "Quiero cobrar por mirar el castillo", emoji: "👀", efectoSi: [3, -3, 0], efectoNo: [-1, 1, 0] },
  { texto: "Que el bosque tenga horario de apertura", emoji: "🌲", efectoSi: [1, -2, -1], efectoNo: [0, 1, 0] },
  { texto: "Regalar oro a quien cuente un chiste", emoji: "😂", efectoSi: [-3, 3, 0], efectoNo: [1, -1, 0] },
  { texto: "Que las vacas den leche con chocolate", emoji: "🍫", efectoSi: [-1, 3, -2], efectoNo: [0, -1, 1] },
  { texto: "Multar a quien pise las flores", emoji: "🌸", efectoSi: [2, -2, 2], efectoNo: [-1, 1, -1] },
  { texto: "Mudar el reino a la cima del volcán", emoji: "🌋", efectoSi: [-3, -2, -3], efectoNo: [0, 1, 1] },
  { texto: "Que los fantasmas paguen impuestos", emoji: "👻", efectoSi: [3, -1, 0], efectoNo: [-1, 0, 0] },
  { texto: "Una noria gigante en el trigal", emoji: "🎡", efectoSi: [-3, 3, -3], efectoNo: [1, -1, 1] },
  { texto: "Cambiar los caballos por avestruces", emoji: "🪶", efectoSi: [-2, 2, -1], efectoNo: [0, -1, 0] },
  { texto: "Quiero declararme isla independiente", emoji: "🏝️", efectoSi: [-2, 1, -2], efectoNo: [0, -1, 0] },
  { texto: "Una campana que suene cada minuto", emoji: "🔔", efectoSi: [-1, -3, 0], efectoNo: [0, 1, 0] },
  { texto: "Que el trigo crezca de colores", emoji: "🌈", efectoSi: [-2, 3, 1], efectoNo: [0, -1, 0] },
];

// ---------- Utilidades ----------
function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function limitar(valor: number): number {
  return Math.max(0, Math.min(BARRA_MAX, valor));
}

function leerRecord(): number {
  if (typeof window === "undefined") return 0;
  const guardado = window.localStorage.getItem(STORAGE_KEY);
  const numero = guardado ? parseInt(guardado, 10) : 0;
  return Number.isFinite(numero) ? numero : 0;
}

function estiloGobierno(historial: Registro[]): string {
  const decididas = historial.filter((r) => r.decision !== "ignorada");
  if (decididas.length === 0) return "Rey ausente 🪑";
  const aprobadas = decididas.filter((r) => r.decision === "si").length;
  const ratio = aprobadas / decididas.length;
  if (ratio >= 0.75) return "Rey generoso 🎁";
  if (ratio >= 0.55) return "Rey complaciente 🤝";
  if (ratio >= 0.4) return "Rey equilibrado ⚖️";
  if (ratio >= 0.2) return "Rey severo 🛡️";
  return "Tirano implacable 🔥";
}

function textoDecision(d: Decision): string {
  if (d === "si") return "aprobar";
  if (d === "no") return "negar";
  return "ignorar";
}

// ---------- Componente ----------
export default function JuegoReyPorUnMinuto() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [barras, setBarras] = useState<Efecto>([BARRA_INICIAL, BARRA_INICIAL, BARRA_INICIAL]);
  const [tiempo, setTiempo] = useState(DURACION);
  const [cola, setCola] = useState<Peticion[]>([]);
  const [indice, setIndice] = useState(0);
  const [tiempoPeticion, setTiempoPeticion] = useState(TIEMPO_PETICION);
  const [historial, setHistorial] = useState<Registro[]>([]);
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [esNuevoRecord, setEsNuevoRecord] = useState(false);
  const [causaCaida, setCausaCaida] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [ultimoEfecto, setUltimoEfecto] = useState<Efecto | null>(null);

  const inicioDragRef = useRef<number | null>(null);
  const finalizadoRef = useRef(false);

  // Cargar récord local
  useEffect(() => {
    setRecord(leerRecord());
  }, []);

  const peticionActual: Peticion | undefined = cola[indice];

  // Terminar partida
  const terminar = useCallback(
    (barrasFinales: Efecto, segundosSobrevividos: number, causa: string | null) => {
      if (finalizadoRef.current) return;
      finalizadoRef.current = true;
      const sumaBarras = barrasFinales.reduce((a, b) => a + b, 0);
      const puntos = Math.max(1, segundosSobrevividos * 10 + sumaBarras * 5);
      setScore(puntos);
      setCausaCaida(causa);
      setFase("fin");
      const recordPrevio = leerRecord();
      if (puntos > recordPrevio) {
        window.localStorage.setItem(STORAGE_KEY, String(puntos));
        setRecord(puntos);
        setEsNuevoRecord(true);
      } else {
        setRecord(recordPrevio);
        setEsNuevoRecord(false);
      }
    },
    []
  );

  // Aplicar una decisión sobre la petición actual
  const decidir = useCallback(
    (decision: Decision) => {
      if (fase !== "jugando" || !peticionActual || finalizadoRef.current) return;

      const efecto: Efecto =
        decision === "si"
          ? peticionActual.efectoSi
          : decision === "no"
            ? peticionActual.efectoNo
            : [0, -1, 0]; // súbdito ignorado: se va enfadado

      const nuevasBarras: Efecto = [
        limitar(barras[0] + efecto[0]),
        limitar(barras[1] + efecto[1]),
        limitar(barras[2] + efecto[2]),
      ];

      const nuevoHistorial = [...historial, { peticion: peticionActual, decision }];
      setBarras(nuevasBarras);
      setHistorial(nuevoHistorial);
      setUltimoEfecto(efecto);
      setDragX(0);
      setArrastrando(false);
      setTiempoPeticion(TIEMPO_PETICION);

      const indiceCaida = nuevasBarras.findIndex((v) => v <= 0);
      if (indiceCaida !== -1) {
        const causa = `Caíste por ${textoDecision(decision)} "${peticionActual.texto}": ${EMOJIS_BARRAS[indiceCaida]} ${NOMBRES_BARRAS[indiceCaida]} llegó a cero.`;
        terminar(nuevasBarras, DURACION - tiempo, causa);
        return;
      }

      // Siguiente petición (si se acaba la cola, se vuelve a barajar)
      if (indice + 1 >= cola.length) {
        setCola(barajar(PETICIONES));
        setIndice(0);
      } else {
        setIndice(indice + 1);
      }
    },
    [fase, peticionActual, barras, historial, indice, cola.length, tiempo, terminar]
  );

  // Timer principal de 60 s
  useEffect(() => {
    if (fase !== "jugando") return;
    const id = window.setInterval(() => {
      setTiempo((t) => (t > 0 ? t - 1 : 0));
      setTiempoPeticion((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [fase]);

  // Fin por tiempo: sobreviviste
  useEffect(() => {
    if (fase === "jugando" && tiempo <= 0) {
      terminar(barras, DURACION, null);
    }
  }, [fase, tiempo, barras, terminar]);

  // Súbdito ignorado por no responder a tiempo
  useEffect(() => {
    if (fase === "jugando" && tiempoPeticion <= 0 && tiempo > 0) {
      decidir("ignorada");
    }
  }, [fase, tiempoPeticion, tiempo, decidir]);

  // Limpiar el flash de efecto
  useEffect(() => {
    if (!ultimoEfecto) return;
    const id = window.setTimeout(() => setUltimoEfecto(null), 700);
    return () => window.clearTimeout(id);
  }, [ultimoEfecto]);

  const empezar = useCallback(() => {
    finalizadoRef.current = false;
    setBarras([BARRA_INICIAL, BARRA_INICIAL, BARRA_INICIAL]);
    setTiempo(DURACION);
    setTiempoPeticion(TIEMPO_PETICION);
    setCola(barajar(PETICIONES));
    setIndice(0);
    setHistorial([]);
    setScore(0);
    setCausaCaida(null);
    setEsNuevoRecord(false);
    setShowLeaderboard(false);
    setDragX(0);
    setArrastrando(false);
    setUltimoEfecto(null);
    setFase("jugando");
  }, []);

  // ---------- Swipe ----------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (fase !== "jugando") return;
    inicioDragRef.current = e.clientX;
    setArrastrando(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inicioDragRef.current === null) return;
    setDragX(e.clientX - inicioDragRef.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (inicioDragRef.current === null) return;
    const desplazamiento = e.clientX - inicioDragRef.current;
    inicioDragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (desplazamiento >= UMBRAL_SWIPE) {
      decidir("si");
    } else if (desplazamiento <= -UMBRAL_SWIPE) {
      decidir("no");
    } else {
      setDragX(0);
      setArrastrando(false);
    }
  };

  const rotacion = Math.max(-15, Math.min(15, dragX / 8));
  const opacidadSi = Math.min(1, Math.max(0, dragX / UMBRAL_SWIPE));
  const opacidadNo = Math.min(1, Math.max(0, -dragX / UMBRAL_SWIPE));

  const segundosSobrevividos = DURACION - tiempo;
  const estilo = estiloGobierno(historial);
  const textoCompartir = causaCaida
    ? `👑 Goberné ${segundosSobrevividos} segundos en "Rey por un minuto" y saqué ${score} puntos. Mi estilo: ${estilo}. ${causaCaida} ¿Aguantas más que yo?`
    : `👑 ¡Sobreviví los 60 segundos en "Rey por un minuto" con ${score} puntos! Mi estilo: ${estilo}. ¿Puedes gobernar mejor?`;

  // ---------- Render ----------
  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 select-none">
      {/* Cabecera */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            👑 Rey por un minuto
          </span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">Gobierna 60 segundos sin arruinar el reino</p>
      </div>

      {/* Pantalla de inicio */}
      {fase === "inicio" && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-[2px] shadow-xl">
          <div className="rounded-3xl bg-white p-6 text-center dark:bg-gray-900">
            <div className="text-6xl">🏰</div>
            <h2 className="mt-3 text-xl font-bold">¿Cómo se juega?</h2>
            <ul className="mt-3 space-y-2 text-left text-sm text-gray-600 dark:text-gray-300">
              <li>🧙 Cada segundo llega un súbdito con una petición absurda.</li>
              <li>👉 Desliza a la derecha (o pulsa ✅) para aprobar.</li>
              <li>👈 Desliza a la izquierda (o pulsa ❌) para negar.</li>
              <li>📊 Cada decisión mueve 💰 Oro, 😊 Ánimo y 🌾 Cosecha.</li>
              <li>💀 Si una barra llega a cero, cae el reino.</li>
              <li>⏱️ Aguanta 60 s y suma puntos por cada barra alta.</li>
            </ul>
            {record > 0 && (
              <p className="mt-4 text-sm font-semibold text-amber-600">🏅 Tu récord: {record} puntos</p>
            )}
            <button
              type="button"
              onClick={empezar}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
              aria-label="Empezar a gobernar"
            >
              👑 Empezar a gobernar
            </button>
          </div>
        </div>
      )}

      {/* Pantalla de juego */}
      {fase === "jugando" && (
        <div>
          {/* Tiempo */}
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-500">Día {historial.length + 1} de reinado</span>
            <span
              className={`rounded-full px-3 py-1 text-white ${tiempo <= 10 ? "animate-pulse bg-rose-500" : "bg-gray-800"}`}
              aria-live="polite"
              aria-label={`Quedan ${tiempo} segundos`}
            >
              ⏱️ {tiempo}s
            </span>
          </div>

          {/* Barras */}
          <div className="mb-4 space-y-2" role="group" aria-label="Estado del reino">
            {barras.map((valor, i) => {
              const delta = ultimoEfecto ? ultimoEfecto[i] : 0;
              return (
                <div key={NOMBRES_BARRAS[i]}>
                  <div className="mb-0.5 flex items-center justify-between text-xs font-semibold">
                    <span>
                      {EMOJIS_BARRAS[i]} {NOMBRES_BARRAS[i]}
                    </span>
                    <span className="flex items-center gap-1">
                      {delta !== 0 && (
                        <span className={`font-bold ${delta > 0 ? "text-green-500" : "text-rose-500"}`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                      <span className="text-gray-500">{valor}/{BARRA_MAX}</span>
                    </span>
                  </div>
                  <div
                    className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={BARRA_MAX}
                    aria-valuenow={valor}
                    aria-label={NOMBRES_BARRAS[i]}
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${COLORES_BARRAS[i]} transition-all duration-300 ease-out ${valor <= 2 ? "animate-pulse" : ""}`}
                      style={{ width: `${(valor / BARRA_MAX) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tarjeta de petición */}
          <div className="relative h-56">
            {/* Indicadores de swipe */}
            <div
              className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border-4 border-rose-500 px-3 py-1 text-xl font-black text-rose-500 -rotate-12"
              style={{ opacity: opacidadNo }}
              aria-hidden="true"
            >
              NO
            </div>
            <div
              className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg border-4 border-green-500 px-3 py-1 text-xl font-black text-green-500 rotate-12"
              style={{ opacity: opacidadSi }}
              aria-hidden="true"
            >
              SÍ
            </div>

            {peticionActual && (
              <div
                key={`${indice}-${peticionActual.texto}`}
                className="absolute inset-0 touch-none cursor-grab rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-[3px] shadow-2xl active:cursor-grabbing"
                style={{
                  transform: `translateX(${dragX}px) rotate(${rotacion}deg)`,
                  transition: arrastrando ? "none" : "transform 0.25s ease-out",
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                role="group"
                aria-label={`Petición: ${peticionActual.texto}. Desliza a la derecha para aprobar o a la izquierda para negar.`}
              >
                <div className="flex h-full flex-col items-center justify-center rounded-3xl bg-white px-5 text-center dark:bg-gray-900">
                  <div className="text-6xl">{peticionActual.emoji}</div>
                  <p className="mt-3 text-lg font-bold leading-snug">&ldquo;{peticionActual.texto}&rdquo;</p>
                  {/* Cuenta atrás del súbdito */}
                  <div className="mt-4 h-1.5 w-2/3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-gray-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${(tiempoPeticion / TIEMPO_PETICION) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">El súbdito se va en {tiempoPeticion}s</p>
                </div>
              </div>
            )}
          </div>

          {/* Botones grandes */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => decidir("no")}
              className="rounded-2xl bg-rose-500 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-rose-600 active:scale-95"
              aria-label="Negar la petición"
            >
              ❌ Negar
            </button>
            <button
              type="button"
              onClick={() => decidir("si")}
              className="rounded-2xl bg-green-500 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-600 active:scale-95"
              aria-label="Aprobar la petición"
            >
              ✅ Aprobar
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">👈 desliza para negar · desliza para aprobar 👉</p>
        </div>
      )}

      {/* Pantalla final */}
      {fase === "fin" && (
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-[2px] shadow-xl">
          <div className="rounded-3xl bg-white p-6 text-center dark:bg-gray-900">
            <div className="text-6xl">{causaCaida ? "💀" : "🏆"}</div>
            <h2 className="mt-2 text-2xl font-extrabold">
              {causaCaida ? "¡Cayó el reino!" : "¡Sobreviviste al minuto!"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {causaCaida ?? `Gobernaste los 60 segundos completos con ${historial.length} decisiones.`}
            </p>

            <div className="mt-4 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500">Puntuación</p>
              <p className="text-5xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                {score}
              </p>
              <p className="text-sm text-gray-500">puntos</p>
              <p className="mt-2 text-xs text-gray-500">
                {segundosSobrevividos}s × 10 + barras ({barras.reduce((a, b) => a + b, 0)}) × 5
              </p>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <span className="font-semibold">🏅 Récord: {record} puntos</span>
              {esNuevoRecord && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">¡NUEVO!</span>
              )}
            </div>

            <p className="mt-3 text-sm">
              Tu estilo de gobierno: <span className="font-bold">{estilo}</span>
            </p>

            {/* Barras finales */}
            <div className="mt-3 flex justify-center gap-4 text-sm">
              {barras.map((v, i) => (
                <span key={NOMBRES_BARRAS[i]} className="font-semibold">
                  {EMOJIS_BARRAS[i]} {v}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={empezar}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-95"
              aria-label="Jugar otra vez"
            >
              🔄 Jugar otra vez
            </button>

            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="mt-3 w-full rounded-2xl border-2 border-amber-500 px-6 py-3 font-bold text-amber-600 transition hover:bg-amber-50 active:scale-95 dark:hover:bg-gray-800"
              aria-label="Ver ranking"
            >
              🏆 Ver ranking
            </button>

            <div className="mt-4">
              <ShareButtons url={URL_JUEGO} text={textoCompartir} />
            </div>

            <div className="mt-4 text-sm">
              <Link href="/juegos" className="text-gray-500 underline hover:text-gray-700">
                ← Más juegos
              </Link>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <LeaderboardModal
          game="rey-por-un-minuto"
          score={score}
          unit="puntos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
