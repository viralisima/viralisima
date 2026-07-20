"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, setProfile, authError, type Profile } from "@/lib/profile";

export default function PerfilCliente() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setProfileState(getProfile()); }, []);

  const submit = async () => {
    setErr(""); setOk("");
    if (name.trim().length < 2) { setErr("Apodo demasiado corto (mín. 2)"); return; }
    if (!/^\d{4}$/.test(pin)) { setErr("El PIN debe tener 4 dígitos"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name: name.trim(), pin }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(authError(d.error)); return; }
      const prof: Profile = { name: d.name, token: d.token };
      setProfile(prof); setProfileState(prof); setPin("");
      setOk(mode === "register" ? `¡Apodo «${prof.name}» registrado!` : `¡Bienvenido de nuevo, ${prof.name}!`);
    } catch {
      setErr("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { setProfile(null); setProfileState(null); setOk(""); setErr(""); };

  return (
    <div className="max-w-md mx-auto">
      {profile ? (
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-2">👤</div>
          <div className="text-sm opacity-70">Estás jugando como</div>
          <div className="text-2xl font-black mb-1">{profile.name}</div>
          <div className="text-xs opacity-60 mb-5">Apodo protegido con tu PIN 🔒 · tus récords se guardan bajo este apodo en cualquier dispositivo.</div>
          <div className="flex flex-col gap-2">
            <Link href="/juegos" className="bg-white text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform">🎮 Ir a los juegos</Link>
            <button onClick={logout} className="text-sm opacity-70 underline">Cerrar sesión en este dispositivo</button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/15 rounded-2xl p-6">
          <div className="flex gap-2 mb-4 text-sm font-bold">
            <button onClick={() => { setMode("register"); setErr(""); }}
              className={`flex-1 py-2 rounded-full ${mode === "register" ? "bg-white text-black" : "bg-white/10"}`}>Registrarme</button>
            <button onClick={() => { setMode("login"); setErr(""); }}
              className={`flex-1 py-2 rounded-full ${mode === "login" ? "bg-white text-black" : "bg-white/10"}`}>Ya tengo apodo</button>
          </div>
          <p className="text-xs opacity-70 mb-4">
            {mode === "register"
              ? "Elige un apodo y un PIN de 4 dígitos. Es voluntario: sirve para que tus récords se guarden bajo tu apodo y nadie más pueda usarlo. Sin email ni datos personales."
              : "Introduce tu apodo y tu PIN para recuperar tu perfil en este dispositivo."}
          </p>
          <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Apodo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="Ej: RayoVeloz"
            className="w-full mb-3 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold outline-none" />
          <label className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-1">PIN (4 dígitos)</label>
          <input type="password" inputMode="numeric" value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            maxLength={4} placeholder="••••"
            className="w-full mb-4 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold outline-none text-center tracking-[0.5em]" />
          <button onClick={submit} disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold px-6 py-3 rounded-full disabled:opacity-50">
            {loading ? "..." : mode === "register" ? "Registrarme" : "Entrar"}
          </button>
          {err && <p className="text-red-400 text-sm mt-3 text-center">{err}</p>}
        </div>
      )}
      {ok && <p className="text-emerald-400 text-center mt-4 font-semibold">{ok}</p>}
      <p className="text-center text-xs opacity-50 mt-6">
        ⚠️ Si olvidas tu PIN no hay forma de recuperar el apodo (no guardamos email). Anótalo.
      </p>
    </div>
  );
}
