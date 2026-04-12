"use client";

import { useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

type Q = { id: string; text: string; emoji: string; options: { text: string; age: number }[] };

const QUESTIONS: Q[] = [
  {
    id: "1",
    text: "¿Qué piensas de las redes sociales?",
    emoji: "📱",
    options: [
      { text: "Vivo en TikTok e Instagram", age: 18 },
      { text: "Las uso pero con moderación", age: 28 },
      { text: "Solo WhatsApp y Facebook", age: 42 },
      { text: "Me dan más flojera que otra cosa", age: 55 },
    ],
  },
  {
    id: "2",
    text: "Viernes a las 11pm:",
    emoji: "🌙",
    options: [
      { text: "Saliendo, la noche empieza", age: 22 },
      { text: "Con gente pero sin locuras", age: 30 },
      { text: "Casa + serie + comida", age: 45 },
      { text: "Ya en la cama", age: 60 },
    ],
  },
  {
    id: "3",
    text: "Cuando te enfadas:",
    emoji: "😤",
    options: [
      { text: "Explotó en segundos", age: 17 },
      { text: "Me callo hasta que puedo hablar bien", age: 35 },
      { text: "Me alejo y vuelvo cuando pueda", age: 48 },
      { text: "Ya ni me enfado, no vale la pena", age: 62 },
    ],
  },
  {
    id: "4",
    text: "Música que más escuchas últimamente:",
    emoji: "🎧",
    options: [
      { text: "Lo que sale viral en TikTok", age: 20 },
      { text: "Reggaetón y pop actual", age: 27 },
      { text: "Mis clásicos de siempre", age: 40 },
      { text: "Boleros, rock viejo, clásicos eternos", age: 55 },
    ],
  },
  {
    id: "5",
    text: "Te invitan a un after party a las 3am:",
    emoji: "🍹",
    options: [
      { text: "¡Voy! Yo no me pierdo nada", age: 21 },
      { text: "Depende de quién esté", age: 30 },
      { text: "A esa hora yo ya dormí", age: 48 },
      { text: "3am es hora de ir al baño, no de salir", age: 62 },
    ],
  },
  {
    id: "6",
    text: "Tu opinión sobre el drama:",
    emoji: "🎭",
    options: [
      { text: "Me encanta saberlo todo", age: 18 },
      { text: "Disfruto viéndolo de lejos", age: 33 },
      { text: "No tengo tiempo para eso", age: 50 },
      { text: "No entiendo de qué están hablando", age: 65 },
    ],
  },
  {
    id: "7",
    text: "Dinero extra inesperado:",
    emoji: "💸",
    options: [
      { text: "Algo que quería + salir a celebrar", age: 22 },
      { text: "50% ahorro, 50% gusto", age: 35 },
      { text: "Todo al ahorro", age: 50 },
      { text: "Invertir o pagar algo importante", age: 55 },
    ],
  },
  {
    id: "8",
    text: "Nivel de drama en tu vida:",
    emoji: "🎢",
    options: [
      { text: "Alto, pero me gusta", age: 20 },
      { text: "Lo justo, no me aburro", age: 30 },
      { text: "Bajo, prefiero mi paz", age: 50 },
      { text: "Cero. Nada me altera.", age: 65 },
    ],
  },
];

function resultFor(avg: number) {
  if (avg < 22) return {
    id: "teen", title: "17 años mentales", emoji: "🎈",
    bg: "from-pink-400 to-rose-500",
    desc: "Tu cerebro está en modo fiesta eterna. Vives el presente a tope, las emociones a flor de piel, y te aburres rápido. Energía pura.",
    share: "Mi edad mental es 17 años 🎈",
  };
  if (avg < 32) return {
    id: "twenties", title: "25 años mentales", emoji: "🔥",
    bg: "from-orange-500 to-red-500",
    desc: "Punto dulce entre energía y madurez. Quieres comerte el mundo pero ya empiezas a pensar en el futuro. Etapa power.",
    share: "Mi edad mental es 25 años 🔥",
  };
  if (avg < 42) return {
    id: "thirties", title: "35 años mentales", emoji: "🌳",
    bg: "from-emerald-500 to-teal-600",
    desc: "Sabes lo que quieres y te estresas menos por lo pequeño. Balance entre vivir y construir. Eres fuente de consejos.",
    share: "Mi edad mental es 35 años 🌳",
  };
  if (avg < 52) return {
    id: "forties", title: "45 años mentales", emoji: "🧘",
    bg: "from-sky-500 to-indigo-600",
    desc: "Has visto suficiente. Te afecta poco, disfrutas tu espacio, y prefieres una conversación profunda a una fiesta ruidosa.",
    share: "Mi edad mental es 45 años 🧘",
  };
  return {
    id: "senior", title: "60+ años mentales", emoji: "👑",
    bg: "from-slate-700 to-slate-900",
    desc: "Un alma vieja en cuerpo joven. Ves los problemas 3 pasos antes. Has hecho paces con casi todo. Tu sabiduría es tu marca.",
    share: "Mi edad mental es 60+ años 👑",
  };
}

export default function EdadMental() {
  const [step, setStep] = useState(0);
  const [ages, setAges] = useState<number[]>([]);

  if (step >= QUESTIONS.length) {
    const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
    const r = resultFor(avg);
    return (
      <div className={`min-h-screen bg-gradient-to-br ${r.bg} text-white`}>
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
          <Link href="/" className="text-sm opacity-80 hover:opacity-100">
            ← Viralísima
          </Link>
          <div className="text-center mt-10">
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
              Tu edad mental es…
            </div>
            <div className="text-9xl mb-3">{r.emoji}</div>
            <h1 className="text-5xl md:text-7xl font-black mb-6">{r.title}</h1>
            <p className="text-lg md:text-xl opacity-95 max-w-lg mx-auto leading-relaxed">
              {r.desc}
            </p>
            <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
              Promedio: <strong>{avg.toFixed(1)} años</strong>
            </div>
          </div>
          <ShareButtons text={r.share} url={`https://viralisima.com/edad-mental`} />
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setStep(0); setAges([]); }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all"
            >
              🔄 Volver a calcular
            </button>
            <Link
              href="/"
              className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-center hover:scale-105 transition-all"
            >
              🎯 Probar otros tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  const progress = step / QUESTIONS.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>
        <div className="mt-6 mb-8">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-500 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Pregunta {step + 1} de {QUESTIONS.length}
          </p>
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{q.emoji}</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{q.text}</h2>
        </div>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setAges([...ages, opt.age]); setStep(step + 1); }}
              className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-fuchsia-500 hover:shadow-md transition-all font-medium text-slate-800"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
