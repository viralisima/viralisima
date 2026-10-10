"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------- Tipos ----------
type Fase = "menu" | "jugando" | "fin";
type Estilo = "espanola" | "mexicana";
type Motivo = "tiempo" | "suelo" | "vidas";

interface Tortilla {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angulo: number;
  omega: number;
  enAire: boolean;
  anguloLanzamiento: number;
}

interface Muestra {
  x: number;
  y: number;
  t: number;
}

interface Aviso {
  texto: string;
  color: string;
  x: number;
  y: number;
  creado: number;
}

interface Hud {
  score: number;
  vidas: number;
  racha: number;
  tiempo: number;
}

interface Resultado {
  score: number;
  maxRacha: number;
  vueltas: number;
  motivo: Motivo;
  restante: number;
}

// ---------- Constantes del juego (coordenadas lógicas) ----------
const W = 360;
const H = 540;
const PAN_Y = 470;
const PAN_HALF = 58;
const RADIO = 42;
const SUELO_Y = 522;
const GRAVEDAD = 1400;
const DURACION = 45;
const VIDAS = 3;
const TOLERANCIA = 0.75;
const DOS_PI = Math.PI * 2;
const BEST_KEY = "vl_tortilla-al-vuelo_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/tortilla-al-vuelo";

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

const grosorDe = (estilo: Estilo): number => (estilo === "espanola" ? 10 : 5);

// Título para compartir según la mejor racha
function nivelDe(racha: number, estilo: Estilo): string {
  const esp = [
    "Nivel quemé la sartén",
    "Nivel bar de carretera",
    "Nivel tortillera de feria",
    "Nivel cocinero de Betanzos",
    "Nivel abuela de Betanzos",
  ];
  const mex = [
    "Nivel se me pegó al comal",
    "Nivel taquería de esquina",
    "Nivel tortillería de barrio",
    "Nivel comal de Oaxaca",
    "Nivel abuelita de Oaxaca",
  ];
  const lista = estilo === "espanola" ? esp : mex;
  if (racha >= 14) return lista[4];
  if (racha >= 9) return lista[3];
  if (racha >= 5) return lista[2];
  if (racha >= 2) return lista[1];
  return lista[0];
}

function tortillaInicial(estilo: Estilo, panX: number): Tortilla {
  return {
    x: panX,
    y: PAN_Y - grosorDe(estilo),
    vx: 0,
    vy: 0,
    angulo: 0,
    omega: 0,
    enAire: false,
    anguloLanzamiento: 0,
  };
}

