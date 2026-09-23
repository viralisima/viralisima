"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------- Tipos ----------
type TipoAccesorio = "sombrero" | "gafas" | "globo" | "flor" | "regalo" | "comida";

interface Base {
  emoji: string;
  nombre: string; // con artículo: "una abuela", "un pingüino"
  animal: boolean;
  mayor?: boolean;
  peque?: boolean;
}

interface Accesorio {
  emoji: string;
  nombre: string;
  tipo: TipoAccesorio;
}

interface Color {
  nombre: string;
  hex: string;
}

interface Invitado {
  id: number;
  base: Base;
  accesorio: Accesorio;
  color: Color;
}

interface Norma {
  texto: string;
  ok: (inv: Invitado) => boolean;
}

type Fase = "inicio" | "jugando" | "fin";
type Salida = "izq" | "der" | null;

interface Feedback {
  tipo: "ok" | "mal";
  texto: string;
}

// ---------- Datos ----------
const BASES: Base[] = [
  { emoji: "🧑‍🎤", nombre: "una estrella del rock", animal: false },
  { emoji: "👵", nombre: "una abuela", animal: false, mayor: true },
  { emoji: "👴", nombre: "un abuelo", animal: false, mayor: true },
  { emoji: "🧓", nombre: "una persona mayor", animal: false, mayor: true },
  { emoji: "👶", nombre: "un bebé", animal: false, peque: true },
  { emoji: "🧒", nombre: "un niño", animal: false, peque: true },
  { emoji: "🧙", nombre: "un mago", animal: false },
  { emoji: "🧛", nombre: "un vampiro", animal: false },
  { emoji: "🧟", nombre: "un zombi", animal: false },
  { emoji: "👮", nombre: "un policía", animal: false },
  { emoji: "🕵️", nombre: "un detective", animal: false },
  { emoji: "👰", nombre: "una novia", animal: false },
  { emoji: "🐧", nombre: "un pingüino", animal: true },
  { emoji: "🐶", nombre: "un perro", animal: true },
  { emoji: "🐱", nombre: "un gato", animal: true },
  { emoji: "🐸", nombre: "una rana", animal: true },
  { emoji: "🐷", nombre: "un cerdo", animal: true },
  { emoji: "🦄", nombre: "un unicornio", animal: true },
  { emoji: "🐔", nombre: "una gallina", animal: true },
  { emoji: "🐢", nombre: "una tortuga", animal: true },
  { emoji: "🦊", nombre: "un zorro", animal: true },
];

const ACCESORIOS: Accesorio[] = [
  { emoji: "🎩", nombre: "chistera", tipo: "sombrero" },
  { emoji: "👒", nombre: "pamela", tipo: "sombrero" },
  { emoji: "🧢", nombre: "gorra", tipo: "sombrero" },
  { emoji: "👑", nombre: "corona", tipo: "sombrero" },
  { emoji: "🕶️", nombre: "gafas de sol", tipo: "gafas" },
  { emoji: "👓", nombre: "gafas de ver", tipo: "gafas" },
  { emoji: "🎈", nombre: "globo", tipo: "globo" },
  { emoji: "🌸", nombre: "flor", tipo: "flor" },
  { emoji: "🎁", nombre: "regalo", tipo: "regalo" },
  { emoji: "🍕", nombre: "pizza", tipo: "comida" },
  { emoji: "🍰", nombre: "tarta", tipo: "comida" },
];

const COLORES: Color[] = [
  { nombre: "rojo", hex: "#ef4444" },
  { nombre: "azul", hex: "#3b82f6" },
  { nombre: "verde", hex: "#22c55e" },
  { nombre: "amarillo", hex: "#eab308" },
  { nombre: "morado", hex: "#a855f7" },
  { nombre: "negro", hex: "#171717" },
  { nombre: "rosa", hex: "#ec4899" },
  { nombre: "naranja", hex: "#f97316" },
];

