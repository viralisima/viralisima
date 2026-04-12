"use client";

import { useState } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";

type A = "rosa" | "dorado" | "azul" | "verde" | "violeta" | "rojo" | "blanco";

const QUESTIONS = [
  {
    text: "Tu energía principal ahora mismo es…",
    emoji: "⚡",
    options: [
      { text: "Creativa, fluyendo con mil ideas", aura: "violeta" as A },
      { text: "Cálida, amorosa, conectando con los demás", aura: "rosa" as A },
      { text: "Activa, con fuerza para cualquier cosa", aura: "rojo" as A },
      { text: "Tranquila, centrada, en paz", aura: "verde" as A },
    ],
  },
  {
    text: "Cuando entras a un lugar nuevo…",
    emoji: "🚪",
    options: [
      { text: "La gente se me queda viendo", aura: "dorado" as A },
      { text: "Se siente un ambiente más relajado", aura: "azul" as A },
      { text: "Me llega toda la información del sitio", aura: "blanco" as A },
      { text: "Pido un abrazo y ya me siento en casa", aura: "rosa" as A },
    ],
  },
  {
    text: "Cuando meditas / piensas se te viene…",
    emoji: "🧘",
    options: [
      { text: "Ideas nuevas, proyectos, creación", aura: "violeta" as A },
      { text: "Visiones claras del futuro", aura: "blanco" as A },
      { text: "Recuerdos bonitos y cariño", aura: "rosa" as A },
      { text: "Paz total, sin pensamientos", aura: "verde" as A },
    ],
  },
  {
    text: "Tu superpoder social es…",
    emoji: "✨",
    options: [
      { text: "Hacer reír y contagiar alegría", aura: "dorado" as A },
      { text: "Calmar a los demás cuando están mal", aura: "azul" as A },
      { text: "Motivar e inspirar a la acción", aura: "rojo" as A },
      { text: "Entender lo que nadie dice", aura: "blanco" as A },
    ],
  },
  {
    text: "Tu mayor debilidad es…",
    emoji: "🎯",
    options: [
      { text: "Me entrego demasiado a los demás", aura: "rosa" as A },
      { text: "Me cuesta parar y descansar", aura: "rojo" as A },
      { text: "Pienso mucho las cosas", aura: "azul" as A },
      { text: "Me aburro rápido", aura: "violeta" as A },
    ],
  },
];

const AURAS: Record<A, {
  title: string;
  bg: string;
  description: string;
  traits: string[];
  share: string;
}> = {
  rosa: {
    title: "Aura Rosa",
    bg: "from-pink-400 via-rose-400 to-rose-600",
    description: "Amor puro y compasión. Tu energía envuelve, cuida y sana. La gente llega a ti buscando calidez y siempre la encuentran.",
    traits: ["Empatía máxima", "Amor incondicional", "Calidez natural", "Generosidad"],
    share: "Mi aura es ROSA 💗 — viralisima.com/aura",
  },
  dorado: {
    title: "Aura Dorada",
    bg: "from-yellow-400 via-amber-500 to-orange-500",
    description: "Brillas de forma natural. Carisma puro, presencia magnética. Donde tú entras, el ambiente sube de energía. Tienes luz propia.",
    traits: ["Carisma", "Liderazgo", "Abundancia", "Presencia magnética"],
    share: "Mi aura es DORADA ✨ — viralisima.com/aura",
  },
  azul: {
    title: "Aura Azul",
    bg: "from-sky-400 via-blue-500 to-indigo-600",
    description: "Comunicador/a nato/a. Tu energía es clara, honesta, serena. La gente confía en ti rápido porque irradias verdad.",
    traits: ["Comunicación clara", "Serenidad", "Verdad", "Claridad mental"],
    share: "Mi aura es AZUL 💙 — viralisima.com/aura",
  },
  verde: {
    title: "Aura Verde",
    bg: "from-emerald-400 via-green-500 to-teal-600",
    description: "Sanación y equilibrio. Tu energía cura sin que lo intentes. Conectado/a con la naturaleza, centrado/a, imparable desde la calma.",
    traits: ["Equilibrio", "Salud", "Naturaleza", "Sanación"],
    share: "Mi aura es VERDE 💚 — viralisima.com/aura",
  },
  violeta: {
    title: "Aura Violeta",
    bg: "from-purple-500 via-violet-600 to-fuchsia-700",
    description: "Creatividad e intuición. Tu mente ve lo que otros no pueden. Alma artística y visionaria. La inspiración te busca a ti.",
    traits: ["Creatividad", "Intuición", "Visión", "Arte"],
    share: "Mi aura es VIOLETA 💜 — viralisima.com/aura",
  },
  rojo: {
    title: "Aura Roja",
    bg: "from-red-500 via-rose-600 to-orange-600",
    description: "Pasión y fuerza. Tu energía es intensa, activa, imparable. Cuando quieres algo, el universo se mueve. Guerrero/a nato/a.",
    traits: ["Pasión", "Fuerza", "Acción", "Intensidad"],
    share: "Mi aura es ROJA ❤️‍🔥 — viralisima.com/aura",
  },
  blanco: {
    title: "Aura Blanca",
    bg: "from-slate-100 via-slate-200 to-slate-400 text-slate-900",
    description: "Pureza y conexión espiritual. Tu energía es profunda, conectada con algo más grande. La gente siente paz solo con mirarte.",
    traits: ["Espiritualidad", "Pureza", "Sabiduría", "Conexión"],
    share: "Mi aura es BLANCA ⚪ — viralisima.com/aura",
  },
};

function compute(answers: A[]): A {
  const counts: Partial<Record<A, number>> = {};
  for (const a of answers) counts[a] = (counts[a] || 0) + 1;
  const sorted = (Object.entries(counts) as [A, number][]).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

export default function AuraGenerator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<A[]>([]);

  if (step >= QUESTIONS.length) {
    const aura = compute(answers);
    const info = AURAS[aura];
    return (
      <div className={`min-h-screen bg-gradient-to-br ${info.bg} text-white`}>
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
          <Link href="/" className="text-sm opacity-80 hover:opacity-100">
            ← Viralísima
          </Link>
          <div className="text-center mt-10">
            <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
              Tu aura es…
            </div>
            <div className="text-9xl mb-3">🔮</div>
            <h1 className="text-5xl md:text-7xl font-black mb-6">{info.title}</h1>
            <p className="text-lg md:text-xl opacity-95 max-w-lg mx-auto leading-relaxed mb-6">
              {info.description}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {info.traits.map((t, i) => (
                <span key={i} className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <ShareButtons text={info.share} url="https://viralisima.com/aura" />
          <div className="mt-10 text-center">
            <button
              onClick={() => { setStep(0); setAnswers([]); }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold transition-all mr-3"
            >
              🔄 Otra vez
            </button>
            <Link
              href="/"
              className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all inline-block"
            >
              🎯 Otros tests
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
            <div className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-500 transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">Pregunta {step + 1} de {QUESTIONS.length}</p>
        </div>
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{q.emoji}</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{q.text}</h2>
        </div>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setAnswers([...answers, opt.aura]); setStep(step + 1); }}
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
