"use client";

import { useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

type Tamano = "pequeno" | "mediano" | "grande" | "gigante";

// Fórmula veterinaria actualizada (AVMA)
// Pequeño (<10kg), Mediano (10-25), Grande (25-45), Gigante (>45)
function calcDogAge(years: number, size: Tamano): number {
  if (years <= 0) return 0;
  if (years === 1) return size === "gigante" ? 14 : size === "grande" ? 12 : 15;
  if (years === 2) return size === "gigante" ? 22 : size === "grande" ? 22 : 24;
  // A partir de 2 años, suma por tamaño
  const perYear: Record<Tamano, number> = {
    pequeno: 4,
    mediano: 5,
    grande: 6,
    gigante: 7,
  };
  const base = size === "gigante" ? 22 : size === "grande" ? 22 : 24;
  return base + (years - 2) * perYear[size];
}

const SIZES: { id: Tamano; label: string; desc: string }[] = [
  { id: "pequeno", label: "Pequeño", desc: "Menos de 10 kg (Chihuahua, Yorkie, Pomerania)" },
  { id: "mediano", label: "Mediano", desc: "10-25 kg (Beagle, Cocker, Bulldog Francés)" },
  { id: "grande", label: "Grande", desc: "25-45 kg (Pastor Alemán, Labrador, Golden)" },
  { id: "gigante", label: "Gigante", desc: "Más de 45 kg (Gran Danés, San Bernardo)" },
];

export default function EdadPerro() {
  const [years, setYears] = useState(3);
  const [size, setSize] = useState<Tamano>("mediano");
  const [computed, setComputed] = useState<number | null>(null);

  const humanAge = calcDogAge(years, size);

  const doCalc = () => setComputed(humanAge);

  if (computed !== null) {
    const shareText = `Mi perro de ${years} años tiene ${computed} años humanos 🐕 — viralisima.com/edad-perro`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
          <Link href="/" className="text-sm opacity-80 hover:opacity-100">
            ← Viralísima
          </Link>
          <div className="text-center mt-10">
            <div className="text-9xl mb-3">🐕</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
              Tu perro de {years} años ({SIZES.find((s) => s.id === size)?.label.toLowerCase()})
            </div>
            <div className="text-2xl mb-2">tiene en años humanos</div>
            <div className="text-8xl md:text-9xl font-black">{computed}</div>
            <div className="text-3xl font-bold mt-2">años</div>
          </div>

          <ShareButtons text={shareText} url="https://viralisima.com/edad-perro" />

          <div className="mt-10 text-center">
            <button
              onClick={() => setComputed(null)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold mr-3"
            >
              🔄 Otro
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
          <div className="text-5xl mb-2">🐕</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Edad real de tu perro
          </h1>
          <p className="text-slate-600 mt-2">
            Cuántos años humanos tiene tu peludo, según fórmula veterinaria.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Edad de tu perro: <strong>{years} años</strong>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={years}
              onChange={(e) => setYears(+e.target.value)}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tamaño</label>
            <div className="space-y-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    size === s.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold">{s.label}</div>
                  <div className="text-sm text-slate-600">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
            <div className="text-xs uppercase font-semibold text-amber-700 tracking-widest">
              Estimación
            </div>
            <div className="text-4xl font-black text-amber-900 mt-1">{humanAge} años humanos</div>
          </div>

          <button
            onClick={doCalc}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg"
          >
            🐾 Ver y compartir
          </button>
        </div>
      </div>
    </div>
  );
}
