"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

const COLORS = [
  { id: 0, bg: "bg-red-500", active: "bg-red-300", name: "rojo", tone: 329.6 },
  { id: 1, bg: "bg-emerald-500", active: "bg-emerald-300", name: "verde", tone: 415.3 },
  { id: 2, bg: "bg-sky-500", active: "bg-sky-300", name: "azul", tone: 261.6 },
  { id: 3, bg: "bg-yellow-400", active: "bg-yellow-200", name: "amarillo", tone: 207.7 },
];

const STORAGE_KEY = "vl_memoria_best";
type State = "idle" | "showing" | "waiting" | "gameOver";

export default function JuegoMemoria() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [state, setState] = useState<State>("idle");
  const [best, setBest] = useState(0);
  const [justHitBest, setJustHitBest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBest(parseInt(saved));
  }, []);

  useEffect(() => () => timeouts.current.forEach(clearTimeout), []);

  const playTone = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const showSequence = (seq: number[]) => {
    setState("showing");
    const speed = Math.max(250, 600 - seq.length * 20);
    seq.forEach((c, i) => {
      timeouts.current.push(
        setTimeout(() => {
          setActiveColor(c);
          playTone(COLORS[c].tone);
          timeouts.current.push(
            setTimeout(() => setActiveColor(null), speed * 0.7)
          );
        }, i * speed)
      );
    });
    timeouts.current.push(
      setTimeout(() => {
        setState("waiting");
        setUserIndex(0);
      }, seq.length * speed + 200)
    );
  };

  const start = () => {
    setJustHitBest(false);
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setUserIndex(0);
    showSequence(first);
  };

  const handleClick = (color: number) => {
    if (state !== "waiting") return;
    setActiveColor(color);
    playTone(COLORS[color].tone);
    setTimeout(() => setActiveColor(null), 200);

    if (sequence[userIndex] !== color) {
      // Game Over
      const score = sequence.length - 1;
      if (score > best) {
        setBest(score);
        localStorage.setItem(STORAGE_KEY, String(score));
        setJustHitBest(true);
      }
      setState("gameOver");
      return;
    }

    if (userIndex + 1 === sequence.length) {
      // Pasaste al siguiente nivel
      const next = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(next);
      setUserIndex(0);
      timeouts.current.push(setTimeout(() => showSequence(next), 700));
    } else {
      setUserIndex(userIndex + 1);
    }
  };

  const level = sequence.length;
  const shareText =
    state === "gameOver"
      ? `Llegué al nivel ${level - 1} en el juego de memoria 🧠 — ¿puedes superarme?`
      : "";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white">
      <div className="max-w-xl mx-auto px-4 pt-6 pb-10">
        <Link href="/juegos" className="text-sm opacity-80 hover:opacity-100">
          ← Juegos
        </Link>

        <div className="text-center mt-6">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="text-3xl md:text-5xl font-black">Memoria Simon</h1>
          <p className="opacity-90 mt-2 text-sm">
            Repite la secuencia de colores. Cada nivel añade uno más.
          </p>
        </div>

        <div className="flex justify-center gap-6 my-6 text-sm">
          <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            Nivel: <strong>{state === "idle" ? 0 : level}</strong>
          </div>
          <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
            Récord: <strong>{best}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => handleClick(c.id)}
              disabled={state !== "waiting"}
              className={`aspect-square rounded-3xl transition-all ${
                activeColor === c.id ? c.active : c.bg
              } ${state === "waiting" ? "hover:opacity-90 active:scale-95" : "opacity-90"}`}
              aria-label={c.name}
            />
          ))}
        </div>

        <div className="text-center">
          {state === "idle" && (
            <button
              onClick={start}
              className="bg-white text-slate-900 font-bold px-10 py-4 rounded-full text-lg hover:scale-105 transition-transform"
            >
              ▶ Empezar
            </button>
          )}

          {state === "showing" && (
            <div className="font-bold text-lg">👀 Observa…</div>
          )}

          {state === "waiting" && (
            <div className="font-bold text-lg">
              Tu turno: <strong>{userIndex + 1}</strong> / {sequence.length}
            </div>
          )}

          {state === "gameOver" && (
            <div>
              <div className="text-5xl mb-2">💥</div>
              <h2 className="text-2xl font-black mb-1">¡Fallaste!</h2>
              <p className="mb-4 opacity-90">
                Llegaste al nivel <strong>{level - 1}</strong>
              </p>
              {justHitBest && (
                <div className="bg-yellow-400 text-slate-900 font-bold px-4 py-2 rounded-full inline-block mb-4">
                  🏆 ¡Nuevo récord!
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
                <button
                  onClick={start}
                  className="bg-white text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                >
                  🔄 Otra vez
                </button>
                {level > 1 && (
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                  >
                    🏆 Ranking global
                  </button>
                )}
              </div>
              <ShareButtons text={shareText} url="https://viralisima.com/juegos/memoria" />

              {showLeaderboard && (
                <LeaderboardModal
                  game="memoria"
                  score={level - 1}
                  unit="nivel"
                  scoreOrder="high"
                  onClose={() => setShowLeaderboard(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
