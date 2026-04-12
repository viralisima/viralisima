"use client";

import { useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

export default function DiasVividos() {
  const [date, setDate] = useState("");
  const [result, setResult] = useState<{
    days: number; weeks: number; months: number; years: number;
    hours: number; minutes: number; sleepYears: number;
  } | null>(null);

  const calc = () => {
    if (!date) return;
    const born = new Date(date);
    const now = new Date();
    const ms = now.getTime() - born.getTime();
    if (ms < 0) return;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor(ms / (1000 * 60));
    const weeks = Math.floor(days / 7);
    const years = now.getFullYear() - born.getFullYear() - (now < new Date(born.setFullYear(now.getFullYear())) ? 1 : 0);
    const months = Math.floor(days / 30.4375);
    const sleepYears = Math.round((days * 8) / 24 / 365);
    setResult({ days, weeks, months, years, hours, minutes, sleepYears });
  };

  if (result) {
    const shareText = `He vivido ${result.days.toLocaleString("es-ES")} días 🎈 (${result.years} años exactos) — calcula el tuyo`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
          <Link href="/" className="text-sm opacity-80 hover:opacity-100">
            ← Viralísima
          </Link>
          <div className="text-center mt-10">
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
              Has vivido…
            </div>
            <div className="text-7xl md:text-9xl font-black my-4 font-mono">
              {result.days.toLocaleString("es-ES")}
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-6">días 🎂</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
              <Card label="Años" value={result.years.toString()} />
              <Card label="Meses" value={result.months.toLocaleString("es-ES")} />
              <Card label="Semanas" value={result.weeks.toLocaleString("es-ES")} />
              <Card label="Horas" value={result.hours.toLocaleString("es-ES")} />
            </div>

            <div className="mt-6 bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-left">
              <p className="text-sm md:text-base">
                💤 De esos días, has pasado aproximadamente <strong>{result.sleepYears} años durmiendo</strong> (con 8h/día).
              </p>
            </div>
          </div>

          <ShareButtons text={shareText} url="https://viralisima.com/dias-vividos" />

          <div className="mt-10 text-center">
            <button
              onClick={() => setResult(null)}
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
          <div className="text-5xl mb-2">🎈</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            ¿Cuántos días has vivido?
          </h1>
          <p className="text-slate-600 mt-2">Introduce tu fecha de nacimiento.</p>
        </div>

        <div className="space-y-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-bold text-center"
          />
          <button
            onClick={calc}
            disabled={!date}
            className="w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            🧮 Calcular
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
      <div className="text-xs opacity-80 uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black mt-1 font-mono">{value}</div>
    </div>
  );
}
