import { redis } from "./leaderboard";

// Registro voluntario "apodo + PIN": reserva un apodo en el servidor y emite un
// token para poder publicar puntuaciones bajo ese apodo. Sin email ni datos
// personales. Los apodos NO registrados siguen siendo libres (compatibilidad).

const PEPPER = "vl_arcade_2026"; // no es secreto crítico: solo protege un apodo de ranking
const TOKEN_TTL = 60 * 60 * 24 * 400; // ~400 días

export const normNick = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 20);

const validNick = (nick: string) => /^[\p{L}\p{N} .\-_]{2,20}$/u.test(nick);

async function hashPin(nick: string, pin: string): Promise<string> {
  const data = new TextEncoder().encode(`${PEPPER}:${nick}:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const newToken = () => crypto.randomUUID().replace(/-/g, "");
const userKey = (nick: string) => `user:${nick}`;
const tokenKey = (t: string) => `tok:${t}`;

export async function isRegistered(nick: string): Promise<boolean> {
  return (await redis.exists(userKey(nick))) === 1;
}

async function emitirToken(nick: string) {
  const token = newToken();
  await redis.set(tokenKey(token), nick, { ex: TOKEN_TTL });
  return token;
}

export async function registerUser(name: string, pin: string) {
  const nick = normNick(name);
  if (!validNick(nick)) throw new Error("invalid_name");
  if (!/^\d{4}$/.test(pin)) throw new Error("invalid_pin");
  if (await redis.exists(userKey(nick))) throw new Error("name_taken");
  const display = name.trim().slice(0, 20);
  await redis.hset(userKey(nick), { pin: await hashPin(nick, pin), name: display });
  return { token: await emitirToken(nick), name: display };
}

export async function loginUser(name: string, pin: string) {
  const nick = normNick(name);
  const rec = await redis.hgetall<{ pin: string; name: string }>(userKey(nick));
  if (!rec || !rec.pin) throw new Error("not_found");
  if ((await hashPin(nick, pin)) !== rec.pin) throw new Error("bad_pin");
  return { token: await emitirToken(nick), name: rec.name || name.trim().slice(0, 20) };
}

// ¿Puede este cliente publicar bajo ese apodo? Sí si el apodo está libre, o si
// está registrado y el token corresponde a su dueño.
export async function ownsName(name: string, token?: string): Promise<boolean> {
  const nick = normNick(name);
  if (!(await isRegistered(nick))) return true;
  if (!token) return false;
  return (await redis.get<string>(tokenKey(token))) === nick;
}
