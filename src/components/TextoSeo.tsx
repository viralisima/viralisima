// Bloque de texto para buscadores, renderizado en servidor debajo del juego, quiz o herramienta.
// Fondo neutro y texto oscuro: el velo de globals.css se aplica a text-white + bg-gradient, aquí no.
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import type { TextoSeo as Texto } from "@/data/textos-seo";

export default function TextoSeo({ texto }: { texto?: Texto }) {
  if (!texto) return null;
  return (
    <section className="bg-white border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 py-10 text-slate-700">
        <h2 className="text-2xl font-black text-slate-900 mb-3">Cómo funciona</h2>
        {texto.intro.map((p, i) => (
          <p key={i} className="leading-relaxed mb-3">
            {p}
          </p>
        ))}
        <h2 className="text-xl font-black text-slate-900 mt-8 mb-3">Preguntas frecuentes</h2>
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-slate-50">
          {texto.faq.map((f, i) => (
            <details key={i} className="group px-4 py-3">
              <summary className="cursor-pointer font-semibold text-slate-900 min-h-11 flex items-center">{f.q}</summary>
              <p className="mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        {texto.relacionados && texto.relacionados.length > 0 && (
          <>
            <h2 className="text-xl font-black text-slate-900 mt-8 mb-3">También te puede gustar</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {texto.relacionados.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="block h-full rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400">
                    <span className="block font-bold text-slate-900">{r.titulo}</span>
                    <span className="block text-sm text-slate-600 mt-1">{r.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: texto.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </section>
  );
}
