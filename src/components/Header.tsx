"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { QUIZZES } from "@/data/quizzes";
import { SIGNS } from "@/data/horoscopo";
import { BLOG } from "@/data/blog";

const TOOLS = [
  { href: "/memes", label: "🎨 Generador de memes" },
  { href: "/frases", label: "💬 Frases virales" },
  { href: "/generadores/nombre-artista", label: "🎤 Nombre artístico" },
  { href: "/historias", label: "📚 Historias cortas" },
  { href: "/edad-mental", label: "🧠 Edad mental" },
  { href: "/aura", label: "🔮 Color de tu aura" },
  { href: "/generadores/username", label: "📱 Username redes" },
  { href: "/compatibilidad", label: "💕 Compatibilidad" },
  { href: "/dias-vividos", label: "🎈 Días vividos" },
  { href: "/edad-perro", label: "🐕 Edad del perro" },
  { href: "/calculadora-imc", label: "⚖️ Calculadora IMC" },
];

type Section = {
  label: string;
  href?: string;
  items?: { href: string; label: string }[];
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const quizItems = QUIZZES.map((q) => ({
    href: `/quiz/${q.slug}`,
    label: `${q.emoji} ${q.title}`,
  }));

  const horoscopoItems = [
    { href: "/horoscopo", label: "✨ Ver todos los signos" },
    ...SIGNS.map((s) => ({ href: `/horoscopo/${s.id}`, label: `${s.emoji} ${s.name}` })),
  ];

  const blogItems = [
    { href: "/blog", label: "📝 Ver todos los artículos" },
    ...[...BLOG].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((p) => ({
      href: `/blog/${p.slug}`,
      label: `${p.emoji} ${p.title}`,
    })),
  ];

  const sections: Section[] = [
    { label: "Inicio", href: "/" },
    { label: "Quizzes", items: quizItems },
    { label: "Herramientas", items: TOOLS },
    { label: "Horóscopo", items: horoscopoItems },
    { label: "Blog", items: blogItems },
  ];

  const closeAll = () => {
    setOpenDropdown(null);
    setMobileOpen(false);
    setExpandedMobile(null);
  };

  return (
    <header ref={ref} className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tight bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent"
          onClick={closeAll}
        >
          Viralísima
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-1">
          {sections.map((s) => (
            <li key={s.label} className="relative">
              {s.href ? (
                <Link
                  href={s.href}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-fuchsia-600 hover:bg-slate-50 transition-colors"
                >
                  {s.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === s.label ? null : s.label)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1 ${
                      openDropdown === s.label
                        ? "text-fuchsia-600 bg-fuchsia-50"
                        : "text-slate-700 hover:text-fuchsia-600 hover:bg-slate-50"
                    }`}
                  >
                    {s.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={`transition-transform ${openDropdown === s.label ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openDropdown === s.label && s.items && (
                    <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 py-2">
                      {s.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeAll}
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-fuchsia-600 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          {sections.map((s) => (
            <div key={s.label} className="border-b border-slate-100">
              {s.href ? (
                <Link
                  href={s.href}
                  onClick={closeAll}
                  className="block px-6 py-3 font-bold text-slate-800 hover:bg-slate-50"
                >
                  {s.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setExpandedMobile(expandedMobile === s.label ? null : s.label)
                    }
                    className="w-full flex items-center justify-between px-6 py-3 font-bold text-slate-800 hover:bg-slate-50"
                  >
                    {s.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className={`transition-transform ${expandedMobile === s.label ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedMobile === s.label && s.items && (
                    <div className="bg-slate-50 border-t border-slate-100">
                      {s.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeAll}
                          className="block px-8 py-2.5 text-sm text-slate-700 hover:bg-white hover:text-fuchsia-600 border-b border-slate-100 last:border-b-0"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
