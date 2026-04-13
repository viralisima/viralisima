"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const STORAGE_KEY = "vl_tapsprint_best";
const DURATION = 10000;
type State = "idle" | "playing" | "result";

export default function JuegoTapSprint() {
  const [state, setState] = useState<State>("idle");
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const start = () => {
    setJustHitBest(false);
    setCount(0);
    setTimeLeft(10);
    setState("playing");
    startRef.current = performance.now();
    tick();
  };

  const tick = () => {
    const elapsed = performance.now() - startRef.current;
    const remaining = Math.max(0, DURATION - elapsed);
    setTimeLeft(Math.ceil(remaining / 1000));
    if (remaining <= 0) {
      end();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const end = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState((prev) => {
      // cerramos solo una vez
      if (prev !== "playing") return prev;
      setCount((c) => {
        if (c > best) {
          setBest(c);
          localStorage.setItem(STORAGE_KEY, String(c));
          setJustHitBest(true);
        }
        return c;
      });
      return "result";
    });
  };

  const handleTap = () => {
    if (state !== "playing") return;
    setCount((c) => c + 1);
  };

  const level = (n: number) => {
    if (n >= 90) return { label: "DEDOS DE HIERRO", emoji: "💪" };
    if (n >= 75) return { label: "GAMER PRO", emoji: "🎮" };
    if (n >= 60) return { label: "MUY RÁPIDO", emoji: "⚡" };
    if (n >= 45) return { label: "NORMAL", emoji: "👍" };
    if (n >= 30) return { label: "LENTO", emoji: "🐢" };
    return { label: "APENAS", emoji: "😅" };
  };

  const cps = state === "result" ? (count / 10).toFixed(1) : "0";
  const shareText =
    state === "result"
      ? `Hice ${count} clicks en 10s (${cps}/seg) ${level(count).emoji} — ¿puedes superarme?`
      : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-80 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-6">
          <div className="text-5xl mb-2">👆</div>
          <h1 className="text-3xl md:text-5xl font-black">Tap Sprint</h1>
          <p className="opacity-90 mt-2 text-sm">
            ¿Cuántos clicks puedes hacer en 10 segundos?
          </p>
        </div>

        <div className="flex justify-center gap-6 my-6 text-sm">
          <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            Récord: <strong>{best}</strong>
          </div>
        </div>

        {state === "idle" && (
          <div className="text-center mt-10">
            <p className="text-lg opacity-90 mb-6 max-w-md mx-auto">
              Cuando empiece, haz click en el botón grande lo más rápido que puedas.
              10 segundos. ¡Prepárate!
            </p>
            <button
              onClick={start}
              className="bg-white text-slate-900 font-bold px-12 py-5 rounded-full text-xl hover:scale-105 transition-transform shadow-xl"
            >
              ▶ Empezar
            </button>
          </div>
        )}

        {state === "playing" && (
          <div className="text-center">
            <div className="text-8xl font-black font-mono mb-2">{timeLeft}</div>
            <div className="text-xl mb-6 opacity-90">segundos</div>
            <div className="text-6xl font-black font-mono mb-6">{count}</div>
            <button
              onClick={handleTap}
              className="bg-white text-slate-900 font-black px-20 py-12 rounded-full text-4xl shadow-2xl active:scale-90 transition-transform select-none"
              style={{ touchAction: "manipulation" }}
            >
              👆 TAP
            </button>
          </div>
        )}

        {state === "result" && (
          <div className="text-center mt-8">
            <div className="text-7xl mb-4">{level(count).emoji}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
              Resultado
            </div>
            <div className="text-8xl md:text-9xl font-black font-mono mb-1">{count}</div>
            <div className="text-xl opacity-90 mb-2">clicks en 10 segundos</div>
            <div className="text-sm opacity-80 mb-4">= {cps} clicks/segundo</div>
            <div className="text-2xl font-bold mb-6">{level(count).label}</div>
            {justHitBest && (
              <div className="bg-yellow-400 text-slate-900 font-bold px-4 py-2 rounded-full inline-block mb-4">
                🏆 ¡Nuevo récord personal!
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
              <button
                onClick={start}
                className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
              >
                🔄 Otra ronda
              </button>
              {count > 0 && (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🏆 Ranking global
                </button>
              )}
            </div>
            <ShareButtons text={shareText} url="https://viralisima.com/juegos/tap-sprint" />

            {showLeaderboard && (
              <LeaderboardModal
                game="tap-sprint"
                score={count}
                unit="clicks"
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
