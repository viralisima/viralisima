import { ImageResponse } from "next/og";
import { getQuiz } from "@/data/quizzes";

export const runtime = "edge";

function gradientToCss(tailwind: string): string {
  const map: Record<string, string> = {
    "fuchsia-500": "#d946ef",
    "pink-500": "#ec4899",
    "orange-400": "#fb923c",
    "indigo-500": "#6366f1",
    "purple-500": "#a855f7",
    "cyan-400": "#22d3ee",
    "violet-500": "#8b5cf6",
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
  const quiz = getQuiz(slug);

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
