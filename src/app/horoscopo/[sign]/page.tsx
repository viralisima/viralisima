import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SIGNS, getSign, weekIndex } from "@/data/horoscopo";
import ShareButtons from "@/components/ShareButtons";

const BG: Record<string, string> = {
  aries: "from-red-500 to-orange-500",
  tauro: "from-emerald-500 to-green-600",
  geminis: "from-yellow-400 to-amber-500",
  cancer: "from-sky-400 to-cyan-500",
  leo: "from-amber-500 to-orange-600",
  virgo: "from-stone-500 to-amber-700",
  libra: "from-pink-400 to-rose-500",
  escorpio: "from-purple-700 to-red-900",
  sagitario: "from-violet-500 to-fuchsia-600",
  capricornio: "from-slate-600 to-slate-800",
  acuario: "from-sky-500 to-blue-600",
  piscis: "from-cyan-500 to-teal-600",
};

export async function generateStaticParams() {
  return SIGNS.map((s) => ({ sign: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}): Promise<Metadata> {
  const { sign } = await params;
  const s = getSign(sign);
  if (!s) return {};
  const url = `https://viralisima.com/horoscopo/${sign}`;
  return {
    title: `Horóscopo de ${s.name} para esta semana | Viralísima`,
    description: `${s.personality}`,
    alternates: { canonical: url },
    openGraph: {
      title: `${s.emoji} Horóscopo de ${s.name}`,
      description: s.personality,
      url,
      siteName: "Viralísima",
      images: [{ url: `/api/og?horoscopo=${sign}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.emoji} Horóscopo de ${s.name}`,
      images: [`/api/og?horoscopo=${sign}`],
    },
  };
}

export default async function SignPage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const s = getSign(sign);
  if (!s) notFound();

  const url = `https://viralisima.com/horoscopo/${sign}`;
  const bg = BG[s.id] ?? "from-slate-500 to-slate-700";

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bg} text-white`}>
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
        <Link href="/horoscopo" className="text-sm opacity-80 hover:opacity-100">
          ← Todos los signos
        </Link>

        <div className="text-center mt-8">
          <div className="text-9xl mb-2">{s.emoji}</div>
          <h1 className="text-5xl md:text-7xl font-black mb-1">{s.name}</h1>
          <p className="opacity-80 text-sm">{s.dates}</p>
        </div>

        <div className="mt-10 space-y-6">
          <section className="bg-white/15 backdrop-blur-sm rounded-3xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
              Tu personalidad
            </h2>
            <p className="text-lg leading-relaxed">{s.personality}</p>
          </section>

          <section className="bg-white/15 backdrop-blur-sm rounded-3xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">
              Tu semana
            </h2>
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-1">❤️ Amor</div>
                <p className="opacity-95">{weekIndex(s.predictions.amor)}</p>
              </div>
              <div>
                <div className="font-bold mb-1">💼 Trabajo</div>
                <p className="opacity-95">{weekIndex(s.predictions.trabajo)}</p>
              </div>
              <div>
                <div className="font-bold mb-1">💪 Salud</div>
                <p className="opacity-95">{weekIndex(s.predictions.salud)}</p>
              </div>
              <div>
                <div className="font-bold mb-1">🍀 Suerte</div>
                <p className="opacity-95">{weekIndex(s.predictions.suerte)}</p>
              </div>
            </div>
          </section>

          <section className="bg-white/15 backdrop-blur-sm rounded-3xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
              Compatibilidad
            </h2>
            <div className="flex flex-wrap gap-2">
              {s.compatibilidad.map((c) => (
                <span key={c} className="bg-white/25 px-3 py-1 rounded-full font-semibold">{c}</span>
              ))}
            </div>
          </section>
        </div>

        <ShareButtons text={s.shareText} url={url} />

        <div className="mt-8 text-center">
          <Link
            href="/horoscopo"
            className="inline-block bg-white text-slate-900 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-all"
          >
            🔮 Ver otros signos
          </Link>
        </div>
      </div>
    </div>
  );
}
