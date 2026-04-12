import Link from "next/link";

export const metadata = {
  title: "Contacto | Viralísima",
  description: "Ponte en contacto con el equipo de Viralísima.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-10">
          <div className="text-5xl mb-2">✉️</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Hablamos
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Preguntas, sugerencias, colaboraciones, quejas con humor…
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Email
              </div>
              <a
                href="mailto:info@viralisima.com"
                className="text-xl font-black text-fuchsia-600 hover:underline"
              >
                info@viralisima.com
              </a>
              <p className="text-sm text-slate-500 mt-1">
                Respondemos en 1-3 días laborales.
              </p>
            </div>

            <hr className="border-slate-200" />

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                ¿Sobre qué puedes escribirnos?
              </div>
              <ul className="space-y-2 text-slate-700">
                <li>💡 Ideas de nuevos tests, quizzes o herramientas</li>
                <li>🤝 Colaboraciones, menciones, enlaces recíprocos</li>
                <li>🐛 Errores que hayas encontrado en la web</li>
                <li>🤔 Dudas sobre alguna calculadora o resultado</li>
                <li>📰 Prensa y medios</li>
                <li>✉️ Lo que se te ocurra</li>
              </ul>
            </div>

            <hr className="border-slate-200" />

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Para temas legales
              </div>
              <p className="text-sm text-slate-700">
                Revisa antes nuestra{" "}
                <Link href="/privacidad" className="text-fuchsia-600 hover:underline">
                  política de privacidad
                </Link>{" "}
                y{" "}
                <Link href="/terminos" className="text-fuchsia-600 hover:underline">
                  términos de uso
                </Link>
                . Si necesitas algo concreto, escríbenos al email indicando
                &quot;LEGAL&quot; en el asunto.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          💛 Gracias por usar Viralísima
        </div>
      </div>
    </main>
  );
}
