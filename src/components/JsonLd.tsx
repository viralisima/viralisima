// Datos estructurados (JSON-LD) como <script> nativo, según la guía de Next.
// Se escapa «<» para que ningún texto pueda cerrar la etiqueta.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const SITE = "https://www.viralisima.com";

export const ORGANIZACION = {
  "@type": "Organization",
  "@id": `${SITE}/#organizacion`,
  name: "Viralísima",
  url: SITE,
  email: "info@viralisima.com",
};
