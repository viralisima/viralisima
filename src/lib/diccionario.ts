// Carga perezosa del diccionario de palabras reales (multiidioma: ES · EN · FR · IT · PT)
// desde /dict/palabras.txt y lo cachea en memoria. Las palabras vienen ya normalizadas
// (minúsculas, sin tildes, ñ→n) igual que las normaliza el juego, así la comparación es directa.

let cache: Set<string> | null = null;
let promesa: Promise<Set<string>> | null = null;

export function cargarDiccionario(): Promise<Set<string>> {
  if (cache) return Promise.resolve(cache);
  if (promesa) return promesa;
  promesa = fetch("/dict/palabras.txt")
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then((txt) => {
      const set = new Set<string>();
      for (const w of txt.split("\n")) if (w) set.add(w);
      cache = set;
      return set;
    })
    .catch((e) => {
      promesa = null; // permite reintentar tras un fallo de red
      throw e;
    });
  return promesa;
}
