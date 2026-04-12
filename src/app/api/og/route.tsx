import { ImageResponse } from "next/og";
import { getQuiz } from "@/data/quizzes";

export const runtime = "edge";

function gradientToCss(tailwind: string): string {
  const map: Record<string, string> = {
    "fuchsia-500": "#d946ef", "pink-500": "#ec4899", "pink-600": "#db2777",
    "orange-400": "#fb923c", "orange-500": "#f97316",
    "indigo-500": "#6366f1", "indigo-600": "#4f46e5",
    "purple-500": "#a855f7", "cyan-400": "#22d3ee",
    "violet-500": "#8b5cf6",
    "fuchsia-600": "#c026d3", "rose-500": "#f43f5e", "rose-600": "#e11d48",
    "red-500": "#ef4444", "red-600": "#dc2626",
    "sky-500": "#0ea5e9", "blue-500": "#3b82f6", "blue-600": "#2563eb",
    "yellow-400": "#facc15", "amber-500": "#f59e0b",
    "emerald-500": "#10b981", "emerald-600": "#059669",
    "teal-600": "#0d9488", "lime-500": "#84cc16",
    "gray-500": "#6b7280", "slate-600": "#475569",
  };
  const m = tailwind.match(/from-([\w-]+)\s+(?:via-([\w-]+)\s+)?to-([\w-]+)/);
  if (!m) return "linear-gradient(135deg, #d946ef, #fb923c)";
  const [, a, b, c] = m;
  const parts = [map[a] || "#d946ef", b && map[b], map[c] || "#fb923c"].filter(Boolean);
  return `linear-gradient(135deg, ${parts.join(", ")})`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("quiz") || "";
  const resultId = searchParams.get("result");
  const quiz = getQuiz(slug);

  // Si piden resultado específico, mostrar el resultado
  if (quiz && resultId) {
    const r = quiz.results.find((x) => x.id === resultId);
    if (r) {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background: gradientToCss(r.bgGradient),
              padding: 70,
              color: "white",
              fontFamily: "sans-serif",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85, marginBottom: 10 }}>
              Me salió…
            </div>
            <div style={{ fontSize: 160 }}>{r.emoji}</div>
            <div style={{ fontSize: 80, fontWeight: 900, marginTop: 10, marginBottom: 20 }}>
              {r.title}
            </div>
            <div style={{ fontSize: 26, opacity: 0.9, maxWidth: 900 }}>
              {quiz.title}
            </div>
            <div style={{ fontSize: 22, marginTop: 30, fontWeight: 700, opacity: 0.85 }}>
              viralisima.com
            </div>
          </div>
        ),
        { width: 1200, height: 630 },
      );
    }
  }

  const title = quiz?.title || "Viralísima";
  const subtitle = quiz?.subtitle || "Tests y quizzes que no podrás dejar de compartir";
  const emoji = quiz?.emoji || "✨";
  const bg = gradientToCss(quiz?.coverGradient || "from-fuchsia-500 to-orange-400");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: bg,
          padding: 80,
          color: "white",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 140 }}>{emoji}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            {title}
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>{subtitle}</div>
          <div style={{ fontSize: 24, marginTop: 30, fontWeight: 700, opacity: 0.8 }}>
            viralisima.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
