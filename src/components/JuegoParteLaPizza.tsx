"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ---------------------------------------------------------------------------
// Tipos y constantes
// ---------------------------------------------------------------------------

type Pt = { x: number; y: number };
type Fase = "intro" | "jugando" | "resultado" | "fin";
type Forma = "redonda" | "ovalada" | "mordisco" | "estrella" | "nube";
type TipoTopping = "pepperoni" | "aceituna" | "albahaca";
type Topping = { x: number; y: number; r: number; tipo: TipoTopping; ang: number };
type Corte = { forma: Forma; pctA: number; puntos: number };
type Revelado = {
  a: Pt;
  b: Pt;
  inicio: number;
  pctA: number;
  cenA: Pt | null;
  cenB: Pt | null;
};

const RONDAS = 5;
const TIEMPO_MS = 45000;
const VERTICES = 64;
const CLAVE_RECORD = "vl_parte-la-pizza_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/parte-la-pizza";
const FORMAS: Forma[] = ["redonda", "ovalada", "mordisco", "estrella", "nube"];

const NOMBRE_FORMA: Record<Forma, string> = {
  redonda: "Redonda",
  ovalada: "Ovalada",
  mordisco: "Con mordisco",
  estrella: "Estrella",
  nube: "Nube",
};

// ---------------------------------------------------------------------------
// Aleatoriedad con semilla (todos juegan las mismas pizzas cada día)
// ---------------------------------------------------------------------------

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

function semillaDelDia(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function mezclarSemilla(base: number, n: number): number {
  let h = (base ^ Math.imul(n + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function ordenFormas(semilla: number): Forma[] {
  const rnd = mulberry32(mezclarSemilla(semilla, 99));
  const lista = [...FORMAS];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = lista[i];
    lista[i] = lista[j];
    lista[j] = tmp;
  }
  return lista;
}

// ---------------------------------------------------------------------------
// Geometría
// ---------------------------------------------------------------------------

// Área con signo (fórmula de Gauss / shoelace)
function areaPoligono(poly: Pt[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    s += p.x * q.y - q.x * p.y;
  }
  return s / 2;
}

// Sutherland-Hodgman contra el semiplano a un lado de la recta a→b
function recortarSemiplano(poly: Pt[], a: Pt, b: Pt, signo: 1 | -1): Pt[] {
  const lado = (p: Pt): number =>
    signo * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
  const corte = (p: Pt, q: Pt, sp: number, sq: number): Pt => {
    const t = sp / (sp - sq);
    return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
  };
  const salida: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const actual = poly[i];
    const previo = poly[(i + poly.length - 1) % poly.length];
    const sa = lado(actual);
    const sp = lado(previo);
    if (sa >= 0) {
      if (sp < 0) salida.push(corte(previo, actual, sp, sa));
      salida.push(actual);
    } else if (sp >= 0) {
      salida.push(corte(previo, actual, sp, sa));
    }
  }
  return salida;
}

function centroide(poly: Pt[]): Pt | null {
  if (poly.length < 3) return null;
  const a = areaPoligono(poly);
  if (Math.abs(a) < 1e-6) return null;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const f = p.x * q.y - q.x * p.y;
    cx += (p.x + q.x) * f;
    cy += (p.y + q.y) * f;
  }
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

function dentroPoligono(p: Pt, poly: Pt[]): boolean {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      dentro = !dentro;
    }
  }
  return dentro;
}

