"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

type State = "idle" | "waiting" | "ready" | "result" | "tooSoon";

const STORAGE_KEY = "vl_reflejos_best";

export default function JuegoReflejos() {
  const [state, setState] = useState<State>("idle");
  const [time, setTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const start = () => {
    setState("waiting");
    setTime(null);
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setState("ready");
      startRef.current = performance.now();
    }, delay);
  };

  const click = () => {
    if (state === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState("tooSoon");
      return;
    }
    if (state === "ready") {
      const ms = Math.round(performance.now() - startRef.current);
      setTime(ms);
      setAttempts((a) => [...a, ms].slice(-5));
      setState("result");
      if (best === null || ms < best) {
        setBest(ms);
        localStorage.setItem(STORAGE_KEY, String(ms));
      }
    }
  };

  const bgClass = {
    idle: "from-slate-600 to-slate-800",
    waiting: "from-red-500 to-rose-600",
    ready: "from-emerald-400 to-green-600",
    result: "from-sky-500 to-blue-600",
    tooSoon: "from-amber-500 to-orange-600",
  }[state];

  const level = (ms: number) => {
    if (ms < 200) return { label: "SOBREHUMANO", emoji: "🔥" };
    if (ms < 250) return { label: "GAMER PRO", emoji: "🎮" };
    if (ms < 300) return { label: "RÁPIDO", emoji: "⚡" };
    if (ms < 400) return { label: "NORMAL", emoji: "👍" };
    if (ms < 500) return { label: "LENTO", emoji: "🐢" };
    return { label: "MUY LENTO", emoji: "😴" };
  };

  const shareText =
    time !== null
      ? `Mis reflejos: ${time}ms ${level(time).emoji} ${level(time).label} — ¿puedes superarme?`
      : "";

  return (
    <div
      onClick={state === "waiting" || state === "ready" ? click : undefined}
      className={`min-h-[calc(100vh-3.5rem)] bg-gradient-to-br ${bgClass} text-white transition-colors duration-200 ${
        state === "waiting" || state === "ready" ? "cursor-pointer select-none" : ""
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-80 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-8 min-h-[60vh] flex flex-col items-center justify-center">
          {state === "idle" && (
            <>
              <div className="text-8xl mb-6">⚡</div>
              <h1 className="text-4xl md:text-6xl font-black mb-4">Test de Reflejos</h1>
              <p className="text-lg opacity-90 max-w-md mb-8">
                Cuando la pantalla se ponga <strong>verde</strong>, haz click lo más rápido que puedas.
                <br />
                Si lo haces en <strong>rojo</strong>, te descalificas.
              </p>
              {best !== null && (
                <div className="mb-6 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full text-sm">
                  Tu récord: <strong>{best}ms</strong>
                </div>
              )}
              <button
                onClick={start}
                className="bg-white text-slate-900 font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform"
              >
                ▶ Empezar
              </button>
            </>
          )}

          {state === "waiting" && (
            <>
              <div className="text-8xl mb-6">🔴</div>
              <h2 className="text-3xl md:text-5xl font-black mb-2">Espera…</h2>
              <p className="text-lg opacity-90">Click cuando se ponga VERDE</p>
            </>
          )}

          {state === "ready" && (
            <>
              <div className="text-8xl mb-6">🟢</div>
              <h2 className="text-5xl md:text-7xl font-black">¡CLICK!</h2>
            </>
          )}

          {state === "tooSoon" && (
            <>
              <div className="text-8xl mb-6">❌</div>
              <h2 className="text-3xl md:text-5xl font-black mb-2">¡Demasiado pronto!</h2>
              <p className="text-lg opacity-90 mb-8">
                Espera a que se ponga verde.
              </p>
              <button
                onClick={start}
                className="bg-white text-slate-900 font-bold px-10 py-4 rounded-full hover:scale-105 transition-transform"
              >
                🔄 Intentar otra vez
              </button>
            </>
          )}

          {state === "result" && time !== null && (
            <>
              <div className="text-8xl mb-4">{level(time).emoji}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
                Tu tiempo
              </div>
              <div className="text-7xl md:text-9xl font-black font-mono mb-2">{time}ms</div>
              <div className="text-2xl font-bold mb-6">{level(time).label}</div>
              {best !== null && time <= best && (
                <div className="bg-yellow-400 text-slate-900 font-bold px-4 py-2 rounded-full mb-4">
                  🏆 ¡Nuevo récord personal!
                </div>
              )}
              {best !== null && (
                <div className="text-sm opacity-80 mb-4">
                  Récord personal: <strong>{best}ms</strong>
                </div>
              )}

              {attempts.length > 1 && (
                <div className="mb-6">
                  <div className="text-xs opacity-80 mb-2">Últimas partidas:</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {attempts.map((ms, i) => (
                      <span
                        key={i}
                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-mono"
                      >
                        {ms}ms
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={start}
                  className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🔄 Otra ronda
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🏆 Ranking global
                </button>
              </div>

              <div className="w-full max-w-sm">
                <ShareButtons text={shareText} url="https://viralisima.com/juegos/reflejos" />
              </div>

              {showLeaderboard && time !== null && (
                <LeaderboardModal
                  game="reflejos"
                  score={time}
                  unit="ms"
                  scoreOrder="low"
                  onClose={() => setShowLeaderboard(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
