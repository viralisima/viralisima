"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";
import { cargarDiccionario } from "@/lib/diccionario";

const STORAGE_KEY = "vl_encadenadas_best";
const BASE_LIMIT = 8000; // 8 s la primera palabra
const STEP = 250; // -0,25 s por palabra encadenada
const MIN_LIMIT = 3500; // suelo de 3,5 s
const START_LETTERS = ["a", "c", "e", "l", "m", "o", "p", "r", "s", "t"];

type State = "idle" | "playing" | "result";

// minúsculas y sin tildes para comparar letras (á→a, ñ→n)
const strip = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const limitFor = (score: number) =>
  Math.max(MIN_LIMIT, BASE_LIMIT - score * STEP);

export default function JuegoPalabrasEncadenadas() {
  const [state, setState] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const [required, setRequired] = useState("a");
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(1); // fracción de tiempo restante (0-1)
  const [msg, setMsg] = useState<{ t: "ok" | "err"; x: string } | null>(null);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [dict, setDict] = useState<Set<string> | null>(null);
  const [dictState, setDictState] = useState<"loading" | "ready" | "error">("loading");

  const endRef = useRef(0);
  const limitRef = useRef(BASE_LIMIT);
  const rafRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const usedRef = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  const cargarDict = useCallback(() => {
    setDictState("loading");
    cargarDiccionario()
      .then((s) => {
        setDict(s);
        setDictState("ready");
      })
      .catch(() => setDictState("error"));
  }, []);

  useEffect(() => {
    cargarDict();
  }, [cargarDict]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const end = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState((prev) => {
      if (prev !== "playing") return prev;
      const final = scoreRef.current;
      setBest((b) => {
        if (final > b) {
          localStorage.setItem(STORAGE_KEY, String(final));
          setJustHitBest(true);
          return final;
        }
        return b;
      });
      return "result";
    });
  }, []);

  const tick = useCallback(() => {
    const remaining = Math.max(0, endRef.current - performance.now());
    setProgress(remaining / limitRef.current);
    if (remaining <= 0) {
      end();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [end]);

  const start = () => {
    if (dictState !== "ready") return;
    const letter = START_LETTERS[Math.floor(Math.random() * START_LETTERS.length)];
    setJustHitBest(false);
    setScore(0);
    scoreRef.current = 0;
    usedRef.current = new Set();
    setChain([]);
    setInput("");
    setMsg(null);
    setRequired(letter);
    setProgress(1);
    setState("playing");
    limitRef.current = BASE_LIMIT;
    endRef.current = performance.now() + BASE_LIMIT;
    rafRef.current = requestAnimationFrame(tick);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const submit = () => {
    if (state !== "playing") return;
    const raw = input.trim();
    const norm = strip(raw);

    // validaciones (un fallo NO acaba la partida, solo avisa)
    if (norm.length < 3) return flash("err", "Mínimo 3 letras");
    if (!/^[a-zñ]+$/.test(norm)) return flash("err", "Solo letras");
    if (norm[0] !== required) return flash("err", `Debe empezar por «${required.toUpperCase()}»`);
    if (usedRef.current.has(norm)) return flash("err", "Ya la usaste");
    if (!dict || !dict.has(norm)) return flash("err", "No está en el diccionario");

    // aceptada
    usedRef.current.add(norm);
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setChain((c) => [raw.toLowerCase(), ...c].slice(0, 12));
    setRequired(norm[norm.length - 1]);
    setInput("");
    limitRef.current = limitFor(scoreRef.current);
    endRef.current = performance.now() + limitRef.current;
    flash("ok", "¡Bien!");
    inputRef.current?.focus();
  };

  const flash = (t: "ok" | "err", x: string) => {
    setMsg({ t, x });
    window.setTimeout(() => setMsg((m) => (m && m.x === x ? null : m)), 900);
  };

  const level = (n: number) => {
    if (n >= 25) return { label: "MÁQUINA DE PALABRAS", emoji: "🏆" };
    if (n >= 18) return { label: "IMPARABLE", emoji: "🔥" };
    if (n >= 12) return { label: "MUY BIEN", emoji: "💪" };
    if (n >= 7) return { label: "NADA MAL", emoji: "👍" };
    if (n >= 3) return { label: "CALENTANDO", emoji: "🙂" };
    return { label: "EN BLANCO", emoji: "😅" };
  };

  const shareText =
    state === "result"
      ? `Encadené ${score} palabras seguidas en Palabras Encadenadas ${level(score).emoji} — ¿cuántas haces tú?`
      : "";

  const barColor =
    progress > 0.5 ? "bg-emerald-300" : progress > 0.25 ? "bg-yellow-300" : "bg-red-400";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-80 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-6">
          <div className="text-5xl mb-2">🔗</div>
          <h1 className="text-3xl md:text-5xl font-black">Palabras Encadenadas</h1>
          <p className="opacity-90 mt-2 text-sm">
            Cada palabra empieza por la <strong>última letra</strong> de la anterior. Sin repetir.
          </p>
        </div>

        <div className="flex justify-center gap-6 my-6 text-sm">
          <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            Récord: <strong>{best}</strong>
          </div>
        </div>

        {state === "idle" && (
          <div className="text-center mt-10">
            <p className="text-lg opacity-90 mb-4 max-w-md mx-auto">
              Escribe una palabra que empiece por la letra que te toque. La siguiente
              debe empezar por la <strong>última letra</strong> de la tuya. Encadena
              todas las que puedas: cada palabra te deja un poco menos de tiempo.
            </p>
            <p className="text-sm opacity-80 mb-8">
              Ej: <strong>gat<span className="underline">o</span></strong> →{" "}
              <strong><span className="underline">o</span>s<span className="underline">o</span></strong> →{" "}
              <strong><span className="underline">o</span>l<span className="underline">a</span></strong> → …
            </p>
            {dictState === "ready" && (
              <button
                onClick={start}
                className="bg-white text-slate-900 font-bold px-12 py-5 rounded-full text-xl hover:scale-105 transition-transform shadow-xl"
              >
                ▶ Empezar
              </button>
            )}
            {dictState === "loading" && (
              <button
                disabled
                className="bg-white/60 text-slate-900 font-bold px-12 py-5 rounded-full text-xl shadow-xl cursor-wait"
              >
                ⏳ Cargando diccionario…
              </button>
            )}
            {dictState === "error" && (
              <button
                onClick={cargarDict}
                className="bg-white text-slate-900 font-bold px-10 py-5 rounded-full text-lg hover:scale-105 transition-transform shadow-xl"
              >
                ↻ Reintentar carga del diccionario
              </button>
            )}
            <p className="text-xs opacity-70 mt-4">
              Solo valen palabras reales · valida contra ~913.000 palabras (ES · EN · FR · IT · PT)
            </p>
          </div>
        )}

        {state === "playing" && (
          <div>
            {/* barra de tiempo */}
            <div className="h-3 rounded-full bg-black/20 overflow-hidden max-w-md mx-auto mb-6">
              <div
                className={`h-full ${barColor} transition-[width] duration-75`}
                style={{ width: `${Math.max(0, progress * 100).toFixed(1)}%` }}
              />
            </div>

            <div className="text-center mb-4">
              <div className="text-sm uppercase tracking-widest opacity-80">
                Palabra nº {score + 1} · empieza por
              </div>
              <div className="text-7xl font-black font-mono leading-none my-1">
                {required.toUpperCase()}
              </div>
              <div className="text-sm opacity-80">Encadenadas: <strong>{score}</strong></div>
            </div>

            <div className="max-w-md mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={`palabra con «${required.toUpperCase()}»…`}
                className="w-full text-center text-2xl font-bold text-slate-900 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-white/60"
              />
              <button
                onClick={submit}
                className="w-full mt-3 bg-slate-900 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform"
              >
                Encadenar ↵
              </button>
              <div className="h-6 mt-2 text-center font-bold">
                {msg && (
                  <span className={msg.t === "ok" ? "text-emerald-100" : "text-red-100"}>
                    {msg.t === "ok" ? "✓ " : "✗ "}
                    {msg.x}
                  </span>
                )}
              </div>
            </div>

            {chain.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-lg mx-auto">
                {chain.map((w, i) => (
                  <span
                    key={`${w}-${i}`}
                    className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {state === "result" && (
          <div className="text-center mt-8">
            <div className="text-7xl mb-4">{level(score).emoji}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
              Resultado
            </div>
            <div className="text-8xl md:text-9xl font-black font-mono mb-1">{score}</div>
            <div className="text-xl opacity-90 mb-2">palabras encadenadas</div>
            <div className="text-2xl font-bold mb-6">{level(score).label}</div>
            {justHitBest && (
              <div className="bg-yellow-400 text-slate-900 font-bold px-4 py-2 rounded-full inline-block mb-4">
                🏆 ¡Nuevo récord personal!
              </div>
            )}
            {chain.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-lg mx-auto opacity-90">
                {chain.slice(0, 10).reverse().map((w, i) => (
                  <span key={`${w}-${i}`} className="bg-white/15 rounded-full px-3 py-1 text-xs">
                    {w}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
              <button
                onClick={start}
                className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
              >
                🔄 Otra ronda
              </button>
              {score > 0 && (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🏆 Ranking global
                </button>
              )}
            </div>
            <ShareButtons text={shareText} url="https://viralisima.com/juegos/palabras-encadenadas" />

            {showLeaderboard && (
              <LeaderboardModal
                game="palabras-encadenadas"
                score={score}
                unit="palabras"
                scoreOrder="high"
                onClose={() => setShowLeaderboard(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
