import Link from "next/link";
import { QUIZZES } from "@/data/quizzes";
import { BLOG } from "@/data/blog";

export const metadata = {
  title:
    "Viralísima — Quizzes, tests y generadores virales en español",
  description:
    "Los quizzes, tests y generadores de memes/frases más virales en español. Gratis, sin registro, para toda LatAm y España.",
};

const TOOLS = [
  {
    slug: "memes",
    href: "/memes",
    title: "Generador de Memes",
    subtitle: "Sube tu foto, pon texto y descarga. Listo para compartir.",
    emoji: "🎨",
    coverGradient: "from-rose-500 via-fuchsia-500 to-indigo-500",
    type: "Herramienta",
    timeEstimate: "30 segundos",
  },
  {
    slug: "frases",
    href: "/frases",
    title: "Generador de Frases Virales",
    subtitle: "Para tu bio, tu próximo post o tu estado. 7 categorías.",
    emoji: "💬",
    coverGradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    type: "Herramienta",
    timeEstimate: "10 segundos",
  },
  {
    slug: "nombre-artista",
    href: "/generadores/nombre-artista",
    title: "Tu Nombre Artístico",
    subtitle: "Reggaetón, rap, pop, rock, banda... elige género y descubre tu nombre.",
    emoji: "🎤",
    coverGradient: "from-orange-500 via-red-500 to-pink-600",
    type: "Herramienta",
    timeEstimate: "5 segundos",
  },
  {
    slug: "horoscopo",
    href: "/horoscopo",
    title: "Horóscopo de la semana",
    subtitle: "Amor, trabajo, salud y suerte. Predicciones por signo.",
    emoji: "✨",
    coverGradient: "from-indigo-500 via-purple-500 to-pink-500",
    type: "Herramienta",
    timeEstimate: "1 minuto",
  },
  {
    slug: "historias",
    href: "/historias",
    title: "Generador de Historias",
    subtitle: "Inventa una historia divertida en segundos. Para niños y adultos.",
    emoji: "📚",
    coverGradient: "from-amber-400 via-orange-500 to-pink-500",
    type: "Herramienta",
    timeEstimate: "10 segundos",
  },
  {
    slug: "edad-mental",
    href: "/edad-mental",
    title: "Calculadora de Edad Mental",
    subtitle: "8 preguntas y te damos el número exacto. Divertido y compartible.",
    emoji: "🧠",
    coverGradient: "from-pink-400 via-rose-500 to-red-500",
    type: "Calculadora",
    timeEstimate: "1 minuto",
  },
  {
    slug: "aura",
    href: "/aura",
    title: "¿De qué color es tu aura?",
    subtitle: "Descubre el color de tu energía según tu vibra. Resultado visual épico.",
    emoji: "🔮",
    coverGradient: "from-violet-500 via-fuchsia-500 to-rose-500",
    type: "Test",
    timeEstimate: "45 segundos",
  },
  {
    slug: "username",
    href: "/generadores/username",
    title: "Generador de Username",
    subtitle: "Encuentra el @ perfecto para Instagram, TikTok o Twitter.",
    emoji: "📱",
    coverGradient: "from-cyan-400 via-sky-500 to-blue-600",
    type: "Herramienta",
    timeEstimate: "15 segundos",
  },
  {
    slug: "compatibilidad",
    href: "/compatibilidad",
    title: "¿Cuánto encajáis?",
    subtitle: "Mete 2 nombres y descubre vuestra compatibilidad. Ultra viral.",
    emoji: "💕",
    coverGradient: "from-pink-500 via-rose-500 to-red-500",
    type: "Calculadora",
    timeEstimate: "10 segundos",
  },
  {
    slug: "dias-vividos",
    href: "/dias-vividos",
    title: "¿Cuántos días has vivido?",
    subtitle: "Tu fecha de nacimiento = tu número de días, horas y años durmiendo.",
    emoji: "🎈",
    coverGradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    type: "Calculadora",
    timeEstimate: "10 segundos",
  },
  {
    slug: "edad-perro",
    href: "/edad-perro",
    title: "Edad real de tu perro",
    subtitle: "Cuántos años humanos tiene tu peludo según tamaño.",
    emoji: "🐕",
    coverGradient: "from-amber-400 via-orange-500 to-red-500",
    type: "Calculadora",
    timeEstimate: "10 segundos",
  },
  {
    slug: "calculadora-imc",
    href: "/calculadora-imc",
    title: "Calculadora de IMC",
    subtitle: "Peso + altura = tu IMC al instante. Con rangos OMS.",
    emoji: "⚖️",
    coverGradient: "from-emerald-500 via-teal-500 to-cyan-500",
    type: "Calculadora",
    timeEstimate: "10 segundos",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="px-4 pt-16 pb-12 text-center max-w-3xl mx-auto">
        <div className="inline-block px-4 py-1 mb-6 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white text-sm font-semibold">
          ✨ Nuevos cada semana
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Viralísima
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 font-medium mb-2">
          Tests, quizzes y generadores que tus amigos no van a poder dejar de compartir.
        </p>
        <p className="text-slate-500">
          Hecho para toda Latinoamérica y España. Gratis, rápido, sin registro.
        </p>
      </section>

      <section id="herramientas" className="px-4 pb-10 max-w-6xl mx-auto scroll-mt-20">
        <h2 className="text-2xl font-black text-slate-800 mb-4">🛠️ Herramientas virales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={t.href}
              className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`bg-gradient-to-br ${t.coverGradient} aspect-[16/9] p-6 flex flex-col justify-between text-white`}
              >
                <div className="flex justify-between items-start">
                  <div className="text-6xl">{t.emoji}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80 bg-white/20 px-3 py-1 rounded-full">
                    {t.type} · {t.timeEstimate}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black leading-tight mb-1">{t.title}</h3>
                  <p className="text-white/90 text-sm">{t.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="quizzes" className="px-4 pb-24 max-w-6xl mx-auto scroll-mt-20">
        <h2 className="text-2xl font-black text-slate-800 mb-4">🎭 Quizzes virales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUIZZES.map((q) => (
            <Link
              key={q.slug}
              href={`/quiz/${q.slug}`}
              className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`bg-gradient-to-br ${q.coverGradient} aspect-[4/5] p-6 flex flex-col justify-between text-white`}
              >
                <div className="text-7xl">{q.emoji}</div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">
                    {q.type === "trivia"
                      ? "🧠 Trivia"
                      : q.type === "personality"
                        ? "🎭 Personalidad"
                        : "⚙️ Generador"}{" "}
                    · {q.timeEstimate}
                  </div>
                  <h2 className="text-2xl font-black leading-tight mb-2">{q.title}</h2>
                  <p className="text-white/90 text-sm">{q.subtitle}</p>
                  <div className="mt-4 inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    Empezar →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {BLOG.length > 0 && (
        <section className="px-4 pb-24 max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-800">📝 Del blog</h2>
            <Link href="/blog" className="text-sm font-semibold text-fuchsia-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...BLOG].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${p.coverGradient} p-5 text-white aspect-[4/3] flex flex-col justify-between`}>
                  <div className="text-5xl">{p.emoji}</div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{p.category}</div>
                    <h3 className="text-lg font-black leading-tight">{p.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="px-4 py-10 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <h4 className="font-bold mb-3">Viralísima</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/sobre-nosotros" className="hover:text-white">Sobre nosotros</Link></li>
                <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Explora</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/#quizzes" className="hover:text-white">Quizzes</Link></li>
                <li><Link href="/#herramientas" className="hover:text-white">Herramientas</Link></li>
                <li><Link href="/horoscopo" className="hover:text-white">Horóscopo</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/privacidad" className="hover:text-white">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-white">Términos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Contacto</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="mailto:info@viralisima.com" className="hover:text-white">info@viralisima.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-sm opacity-60">
            © 2026 Viralísima · Hecho con 💛 para todo el mundo hispano
          </div>
        </div>
      </footer>
    </main>
  );
}
