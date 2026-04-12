"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/#quizzes", label: "Quizzes" },
  { href: "/#herramientas", label: "Herramientas" },
  { href: "/horoscopo", label: "Horóscopo" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tight bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent"
          onClick={() => setOpen(false)}
        >
          Viralísima
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-fuchsia-600 hover:bg-slate-50 transition-colors"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
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
      {open && (
        <ul className="md:hidden border-t border-slate-200 bg-white">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:text-fuchsia-600 transition-colors border-b border-slate-100 last:border-b-0"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
