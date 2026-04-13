import UsernameGenerator from "@/components/UsernameGenerator";

export const metadata = {
  title: "Generador de Username para Instagram y TikTok | Viralísima",
  description:
    "Ideas para tu username de Instagram, TikTok, Twitter y más. Mete tu nombre y elige un estilo. Gratis y sin registro.",
  openGraph: {
    title: "Generador de Username — Viralísima",
    description: "Encuentra el @ perfecto para tus redes.",
    url: "https://viralisima.com/generadores/username",
    images: [{ url: "/api/og?quiz=username", width: 1200, height: 630 }],
  },
};

export default function Page() {
  return <UsernameGenerator />;
}
