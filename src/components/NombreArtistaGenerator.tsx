"use client";

import { useState } from "react";
import Link from "next/link";

const GENRES = {
  reggaeton: {
    label: "🔥 Reggaetón",
    gradient: "from-orange-500 via-red-500 to-pink-600",
    prefixes: ["El", "Don", "Bebé", "Young", "Baby", "King", "Mr.", "Lil"],
    cores: ["Flexx", "Ghosttie", "Maldito", "Rebelde", "Diamante", "Lava", "Neon", "Papi", "Kryptonite", "Tropi", "Santo", "Loco", "Royal", "Mango", "Vortex"],
    suffixes: ["", " Jr.", " 24", " XL", " OG", " Pro", " del Barrio", " Flow", " MX", " PR"],
  },
  rap: {
    label: "🎤 Rap / Trap",
    gradient: "from-slate-700 via-slate-900 to-black",
    prefixes: ["Lil", "Young", "Big", "MC", "DJ", "OG", "MF", "Real"],
    cores: ["Skull", "Menace", "Dominus", "Static", "Wolf", "Cipher", "Phantom", "Rayo", "Asfalto", "Oro", "Cuervo", "Vandal", "Odiseo", "Bala", "Metro"],
    suffixes: ["", " Ace", " One", " 305", " 52", " .exe", " K", " Beats", " Flow"],
  },
  pop: {
    label: "✨ Pop",
    gradient: "from-pink-400 via-fuchsia-500 to-purple-500",
    prefixes: ["", "La", "The", "Miss", "Mr."],
    cores: ["Aurora", "Lumi", "Luna", "Vera", "Cielo", "Rose", "Monaco", "Bambi", "Glass", "Stellar", "Nova", "Kiki", "Mila", "Theo", "Vela"],
    suffixes: ["", " Moon", " Star", " Bloom", " Dream", " Sky", " Neon", " Pulse"],
  },
  rock: {
    label: "🤘 Rock",
    gradient: "from-red-700 via-rose-900 to-black",
    prefixes: ["Los", "The", "", "Sonic"],
    cores: ["Tigres", "Cardenales", "Cuervos Rojos", "Vampiros", "Lobos de Papel", "Sangre Azul", "Manos Muertas", "Ajenos", "Lava Fría", "Reyes del Ruido", "Bastardos", "Silencio Eterno", "Velocidad", "Sal y Fuego", "Armadillos"],
    suffixes: ["", " & La Furia", " del Norte", " en Combustión", " Eléctricos", " del Sur", " Band"],
  },
  banda: {
    label: "🎺 Banda / Regional",
    gradient: "from-amber-500 via-orange-600 to-red-700",
    prefixes: ["Los", "Grupo", "La Banda", "Los Nuevos"],
    cores: ["Caciques de Sinaloa", "Águilas del Norte", "Reyes de Monterrey", "Leones del Pacífico", "Gavilanes", "Jilgueros", "Tigres de la Sierra", "Broncos del Desierto", "Jinetes", "Hermanos Soto", "Compadres Valientes", "Potros del Sur"],
    suffixes: ["", " MX", " Oficial", " del Rancho", " Pro"],
  },
  electronica: {
    label: "🎛️ Electrónica / DJ",
    gradient: "from-cyan-400 via-blue-500 to-violet-600",
    prefixes: ["DJ", "MC"],
    cores: ["Neonix", "Pulse", "Lumen", "Astro", "Hex", "Circuit", "Zephyr", "Oblivion", "Pixel", "Gravity", "Cosmo", "Cypher", "Moonwave", "Synth Lord"],
    suffixes: ["", " Beats", " x2", " 99", " .WAV", " FM"],
  },
};

type Genre = keyof typeof GENRES;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(g: Genre): string {
  const set = GENRES[g];
  const p = pick(set.prefixes);
  const c = pick(set.cores);
  const s = pick(set.suffixes);
  return `${p ? p + " " : ""}${c}${s}`.trim().replace(/\s+/g, " ");
}

export default function NombreArtistaGenerator() {
  const [genre, setGenre] = useState<Genre>("reggaeton");
  const [name, setName] = useState(generate("reggaeton"));
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const roll = (g: Genre = genre) => {
    const newName = generate(g);
    setName(newName);
    setHistory((h) => [newName, ...h].slice(0, 5));
  };

  const changeGenre = (g: Genre) => {
    setGenre(g);
    roll(g);
  };

  const copy = () => {
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareMsg = `Mi nombre artístico de ${GENRES[genre].label.replace(/[🔥🎤✨🤘🎺🎛️]\s*/u, "")} es ${name} 🎤 (según viralisima.com)`;
  const share = (platform: "whatsapp" | "twitter") => {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMsg)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}`,
    };
    window.open(urls[platform], "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-2">🎤</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Tu Nombre Artístico
          </h1>
          <p className="text-slate-600 mt-2">
            Descubre cuál sería tu nombre de escenario. Elige género y dale a generar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {(Object.keys(GENRES) as Genre[]).map((g) => (
            <button
              key={g}
              onClick={() => changeGenre(g)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                genre === g
                  ? "bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-md"
                  : "bg-white border-2 border-slate-200 text-slate-700 hover:border-fuchsia-500"
              }`}
            >
              {GENRES[g].label}
            </button>
          ))}
        </div>

        <div
          className={`bg-gradient-to-br ${GENRES[genre].gradient} rounded-3xl p-10 md:p-16 text-white text-center min-h-[250px] flex flex-col items-center justify-center shadow-2xl`}
        >
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
            Tu nombre artístico:
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight break-words">{name}</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => roll()}
            className="bg-slate-900 text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform col-span-2 sm:col-span-1"
          >
            🎲 Otro
          </button>
          <button
            onClick={copy}
            className="bg-white border-2 border-slate-200 font-semibold py-3 rounded-2xl hover:border-fuchsia-500"
          >
            {copied ? "✅ Copiado" : "📋 Copiar"}
          </button>
          <button
            onClick={() => share("whatsapp")}
            className="bg-green-500 text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={() => share("twitter")}
            className="bg-black text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform"
          >
            𝕏 Twitter
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-8 p-5 bg-slate-100 rounded-2xl">
            <div className="text-sm font-semibold text-slate-700 mb-2">📚 Otros que te salieron:</div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-slate-600 border border-slate-200">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
