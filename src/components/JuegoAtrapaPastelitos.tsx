"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// Pastelitos: emojis de dulces variados
const TREATS = ["🥮", "🧁", "🍰", "🍩", "🥞", "🍪"];
const BOMBS = ["🪨", "💣"];

type Treat = {
  id: number;
  emoji: string;
  isBomb: boolean;
  x: number;
  dir: 1 | -1;
  y: number;
  falling: boolean;
  speed: number;
  fallSpeed: number;
};

const STORAGE_KEY = "vl_atrapa-pastelitos_best";
const STAGE_HEIGHT = 400;
const CAT_WIDTH_PCT = 22;
const TREAT_SIZE = 44;
const FLOOR_Y = STAGE_HEIGHT - 100;
const CAT_MOVE_UNLOCK_SEC = 60;       // a partir de aquí el gato patrulla solo
const CAT_RANGE = 28;                 // amplitud (% del ancho) de la patrulla
const CAT_PERIOD_SEC = 6;             // segundos de un ciclo completo izq-der-izq

export default function JuegoAtrapaPastelitos() {
  const [state, setState] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [fails, setFails] = useState(0);
  const [elapsed, setElapsed] = useState(0); // segundos
  const [treats, setTreats] = useState<Treat[]>([]);
  const [catMood, setCatMood] = useState<"sad" | "happy">("sad");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [catX, setCatX] = useState(50); // % horizontal del centro del gato
  const catXRef = useRef(50);
  const lastTapRef = useRef<number>(0);
  const [idleLeft, setIdleLeft] = useState(6);

  const stageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const startTsRef = useRef<number>(0);
  const idRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved) || 0);
  }, []);

  // --- Sonido: maullido sintético con WebAudio ---
  const miau = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current!;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      // "mi"→ "au": pitch sube y luego baja
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(780, now + 0.09);
      osc.frequency.linearRampToValueAtTime(620, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.42);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1400, now + 0.12);
      filter.frequency.linearRampToValueAtTime(700, now + 0.42);
      filter.Q.value = 6;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.32, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // silencio si el navegador no deja
    }
  }, []);

  const sadBoom = useCallback(() => {
    try {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(g).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch {}
  }, []);

  const showMood = (mood: "happy" | "sad", ms: number) => {
    setCatMood(mood);
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    moodTimerRef.current = setTimeout(() => setCatMood("sad"), ms);
  };

  const flashFeedback = (kind: "good" | "bad") => {
    setFlash(kind);
    setTimeout(() => setFlash(null), 250);
  };

  const start = () => {
    // Desbloqueo AudioContext con el gesto del usuario
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      audioCtxRef.current!.resume();
    } catch {}

    setScore(0);
    setFails(0);
    setElapsed(0);
    setTreats([]);
    setCatMood("sad");
    setCatX(50);
    catXRef.current = 50;
    startTsRef.current = performance.now();
    lastTapRef.current = performance.now();
    setIdleLeft(6);
    lastSpawnRef.current = 0;
    idRef.current = 0;
    setState("playing");
  };


  // --- Bucle principal ---
  useEffect(() => {
    if (state !== "playing") return;

    const loop = (now: number) => {
      const sec = (now - startTsRef.current) / 1000;
      setElapsed(Math.floor(sec));

      // Dificultad: velocidad base sube cada 10s
      const stage = Math.floor(sec / 10);                   // 0,1,2,...
      const speedMult = 1 + stage * 0.28;
      const spawnInterval = Math.max(380, 1100 - stage * 70); // ms entre spawns

      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        setTreats((prev) => {
          const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
          const lane = 20 + Math.random() * 90;
          idRef.current += 1;
          // Probabilidad de bomba: empieza 12%, sube hasta ~30% con la dificultad
          const bombProb = Math.min(0.22, 0.08 + stage * 0.02);
          const isBomb = Math.random() < bombProb;
          const emoji = isBomb
            ? BOMBS[Math.floor(Math.random() * BOMBS.length)]
            : TREATS[Math.floor(Math.random() * TREATS.length)];
          return [
            ...prev,
            {
              id: idRef.current,
              emoji,
              isBomb,
              x: dir === 1 ? -8 : 108,
              dir,
              y: lane,
              falling: false,
              speed: (0.35 + Math.random() * 0.25) * speedMult,
              fallSpeed: 0,
            },
          ];
        });
      }

      // Patrulla automática del gato a partir del segundo CAT_MOVE_UNLOCK_SEC
      // Inactividad: si pasan 6s sin tocar nada → -1 vida y reinicia contador
      const idleSec = (now - lastTapRef.current) / 1000;
      const left = Math.max(0, Math.ceil(6 - idleSec));
      setIdleLeft(left);
      if (idleSec >= 6) {
        lastTapRef.current = now;
        setFails((f) => f + 1);
        sadBoom();
        flashFeedback("bad");
      }

      if (sec >= CAT_MOVE_UNLOCK_SEC) {
        const t = sec - CAT_MOVE_UNLOCK_SEC;
        const phase = (t / CAT_PERIOD_SEC) * Math.PI * 2;
        const nx = 50 + Math.sin(phase) * CAT_RANGE;
        catXRef.current = nx;
        setCatX(nx);
      }

      // Avance físico
      setTreats((prev) => {
        const next: Treat[] = [];
        let caughtCount = 0;
        let missedCount = 0;
        for (const t of prev) {
          if (t.falling) {
            const fy = t.y + t.fallSpeed;
            const fs = t.fallSpeed + 0.55; // gravedad
            if (fy >= FLOOR_Y) {
              const currentCatX = catXRef.current;
              const catXMin = currentCatX - CAT_WIDTH_PCT / 2;
              const catXMax = currentCatX + CAT_WIDTH_PCT / 2;
              const inBag = t.x >= catXMin && t.x <= catXMax;
              if (t.isBomb) {
                // Piedra/bomba caída: si entra en la bolsa penaliza, fuera no pasa nada
                if (inBag) missedCount += 1;
              } else {
                if (inBag) caughtCount += 1;
                else missedCount += 1;
              }
              continue;
            }
            next.push({ ...t, y: fy, fallSpeed: fs });
          } else {
            const nx = t.x + t.speed * t.dir;
            if (nx < -12 || nx > 112) continue; // se va de pantalla sin tocarlo
            next.push({ ...t, x: nx });
          }
        }
        if (caughtCount > 0) {
          setScore((s) => s + caughtCount);
          for (let i = 0; i < caughtCount; i++) miau();
          showMood("happy", 700);
          flashFeedback("good");
        }
        if (missedCount > 0) {
          setFails((f) => f + missedCount);
          sadBoom();
          flashFeedback("bad");
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state, miau, sadBoom]);

  // Game over con 3 fallos
  useEffect(() => {
    if (state === "playing" && fails >= 3) {
      setState("over");
      setTreats([]);
      if (score > best) {
        setBest(score);
        localStorage.setItem(STORAGE_KEY, String(score));
      }
    }
  }, [fails, state, score, best]);

  const tapTreat = (id: number) => {
    if (state !== "playing") return;
    lastTapRef.current = performance.now();
    setTreats((prev) => {
      const t = prev.find((x) => x.id === id);
      if (!t || t.falling) return prev;
      if (t.isBomb) {
        // Pulsaste una piedra/bomba → pierdes vida y desaparece
        setFails((f) => f + 1);
        sadBoom();
        flashFeedback("bad");
        return prev.filter((x) => x.id !== id);
      }
      return prev.map((x) => (x.id === id ? { ...x, falling: true, fallSpeed: 2 } : x));
    });
  };

  const stageStyle = { height: STAGE_HEIGHT };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-sky-100 via-pink-50 to-amber-100">
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-6">
        {state !== "playing" && (
          <>
            <Link href="/juegos" className="text-sm text-slate-500 hover:text-slate-900">
              ← Juegos
            </Link>
            <header className="text-center my-4">
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                🐱 Atrapa Pastelitos
              </h1>
              <p className="text-slate-600 mt-2 text-sm md:text-base">
                Toca los pastelitos (no las piedras 🪨) para que caigan en la bolsa del gatito.
                Cada 10s va más rápido. A los 30s el gato se puede mover. 3 fallos y se acaba.
              </p>
            </header>
          </>
        )}

        {/* HUD */}
        <div className="flex items-center justify-between bg-white/70 backdrop-blur rounded-full px-5 py-2 mb-3 shadow text-slate-800 font-bold">
          <span>🎂 {score}</span>
          <span className="text-rose-500">
            {"💔".repeat(fails)}
            {"🤍".repeat(Math.max(0, 3 - fails))}
          </span>
          <span>⏱ {elapsed}s</span>
        </div>

        {/* Escenario */}
        <div
          ref={stageRef}
          onPointerDown={() => { if (state === "playing") lastTapRef.current = performance.now(); }}
          style={stageStyle}
          className={`relative w-full rounded-3xl overflow-hidden border-4 transition-colors ${
            flash === "good"
              ? "border-emerald-400 bg-emerald-50"
              : flash === "bad"
              ? "border-rose-400 bg-rose-50"
              : "border-white bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100"
          } shadow-xl select-none`}
        >
          {/* Sol decorativo */}
          <div className="absolute top-10 left-6 text-3xl opacity-40">☁️</div>

          {/* Cuenta atrás de inactividad — arriba derecha */}
          {state === "playing" && (
            <div
              className={`absolute top-3 right-3 rounded-full font-black text-2xl md:text-3xl w-14 h-14 flex items-center justify-center shadow-lg border-4 border-white ${
                idleLeft <= 2 ? "bg-rose-600 text-white animate-pulse" : "bg-amber-400 text-slate-900"
              }`}
              aria-label="segundos sin pulsar"
            >
              {idleLeft}
            </div>
          )}

          {/* Aviso visible cuando el gato se desbloquea */}
          {state === "playing" && elapsed >= CAT_MOVE_UNLOCK_SEC && elapsed < CAT_MOVE_UNLOCK_SEC + 4 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-fuchsia-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              🐾 ¡el gato se mueve!
            </div>
          )}

          {/* Pastelitos */}
          {treats.map((t) => (
            <button
              key={t.id}
              onClick={() => tapTreat(t.id)}
              onTouchStart={(e) => {
                e.preventDefault();
                tapTreat(t.id);
              }}
              disabled={t.falling}
              aria-label="pastelito"
              style={{
                left: `calc(${t.x}% - ${TREAT_SIZE / 2}px)`,
                top: t.y,
                width: TREAT_SIZE,
                height: TREAT_SIZE,
              }}
              className={`absolute text-3xl md:text-4xl leading-none flex items-center justify-center transition-transform ${
                t.falling ? "scale-110" : "hover:scale-125 active:scale-95 drop-shadow-md"
              }`}
            >
              {t.emoji}
            </button>
          ))}

          {/* Gatito abajo */}
          <div
            className="absolute -translate-x-1/2 pointer-events-none"
            style={{ bottom: 0, left: `${catX}%`, width: `${CAT_WIDTH_PCT + 10}%`, maxWidth: 220 }}
          >
            <CatSVG mood={catMood} />
          </div>

          {/* Guía visual de la bolsa */}
          <div
            className="absolute pointer-events-none border-2 border-dashed border-amber-500/50 rounded-xl"
            style={{
              left: `${catX - CAT_WIDTH_PCT / 2}%`,
              width: `${CAT_WIDTH_PCT}%`,
              bottom: 62,
              height: 12,
            }}
          />
        </div>

        {/* Controles */}
        <div className="text-center mt-6">
          {state === "idle" && (
            <button
              onClick={start}
              className="bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform shadow-lg"
            >
              ▶ Empezar
            </button>
          )}
          {state === "over" && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-5xl mb-2">{score >= best && score > 0 ? "🏆" : "🐾"}</div>
              <p className="text-slate-700 text-lg">
                Pastelitos colados: <strong className="text-2xl">{score}</strong>
              </p>
              <p className="text-slate-500 text-sm">
                Récord: <strong>{best}</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                <button
                  onClick={start}
                  className="bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  ▶ Jugar otra vez
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🏆 Ver ranking
                </button>
              </div>
              <div className="mt-5">
                <ShareButtons
                  url="https://viralisima.com/juegos/atrapa-pastelitos"
                  text={`Colé ${score} pastelitos en Atrapa Pastelitos 🐱 ¿puedes superarme?`}
                />
              </div>
            </div>
          )}
        </div>

        {showLeaderboard && (
          <LeaderboardModal
            game="atrapa-pastelitos"
            score={score}
            unit="pastelitos"
            scoreOrder="high"
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </main>
  );
}

// Gato SVG inline — ojos grandes brillantes, expresión tierna
function CatSVG({ mood }: { mood: "sad" | "happy" }) {
  const pupilY = mood === "happy" ? 108 : 112;
  const mouth = mood === "happy" ? "M140 148 Q160 168 180 148" : "M145 152 Q160 142 175 152";
  const tearOpacity = mood === "sad" ? 0.85 : 0;

  return (
    <svg viewBox="0 0 320 260" className="w-full h-auto" aria-label="gatito">
      <defs>
        <radialGradient id="furGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>
        <radialGradient id="bagGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>

      {/* Bolsa amarilla delante */}
      <ellipse cx="160" cy="230" rx="110" ry="22" fill="#78350f" opacity="0.25" />
      <path
        d="M70 200 Q70 160 100 152 L220 152 Q250 160 250 200 Q250 244 160 244 Q70 244 70 200 Z"
        fill="url(#bagGrad)"
        stroke="#92400e"
        strokeWidth="3"
      />
      {/* Boca de la bolsa */}
      <ellipse cx="160" cy="156" rx="62" ry="10" fill="#422006" />
      <ellipse cx="160" cy="154" rx="58" ry="6" fill="#1c1917" />

      {/* Cuerpo/cabeza del gato atrás de la bolsa */}
      <ellipse cx="160" cy="120" rx="95" ry="82" fill="url(#furGrad)" stroke="#78350f" strokeWidth="2.5" />

      {/* Orejas */}
      <path d="M78 72 L92 30 L118 62 Z" fill="url(#furGrad)" stroke="#78350f" strokeWidth="2.5" />
      <path d="M242 72 L228 30 L202 62 Z" fill="url(#furGrad)" stroke="#78350f" strokeWidth="2.5" />
      <path d="M88 60 L96 42 L108 58 Z" fill="#fb7185" />
      <path d="M232 60 L224 42 L212 58 Z" fill="#fb7185" />

      {/* Rayas */}
      <path d="M90 82 Q100 78 110 86" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M215 82 Q220 78 230 86" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M100 104 Q108 100 118 106" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M205 104 Q215 100 222 106" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Ojos enormes brillantes */}
      <g>
        <ellipse cx="125" cy="115" rx="28" ry="32" fill="white" stroke="#78350f" strokeWidth="2" />
        <ellipse cx="195" cy="115" rx="28" ry="32" fill="white" stroke="#78350f" strokeWidth="2" />
        <ellipse cx="125" cy={pupilY} rx="22" ry="26" fill="url(#eyeGrad)" />
        <ellipse cx="195" cy={pupilY} rx="22" ry="26" fill="url(#eyeGrad)" />
        {/* Pupilas */}
        <ellipse cx="125" cy={pupilY + 2} rx="6" ry="22" fill="#0c0a09" />
        <ellipse cx="195" cy={pupilY + 2} rx="6" ry="22" fill="#0c0a09" />
        {/* Brillos */}
        <ellipse cx="117" cy={pupilY - 12} rx="7" ry="9" fill="white" opacity="0.95" />
        <ellipse cx="187" cy={pupilY - 12} rx="7" ry="9" fill="white" opacity="0.95" />
        <circle cx="132" cy={pupilY + 8} r="3" fill="white" opacity="0.85" />
        <circle cx="202" cy={pupilY + 8} r="3" fill="white" opacity="0.85" />
        {/* Lágrima */}
        <path
          d="M108 138 Q106 150 112 156 Q118 150 114 140 Z"
          fill="#7dd3fc"
          stroke="#0284c7"
          strokeWidth="1"
          opacity={tearOpacity}
        />
      </g>

      {/* Naricita */}
      <path d="M153 138 L167 138 L160 148 Z" fill="#fb7185" stroke="#9f1239" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Boca */}
      <path d={mouth} stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Bigotes */}
      <line x1="60" y1="140" x2="110" y2="142" stroke="#78350f" strokeWidth="1.5" />
      <line x1="60" y1="150" x2="110" y2="150" stroke="#78350f" strokeWidth="1.5" />
      <line x1="260" y1="140" x2="210" y2="142" stroke="#78350f" strokeWidth="1.5" />
      <line x1="260" y1="150" x2="210" y2="150" stroke="#78350f" strokeWidth="1.5" />

      {/* Patitas sujetando la bolsa */}
      <ellipse cx="95" cy="180" rx="18" ry="14" fill="url(#furGrad)" stroke="#78350f" strokeWidth="2" />
      <ellipse cx="225" cy="180" rx="18" ry="14" fill="url(#furGrad)" stroke="#78350f" strokeWidth="2" />
    </svg>
  );
}