export default function JuegoTortillaAlVuelo() {
  const [fase, setFase] = useState<Fase>("menu");
  const [estilo, setEstilo] = useState<Estilo>("espanola");
  const [hud, setHud] = useState<Hud>({ score: 0, vidas: VIDAS, racha: 0, tiempo: DURACION });
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [best, setBest] = useState<number>(0);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faseRef = useRef<Fase>("menu");
  const estiloRef = useRef<Estilo>("espanola");
  const panXRef = useRef<number>(W / 2);
  const tortillaRef = useRef<Tortilla>(tortillaInicial("espanola", W / 2));
  const scoreRef = useRef<number>(0);
  const vidasRef = useRef<number>(VIDAS);
  const rachaRef = useRef<number>(0);
  const maxRachaRef = useRef<number>(0);
  const vueltasRef = useRef<number>(0);
  const inicioRef = useRef<number>(0);
  const tiempoMostradoRef = useRef<number>(DURACION);
  const cooldownRef = useRef<number>(0);
  const lanzamientosRef = useRef<number>(0);
  const avisosRef = useRef<Aviso[]>([]);
  const swipeRef = useRef<{ activo: boolean; muestras: Muestra[] }>({ activo: false, muestras: [] });
  const bestRef = useRef<number>(0);

  // Récord guardado
  useEffect(() => {
    try {
      const guardado = Number(window.localStorage.getItem(BEST_KEY));
      if (Number.isFinite(guardado) && guardado > 0) {
        bestRef.current = Math.floor(guardado);
        setBest(Math.floor(guardado));
      }
    } catch {
      // localStorage no disponible
    }
  }, []);

  useEffect(() => {
    estiloRef.current = estilo;
    if (faseRef.current !== "jugando") {
      tortillaRef.current = tortillaInicial(estilo, panXRef.current);
    }
  }, [estilo]);

  const vibrar = useCallback((patron: number | number[]) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(patron);
    }
  }, []);

  const sincronizarHud = useCallback(() => {
    setHud({
      score: scoreRef.current,
      vidas: vidasRef.current,
      racha: rachaRef.current,
      tiempo: tiempoMostradoRef.current,
    });
  }, []);

  const terminar = useCallback(
    (motivo: Motivo, ahora: number) => {
      if (faseRef.current !== "jugando") return;
      faseRef.current = "fin";
      swipeRef.current = { activo: false, muestras: [] };
      const restante = Math.max(0, DURACION - (ahora - inicioRef.current) / 1000);
      const final = Math.max(1, Math.round(scoreRef.current));
      const esRecord = final > bestRef.current;
      if (esRecord) {
        bestRef.current = final;
        setBest(final);
        try {
          window.localStorage.setItem(BEST_KEY, String(final));
        } catch {
          // sin persistencia
        }
      }
      setNuevoRecord(esRecord);
      setResultado({
        score: final,
        maxRacha: maxRachaRef.current,
        vueltas: vueltasRef.current,
        motivo,
        restante,
      });
      sincronizarHud();
      setFase("fin");
      vibrar(motivo === "tiempo" ? 40 : [120, 60, 120]);
    },
    [sincronizarHud, vibrar]
  );

  const terminarRef = useRef(terminar);
  useEffect(() => {
    terminarRef.current = terminar;
  }, [terminar]);

  const nuevoAviso = (texto: string, color: string, x: number, y: number, ahora: number) => {
    avisosRef.current.push({ texto, color, x: clamp(x, 70, W - 70), y, creado: ahora });
    if (avisosRef.current.length > 6) avisosRef.current.shift();
  };

  // Aterrizaje sobre la sartén: decide vuelta limpia, sin vuelta o de canto
  const aterrizar = useCallback(
    (ahora: number) => {
      const tor = tortillaRef.current;
      const rot = Math.abs(tor.angulo - tor.anguloLanzamiento);
      const m = rot % DOS_PI;
      const dPi = Math.abs(m - Math.PI);
      const d0 = Math.min(m, DOS_PI - m);

      tor.enAire = false;
      tor.vx = 0;
      tor.vy = 0;
      tor.omega = 0;
      tor.angulo = ((Math.round(tor.angulo / Math.PI) * Math.PI) % DOS_PI + DOS_PI) % DOS_PI;
      tor.y = PAN_Y - grosorDe(estiloRef.current);
      cooldownRef.current = ahora + 150;

      if (dPi < TOLERANCIA) {
        const puntos = 10 + 5 * rachaRef.current;
        scoreRef.current += puntos;
        rachaRef.current += 1;
        vueltasRef.current += 1;
        maxRachaRef.current = Math.max(maxRachaRef.current, rachaRef.current);
        nuevoAviso(
          rachaRef.current > 1 ? `¡Vuelta limpia x${rachaRef.current}! +${puntos}` : `¡Vuelta limpia! +${puntos}`,
          "#15803d",
          tor.x,
          PAN_Y - 60,
          ahora
        );
        vibrar(25);
      } else if (d0 < TOLERANCIA) {
        rachaRef.current = 0;
        nuevoAviso("Ni se ha girado", "#92400e", tor.x, PAN_Y - 60, ahora);
        vibrar(15);
      } else {
        rachaRef.current = 0;
        vidasRef.current -= 1;
        nuevoAviso("¡De canto! −1 vida", "#b91c1c", tor.x, PAN_Y - 60, ahora);
        vibrar([60, 40, 60]);
        if (vidasRef.current <= 0) {
          sincronizarHud();
          terminarRef.current("vidas", ahora);
          return;
        }
      }
      sincronizarHud();
    },
    [sincronizarHud, vibrar]
  );

  const aterrizarRef = useRef(aterrizar);
  useEffect(() => {
    aterrizarRef.current = aterrizar;
  }, [aterrizar]);

  // ---------- Dibujo ----------
  const dibujar = useCallback((ctx: CanvasRenderingContext2D, ahora: number) => {
    const est = estiloRef.current;
    const grosor = grosorDe(est);
    const tor = tortillaRef.current;
    const panX = panXRef.current;

    // Pared de cocina
    const fondo = ctx.createLinearGradient(0, 0, 0, H);
    fondo.addColorStop(0, "#fff7e6");
    fondo.addColorStop(1, "#fde7c2");
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, W, H);

    // Azulejos
    ctx.strokeStyle = "rgba(180, 120, 40, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SUELO_Y);
      ctx.stroke();
    }
    for (let y = 0; y <= SUELO_Y; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Suelo
    ctx.fillStyle = "#7c4a1e";
    ctx.fillRect(0, SUELO_Y, W, H - SUELO_Y);
    ctx.fillStyle = "#5c3512";
    for (let x = 0; x < W; x += 30) ctx.fillRect(x, SUELO_Y, 2, H - SUELO_Y);

    // Sartén (o comal)
    ctx.fillStyle = "#6b3f1d";
    ctx.fillRect(panX + PAN_HALF - 4, PAN_Y + 2, 64, 9);
    ctx.fillStyle = "#1f2937";
    ctx.beginPath();
    ctx.ellipse(panX, PAN_Y + 8, PAN_HALF, 11, 0, 0, DOS_PI);
    ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.beginPath();
    ctx.ellipse(panX, PAN_Y + 4, PAN_HALF - 4, 6, 0, 0, DOS_PI);
    ctx.fill();

    // Tortilla: mitad de arriba = cara A, mitad de abajo = cara B (tostada)
    const caraA = est === "espanola" ? "#facc15" : "#f5e6bd";
    const caraB = est === "espanola" ? "#c2410c" : "#d4a856";
    ctx.save();
    ctx.translate(tor.x, tor.y);
    ctx.rotate(tor.angulo);
    ctx.fillStyle = caraB;
    ctx.beginPath();
    ctx.ellipse(0, 0, RADIO, grosor, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = caraA;
    ctx.beginPath();
    ctx.ellipse(0, 0, RADIO, grosor, 0, Math.PI, DOS_PI);
    ctx.fill();
    if (est === "mexicana") {
      ctx.fillStyle = "rgba(120, 70, 20, 0.55)";
      const manchas = [-26, -12, 4, 18, 30];
      manchas.forEach((mx) => {
        ctx.beginPath();
        ctx.arc(mx, 1.5, 1.6, 0, DOS_PI);
        ctx.fill();
      });
    }
    ctx.strokeStyle = "rgba(90, 50, 10, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, RADIO, grosor, 0, 0, DOS_PI);
    ctx.stroke();
    ctx.restore();

    // Indicador si la tortilla sale por arriba
    if (tor.y < -grosor) {
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.moveTo(tor.x, 6);
      ctx.lineTo(tor.x - 9, 20);
      ctx.lineTo(tor.x + 9, 20);
      ctx.closePath();
      ctx.fill();
    }

    // Pista inicial
    if (faseRef.current === "jugando" && lanzamientosRef.current === 0 && !tor.enAire) {
      ctx.fillStyle = "rgba(146, 64, 14, 0.85)";
      ctx.font = "bold 18px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Desliza hacia arriba ↑", W / 2, 200);
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillText("Más fuerza = más altura y más giro", W / 2, 224);
    }

    // Avisos flotantes
    avisosRef.current = avisosRef.current.filter((a) => ahora - a.creado < 1100);
    avisosRef.current.forEach((a) => {
      const p = (ahora - a.creado) / 1100;
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = a.color;
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(a.texto, a.x, a.y - p * 50);
      ctx.globalAlpha = 1;
    });
  }, []);

  // ---------- Bucle principal ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let ultimo = performance.now();

    const paso = (ahora: number) => {
      const dt = Math.min(0.033, Math.max(0, (ahora - ultimo) / 1000));
      ultimo = ahora;

      if (faseRef.current === "jugando") {
        // Temporizador
        const restante = DURACION - (ahora - inicioRef.current) / 1000;
        const mostrado = Math.max(0, Math.ceil(restante));
        if (mostrado !== tiempoMostradoRef.current) {
          tiempoMostradoRef.current = mostrado;
          sincronizarHud();
        }
        if (restante <= 0) {
          terminarRef.current("tiempo", ahora);
        } else {
          const tor = tortillaRef.current;
          const tope = PAN_Y - grosorDe(estiloRef.current);
          if (!tor.enAire) {
            tor.x = panXRef.current;
            tor.y = tope;
          } else {
            const prevY = tor.y;
            tor.vy += GRAVEDAD * dt;
            tor.x += tor.vx * dt;
            tor.y += tor.vy * dt;
            tor.angulo += tor.omega * dt;
            if (tor.x < RADIO) {
              tor.x = RADIO;
              tor.vx = Math.abs(tor.vx) * 0.6;
            } else if (tor.x > W - RADIO) {
              tor.x = W - RADIO;
              tor.vx = -Math.abs(tor.vx) * 0.6;
            }
            const sobreSarten = Math.abs(tor.x - panXRef.current) < PAN_HALF + 12;
            if (tor.vy > 0 && prevY <= tope && tor.y >= tope && sobreSarten) {
              aterrizarRef.current(ahora);
            } else if (tor.y >= SUELO_Y - grosorDe(estiloRef.current)) {
              tor.y = SUELO_Y - grosorDe(estiloRef.current);
              tor.omega = 0;
              nuevoAviso("¡Al suelo!", "#b91c1c", tor.x, SUELO_Y - 40, ahora);
              terminarRef.current("suelo", ahora);
            }
          }
        }
      }

      dibujar(ctx, ahora);
      raf = requestAnimationFrame(paso);
    };

    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [dibujar, sincronizarHud]);

  // ---------- Entrada (puntero: ratón y táctil por igual) ----------
  const puntoLogico = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height,
    };
  };

  const moverSarten = (x: number) => {
    panXRef.current = clamp(x, PAN_HALF, W - PAN_HALF);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (faseRef.current !== "jugando") return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // algunos navegadores no lo permiten
    }
    const p = puntoLogico(e);
    moverSarten(p.x);
    swipeRef.current = { activo: true, muestras: [{ x: p.x, y: p.y, t: performance.now() }] };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (faseRef.current !== "jugando") return;
    const p = puntoLogico(e);
    moverSarten(p.x);
    if (swipeRef.current.activo) {
      const ahora = performance.now();
      const muestras = swipeRef.current.muestras;
      muestras.push({ x: p.x, y: p.y, t: ahora });
      while (muestras.length > 2 && ahora - muestras[0].t > 160) muestras.shift();
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const swipe = swipeRef.current;
    swipeRef.current = { activo: false, muestras: [] };
    if (faseRef.current !== "jugando" || !swipe.activo) return;
    const tor = tortillaRef.current;
    const ahora = performance.now();
    if (tor.enAire || ahora < cooldownRef.current) return;

    const p = puntoLogico(e);
    // Velocidad del gesto en los últimos ~120 ms
    const origen = swipe.muestras.find((m) => ahora - m.t <= 120) ?? swipe.muestras[0];
    if (!origen) return;
    const dy = origen.y - p.y;
    const dx = p.x - origen.x;
    const dt = Math.max(0.04, (ahora - origen.t) / 1000);
    if (dy < 25) return;

    const velocidad = dy / dt;
    const vy = clamp(velocidad * 0.45, 380, 1200);
    const sentido = dx < 0 ? -1 : 1;
    tor.vy = -vy;
    tor.vx = clamp((dx / dt) * 0.15, -220, 220);
    tor.omega = 0.006 * vy * sentido;
    tor.enAire = true;
    tor.anguloLanzamiento = tor.angulo;
    lanzamientosRef.current += 1;
    vibrar(10);
  };

  // ---------- Control de partida ----------
  const empezar = () => {
    panXRef.current = W / 2;
    tortillaRef.current = tortillaInicial(estiloRef.current, W / 2);
    scoreRef.current = 0;
    vidasRef.current = VIDAS;
    rachaRef.current = 0;
    maxRachaRef.current = 0;
    vueltasRef.current = 0;
    lanzamientosRef.current = 0;
    tiempoMostradoRef.current = DURACION;
    cooldownRef.current = 0;
    avisosRef.current = [];
    swipeRef.current = { activo: false, muestras: [] };
    inicioRef.current = performance.now();
    faseRef.current = "jugando";
    setResultado(null);
    setNuevoRecord(false);
    setShowLeaderboard(false);
    setHud({ score: 0, vidas: VIDAS, racha: 0, tiempo: DURACION });
    setFase("jugando");
  };

  const nivel = resultado ? nivelDe(resultado.maxRacha, estilo) : "";
  const textoCompartir = resultado
    ? `${nivel}: ${resultado.maxRacha} ${resultado.maxRacha === 1 ? "vuelta seguida" : "vueltas seguidas"} y ${resultado.score} puntos en Tortilla al Vuelo ${estilo === "espanola" ? "🇪🇸" : "🇲🇽"}🍳 ¿Tú le das la vuelta mejor?`
    : "";

  const mensajeFinal = (r: Resultado): string => {
    if (r.motivo === "suelo") {
      return r.restante < 3
        ? `¡Al suelo a ${r.restante.toFixed(1)} s del final! Duele.`
        : "La tortilla acabó en el suelo.";
    }
    if (r.motivo === "vidas") return "Tres tortillas de canto. Se acabó.";
    return "¡Tiempo! La tortilla sobrevivió los 45 segundos.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 px-3 py-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        <header className="flex items-center justify-between text-white">
          <Link
            href="/juegos"
            className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur hover:bg-white/30"
            aria-label="Volver a la lista de juegos"
          >
            ← Juegos
          </Link>
          <p className="text-sm font-semibold opacity-90">Récord: {best} puntos</p>
        </header>

        <div className="text-center text-white drop-shadow">
          <h1 className="text-3xl font-black sm:text-4xl">🍳 Tortilla al Vuelo</h1>
          <p className="text-sm font-medium opacity-95 sm:text-base">Dale la vuelta sin que acabe en el suelo</p>
        </div>

        {/* Marcador */}
        <div
          className="grid grid-cols-4 gap-2 rounded-2xl bg-white/90 p-2 text-center shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase text-amber-700">Puntos</p>
            <p className="text-xl font-black text-amber-900">{hud.score}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-amber-700">Tiempo</p>
            <p className={`text-xl font-black ${hud.tiempo <= 5 && fase === "jugando" ? "text-red-600" : "text-amber-900"}`}>
              {hud.tiempo}s
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-amber-700">Racha</p>
            <p className="text-xl font-black text-amber-900">{hud.racha}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-amber-700">Vidas</p>
            <p className="text-lg leading-7" aria-label={`${hud.vidas} vidas`}>
              {"❤️".repeat(Math.max(0, hud.vidas))}
              {"🖤".repeat(Math.max(0, VIDAS - hud.vidas))}
            </p>
          </div>
        </div>

        {/* Zona de juego */}
        <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/40" style={{ aspectRatio: `${W} / ${H}` }}>
          <canvas
            ref={canvasRef}
            className="block h-full w-full touch-none select-none"
            aria-label="Cocina con una sartén: desliza hacia arriba para lanzar la tortilla y mueve el dedo para recogerla"
            role="img"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              swipeRef.current = { activo: false, muestras: [] };
            }}
          />

          {fase === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-amber-950/60 p-5 text-center text-white backdrop-blur-sm">
              <p className="text-5xl" aria-hidden="true">🍳</p>
              <h2 className="text-2xl font-black">¿Qué tortilla vas a voltear?</h2>
              <div className="grid w-full grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de tortilla">
                <button
                  type="button"
                  role="radio"
                  aria-checked={estilo === "espanola"}
                  onClick={() => setEstilo("espanola")}
                  className={`rounded-2xl px-3 py-3 font-bold transition ${
                    estilo === "espanola" ? "bg-yellow-400 text-amber-950 ring-4 ring-white" : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  🇪🇸 Española
                  <span className="block text-xs font-medium opacity-80">De patata, gordita</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={estilo === "mexicana"}
                  onClick={() => setEstilo("mexicana")}
                  className={`rounded-2xl px-3 py-3 font-bold transition ${
                    estilo === "mexicana" ? "bg-yellow-400 text-amber-950 ring-4 ring-white" : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  🇲🇽 Mexicana
                  <span className="block text-xs font-medium opacity-80">De maíz, finita</span>
                </button>
              </div>
              <ul className="space-y-1 text-left text-sm opacity-95">
                <li>☝️ Desliza hacia arriba: la fuerza decide altura y giro.</li>
                <li>↔️ Mueve el dedo para recoger la tortilla con la sartén.</li>
                <li>✅ Cara cambiada: +10 y +5 por cada vuelta seguida.</li>
                <li>⚠️ De canto pierdes una vida. Al suelo, se acabó.</li>
              </ul>
              <button
                type="button"
                onClick={empezar}
                className="w-full rounded-2xl bg-white px-6 py-3 text-lg font-black text-orange-600 shadow-lg transition hover:scale-[1.02] active:scale-95"
              >
                Empezar (45 segundos)
              </button>
            </div>
          )}

          {fase === "fin" && resultado && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-amber-950/70 p-5 text-center text-white backdrop-blur-sm">
              <p className="text-sm font-semibold opacity-90">{mensajeFinal(resultado)}</p>
              <h2 className="text-2xl font-black leading-tight text-yellow-300">{nivel}</h2>
              <p className="text-sm">
                {resultado.maxRacha} {resultado.maxRacha === 1 ? "vuelta seguida" : "vueltas seguidas"} · {resultado.vueltas} en total
              </p>
              <div className="flex w-full justify-center gap-3">
                <div className="flex-1 rounded-2xl bg-white/15 p-3">
                  <p className="text-xs uppercase opacity-80">Puntuación</p>
                  <p className="text-3xl font-black">{resultado.score}</p>
                  <p className="text-xs opacity-80">puntos</p>
                </div>
                <div className="flex-1 rounded-2xl bg-white/15 p-3">
                  <p className="text-xs uppercase opacity-80">Mejor récord</p>
                  <p className="text-3xl font-black">{best}</p>
                  <p className="text-xs opacity-80">{nuevoRecord ? "¡Nuevo récord! 🎉" : "puntos"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={empezar}
                className="w-full rounded-2xl bg-white px-6 py-3 text-lg font-black text-orange-600 shadow-lg transition hover:scale-[1.02] active:scale-95"
              >
                Jugar otra vez
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboard(true)}
                className="w-full rounded-2xl bg-yellow-400 px-6 py-2.5 font-bold text-amber-950 shadow transition hover:bg-yellow-300"
                aria-label="Ver ranking de Tortilla al Vuelo"
              >
                🏆 Ver ranking
              </button>
              <div className="w-full">
                <ShareButtons url={URL_JUEGO} text={textoCompartir} />
              </div>
              <button
                type="button"
                onClick={() => {
                  faseRef.current = "menu";
                  setFase("menu");
                }}
                className="text-sm font-semibold underline opacity-90 hover:opacity-100"
              >
                Cambiar de tortilla
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs font-medium text-white/90">
          Funciona con el dedo y con el ratón: arrastra hacia arriba y suelta para lanzar.
        </p>
      </div>

      {showLeaderboard && resultado && (
        <LeaderboardModal
          game="tortilla-al-vuelo"
          score={resultado.score}
          unit="puntos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
