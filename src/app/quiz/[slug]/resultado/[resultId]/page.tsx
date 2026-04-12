import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { QUIZZES, getQuiz } from "@/data/quizzes";
import ShareButtons from "@/components/ShareButtons";

export async function generateStaticParams() {
  const out: { slug: string; resultId: string }[] = [];
  for (const q of QUIZZES) {
    for (const r of q.results) out.push({ slug: q.slug, resultId: r.id });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; resultId: string }>;
}): Promise<Metadata> {
  const { slug, resultId } = await params;
  const quiz = getQuiz(slug);
  const result = quiz?.results.find((r) => r.id === resultId);
  if (!quiz || !result) return {};
  const url = `https://viralisima.com/quiz/${slug}/resultado/${resultId}`;
  const ogUrl = `/api/og?quiz=${slug}&result=${resultId}`;
  return {
    title: `Me salió: ${result.title} — ${quiz.title}`,
    description: result.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${result.emoji} Me salió: ${result.title}`,
      description: `${result.description} — ¿Y a ti?`,
      url,
      siteName: "Viralísima",
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Me salió: ${result.title}`,
      description: result.description,
      images: [ogUrl],
    },
  };
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ slug: string; resultId: string }>;
}) {
  const { slug, resultId } = await params;
  const quiz = getQuiz(slug);
  const result = quiz?.results.find((r) => r.id === resultId);
  if (!quiz || !result) notFound();

  const url = `https://viralisima.com/quiz/${slug}/resultado/${resultId}`;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${result.bgGradient} text-white`}>
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
        <Link href="/" className="text-sm opacity-80 hover:opacity-100">
          ← Viralísima
        </Link>

        <div className="text-center mt-8">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">
            Resultado del test · {quiz.title}
          </div>
          <div className="text-9xl mb-4">{result.emoji}</div>
          <h1 className="text-4xl md:text-6xl font-black mb-6">{result.title}</h1>
          <p className="text-lg md:text-xl opacity-95 max-w-lg mx-auto leading-relaxed">
            {result.description}
          </p>
        </div>

        <ShareButtons text={result.shareText} url={url} />

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/quiz/${quiz.slug}`}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-center transition-all"
          >
            🔄 Haz el test tú también
          </Link>
          <Link
            href="/"
            className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-center hover:scale-105 transition-all"
          >
            🎯 Más quizzes virales
          </Link>
        </div>
      </div>
    </div>
  );
}
