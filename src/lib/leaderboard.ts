import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

// Config por juego. scoreOrder:
//   "high" → el mayor score es mejor (Simon, Tap Sprint)
//   "low"  → el menor score es mejor (Reflejos ms)
export const GAMES = {
  "atrapa-pastelitos": { label: "Atrapa Pastelitos", unit: "pastelitos", scoreOrder: "high" as const },
  "atrapa-la-palabra": { label: "Atrapa la Palabra", unit: "puntos", scoreOrder: "high" as const },
  reflejos: { label: "Test de Reflejos", unit: "ms", scoreOrder: "low" as const },
  memoria: { label: "Memoria Simon", unit: "nivel", scoreOrder: "high" as const },
  "tap-sprint": { label: "Tap Sprint", unit: "clicks", scoreOrder: "high" as const },
};

export type GameSlug = keyof typeof GAMES;

export const isValidGame = (g: string): g is GameSlug =>
  Object.prototype.hasOwnProperty.call(GAMES, g);

const key = (game: string) => `lb:${game}`;

// Redis Sorted Set usa orden natural ascendente.
// Para "high" guardamos el score real, leemos con ZREVRANGE.
// Para "low" guardamos score tal cual, leemos con ZRANGE.
export async function submitScore(game: GameSlug, name: string, score: number) {
  const clean = sanitizeName(name);
  if (!clean) throw new Error("invalid_name");
  if (!Number.isFinite(score) || score <= 0) throw new Error("invalid_score");

  // Si el mismo usuario ya tiene score, conservamos solo el mejor
  const existing = await redis.zscore(key(game), clean);
  const cfg = GAMES[game];

  let keep: number;
  if (existing == null) {
    keep = score;
  } else {
    const existingNum = Number(existing);
    keep = cfg.scoreOrder === "high" ? Math.max(existingNum, score) : Math.min(existingNum, score);
  }
  await redis.zadd(key(game), { score: keep, member: clean });
  // Mantener solo top 500 para no crecer sin límite
  const total = await redis.zcard(key(game));
  if (total > 500) {
    if (cfg.scoreOrder === "high") {
      await redis.zremrangebyrank(key(game), 0, total - 501);
    } else {
      await redis.zremrangebyrank(key(game), 500, total - 1);
    }
  }
  return keep;
}

export async function getTop(game: GameSlug, limit = 100) {
  const cfg = GAMES[game];
  const raw = cfg.scoreOrder === "high"
    ? await redis.zrange<string[]>(key(game), 0, limit - 1, { rev: true, withScores: true })
    : await redis.zrange<string[]>(key(game), 0, limit - 1, { withScores: true });
  // Respuesta es [member, score, member, score, ...]
  const arr = raw as unknown as (string | number)[];
  const out: { name: string; score: number }[] = [];
  for (let i = 0; i < arr.length; i += 2) {
    out.push({ name: String(arr[i]), score: Number(arr[i + 1]) });
  }
  return out;
}

export async function getRank(game: GameSlug, name: string): Promise<number | null> {
  const clean = sanitizeName(name);
  if (!clean) return null;
  const cfg = GAMES[game];
  const rank = cfg.scoreOrder === "high"
    ? await redis.zrevrank(key(game), clean)
    : await redis.zrank(key(game), clean);
  return rank == null ? null : rank + 1;
}

function sanitizeName(raw: string) {
  const s = String(raw).trim().replace(/\s+/g, " ").slice(0, 20);
  // Permitir letras, números, espacios, emojis básicos y algunos símbolos
  if (!/^[\p{L}\p{N}\p{Emoji_Presentation}\p{Extended_Pictographic} .\-_]+$/u.test(s)) return "";
  return s;
}
