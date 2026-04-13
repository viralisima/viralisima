import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GAMES, isValidGame, getTop } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  if (!isValidGame(game)) return {};
  const g = GAMES[game];
  return {
    title: `Ranking de ${g.label} | Viralísima`,
    description: `Top 100 jugadores de ${g.label}. ¿Entras en el ranking?`,
  };
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  if (!isValidGame(game)) notFound();
  const cfg = GAMES[game];
  let top: { name: string; score: number }[] = [];
  try {
    top = await getTop(game, 100);
  } catch {
    top = [];
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
        <Link href={`/juegos/${game}`} className="text-sm text-slate-500 hover:text-slate-900">
          ← {cfg.label}
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-2">🏆</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Ranking Global
          </h1>
          <p className="text-slate-600 mt-1 text-lg">{cfg.label}</p>
        </div>

        {top.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="mb-6">Aún no hay nadie en el ranking. ¡Sé el primero!</p>
            <Link
              href={`/juegos/${game}`}
              className="inline-block bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
            >
              ▶ Jugar ahora
            </Link>
          </div>
        ) : (
          <>
            <ol className="space-y-1 bg-white rounded-3xl p-4 shadow-lg">
              {top.map((e, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl ${
                    i < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : ""
                  }`}
                >
                  <div
                    className={`w-10 text-center font-black text-xl ${
                      i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-500"
                    }`}
                  >
                    {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                  </div>
                  <div className="flex-1 font-semibold truncate">{e.name}</div>
                  <div className="font-mono font-bold text-slate-900">
                    {e.score} {cfg.unit}
                  </div>
                </li>
              ))}
            </ol>

            <div className="text-center mt-8">
              <Link
                href={`/juegos/${game}`}
                className="inline-block bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
              >
                ▶ Intenta superarlos
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