const NORMAS: Norma[] = [
  { texto: "Solo con sombrero", ok: (i) => i.accesorio.tipo === "sombrero" },
  { texto: "No animales", ok: (i) => !i.base.animal },
  { texto: "Solo animales", ok: (i) => i.base.animal },
  { texto: "Solo con gafas de sol", ok: (i) => i.accesorio.emoji === "🕶️" },
  { texto: "Nada de globos", ok: (i) => i.accesorio.tipo !== "globo" },
  { texto: "Solo vestidos de rojo", ok: (i) => i.color.nombre === "rojo" },
  { texto: "Nada de azul", ok: (i) => i.color.nombre !== "azul" },
  { texto: "Solo personas con sombrero", ok: (i) => !i.base.animal && i.accesorio.tipo === "sombrero" },
  { texto: "Solo personas mayores", ok: (i) => i.base.mayor === true },
  { texto: "Solo quien traiga flor", ok: (i) => i.accesorio.tipo === "flor" },
  { texto: "Nada de coronas", ok: (i) => i.accesorio.emoji !== "👑" },
  { texto: "Solo quien traiga regalo", ok: (i) => i.accesorio.tipo === "regalo" },
  { texto: "Solo de verde o amarillo", ok: (i) => i.color.nombre === "verde" || i.color.nombre === "amarillo" },
  { texto: "Solo animales con globo", ok: (i) => i.base.animal && i.accesorio.tipo === "globo" },
  { texto: "Solo quien traiga comida", ok: (i) => i.accesorio.tipo === "comida" },
  { texto: "Nada de gorras", ok: (i) => i.accesorio.emoji !== "🧢" },
  { texto: "Solo peques (bebés y niños)", ok: (i) => i.base.peque === true },
  { texto: "Solo de negro o morado", ok: (i) => i.color.nombre === "negro" || i.color.nombre === "morado" },
  { texto: "Nadie con comida", ok: (i) => i.accesorio.tipo !== "comida" },
  { texto: "Solo con gafas (las que sean)", ok: (i) => i.accesorio.tipo === "gafas" },
];

const DURACION_MS = 60_000;
const CAMBIO_NORMA_MS = 10_000;
const AVISO_MS = 1_000;
const UMBRAL_PX = 60;
const MAX_ERRORES = 3;
const CLAVE_RECORD = "vl_portero-de-fiesta_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/portero-de-fiesta";

// ---------- Utilidades ----------
function azar<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)] as T;
}

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copia[i] as T;
    copia[i] = copia[j] as T;
    copia[j] = tmp;
  }
  return copia;
}

function describir(inv: Invitado): string {
  return `${inv.base.nombre} con ${inv.accesorio.nombre} vestido de ${inv.color.nombre}`;
}

