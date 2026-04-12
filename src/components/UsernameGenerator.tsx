"use client";

import { useState } from "react";
import Link from "next/link";

const STYLES = {
  aesthetic: {
    label: "✨ Estético",
    prefixes: ["", "the", "its", "my", ""],
    suffixes: [".aesthetic", "_aura", ".vibes", ".core", "_vibes", ".moon", "_luna", ".soft", "_bloom", ".sky"],
  },
  gamer: {
    label: "🎮 Gamer",
    prefixes: ["xX", "pro", "gg", "lord_", ""],
    suffixes: ["_tv", "YT", "GG", "_XD", "_op", "_mvp", "_god", "Xx", "_ez", "1337"],
  },
  cool: {
    label: "😎 Cool",
    prefixes: ["real", "the", "iam", ""],
    suffixes: [".official", "_rl", "real", "oficial", "x", "__", "_yes", "live", "era", "now"],
  },
  minimalista: {
    label: "🤍 Minimal",
    prefixes: ["", "_", "", ""],
    suffixes: ["", ".", "_", "__", "°", ".tt", ".ig"],
  },
  divertido: {
    label: "🤪 Divertido",
    prefixes: ["el", "la", "super", "turbo", "mega"],
    suffixes: ["123", "puro", "oficial", "star", "power", "galaxy", "cosmic", "xd", "pro"],
  },
  empresarial: {
    label: "💼 Profesional",
    prefixes: ["", "by", "studio"],
    suffixes: [".studio", ".co", ".work", ".labs", ".mx", ".es", ".agency"],
  },
};

const ADJECTIVES = ["sunny", "happy", "dreamy", "wild", "cool", "rare", "real", "pure", "wavy", "fresh"];
const NOUNS = ["soul", "rose", "star", "wolf", "moon", "bee", "fox", "kitten", "sky", "mango"];

type Style = keyof typeof STYLES;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(base: string, style: Style): string[] {
  const set = STYLES[style];
  const b = base.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "user";
  const r = () => Math.floor(Math.random() * 99);
  const variants = [
    `${pick(set.prefixes)}${b}${pick(set.suffixes)}`,
    `${b}${pick(set.suffixes)}${r()}`,
    `${b}_${pick(ADJECTIVES)}`,
    `${pick(ADJECTIVES)}.${b}`,
    `${b}${pick(NOUNS)}`,
    `${b}.${pick(NOUNS)}`,
    `${b}${r()}${pick(set.suffixes)}`,
    `${pick(set.prefixes)}${b}.${pick(NOUNS)}`,
  ];
  return [...new Set(variants.map((v) => v.replace(/\s+/g, "").replace(/^[._]+/, "").slice(0, 30)))].slice(0, 6);
}

export default function UsernameGenerator() {
  const [name, setName] = useState("");
  const [style, setStyle] = useState<Style>("aesthetic");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  const generate = () => {
    if (!name.trim()) return;
    setResults(generateName(name.trim(), style));
  };

  const copy = (u: string) => {
    navigator.clipboard.writeText(`@${u}`);
    setCopied(u);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-2">📱</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Generador de Username
          </h1>
          <p className="text-slate-600 mt-2">
            Encuentra el @ perfecto para Instagram, TikTok, Twitter o donde quieras.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tu nombre, apodo o palabra base
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ana, Luis, Maria..."
              onKeyDown={(e) => e.key === "Enter" && generate()}
              className="w-full px-4 py-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Estilo</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STYLES) as Style[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    style === s
                      ? "bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-md"
                      : "bg-white border-2 border-slate-200 text-slate-700 hover:border-fuchsia-500"
                  }`}
                >
                  {STYLES[s].label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            🎲 Generar usernames
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-sm font-bold text-slate-700">💡 Toca para copiar:</p>
            {results.map((u, i) => (
              <button
                key={i}
                onClick={() => copy(u)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-fuchsia-500 transition-all text-left group"
              >
                <span className="font-mono font-bold text-lg text-slate-900">@{u}</span>
                <span className="text-sm text-slate-500 group-hover:text-fuchsia-600">
                  {copied === u ? "✅ Copiado" : "📋 Copiar"}
                </span>
              </button>
            ))}
            <p className="text-xs text-slate-500 text-center mt-4">
              ⚠️ Recuerda verificar disponibilidad en cada red social antes de usarlo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
