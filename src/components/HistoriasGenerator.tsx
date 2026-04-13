"use client";

import { useState } from "react";
import Link from "next/link";

const PERSONAJES = [
  "un astronauta que odia el espacio",
  "una abuela que sabe kung-fu",
  "un perro que habla francés",
  "un pingüino detective",
  "una princesa cansada de los castillos",
  "un pirata que le tiene miedo al agua",
  "un robot que sueña con ser panadero",
  "un dragón vegetariano",
  "un gato que trabaja en una oficina",
  "una niña con poderes sobre el viento",
  "un mago que siempre olvida los hechizos",
  "un chef cocinero de fantasmas",
];

const LUGARES = [
  "una isla hecha completamente de chocolate",
  "la luna, durante la hora del café",
  "una biblioteca donde los libros gritan",
  "un tren que no tiene destino",
  "un bosque donde los árboles bailan",
  "una escuela submarina",
  "un circo en el año 3000",
  "la casa del presidente de una república muy, muy pequeña",
  "un desierto con lagos invisibles",
  "el Polo Norte pero con clima tropical",
  "un museo donde las estatuas cobran vida de noche",
  "un restaurante flotante en las nubes",
];

const MISIONES = [
  "encontrar el único calcetín que falta en el mundo",
  "salvar a su gato de un hechizo de dulces",
  "ganar un concurso de canto aunque no sepa cantar",
  "descifrar un mapa dibujado por un bebé",
  "invitar a cenar al monstruo del armario",
  "apagar un volcán usando solo una cuchara",
  "encontrar la receta perdida del mejor pastel del mundo",
  "convencer al sol de tomarse un día libre",
  "ganarle una carrera a un caracol muy seguro de sí mismo",
  "descubrir quién le robó la pijama de los domingos",
  "cruzar un río lleno de jirafas curiosas",
  "encontrar el tesoro escondido en su propia mochila",
];

const GIROS = [
  "descubre que el villano en realidad solo quería un abrazo.",
  "se da cuenta de que todo fue un sueño dentro de otro sueño.",
  "hace amistad con quien menos esperaba.",
  "aprende que la respuesta estaba delante de sus narices.",
  "termina fundando un club muy raro pero muy feliz.",
  "pierde todo… pero gana lo que de verdad importa.",
  "logra su misión y decide que ahora va a descansar por 100 años.",
  "cambia de idea y se lanza a una aventura completamente distinta.",
  "convierte a su enemigo en su mejor socio de negocios.",
  "se ríe al ver que todo fue un malentendido enorme.",
];

type Historia = {
  personaje: string;
  lugar: string;
  mision: string;
  giro: string;
};

function randomFrom<T>(arr: T[], exclude?: T): T {
  let pick = arr[Math.floor(Math.random() * arr.length)];
  if (exclude && pick === exclude && arr.length > 1) {
    pick = arr[(arr.indexOf(pick) + 1) % arr.length];
  }
  return pick;
}

function generate(prev?: Historia): Historia {
  return {
    personaje: randomFrom(PERSONAJES, prev?.personaje),
    lugar: randomFrom(LUGARES, prev?.lugar),
    mision: randomFrom(MISIONES, prev?.mision),
    giro: randomFrom(GIROS, prev?.giro),
  };
}

function buildText(h: Historia): string {
  return `Había una vez ${h.personaje}. Vivía en ${h.lugar} y tenía una misión muy importante: ${h.mision}. Después de mil peripecias, al final ${h.giro}`;
}

export default function HistoriasGenerator() {
  const [historia, setHistoria] = useState<Historia>(() => generate());
  const [copied, setCopied] = useState(false);

  const roll = () => setHistoria(generate(historia));
  const text = buildText(historia);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const share = (platform: "whatsapp" | "twitter") => {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " — viralisima.com/historias")}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 240) + "… @viralisima")}`,
    };
    window.open(urls[platform], "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-2">📚</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Generador de Historias
          </h1>
          <p className="text-slate-600 mt-2">
            Una historia distinta cada vez. Perfecta para contar a niños o para inspirarte.
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-4 border-amber-200 rounded-3xl p-8 md:p-10 shadow-xl">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-4 text-center">
            📖 Tu historia
          </div>
          <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">
            <span className="text-2xl">Había una vez </span>
            <strong className="text-fuchsia-600">{historia.personaje}</strong>. Vivía en{" "}
            <strong className="text-purple-600">{historia.lugar}</strong> y tenía una misión muy
            importante:{" "}
            <strong className="text-orange-600">{historia.mision}</strong>. Después de mil
            peripecias, al final <strong className="text-emerald-600">{historia.giro}</strong>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <button
            onClick={roll}
            className="bg-slate-900 text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform col-span-2 sm:col-span-1"
          >
            🎲 Otra historia
          </button>
          <button
            onClick={copy}
            className="bg-white border-2 border-slate-200 font-semibold py-3 rounded-2xl hover:border-fuchsia-500"
          >
            {copied ? "✅ Copiado" : "📋 Copiar"}
          </button>
          <button
            onClick={() => share("whatsapp")}
            className="bg-green-500 text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={() => share("twitter")}
            className="bg-black text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform"
          >
            𝕏 Twitter
          </button>
        </div>

        <div className="mt-10 p-5 bg-slate-100 rounded-2xl text-sm text-slate-600 text-center">
          💡 <strong>Tip:</strong> cada historia combina 4 ingredientes de nuestros bancos
          creativos. Hay miles de combinaciones posibles.
        </div>
      </div>
    </div>
  );
}
