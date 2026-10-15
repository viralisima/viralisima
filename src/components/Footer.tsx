import Link from "next/link";
import { QUIZZES } from "@/data/quizzes";
import { GAMES } from "@/lib/leaderboard";

// Pie con enlaces en el HTML del servidor (2026-10-16): el menú de Header sólo pinta enlaces al abrirse,
// así que Google veía 2-3 enlaces internos por página y no llegaba a casi nada.
const HERRAMIENTAS: [string, string][] = [
  ["/edad-perro", "Edad de tu perro en años humanos"],
  ["/dias-vividos", "Cuántos días has vivido"],
  ["/calculadora-imc", "Calculadora de IMC"],
  ["/compatibilidad", "Compatibilidad de pareja"],
  ["/edad-mental", "Test de edad mental"],
  ["/aura", "¿De qué color es tu aura?"],
  ["/generadores/nombre-artista", "Generador de nombre artístico"],
  ["/generadores/username", "Generador de nombres de usuario"],
  ["/frases", "Generador de frases"],
  ["/memes", "Memes"],
  ["/historias", "Historias"],
  ["/horoscopo", "Horóscopo de hoy"],
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <nav aria-label="Herramientas">
          <p className="mb-2 font-semibold text-gray-900">Calculadoras y generadores</p>
          <ul className="space-y-1">
            {HERRAMIENTAS.map(([href, txt]) => (
              <li key={href}><Link href={href} className="hover:underline">{txt}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Quizzes">
          <p className="mb-2 font-semibold text-gray-900">Quizzes y tests</p>
          <ul className="space-y-1">
            {QUIZZES.map((q) => (
              <li key={q.slug}><Link href={`/quiz/${q.slug}`} className="hover:underline">{q.title}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Juegos">
          <p className="mb-2 font-semibold text-gray-900">Juegos</p>
          <ul className="space-y-1">
            <li><Link href="/juegos" className="hover:underline">Todos los juegos</Link></li>
            {Object.entries(GAMES).map(([slug, g]) => (
              <li key={slug}><Link href={`/juegos/${slug}`} className="hover:underline">{g.label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Viralísima">
          <p className="mb-2 font-semibold text-gray-900">Viralísima</p>
          <ul className="space-y-1">
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
            <li><Link href="/sobre-nosotros" className="hover:underline">Quiénes somos</Link></li>
            <li><Link href="/contacto" className="hover:underline">Contacto</Link></li>
            <li><Link href="/privacidad" className="hover:underline">Privacidad</Link></li>
            <li><Link href="/terminos" className="hover:underline">Términos</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
