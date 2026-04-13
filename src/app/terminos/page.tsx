import Link from "next/link";

export const metadata = {
  title: "Términos de Uso | Viralísima",
  description: "Condiciones de uso de Viralísima.com",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate prose-lg">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 no-underline">
          ← Viralísima
        </Link>

        <h1>Términos de Uso</h1>
        <p>
          <em>Última actualización: 12 de abril de 2026</em>
        </p>

        <p>
          Bienvenido/a a <strong>Viralísima</strong>. Al usar este sitio web
          aceptas estos términos. Si no estás de acuerdo, te pedimos que no lo
          uses. Son cortitos, léelos.
        </p>

        <h2>1. Naturaleza del servicio</h2>
        <p>
          Viralísima ofrece <strong>tests, quizzes, generadores y contenido
          viral con fines de entretenimiento</strong>. Los resultados son
          divertidos y orientativos, no profesionales. Por ejemplo:
        </p>
        <ul>
          <li>
            La <strong>calculadora de IMC</strong> es orientativa — consulta
            siempre a un profesional de salud.
          </li>
          <li>
            El <strong>horóscopo</strong> es contenido de entretenimiento, no
            una fuente de decisiones vitales.
          </li>
          <li>
            Los <strong>tests de personalidad</strong> no son diagnósticos
            psicológicos.
          </li>
        </ul>

        <h2>2. Uso permitido</h2>
        <p>Puedes usar Viralísima para:</p>
        <ul>
          <li>Hacer tests, generar contenido y compartir resultados en redes.</li>
          <li>Descargar los memes que crees (son tuyos).</li>
          <li>
            Enlazar a nuestras páginas desde redes, blogs o mensajes. ¡Gracias!
          </li>
        </ul>

        <h2>3. Uso no permitido</h2>
        <ul>
          <li>Copiar masivamente el contenido sin permiso.</li>
          <li>
            Usar Viralísima para fines ilegales, fraudulentos o que dañen a
            otras personas.
          </li>
          <li>
            Automatizar scraping agresivo que sature nuestros servidores.
          </li>
          <li>
            Intentar vulnerar la seguridad del sitio o de sus usuarios.
          </li>
        </ul>

        <h2>4. Propiedad intelectual</h2>
        <p>
          El nombre, logo, diseño y contenido original de Viralísima son
          propiedad de sus autores. Los memes que tú generes son tuyos. Las
          fotos que subas al generador se procesan en tu navegador — no las
          guardamos.
        </p>

        <h2>5. Limitación de responsabilidad</h2>
        <p>
          Viralísima se ofrece <strong>"tal cual"</strong>, con fines de
          entretenimiento. No somos responsables de:
        </p>
        <ul>
          <li>Decisiones que tomes basadas en resultados de nuestros tests.</li>
          <li>Caídas temporales del servicio.</li>
          <li>Contenido creado por usuarios (memes, etc.).</li>
          <li>Enlaces a sitios de terceros.</li>
        </ul>

        <h2>6. Publicidad</h2>
        <p>
          Podemos mostrar anuncios de terceros (Google AdSense) para sostener
          el sitio. Estos anuncios no implican que Viralísima recomiende los
          productos o servicios anunciados.
        </p>

        <h2>7. Modificaciones</h2>
        <p>
          Podemos modificar estos términos cuando lo consideremos necesario. Te
          recomendamos revisar esta página periódicamente.
        </p>

        <h2>8. Legislación aplicable</h2>
        <p>
          Estos términos se rigen por la legislación española, sin perjuicio de
          los derechos de consumidor que te correspondan según tu país de
          residencia.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Para cualquier duda:{" "}
          <a href="mailto:info@viralisima.com">info@viralisima.com</a>.
        </p>
      </article>
    </main>
  );
}
