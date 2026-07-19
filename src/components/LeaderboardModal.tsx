"use client";

import { useEffect, useState } from "react";
import type { GameSlug } from "@/lib/leaderboard";
import { getProfile, setProfile, authError, type Profile } from "@/lib/profile";

type Props = {
  game: GameSlug;
  score: number;
  unit: string;
  scoreOrder: "high" | "low";
  onClose: () => void;
};

type Entry = { name: string; score: number };

const NAME_KEY = "vl_name";

export default function LeaderboardModal({ game, score, unit, onClose }: Props) {
  const [name, setName] = useState("");
  const [top, setTop] = useState<Entry[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfileState] = useState<Profile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [pin, setPin] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (p) { setProfileState(p); setName(p.name); }
    else { const saved = localStorage.getItem(NAME_KEY); if (saved) setName(saved); }
    fetch(`/api/leaderboard/${game}`)
      .then((r) => r.json())
      .then((d) => setTop(d.top ?? []))
      .catch(() => setTop([]));
  }, [game]);

  const doSubmit = async (nm: string, token?: string) => {
    setError("");
    if (!nm.trim()) { setError("Pon un nombre"); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/leaderboard/${game}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nm.trim(), score, token }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(
          d.error === "name_locked" ? "Ese apodo está registrado. Entra con tu PIN para usarlo."
          : d.error === "invalid_name" ? "Nombre inválido"
          : "No se pudo guardar"
        );
        if (d.error === "name_locked") { setShowAuth(true); setAuthMode("login"); }
      } else {
        localStorage.setItem(NAME_KEY, nm.trim());
        setTop(d.top);
        setSubmittedName(nm.trim());
        setSubmitted(true);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const doAuth = async () => {
    setAuthErr("");
    const nm = name.trim();
    if (nm.length < 2) { setAuthErr("Apodo demasiado corto"); return; }
    if (!/^\d{4}$/.test(pin)) { setAuthErr("El PIN debe tener 4 dígitos"); return; }
    setAuthLoading(true);
    try {
      const r = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: authMode, name: nm, pin }),
      });
      const d = await r.json();
      if (!r.ok) { setAuthErr(authError(d.error)); return; }
      const prof: Profile = { name: d.name, token: d.token };
      setProfile(prof);
      setProfileState(prof);
      setName(prof.name);
      setShowAuth(false);
      setPin("");
      await doSubmit(prof.name, prof.token); // guarda la puntuación ya con el token
    } catch {
      setAuthErr("Error de conexión");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setProfile(null);
    setProfileState(null);
    setSubmitted(false);
  };

  const formatScore = (s: number) => `${s} ${unit}`;
  const myRank = submitted && top ? top.findIndex((e) => e.name === submittedName && e.score === score) + 1 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white text-slate-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-3xl flex items-center justify-between">
          <h3 className="text-xl font-black">🏆 Ranking Global</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100" aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!submitted && (
          <div className="p-6 bg-gradient-to-br from-fuchsia-50 to-orange-50 border-b border-slate-200">
            <p className="text-sm text-slate-600 mb-2">
              Tu puntuación: <strong className="text-2xl font-black text-slate-900">{formatScore(score)}</strong>
            </p>

            {profile ? (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  Guardando como <strong>👤 {profile.name}</strong>{" "}
                  <button onClick={logout} className="text-fuchsia-600 underline text-xs ml-1">(no soy yo)</button>
                </p>
                <button
                  onClick={() => doSubmit(profile.name, profile.token)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold px-5 py-3 rounded-xl disabled:opacity-50"
                >
                  {loading ? "..." : "🏆 Guardar en el ranking"}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-3">Entra al ranking global. Un nombre y listo.</p>
                <div className="flex gap-2">
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSubmit(name)}
                    placeholder="Tu nombre" maxLength={20}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-semibold"
                  />
                  <button onClick={() => doSubmit(name)} disabled={loading || !name.trim()}
                    className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold px-5 py-3 rounded-xl disabled:opacity-50">
                    {loading ? "..." : "Guardar"}
                  </button>
                </div>

                {!showAuth ? (
                  <button onClick={() => { setShowAuth(true); setAuthErr(""); }} className="mt-3 text-sm text-fuchsia-700 font-semibold underline">
                    🔒 Registra tu apodo y guarda tus récords en cualquier dispositivo
                  </button>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-white border-2 border-fuchsia-200">
                    <p className="text-xs text-slate-500 mb-2">
                      {authMode === "register"
                        ? "Reserva tu apodo con un PIN de 4 dígitos. Con apodo + PIN recuperas tus récords en otro móvil o PC."
                        : "Entra con tu apodo y tu PIN de 4 dígitos."}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Apodo" maxLength={20}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-semibold"
                      />
                      <input
                        type="password" inputMode="numeric" value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        onKeyDown={(e) => e.key === "Enter" && doAuth()}
                        placeholder="PIN" maxLength={4}
                        className="w-20 px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-semibold text-center tracking-widest"
                      />
                    </div>
                    <button onClick={doAuth} disabled={authLoading}
                      className="w-full mt-2 bg-slate-900 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50">
                      {authLoading ? "..." : authMode === "register" ? "Registrarme y guardar" : "Entrar y guardar"}
                    </button>
                    <div className="text-center mt-2">
                      <button
                        onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthErr(""); }}
                        className="text-xs text-slate-500 underline">
                        {authMode === "register" ? "Ya tengo apodo · Entrar" : "No tengo apodo · Registrarme"}
                      </button>
                    </div>
                    {authErr && <p className="text-sm text-red-600 mt-2">{authErr}</p>}
                  </div>
                )}
              </>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        )}

        {submitted && (
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <div>
                <div className="font-bold">Guardado como {submittedName}</div>
                {myRank > 0 && <div className="text-sm opacity-90">Estás en el puesto #{myRank} del top 100</div>}
                {profile && <div className="text-xs opacity-80 mt-0.5">Apodo protegido con tu PIN 🔒</div>}
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <h4 className="font-bold mb-3 text-sm uppercase tracking-widest text-slate-500">Top {top?.length ?? "100"} jugadores</h4>
          {top === null ? (
            <p className="text-center text-slate-500 py-8">Cargando...</p>
          ) : top.length === 0 ? (
            <p className="text-center text-slate-500 py-8">¡Sé el primero en el ranking!</p>
          ) : (
            <ol className="space-y-1">
              {top.map((e, i) => {
                const isMe = submitted && e.name === submittedName;
                return (
                  <li key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isMe ? "bg-gradient-to-r from-fuchsia-100 to-orange-100 ring-2 ring-fuchsia-500" : i < 3 ? "bg-slate-50" : ""}`}>
                    <div className={`w-8 text-center font-black ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-slate-500"}`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                    </div>
                    <div className="flex-1 font-semibold truncate">{e.name}{isMe && " (tú)"}</div>
                    <div className="font-mono font-bold text-slate-900">{formatScore(e.score)}</div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
