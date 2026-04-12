"use client";

import { useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

// Hash determinístico: mismos nombres siempre dan mismo resultado
function hashNames(a: string, b: string): number {
  const [x, y] = [a, b].map((s) => s.toLowerCase().trim().replace(/[^a-zñáéíóú]/g, ""));
  const combined = [x, y].sort().join("|");
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  // Distribución: entre 40 y 99 para que nunca sea deprimente
  return 40 + (abs % 60);
}

function interpret(pct: number) {
  if (pct >= 90) return {
    level: "Alma gemela 💖",
    bg: "from-pink-500 via-rose-500 to-red-500",
    desc: "Esto es más que química, es sincronía. Vuestras energías se potencian: donde uno flaquea, el otro completa. Protegedlo, esto no se encuentra fácil.",
  };
  if (pct >= 75) return {
    level: "Tremenda conexión 🔥",
    bg: "from-orange-500 via-red-500 to-pink-600",
    desc: "Encajáis muy bien. Hay chispa, hay risas, hay complicidad. No es perfecto — pero es real y sólido. Apuesta fuerte, vale la pena.",
  };
  if (pct >= 60) return {
    level: "Compatibles 💫",
    bg: "from-violet-500 to-fuchsia-500",
    desc: "Hay buena base: os divertís, os entendéis y os ayudáis. Trabajen la comunicación y este lazo puede crecer mucho.",
  };
  if (pct >= 50) return {
    level: "Depende del día 🎲",
    bg: "from-amber-500 to-orange-500",
    desc: "Tenéis lo bueno y lo complicado. Cuando fluye, fluye increíble. Cuando no, choca. Con voluntad, funciona.",
  };
  return {
    level: "Requiere paciencia 🙂",
    bg: "from-sky-500 to-blue-600",
    desc: "Sois muy diferentes — eso puede ser lo mejor o lo peor. Requiere respeto, paciencia y mucho diálogo. Pero nada imposible.",
  };
}

export default function Compatibilidad() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calc = () => {
    if (!name1.trim() || !name2.trim()) return;
    setResult(hashNames(name1, name2));
  };

  if (result !== null && name1 && name2) {
    const info = interpret(result);
    const shareText = `${name1} + ${name2} = ${result}% de compatibilidad 💕 — viralisima.com/compatibilidad`;
    return (
      <div className={`min-h-screen bg-gradient-to-br ${info.bg} text-white`}>
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
          <Link href="/" className="text-sm opacity-80 hover:opacity-100">
            ← Viralísima
          </Link>
          <div className="text-center mt-10">
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
              Compatibilidad de
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              {name1} <span className="opacity-60">+</span> {name2}
            </h2>
            <div className="text-8xl md:text-9xl font-black my-4">{result}%</div>
            <h1 className="text-3xl md:text-5xl font-black mb-6">{info.level}</h1>
            <p className="text-lg md:text-xl opacity-95 max-w-lg mx-auto leading-relaxed">
              {info.desc}
            </p>
          </div>

          <ShareButtons text={shareText} url="https://viralisima.com/compatibilidad" />

          <div className="mt-10 text-center">
            <button
              onClick={() => { setResult(null); setName1(""); setName2(""); }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold mr-3"
            >
              🔄 Probar otros
            </button>
            <Link
              href="/"
              className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all inline-block"
            >
              🎯 Más tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>
        <div className="text-center my-8">
          <div className="text-5xl mb-2">💕</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
            ¿Cuánto encajáis?
          </h1>
          <p className="text-slate-600 mt-2">
            Mete dos nombres y descubre vuestra compatibilidad.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tu nombre"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            className="w-full px-4 py-4 text-lg text-center rounded-2xl border-2 border-slate-200 focus:border-rose-500 focus:outline-none font-bold"
          />
          <div className="text-center text-4xl">💞</div>
          <input
            type="text"
            placeholder="Nombre de tu crush/pareja"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calc()}
            className="w-full px-4 py-4 text-lg text-center rounded-2xl border-2 border-slate-200 focus:border-rose-500 focus:outline-none font-bold"
          />
          <button
            onClick={calc}
            disabled={!name1.trim() || !name2.trim()}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            💘 Calcular compatibilidad
          </button>
          <p className="text-xs text-slate-500 text-center">
            Los mismos nombres siempre dan el mismo resultado. Haz la prueba.
          </p>
        </div>
      </div>
    </div>
  );
}
