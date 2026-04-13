import Link from "next/link";

export const metadata = {
  title: "Mini-juegos virales | Viralísima",
  description: "Juegos rápidos y adictivos: reflejos, memoria, velocidad de click. Bate tu récord y reta a tus amigos.",
  openGraph: {
    title: "Mini-juegos — Viralísima",
    description: "Juegos rápidos para retar a tus amigos.",
    url: "https://viralisima.com/juegos",
    images: [{ url: "/api/og?quiz=juegos", width: 1200, height: 630 }],
  },
};

const GAMES = [
  {
    slug: "reflejos",
    title: "Test de Reflejos",
    subtitle: "Click cuando el círculo cambie de color. Mide tu tiempo en milisegundos.",
    emoji: "⚡",
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    duration: "15 segundos",
  },
  {
    slug: "memoria",
    title: "Memoria Simon",
    subtitle: "Repite la secuencia de colores. Cada nivel añade un color más.",
    emoji: "🧠",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    duration: "1-3 minutos",
  },
  {
    slug: "tap-sprint",
    title: "Tap Sprint",
    subtitle: "¿Cuántos clicks puedes hacer en 10 segundos? Pon a prueba tus dedos.",
    emoji: "👆",
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    duration: "10 segundos",
  },
];

export default function Juegos() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-10">
          <div className="text-5xl mb-2">🎮</div>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Mini-juegos
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Juegos rápidos, adictivos y compartibles. Bate tu récord.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/juegos/${g.slug}`}
              className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className={`bg-gradient-to-br ${g.gradient} aspect-[3/4] p-6 flex flex-col justify-between text-white`}>
                <div className="text-7xl">{g.emoji}</div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
                    🎮 Juego · {g.duration}
                  </div>
                  <h2 className="text-2xl font-black leading-tight mb-2">{g.title}</h2>
                  <p className="text-white/90 text-sm">{g.subtitle}</p>
                  <div className="mt-4 inline-flex bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold group-hover:bg-white group-hover:text-slate-900 transition-colors">
                    Jugar ▶
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">
            🏆 Rankings globales
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {GAMES.map((g) => (
              <Link
                key={g.slug}
                href={`/juegos/ranking/${g.slug}`}
                className="px-4 py-2 bg-white border-2 border-slate-200 rounded-full text-sm font-semibold hover:border-fuchsia-500 transition-colors"
              >
                {g.emoji} {g.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