export default function JuegoPorteroDeFiesta() {
  // ---------- Estado ----------
  const [fase, setFase] = useState<Fase>("inicio");
  const [cola, setCola] = useState<Invitado[]>([]);
  const [orden, setOrden] = useState<number[]>([]);
  const [normaIdx, setNormaIdx] = useState(0);
  const [aviso, setAviso] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [tiempo, setTiempo] = useState(60);
  const [dx, setDx] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [saliendo, setSaliendo] = useState<Salida>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [anecdota, setAnecdota] = useState("");
  const [score, setScore] = useState(0);
  const [record, setRecord] = useState(0);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Refs para leer valores actuales dentro de temporizadores
  const inicioRef = useRef(0);
  const cartaInicioRef = useRef(0);
  const normaIdxRef = useRef(0);
  const puntosRef = useRef(0);
  const erroresRef = useRef(0);
  const contadorIdRef = useRef(0);
  const inicioXRef = useRef(0);
  const finalizadoRef = useRef(false);
  const temporizadoresRef = useRef<number[]>([]);

  const normaActual: Norma | undefined =
    orden.length > 0 ? NORMAS[orden[normaIdx % orden.length] as number] : undefined;

  // ---------- Récord local ----------
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE_RECORD);
      if (guardado) setRecord(parseInt(guardado, 10) || 0);
    } catch {
      /* localStorage no disponible */
    }
  }, []);

  // Programa un timeout y lo registra para limpiarlo al reiniciar
  const programar = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    temporizadoresRef.current.push(id);
  }, []);

  const limpiarTemporizadores = useCallback(() => {
    temporizadoresRef.current.forEach((id) => window.clearTimeout(id));
    temporizadoresRef.current = [];
  }, []);

  // ---------- Generación de invitados ----------
  // La mitad de las veces intenta generar uno que cumpla la norma (evita rachas de "todos fuera")
  const nuevoInvitado = useCallback((norma: Norma | undefined): Invitado => {
    const quierePasar = Math.random() < 0.5;
    let inv: Invitado = {
      id: ++contadorIdRef.current,
      base: azar(BASES),
      accesorio: azar(ACCESORIOS),
      color: azar(COLORES),
    };
    if (!norma) return inv;
    for (let intento = 0; intento < 25; intento++) {
      if (norma.ok(inv) === quierePasar) return inv;
      inv = {
        id: inv.id,
        base: azar(BASES),
        accesorio: azar(ACCESORIOS),
        color: azar(COLORES),
      };
    }
    return inv;
  }, []);

  // ---------- Fin de partida ----------
  const terminar = useCallback(() => {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true;
    const final = Math.max(1, Math.round(puntosRef.current));
    setScore(final);
    setFase("fin");
    try {
      const guardado = parseInt(window.localStorage.getItem(CLAVE_RECORD) ?? "0", 10) || 0;
      if (final > guardado) {
        window.localStorage.setItem(CLAVE_RECORD, String(final));
        setRecord(final);
        setNuevoRecord(true);
      } else {
        setRecord(guardado);
        setNuevoRecord(false);
      }
    } catch {
      setNuevoRecord(final > record);
      if (final > record) setRecord(final);
    }
  }, [record]);

  // ---------- Inicio de partida ----------
  const empezar = useCallback(() => {
    limpiarTemporizadores();
    const nuevoOrden = barajar(NORMAS.map((_, i) => i));
    const primera = NORMAS[nuevoOrden[0] as number];
    contadorIdRef.current = 0;
    puntosRef.current = 0;
    erroresRef.current = 0;
    normaIdxRef.current = 0;
    finalizadoRef.current = false;
    inicioRef.current = Date.now();
    cartaInicioRef.current = Date.now();
    setOrden(nuevoOrden);
    setNormaIdx(0);
    setCola([nuevoInvitado(primera), nuevoInvitado(primera)]);
    setPuntos(0);
    setErrores(0);
    setTiempo(60);
    setDx(0);
    setSaliendo(null);
    setFeedback(null);
    setAnecdota("");
    setAviso(false);
    setNuevoRecord(false);
    setShowLeaderboard(false);
    setFase("jugando");
  }, [limpiarTemporizadores, nuevoInvitado]);

  // ---------- Bucle de tiempo (cuenta atrás + rotación de normas) ----------
  useEffect(() => {
    if (fase !== "jugando") return;
    const id = window.setInterval(() => {
      const ahora = Date.now();
      const transcurrido = ahora - inicioRef.current;
      const restante = Math.max(0, DURACION_MS - transcurrido);
      setTiempo(Math.ceil(restante / 1000));

      const idx = Math.floor(transcurrido / CAMBIO_NORMA_MS);
      if (idx !== normaIdxRef.current && restante > 0) {
        normaIdxRef.current = idx;
        setNormaIdx(idx);
        setAviso(true);
        setDx(0);
        cartaInicioRef.current = ahora + AVISO_MS;
        programar(() => setAviso(false), AVISO_MS);
      }

      if (restante <= 0) terminar();
    }, 100);
    return () => window.clearInterval(id);
  }, [fase, programar, terminar]);

  // Limpieza al desmontar
  useEffect(() => limpiarTemporizadores, [limpiarTemporizadores]);

  // ---------- Decisión (pasa / fuera) ----------
  const decidir = useCallback(
    (pasa: boolean) => {
      if (fase !== "jugando" || aviso || saliendo || finalizadoRef.current) return;
      const actual = cola[0];
      const norma = normaActual;
      if (!actual || !norma) return;

      const correcto = norma.ok(actual) === pasa;
      setSaliendo(pasa ? "der" : "izq");
      setArrastrando(false);

      if (correcto) {
        const ms = Math.max(0, Date.now() - cartaInicioRef.current);
        const bonus = Math.max(0, 100 - Math.floor(ms / 30)); // hasta +100 si decides en <3 s
        const ganado = 100 + bonus;
        puntosRef.current += ganado;
        setPuntos(puntosRef.current);
        setFeedback({ tipo: "ok", texto: `+${ganado}` });
      } else {
        erroresRef.current += 1;
        setErrores(erroresRef.current);
        const frase = pasa
          ? `Dejaste pasar a ${describir(actual)}`
          : `Rechazaste a ${describir(actual)}`;
        setAnecdota(`${frase} (la norma era «${norma.texto}»)`);
        setFeedback({ tipo: "mal", texto: pasa ? "¡No cumplía la norma!" : "¡Sí cumplía la norma!" });
        if (erroresRef.current >= MAX_ERRORES) {
          programar(terminar, 400);
        }
      }

      programar(() => setFeedback(null), 800);
      programar(() => {
        setCola((c) => {
          const siguiente = c[1];
          return siguiente ? [siguiente, nuevoInvitado(norma)] : [nuevoInvitado(norma), nuevoInvitado(norma)];
        });
        setSaliendo(null);
        setDx(0);
        cartaInicioRef.current = Date.now();
      }, 260);
    },
    [fase, aviso, saliendo, cola, normaActual, programar, terminar, nuevoInvitado]
  );

  // Teclado: flechas izquierda/derecha
  useEffect(() => {
    if (fase !== "jugando") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decidir(true);
      if (e.key === "ArrowLeft") decidir(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fase, decidir]);

  // ---------- Gestos ----------
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (fase !== "jugando" || aviso || saliendo) return;
    inicioXRef.current = e.clientX;
    setArrastrando(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastrando) return;
    setDx(e.clientX - inicioXRef.current);
  };

  const onPointerUp = () => {
    if (!arrastrando) return;
    setArrastrando(false);
    if (Math.abs(dx) >= UMBRAL_PX) {
      decidir(dx > 0);
    } else {
      setDx(0);
    }
  };

  // ---------- Render ----------
  const actual = cola[0];
  const siguiente = cola[1];
  const xVisual = saliendo === "der" ? 700 : saliendo === "izq" ? -700 : dx;
  const rotacion = xVisual / 14;
  const transicion = arrastrando ? "none" : "transform 260ms ease";
  const textoCompartir = `${anecdota ? anecdota.split(" (")[0] + " 😂 " : ""}Hice ${score} puntos en Portero de Fiesta 🕺 ¿Me superas?`;

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-white flex flex-col items-center px-4 py-5 select-none">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-extrabold drop-shadow">🕺 Portero de Fiesta</h1>
        <p className="text-sm text-white/85 mt-1">
          Deja pasar solo a quien cumpla la norma… que cambia cada 10 segundos
        </p>
      </header>

      {/* ---------- Pantalla de inicio ---------- */}
      {fase === "inicio" && (
        <section className="w-full max-w-md bg-white/15 backdrop-blur rounded-3xl p-6 text-center shadow-xl">
          <div className="text-6xl mb-3">🧑‍🎤🎩 🐧🎈 👵🕶️</div>
          <p className="text-base leading-relaxed">
            Llegan invitados uno a uno. Arriba verás la <strong>norma vigente</strong>. Desliza a la{" "}
            <strong>derecha</strong> (o pulsa ✅) para dejar pasar y a la <strong>izquierda</strong> (o ❌)
            para rechazar.
          </p>
          <ul className="text-sm text-white/90 mt-3 space-y-1 text-left inline-block">
            <li>⚡ Cuanto más rápido decidas, más puntos.</li>
            <li>🚨 Con 3 errores la fiesta se descontrola.</li>
            <li>⏱️ Dura 60 segundos como máximo.</li>
          </ul>
          {record > 0 && (
            <p className="mt-4 text-sm font-semibold">🏅 Tu mejor récord: {record} puntos</p>
          )}
          <button
            type="button"
            onClick={empezar}
            className="mt-5 w-full bg-white text-purple-700 font-bold text-lg py-3 rounded-2xl shadow-lg active:scale-95 transition"
          >
            🕺 Empezar a controlar la puerta
          </button>
        </section>
      )}

      {/* ---------- Partida ---------- */}
      {fase === "jugando" && (
        <section className="w-full max-w-md flex flex-col items-center">
          {/* Marcadores */}
          <div className="w-full flex justify-between items-center text-sm font-semibold mb-3">
            <span className="bg-white/20 rounded-full px-3 py-1" aria-label={`Tiempo restante ${tiempo} segundos`}>
              ⏱️ {tiempo}s
            </span>
            <span className="bg-white/20 rounded-full px-3 py-1" aria-label={`${puntos} puntos`}>
              ⭐ {puntos}
            </span>
            <span className="bg-white/20 rounded-full px-3 py-1" aria-label={`${errores} de ${MAX_ERRORES} errores`}>
              {Array.from({ length: MAX_ERRORES }, (_, i) => (i < errores ? "🚨" : "🟢")).join("")}
            </span>
          </div>

          {/* Norma vigente */}
          <div
            className="w-full bg-white text-purple-800 rounded-2xl px-4 py-3 text-center shadow-lg mb-4"
            aria-live="polite"
          >
            <div className="text-[11px] uppercase tracking-widest text-purple-500 font-bold">Norma vigente</div>
            <div className="text-xl font-extrabold leading-tight">{normaActual?.texto ?? "…"}</div>
          </div>

          {/* Zona de tarjetas */}
          <div className="relative w-full h-80 flex items-center justify-center">
            {/* Tarjeta de detrás (decorativa) */}
            {siguiente && (
              <div
                className="absolute w-64 h-72 bg-white/70 rounded-3xl scale-95 translate-y-3 shadow"
                aria-hidden="true"
              />
            )}

            {/* Tarjeta actual */}
            {actual && (
              <div
                role="group"
                aria-label={`Invitado: ${describir(actual)}. Desliza a la derecha para dejar pasar o a la izquierda para rechazar.`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="absolute w-64 h-72 bg-white text-gray-900 rounded-3xl shadow-2xl touch-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center overflow-hidden"
                style={{
                  transform: `translateX(${xVisual}px) rotate(${rotacion}deg)`,
                  transition: transicion,
                  borderTop: `10px solid ${actual.color.hex}`,
                }}
              >
                {/* Indicadores de decisión durante el arrastre */}
                <div
                  className="absolute top-4 left-4 border-4 border-green-500 text-green-600 font-black text-xl rounded-lg px-2 -rotate-12"
                  style={{ opacity: Math.min(1, Math.max(0, dx / UMBRAL_PX)) }}
                  aria-hidden="true"
                >
                  PASA
                </div>
                <div
                  className="absolute top-4 right-4 border-4 border-red-500 text-red-600 font-black text-xl rounded-lg px-2 rotate-12"
                  style={{ opacity: Math.min(1, Math.max(0, -dx / UMBRAL_PX)) }}
                  aria-hidden="true"
                >
                  FUERA
                </div>

                <div className="relative">
                  <span className="text-[6.5rem] leading-none">{actual.base.emoji}</span>
                  <span className="absolute -top-3 -right-6 text-5xl drop-shadow">{actual.accesorio.emoji}</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-700 text-center px-3 capitalize">
                  {actual.base.nombre} con {actual.accesorio.nombre}
                </div>
                <div
                  className="mt-2 text-xs font-bold text-white rounded-full px-3 py-1 uppercase tracking-wide"
                  style={{ backgroundColor: actual.color.hex }}
                >
                  vestido de {actual.color.nombre}
                </div>
              </div>
            )}

            {/* Feedback de la decisión */}
            {feedback && (
              <div
                className={`absolute -top-2 pointer-events-none text-2xl font-black drop-shadow-lg px-4 py-1 rounded-full ${
                  feedback.tipo === "ok" ? "bg-green-500" : "bg-red-600"
                }`}
                aria-live="assertive"
              >
                {feedback.texto}
              </div>
            )}

            {/* Aviso de cambio de norma */}
            {aviso && normaActual && (
              <div
                className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center text-center px-4 z-10"
                role="alert"
              >
                <div className="text-sm uppercase tracking-widest text-yellow-300 font-bold mb-2">📣 ¡Nueva norma!</div>
                <div className="text-3xl font-extrabold leading-tight">{normaActual.texto}</div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="w-full flex justify-center gap-6 mt-3">
            <button
              type="button"
              onClick={() => decidir(false)}
              disabled={aviso || saliendo !== null}
              aria-label="Rechazar invitado"
              className="w-20 h-20 rounded-full bg-white text-4xl shadow-xl active:scale-90 transition disabled:opacity-50"
            >
              ❌
            </button>
            <button
              type="button"
              onClick={() => decidir(true)}
              disabled={aviso || saliendo !== null}
              aria-label="Dejar pasar al invitado"
              className="w-20 h-20 rounded-full bg-white text-4xl shadow-xl active:scale-90 transition disabled:opacity-50"
            >
              ✅
            </button>
          </div>
          <p className="text-xs text-white/75 mt-2">Desliza la tarjeta o usa los botones · ← → en teclado</p>
        </section>
      )}

      {/* ---------- Fin de partida ---------- */}
      {fase === "fin" && (
        <section className="w-full max-w-md bg-white/15 backdrop-blur rounded-3xl p-6 text-center shadow-xl">
          <div className="text-5xl mb-2">{errores >= MAX_ERRORES ? "🚨🎉🚨" : "🎉🕺🎉"}</div>
          <h2 className="text-2xl font-extrabold">
            {errores >= MAX_ERRORES ? "¡La fiesta se descontroló!" : "¡Se acabó el turno!"}
          </h2>
          <div className="mt-4 text-5xl font-black drop-shadow">{score}</div>
          <div className="text-sm text-white/85">puntos</div>
          <div className="mt-2 text-sm font-semibold">
            🏅 Mejor récord: {record} puntos {nuevoRecord && <span className="text-yellow-300">· ¡NUEVO RÉCORD!</span>}
          </div>
          {anecdota && (
            <p className="mt-4 text-sm bg-black/25 rounded-xl px-3 py-2 italic">😂 {anecdota}</p>
          )}

          <button
            type="button"
            onClick={empezar}
            className="mt-5 w-full bg-white text-purple-700 font-bold text-lg py-3 rounded-2xl shadow-lg active:scale-95 transition"
          >
            🔁 Jugar otra vez
          </button>

          <button
            type="button"
            onClick={() => setShowLeaderboard(true)}
            className="mt-3 w-full bg-yellow-400 text-purple-900 font-bold text-lg py-3 rounded-2xl shadow-lg active:scale-95 transition"
          >
            🏆 Ver ranking
          </button>

          <div className="mt-4">
            <ShareButtons url={URL_JUEGO} text={textoCompartir} />
          </div>

          {showLeaderboard && (
            <LeaderboardModal
              game="portero-de-fiesta"
              score={score}
              unit="puntos"
              scoreOrder="high"
              onClose={() => setShowLeaderboard(false)}
            />
          )}
        </section>
      )}
    </div>
  );
}
