import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Viralísima",
  description: "Cómo tratamos tus datos en Viralísima. Transparencia total.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate prose-lg">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 no-underline">
          ← Viralísima
        </Link>

        <h1>Política de Privacidad</h1>
        <p>
          <em>Última actualización: 12 de abril de 2026</em>
        </p>

        <p>
          En <strong>Viralísima</strong> (viralisima.com) nos tomamos tu
          privacidad muy en serio. Este documento explica qué datos recogemos,
          para qué los usamos y qué derechos tienes.
        </p>

        <h2>1. ¿Qué datos recogemos?</h2>
        <p>
          La mayoría de nuestros tests y herramientas funcionan{" "}
          <strong>completamente en tu navegador</strong> y no almacenan datos
          personales. Sin embargo, sí recogemos información anónima con fines
          analíticos y técnicos:
        </p>
        <ul>
          <li>
            <strong>Analíticas básicas</strong> a través de Vercel Analytics:
            páginas visitadas, país aproximado, dispositivo, navegador. No
            identificamos usuarios individuales.
          </li>
          <li>
            <strong>Cookies técnicas</strong> necesarias para el funcionamiento
            del sitio.
          </li>
          <li>
            <strong>Publicidad (futuro):</strong> si activamos Google AdSense,
            Google podrá usar cookies para mostrar anuncios personalizados según
            tu navegación.
          </li>
        </ul>

        <h2>2. ¿Qué NO hacemos?</h2>
        <ul>
          <li>No vendemos ni compartimos tus datos con terceros.</li>
          <li>
            No requerimos registro. Puedes usar Viralísima sin dar tu nombre,
            email ni teléfono.
          </li>
          <li>
            Los resultados de tus tests no se guardan en nuestros servidores
            (excepto si decides compartirlos públicamente).
          </li>
        </ul>

        <h2>3. Google AdSense (si está activo)</h2>
        <p>
          Podemos mostrar anuncios de Google AdSense. Google y sus socios usan
          cookies para personalizar anuncios según tu historial de navegación.
          Puedes desactivar la publicidad personalizada en{" "}
          <a
            href="https://adssettings.google.com/"
            target="_blank"
            rel="noopener"
          >
            adssettings.google.com
          </a>
          .
        </p>

        <h2>4. Análisis</h2>
        <p>
          Usamos <strong>Vercel Analytics</strong> y{" "}
          <strong>Vercel Speed Insights</strong> para medir el rendimiento del
          sitio. Estos servicios recogen datos anónimos agregados, sin cookies
          ni identificadores personales.
        </p>

        <h2>5. Tus derechos (RGPD / LFPDPPP)</h2>
        <p>
          Si estás en la Unión Europea o en algún país con legislación
          equivalente (México, Argentina, Colombia, etc.), tienes derecho a:
        </p>
        <ul>
          <li>Acceder, rectificar o eliminar tus datos</li>
          <li>Oponerte al tratamiento de tus datos</li>
          <li>Portabilidad de tus datos</li>
          <li>Retirar tu consentimiento en cualquier momento</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a href="mailto:info@viralisima.com">info@viralisima.com</a>.
        </p>

        <h2>6. Menores de edad</h2>
        <p>
          El contenido de Viralísima es apto para todas las edades. Si eres
          menor de 14 años, recomendamos que uses la web con supervisión de un
          adulto responsable.
        </p>

        <h2>7. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política ocasionalmente. La fecha al inicio
          del documento indica cuándo fue la última modificación. Te
          recomendamos revisarla periódicamente.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Para cualquier duda sobre esta política o sobre tus datos, escríbenos
          a <a href="mailto:info@viralisima.com">info@viralisima.com</a>.
        </p>
      </article>
    </main>
  );
}
