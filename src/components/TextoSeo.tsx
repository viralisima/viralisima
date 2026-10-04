// Bloque de texto para buscadores, renderizado en servidor debajo del juego, quiz o herramienta.
// Fondo neutro y texto oscuro: el velo de globals.css se aplica a text-white + bg-gradient, aquí no.
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
