// Perfil del jugador guardado en el dispositivo (apodo + token del servidor).
// El token se obtiene al registrarse/entrar y permite publicar bajo el apodo.

export type Profile = { name: string; token: string };
const KEY = "vl_profile";

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfile(p: Profile | null) {
  if (typeof window === "undefined") return;
  if (p) localStorage.setItem(KEY, JSON.stringify(p));
  else localStorage.removeItem(KEY);
}

// Traduce los códigos de error del API a mensajes para el usuario.
export function authError(code: string): string {
  switch (code) {
    case "name_taken": return "Ese apodo ya existe. Si es tuyo, pulsa «Entrar».";
    case "not_found": return "No existe ese apodo. Pulsa «Registrarme».";
    case "bad_pin": return "PIN incorrecto.";
    case "invalid_name": return "Apodo no válido (2-20 letras/números).";
    case "invalid_pin": return "El PIN debe tener 4 dígitos.";
    default: return "No se pudo completar. Inténtalo de nuevo.";
  }
}
