import Link from "next/link";
import { QUIZZES } from "@/data/quizzes";

export const metadata = {
  title: "Viralísima — Tests, quizzes y generadores que no podrás dejar de compartir",
  description:
    "Los quizzes y generadores más virales en español. Descubre qué famoso eres, qué tanto sabes de música, cómo será tu vida en 2030 y más. Gratis, sin registro.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="px-4 pt-16 pb-12 text-center max-w-3xl mx-auto">
        <div className="inline-block px-4 py-1 mb-6 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 text-white text-sm font-semibold">
          ✨ Nuevo cada semana
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

      <section className="px-4 pb-24 max-w-6xl mx-auto">
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

      <footer className="px-4 py-10 bg-slate-900 text-white text-center">
        <p className="text-sm opacity-70">
          © 2026 Viralísima · Hecho con 💛 para todo el mundo hispano
        </p>
      </footer>
    </main>
  );
}