function difAngular(a: number, b: number): number {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// ---------------------------------------------------------------------------
// Generación de pizzas (polígono en coordenadas normalizadas, radio ~1)
// ---------------------------------------------------------------------------

function generarPizza(forma: Forma, semilla: number): { poly: Pt[]; tops: Topping[] } {
  const rnd = mulberry32(semilla);
  const rot = rnd() * Math.PI * 2;
  const armonicos = [2, 3, 4, 5, 6, 7].map((k) => ({
    k,
    a: 0.005 + rnd() * 0.01,
    f: rnd() * Math.PI * 2,
  }));

  const mordiscos: { ang: number; ancho: number; prof: number }[] = [];
  if (forma === "mordisco") {
    const n = rnd() < 0.5 ? 1 : 2;
    for (let i = 0; i < n; i++) {
      mordiscos.push({
        ang: rot + i * Math.PI * (0.6 + rnd() * 0.6),
        ancho: 0.45 + rnd() * 0.25,
        prof: 0.22 + rnd() * 0.12,
      });
    }
  }
  const lobuloA = rnd() * Math.PI * 2;
  const lobuloB = rnd() * Math.PI * 2;

  const poly: Pt[] = [];
  for (let i = 0; i < VERTICES; i++) {
    const th = (i / VERTICES) * Math.PI * 2;
    const phi = th - rot;
    let r = 1;
    switch (forma) {
      case "redonda":
        r = 1;
        break;
      case "ovalada": {
        const a = 1.05;
        const b = 0.66;
        r = (a * b) / Math.sqrt((b * Math.cos(phi)) ** 2 + (a * Math.sin(phi)) ** 2);
        break;
      }
      case "mordisco":
        r = 1;
        for (const m of mordiscos) {
          const d = difAngular(th, m.ang);
          if (Math.abs(d) < m.ancho) r -= m.prof * Math.sqrt(1 - (d / m.ancho) ** 2);
        }
        break;
      case "estrella":
        r = 0.5 + 0.55 * Math.pow((1 + Math.cos(5 * phi)) / 2, 1.6);
        break;
      case "nube":
        r = 0.92 + 0.09 * Math.sin(3 * th + lobuloA) + 0.06 * Math.sin(5 * th + lobuloB);
        break;
    }
    // Ruido suave para que ninguna pizza sea perfecta
    let ruido = 0;
    for (const h of armonicos) ruido += h.a * Math.sin(h.k * th + h.f);
    r *= 1 + ruido;
    poly.push({ x: r * Math.cos(th), y: r * Math.sin(th) });
  }

  // Ingredientes dentro de la zona de queso
  const interior = poly.map((p) => ({ x: p.x * 0.85, y: p.y * 0.85 }));
  const tops: Topping[] = [];
  const plan: { tipo: TipoTopping; n: number; r: [number, number] }[] = [
    { tipo: "pepperoni", n: 8, r: [0.1, 0.13] },
    { tipo: "aceituna", n: 5, r: [0.04, 0.05] },
    { tipo: "albahaca", n: 4, r: [0.06, 0.075] },
  ];
  for (const grupo of plan) {
    let colocados = 0;
    let intentos = 0;
    while (colocados < grupo.n && intentos < 300) {
      intentos++;
      const ang = rnd() * Math.PI * 2;
      const dist = Math.sqrt(rnd()) * 0.8;
      const r = grupo.r[0] + rnd() * (grupo.r[1] - grupo.r[0]);
      const p = { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist };
      const bordes: Pt[] = [
        p,
        { x: p.x + r, y: p.y },
        { x: p.x - r, y: p.y },
        { x: p.x, y: p.y + r },
        { x: p.x, y: p.y - r },
      ];
      if (!bordes.every((q) => dentroPoligono(q, interior))) continue;
      const choca = tops.some((t) => Math.hypot(t.x - p.x, t.y - p.y) < t.r + r + 0.02);
      if (choca) continue;
      tops.push({ x: p.x, y: p.y, r, tipo: grupo.tipo, ang: rnd() * Math.PI * 2 });
      colocados++;
    }
  }
  return { poly, tops };
}

// ---------------------------------------------------------------------------
// Dibujo
// ---------------------------------------------------------------------------

function dibujarPizza(
  ctx: CanvasRenderingContext2D,
  poly: Pt[],
  tops: Topping[],
  cx: number,
  cy: number,
  R: number
): void {
  const trazar = (esc: number): void => {
    ctx.beginPath();
    poly.forEach((p, i) => {
      const x = cx + p.x * R * esc;
      const y = cy + p.y * R * esc;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };

  // Corteza con sombra
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = R * 0.08;
  ctx.shadowOffsetY = R * 0.03;
  const g = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.1);
  g.addColorStop(0, "#fcd34d");
  g.addColorStop(0.75, "#f59e0b");
  g.addColorStop(1, "#b45309");
  trazar(1);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  trazar(1);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#92400e";
  ctx.stroke();

  // Salsa y queso
  trazar(0.9);
  ctx.fillStyle = "#dc2626";
  ctx.fill();
  trazar(0.85);
  ctx.fillStyle = "#fde68a";
  ctx.fill();

  // Ingredientes recortados al queso
  ctx.save();
  trazar(0.85);
  ctx.clip();
  for (const t of tops) {
    const x = cx + t.x * R;
    const y = cy + t.y * R;
    const r = t.r * R;
    if (t.tipo === "pepperoni") {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#b91c1c";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      ctx.fillStyle = "#7f1d1d";
      for (let k = 0; k < 3; k++) {
        const a = t.ang + k * 2.1;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (t.tipo === "aceituna") {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#1f2937";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "#fde68a";
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.2, r * 0.55, t.ang, 0, Math.PI * 2);
      ctx.fillStyle = "#15803d";
      ctx.fill();
    }
  }
  ctx.restore();
}

function rectRedondeado(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Utilidades de presentación
// ---------------------------------------------------------------------------

function parPorcentajes(pctA: number): [number, number] {
  const a = Math.round(pctA * 10) / 10;
  const b = Math.round((100 - a) * 10) / 10;
  return [a, b];
}

function fmtPct(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function textoCorte(pctA: number): string {
  const [a, b] = parPorcentajes(pctA);
  return `${fmtPct(a)}% / ${fmtPct(b)}%`;
}

function veredicto(puntos: number): string {
  if (puntos >= 196) return "¡Corte de cirujano! 🎯";
  if (puntos >= 170) return "¡Casi perfecto! 🔥";
  if (puntos >= 120) return "Nada mal 👌";
  if (puntos >= 40) return "Alguien va a protestar… 😬";
  return "¡Pelea asegurada! 😅";
}

function tituloFinal(score: number): string {
  if (score >= 900) return "Maestro pizzero 👨‍🍳";
  if (score >= 700) return "Pulso de cirujano 🔪";
  if (score >= 450) return "Reparto aceptable 🍕";
  return "Habrá discusión en la mesa 😂";
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function JuegoParteLaPizza() {
  const [fase, setFase] = useState<Fase>("intro");
  const [ronda, setRonda] = useState<number>(0);
  const [forma, setForma] = useState<Forma>("redonda");
  const [cortes, setCortes] = useState<Corte[]>([]);
  const [ultimo, setUltimo] = useState<Corte | null>(null);
  const [restante, setRestante] = useState<number>(TIEMPO_MS);
  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(0);
  const [nuevoRecord, setNuevoRecord] = useState<boolean>(false);
  const [sinTiempo, setSinTiempo] = useState<boolean>(false);
  const [aviso, setAviso] = useState<string>("");
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faseRef = useRef<Fase>("intro");
  const polyRef = useRef<Pt[]>([]);
  const toppingsRef = useRef<Topping[]>([]);
  const formaRef = useRef<Forma>("redonda");
  const dragRef = useRef<{ a: Pt; b: Pt } | null>(null);
  const reveladoRef = useRef<Revelado | null>(null);
  const cortesRef = useRef<Corte[]>([]);
  const restanteRef = useRef<number>(TIEMPO_MS);
  const ultimoTickRef = useRef<number>(0);
  const semillaRef = useRef<number>(0);
  const ordenRef = useRef<Forma[]>(FORMAS);
  const bestRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  // Récord guardado
  useEffect(() => {
    try {
      const guardado = Number(localStorage.getItem(CLAVE_RECORD) ?? "0");
      if (Number.isFinite(guardado) && guardado > 0) {
        bestRef.current = guardado;
        setBest(guardado);
      }
    } catch {
      // localStorage no disponible (modo privado, etc.)
    }
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const cambiarFase = useCallback((f: Fase) => {
    faseRef.current = f;
    setFase(f);
  }, []);

  const prepararRonda = useCallback((i: number) => {
    const f = ordenRef.current[i] ?? "redonda";
    const { poly, tops } = generarPizza(f, mezclarSemilla(semillaRef.current, i + 1));
    polyRef.current = poly;
    toppingsRef.current = tops;
    formaRef.current = f;
    reveladoRef.current = null;
    dragRef.current = null;
    setForma(f);
    setRonda(i);
    setAviso("");
  }, []);

  const terminar = useCallback(
    (porTiempo: boolean) => {
      if (faseRef.current === "fin") return;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      dragRef.current = null;
      reveladoRef.current = null;
      const total = cortesRef.current.reduce((s, c) => s + c.puntos, 0);
      const final = Math.max(1, Math.round(total));
      const esRecord = final > bestRef.current;
      if (esRecord) {
        bestRef.current = final;
        setBest(final);
        try {
          localStorage.setItem(CLAVE_RECORD, String(final));
        } catch {
          // sin persistencia disponible
        }
      }
      setNuevoRecord(esRecord);
      setSinTiempo(porTiempo);
      setScore(final);
      cambiarFase("fin");
    },
    [cambiarFase]
  );

  const siguiente = useCallback(() => {
    timeoutRef.current = null;
    const hechas = cortesRef.current.length;
    if (hechas >= RONDAS) {
      terminar(false);
    } else {
      prepararRonda(hechas);
      cambiarFase("jugando");
    }
  }, [prepararRonda, terminar, cambiarFase]);

  const empezar = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    semillaRef.current = semillaDelDia();
    ordenRef.current = ordenFormas(semillaRef.current);
    cortesRef.current = [];
    setCortes([]);
    setUltimo(null);
    restanteRef.current = TIEMPO_MS;
    setRestante(TIEMPO_MS);
    setScore(0);
    setNuevoRecord(false);
    setSinTiempo(false);
    setShowLeaderboard(false);
    prepararRonda(0);
    cambiarFase("jugando");
  }, [prepararRonda, cambiarFase]);

  // Cronómetro: sólo corre mientras se está cortando (se pausa al enseñar el resultado)
  useEffect(() => {
    if (fase !== "jugando") return;
    ultimoTickRef.current = performance.now();
    const id = window.setInterval(() => {
      const ahora = performance.now();
      restanteRef.current -= ahora - ultimoTickRef.current;
      ultimoTickRef.current = ahora;
      if (restanteRef.current <= 0) {
        restanteRef.current = 0;
        setRestante(0);
        terminar(true);
      } else {
        setRestante(restanteRef.current);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [fase, terminar]);

  // Dibujo de cada fotograma
  const dibujar = useCallback((ahora: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.4;
    const poly = polyRef.current;
    const tops = toppingsRef.current;
    if (poly.length < 3) return;
    const aPx = (p: Pt): Pt => ({ x: cx + p.x * R, y: cy + p.y * R });
    const LEJOS = 4000;

    const rev = reveladoRef.current;
    if (rev) {
      const a = aPx(rev.a);
      const b = aPx(rev.b);
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
      const n = { x: -u.y, y: u.x }; // el trozo A queda en +n
      const t = Math.min(1, (ahora - rev.inicio) / 550);
      const e = 1 - Math.pow(1 - t, 3);
      const sep = e * R * 0.12;

      for (const lado of [1, -1] as const) {
        ctx.save();
        ctx.translate(n.x * sep * lado, n.y * sep * lado);
        ctx.beginPath();
        ctx.moveTo(a.x - u.x * LEJOS, a.y - u.y * LEJOS);
        ctx.lineTo(a.x + u.x * LEJOS, a.y + u.y * LEJOS);
        ctx.lineTo(a.x + u.x * LEJOS + n.x * LEJOS * lado, a.y + u.y * LEJOS + n.y * LEJOS * lado);
        ctx.lineTo(a.x - u.x * LEJOS + n.x * LEJOS * lado, a.y - u.y * LEJOS + n.y * LEJOS * lado);
        ctx.closePath();
        ctx.clip();
        dibujarPizza(ctx, poly, tops, cx, cy, R);
        ctx.restore();
      }

      // Porcentaje encima de cada trozo
      if (t > 0.35) {
        const alfa = Math.min(1, (t - 0.35) / 0.4);
        const [pa, pb] = parPorcentajes(rev.pctA);
        const etiquetas: { cen: Pt | null; pct: number; lado: 1 | -1 }[] = [
          { cen: rev.cenA, pct: pa, lado: 1 },
          { cen: rev.cenB, pct: pb, lado: -1 },
        ];
        ctx.save();
        ctx.globalAlpha = alfa;
        const tamFuente = Math.max(15, Math.round(R * 0.13));
        ctx.font = `800 ${tamFuente}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const et of etiquetas) {
          if (!et.cen) continue;
          const p = aPx(et.cen);
          const x = p.x + n.x * sep * et.lado;
          const y = p.y + n.y * sep * et.lado;
          const texto = `${fmtPct(et.pct)}%`;
          const ancho = ctx.measureText(texto).width + tamFuente * 0.9;
          const alto = tamFuente * 1.6;
          ctx.shadowColor = "rgba(0,0,0,0.25)";
          ctx.shadowBlur = 8;
          rectRedondeado(ctx, x - ancho / 2, y - alto / 2, ancho, alto, alto / 2);
          ctx.fillStyle = "rgba(255,255,255,0.96)";
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#9a3412";
          ctx.fillText(texto, x, y + 1);
        }
        ctx.restore();
      }
      return;
    }

    dibujarPizza(ctx, poly, tops, cx, cy, R);

    // Línea de corte en vivo
    const d = dragRef.current;
    if (d) {
      const len = Math.hypot(d.b.x - d.a.x, d.b.y - d.a.y);
      if (len > 2) {
        const u = { x: (d.b.x - d.a.x) / len, y: (d.b.y - d.a.y) / len };
        ctx.save();
        ctx.setLineDash([6, 7]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.beginPath();
        ctx.moveTo(d.a.x - u.x * LEJOS, d.a.y - u.y * LEJOS);
        ctx.lineTo(d.b.x + u.x * LEJOS, d.b.y + u.y * LEJOS);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 6;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(d.a.x, d.a.y);
      ctx.lineTo(d.b.x, d.b.y);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(d.a.x, d.a.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    if (fase !== "jugando" && fase !== "resultado") return;
    let raf = 0;
    const bucle = (t: number) => {
      dibujar(t);
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);
    return () => cancelAnimationFrame(raf);
  }, [fase, dibujar]);

  // Cálculo del corte
  const cortar = useCallback(
    (a: Pt, b: Pt, canvas: HTMLCanvasElement) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const R = Math.min(w, h) * 0.4;
      const aNorm = (p: Pt): Pt => ({ x: (p.x - w / 2) / R, y: (p.y - h / 2) / R });
      const aN = aNorm(a);
      const bN = aNorm(b);
      const poly = polyRef.current;
      const total = Math.abs(areaPoligono(poly));
      const trozoA = recortarSemiplano(poly, aN, bN, 1);
      const trozoB = recortarSemiplano(poly, aN, bN, -1);
      const areaA = trozoA.length >= 3 ? Math.abs(areaPoligono(trozoA)) : 0;
      const pctA = total > 0 ? Math.min(100, Math.max(0, (areaA / total) * 100)) : 50;
      const puntos = Math.round(Math.max(0, 100 - Math.abs(50 - pctA) * 10) * 2);
      const corte: Corte = { forma: formaRef.current, pctA, puntos };

      cortesRef.current = [...cortesRef.current, corte];
      setCortes(cortesRef.current);
      setUltimo(corte);
      reveladoRef.current = {
        a: aN,
        b: bN,
        inicio: performance.now(),
        pctA,
        cenA: centroide(trozoA),
        cenB: centroide(trozoB),
      };
      cambiarFase("resultado");
      timeoutRef.current = window.setTimeout(siguiente, 1800);
    },
    [cambiarFase, siguiente]
  );

  const puntoLocal = (clientX: number, clientY: number, canvas: HTMLCanvasElement): Pt => {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const totalPuntos = cortes.reduce((s, c) => s + c.puntos, 0);
  const segundos = Math.ceil(restante / 1000);
  const mejorCorte =
    cortes.length > 0 ? cortes.reduce((m, c) => (c.puntos > m.puntos ? c : m), cortes[0]) : null;

  const textoCompartir = mejorCorte
    ? `🍕 He partido pizzas en "Parte la Pizza" y he sacado ${score} puntos. Mi mejor corte: ${textoCorte(
        mejorCorte.pctA
      )} 🔪 ¿Eres capaz de partirla justo por la mitad?`
    : `🍕 He sacado ${score} puntos en "Parte la Pizza". ¿Eres capaz de partirla justo por la mitad?`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 px-4 py-5 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <header className="flex items-center justify-between">
          <Link
            href="/juegos"
            className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold backdrop-blur hover:bg-white/30"
            aria-label="Volver a todos los juegos"
          >
            ← Juegos
          </Link>
          {best > 0 && (
            <span className="rounded-full bg-black/20 px-3 py-1.5 text-sm font-semibold">
              🏆 Récord: {best}
            </span>
          )}
        </header>

        {fase === "intro" && (
          <section className="flex flex-col items-center gap-5 rounded-3xl bg-white/15 p-6 text-center shadow-xl backdrop-blur">
            <div className="text-7xl" aria-hidden="true">
              🍕
            </div>
            <div>
              <h1 className="text-3xl font-extrabold drop-shadow">Parte la Pizza</h1>
              <p className="mt-2 text-lg font-medium text-white/90">
                ¿Eres capaz de partirla justo por la mitad?
              </p>
            </div>
            <ul className="w-full space-y-2 rounded-2xl bg-black/15 p-4 text-left text-sm">
              <li>🔪 Traza <strong>una línea recta</strong> con el dedo o el ratón.</li>
              <li>⚖️ Calculamos el % exacto de cada trozo.</li>
              <li>🎯 Cuanto más cerca del 50/50, más puntos (hasta 200 por ronda).</li>
              <li>⏱️ 5 pizzas distintas en 45 segundos.</li>
              <li>📅 Las pizzas de hoy son iguales para todo el mundo.</li>
            </ul>
            <button
              type="button"
              onClick={empezar}
              className="w-full rounded-2xl bg-white px-6 py-4 text-xl font-extrabold text-orange-600 shadow-lg transition active:scale-95 hover:bg-yellow-50"
              aria-label="Empezar a jugar a Parte la Pizza"
            >
              ¡A cortar! 🔪
            </button>
          </section>
        )}

        {(fase === "jugando" || fase === "resultado") && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 text-sm font-bold">
              <span className="rounded-full bg-black/20 px-3 py-1.5">
                Ronda {ronda + 1}/{RONDAS} · {NOMBRE_FORMA[forma]}
              </span>
              <span className="rounded-full bg-black/20 px-3 py-1.5" aria-label={`${segundos} segundos restantes`}>
                ⏱️ {segundos}s
              </span>
              <span className="rounded-full bg-black/20 px-3 py-1.5">{totalPuntos} pts</span>
            </div>

            <div
              className="h-2 w-full overflow-hidden rounded-full bg-black/20"
              role="progressbar"
              aria-label="Tiempo restante"
              aria-valuemin={0}
              aria-valuemax={45}
              aria-valuenow={segundos}
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-100"
                style={{ width: `${(restante / TIEMPO_MS) * 100}%` }}
              />
            </div>

            <div className="rounded-3xl bg-orange-900/25 p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                className="block aspect-square w-full cursor-crosshair touch-none select-none"
                aria-label="Pizza para cortar. Arrastra el dedo o el ratón en línea recta para partirla en dos trozos lo más iguales posible."
                onPointerDown={(e) => {
                  if (faseRef.current !== "jugando") return;
                  e.preventDefault();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  const p = puntoLocal(e.clientX, e.clientY, e.currentTarget);
                  dragRef.current = { a: p, b: p };
                  setAviso("");
                }}
                onPointerMove={(e) => {
                  const d = dragRef.current;
                  if (!d || faseRef.current !== "jugando") return;
                  d.b = puntoLocal(e.clientX, e.clientY, e.currentTarget);
                }}
                onPointerUp={(e) => {
                  const d = dragRef.current;
                  dragRef.current = null;
                  if (!d || faseRef.current !== "jugando") return;
                  const fin = puntoLocal(e.clientX, e.clientY, e.currentTarget);
                  if (Math.hypot(fin.x - d.a.x, fin.y - d.a.y) < 25) {
                    setAviso("Arrastra un poco más para trazar el corte ✋");
                    return;
                  }
                  cortar(d.a, fin, e.currentTarget);
                }}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
              />
            </div>

            <div className="min-h-[4.5rem] rounded-2xl bg-white/15 p-3 text-center backdrop-blur" aria-live="polite">
              {fase === "resultado" && ultimo ? (
                <>
                  <p className="text-2xl font-extrabold tabular-nums">{textoCorte(ultimo.pctA)}</p>
                  <p className="text-sm font-semibold">
                    {veredicto(ultimo.puntos)} · +{ultimo.puntos} pts
                  </p>
                </>
              ) : (
                <p className="pt-2 text-base font-semibold">
                  {aviso || "Traza una línea recta para partirla por la mitad 🔪"}
                </p>
              )}
            </div>
          </section>
        )}

        {fase === "fin" && (
          <section className="flex flex-col gap-4 rounded-3xl bg-white/15 p-5 text-center shadow-xl backdrop-blur">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                {sinTiempo ? "⏰ ¡Se acabó el tiempo!" : "¡Pizzas repartidas!"}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold">{tituloFinal(score)}</h2>
            </div>

            <div className="rounded-2xl bg-white p-4 text-orange-600 shadow-lg">
              <p className="text-6xl font-black tabular-nums">{score}</p>
              <p className="text-sm font-bold uppercase">puntos de 1000</p>
              {nuevoRecord ? (
                <p className="mt-2 font-extrabold text-red-500">🎉 ¡Nuevo récord!</p>
              ) : (
                <p className="mt-2 font-semibold text-orange-500">Tu récord: {best} puntos</p>
              )}
            </div>

            {mejorCorte && (
              <div className="rounded-2xl bg-black/20 p-3">
                <p className="text-xs font-semibold uppercase text-white/80">Tu mejor corte</p>
                <p className="text-3xl font-black tabular-nums">{textoCorte(mejorCorte.pctA)}</p>
              </div>
            )}

            <ol className="space-y-1.5 text-left text-sm" aria-label="Resultado de cada ronda">
              {Array.from({ length: RONDAS }, (_, i) => {
                const c = cortes[i];
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-black/15 px-3 py-2"
                  >
                    <span className="font-semibold">
                      {i + 1}. {c ? NOMBRE_FORMA[c.forma] : NOMBRE_FORMA[ordenRef.current[i] ?? "redonda"]}
                    </span>
                    <span className="tabular-nums">
                      {c ? `${textoCorte(c.pctA)} · ${c.puntos} pts` : "Sin cortar · 0 pts"}
                    </span>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={empezar}
              className="w-full rounded-2xl bg-white px-6 py-4 text-lg font-extrabold text-orange-600 shadow-lg transition active:scale-95 hover:bg-yellow-50"
              aria-label="Jugar otra vez a Parte la Pizza"
            >
              🔁 Jugar otra vez
            </button>

            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="w-full rounded-2xl bg-black/25 px-6 py-3 text-lg font-bold text-white transition active:scale-95 hover:bg-black/35"
              aria-label="Ver el ranking de Parte la Pizza"
            >
              🏆 Ver ranking
            </button>

            <div>
              <p className="mb-2 text-sm font-semibold">¡Reta a quien siempre se queda el trozo grande!</p>
              <ShareButtons url={URL_JUEGO} text={textoCompartir} />
            </div>
          </section>
        )}
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game="parte-la-pizza"
          score={score}
          unit="puntos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
