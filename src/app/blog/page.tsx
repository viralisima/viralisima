import Link from "next/link";
import { BLOG } from "@/data/blog";

export const metadata = {
  title: "Blog de Viralísima | Tendencias, tops y contenido viral en español",
  description:
    "Lee tops, rankings y contenido divertido para toda Latinoamérica y España. Nuevos artículos virales cada día.",
};

export default function BlogIndex() {
  const sorted = [...BLOG].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-2">📝</div>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Blog Viralísima
          </h1>
          <p className="text-slate-600 mt-2">
            Tops, listas y contenido que te va a hacer reír, pensar y compartir.
          </p>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-slate-500">Pronto más contenido...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {sorted.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div
                  className={`bg-gradient-to-br ${p.coverGradient} aspect-[16/9] p-6 text-white flex flex-col justify-between`}
                >
                  <div className="text-5xl">{p.emoji}</div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">
                      {p.category} · {new Date(p.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </div>
                    <h2 className="text-xl font-black leading-tight">{p.title}</h2>
                    <p className="text-white/90 text-sm mt-2">{p.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
