import Link from "next/link";

export const metadata = {
  title: "Sobre Viralísima | Quiénes somos",
  description: "La web de quizzes y generadores virales para todo el mundo hispano. Nuestra misión: que te rías y compartas.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate prose-lg">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 no-underline">
          ← Viralísima
        </Link>

        <h1>Sobre Viralísima</h1>

        <p>
          <strong>Viralísima</strong> nació con una idea simple: crear la web de
          entretenimiento más divertida para todo el mundo hispanohablante.
          Desde México hasta España, pasando por Argentina, Colombia, Perú,
          Chile, Venezuela, República Dominicana, Puerto Rico, Ecuador y cada
          rincón donde se hable español.
        </p>

        <h2>🎯 Nuestra misión</h2>
        <p>
          Hacer que pases un <strong>buen rato</strong>, aprendas algo nuevo (o
          rarísimo), y tengas ganas de mandárselo a tus amigos por WhatsApp.
          Sin más.
        </p>

        <h2>🛠️ Qué encontrarás aquí</h2>
        <ul>
          <li>
            <strong>Tests y quizzes de personalidad</strong>: qué famoso eres,
            qué animal eres, qué sabor de helado te representa…
          </li>
          <li>
            <strong>Trivias</strong>: música en español, cultura latina,
            Pokémon, Disney, fútbol, Minecraft…
          </li>
          <li>
            <strong>Generadores</strong>: memes, nombres artísticos, usernames
            de redes, frases virales, historias cortas…
          </li>
          <li>
            <strong>Calculadoras divertidas</strong>: días que has vivido, edad
            real de tu perro, compatibilidad con tu crush, IMC, edad mental…
          </li>
          <li>
            <strong>Horóscopo semanal</strong> con predicciones de amor,
            trabajo, salud y suerte para cada signo.
          </li>
          <li>
            <strong>Blog</strong> con tops, listas nostálgicas y contenido que
            te hará reír y pensar.
          </li>
        </ul>

        <h2>🌎 Nuestro público</h2>
        <p>
          Escribimos en <strong>español neutro</strong> para que nos entiendan
          desde Tijuana hasta Barcelona. Cuando hablamos de cultura, buscamos lo
          que nos une más que lo que nos separa. Y cuando metemos alguna
          referencia regional, la explicamos.
        </p>
        <p>
          El contenido es <strong>apto para toda la familia</strong>: niños,
          adolescentes, adultos, abuelos. No hay política, no hay contenido
          adulto, no hay violencia. Solo diversión que se puede compartir con
          cualquiera.
        </p>

        <h2>🔒 Lo que NO hacemos</h2>
        <ul>
          <li>No pedimos registro.</li>
          <li>No guardamos tus datos (los tests funcionan en tu navegador).</li>
          <li>No vendemos información.</li>
          <li>No te envíamos spam.</li>
        </ul>

        <h2>💛 Cómo nos sostenemos</h2>
        <p>
          Viralísima es gratis. Para mantener el servidor, el dominio y seguir
          creando contenido, podemos mostrar anuncios discretos (Google
          AdSense) y hacer alguna colaboración ocasional. Nada intrusivo.
        </p>

        <h2>🤝 Colabora con nosotros</h2>
        <p>
          ¿Tienes una idea para un quiz que se viralizaría? ¿Una sugerencia de
          herramienta que te encantaría ver? ¿Una mención en tu blog o canal?
          Escríbenos:{" "}
          <a href="mailto:info@viralisima.com">info@viralisima.com</a>
        </p>

        <h2>📱 Síguenos</h2>
        <p>
          Próximamente en Instagram, TikTok y Facebook. Mientras, comparte tus
          resultados favoritos con tus amigos — es la mejor forma de apoyarnos.
        </p>

        <p>
          <strong>Gracias por estar aquí.</strong> De verdad.
        </p>

        <p className="text-sm text-slate-500">
          — El equipo de Viralísima
        </p>
      </article>
    </main>
  );
}
