"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIES = {
  motivacional: {
    label: "💪 Motivacional",
    phrases: [
      "No esperes el momento perfecto. Toma el momento y hazlo perfecto.",
      "La única diferencia entre un sueño y una meta es una fecha.",
      "Eres la suma de tus decisiones, no de tus excusas.",
      "Hoy es el día en que alguien menos capaz que tú hizo algo que tú no hiciste.",
      "Tu vida empieza al final de tu zona de confort.",
      "El que se queja planta, el que actúa cosecha.",
      "Tu futuro es lo que haces ahora, no lo que planeas hacer mañana.",
      "Las oportunidades no aparecen — las creas tú.",
      "Nadie viene a rescatarte. La buena noticia es que tampoco hace falta.",
      "El talento abre puertas, la disciplina las mantiene abiertas.",
    ],
  },
  romantico: {
    label: "❤️ Romántico",
    phrases: [
      "Contigo hasta el final de mi batería.",
      "No quiero para siempre contigo. Quiero todos los 'siempre' que existan.",
      "Si fueras una etiqueta en redes, te usaría en cada foto.",
      "Me gustas tanto que hasta me caen bien tus amigos.",
      "Tú eres mi razón para revisar el teléfono.",
      "Prefiero una noche mala contigo que una buena con cualquiera.",
      "Si me enamoro contigo, me enamoro bien.",
      "Eres la persona que le diría 'yo la conocí antes' al mundo.",
      "Contigo entendí que el amor no duele — el que duele no era amor.",
      "Me gustas en estilo, forma y fondo.",
    ],
  },
  sarcastico: {
    label: "😏 Sarcástico",
    phrases: [
      "No estoy para todos, y eso a veces es un privilegio para mí.",
      "Me encanta la gente que pide opiniones y no escucha ninguna.",
      "Perdón, no era drama. Era mi tono normal.",
      "Ser responsable es sexy, hasta que te das cuenta que nadie más lo es.",
      "Yo no soy celoso/a, soy observador/a con muy buena memoria.",
      "Mi vibe es 'no tengo ganas' con estilo.",
      "Me gusta mi espacio. Y el tuyo. Y todo el espacio que puedas darme.",
      "Si la madurez fuera ruido, yo estaría en silencio.",
      "Nací cansado/a y así seguiré.",
      "Prefiero una conversación corta que una amistad falsa.",
    ],
  },
  reflexivo: {
    label: "🧠 Reflexivo",
    phrases: [
      "A veces la paz cuesta más que el drama, pero siempre vale más.",
      "No pierdes personas — depuras círculo.",
      "Crecer duele porque toca soltar quien fuiste.",
      "Lo que no te recuerda tu valor, está ocupando espacio en tu vida.",
      "La madurez llegó cuando dejé de explicarme con quien no quería entenderme.",
      "Tu vibra se nota más que tus palabras.",
      "Nadie pierde a nadie — todos pertenecen a sí mismos.",
      "El silencio también es respuesta. Y la más clara.",
      "Elige la paz. Siempre la paz.",
      "Me tomé el riesgo de ser yo, y gané.",
    ],
  },
  fiesta: {
    label: "🎉 Fiesta",
    phrases: [
      "Hoy mi actitud: no todo tiene que tener sentido.",
      "Vinimos a brillar, no a pedir permiso.",
      "Si hay música, hay plan.",
      "Modo 'dejar todo por una mala idea': ON.",
      "La vida es corta, el grupo es bueno, la noche es larga.",
      "No hay fiesta mala, hay gente sin vibra.",
      "Mañana me arrepiento, hoy me encanto.",
      "Friday vibe: encender el caos con estilo.",
      "Bailar: la terapia más barata del mundo.",
      "Gente que brilla, yo quiero estar con esa gente.",
    ],
  },
  autoestima: {
    label: "✨ Autoestima",
    phrases: [
      "Soy mi propia competencia. Y voy ganando.",
      "Me elegí a mí, y fue la mejor decisión.",
      "Mi energía es mi regalo, no todos la merecen.",
      "No soy para todos y ese es mi superpoder.",
      "Prefiero intensidad a intentos a medias.",
      "Vine a ocupar mi lugar, no a pedir permiso.",
      "Yo, conmigo: equipo completo.",
      "Tengo 'flow' y el 'flow' no se explica.",
      "La mejor versión de mí es la que no pide disculpas por existir.",
      "Mi aura es la inversión que mejor me pagó.",
    ],
  },
  bio_instagram: {
    label: "📱 Bio Instagram",
    phrases: [
      "Perdido/a, pero con estilo 🌹",
      "Café, música y caos 🌀",
      "Ir por más. Siempre.",
      "Un café, una playlist, una vida bonita ☕🎶",
      "No tengo filtro, tengo actitud.",
      "Hecho/a en [TU PAÍS] 🇲🇽🇪🇸🇨🇴",
      "Proyecto en construcción.",
      "Poco tiempo, muchas ganas.",
      "Soy mi propio plan B.",
      "Coleccionista de momentos.",
    ],
  },
};

type Cat = keyof typeof CATEGORIES;

export default function FrasesGenerator() {
  const [cat, setCat] = useState<Cat>("motivacional");
  const [current, setCurrent] = useState(CATEGORIES.motivacional.phrases[0]);
  const [copied, setCopied] = useState(false);

  const generate = (c: Cat = cat) => {
    const arr = CATEGORIES[c].phrases;
    let next = arr[Math.floor(Math.random() * arr.length)];
    if (next === current && arr.length > 1) {
      next = arr[(arr.indexOf(next) + 1) % arr.length];
    }
    setCurrent(next);
  };

  const changeCat = (c: Cat) => {
    setCat(c);
    const arr = CATEGORIES[c].phrases;
    setCurrent(arr[Math.floor(Math.random() * arr.length)]);
  };

  const copy = () => {
    navigator.clipboard.writeText(current);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = (platform: "whatsapp" | "twitter") => {
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(current + " — via viralisima.com/frases")}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(current + " — via @viralisima")}`,
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
          <div className="text-5xl mb-2">💬</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Generador de Frases Virales
          </h1>
          <p className="text-slate-600 mt-2">
            Para tu bio, tu próximo post, tu estado… o solo para inspirarte.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {(Object.keys(CATEGORIES) as Cat[]).map((c) => (
            <button
              key={c}
              onClick={() => changeCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                cat === c
                  ? "bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white shadow-md"
                  : "bg-white border-2 border-slate-200 text-slate-700 hover:border-fuchsia-500"
              }`}
            >
              {CATEGORIES[c].label}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-500 rounded-3xl p-8 md:p-12 text-white text-center min-h-[220px] flex items-center justify-center shadow-2xl">
          <p className="text-2xl md:text-3xl font-bold leading-snug">
            &ldquo;{current}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => generate()}
            className="bg-slate-900 text-white font-semibold py-3 rounded-2xl hover:scale-105 transition-transform col-span-2 sm:col-span-1"
          >
            🎲 Otra
          </button>
          <button
            onClick={copy}
            className="bg-white border-2 border-slate-200 font-semibold py-3 rounded-2xl hover:border-fuchsia-500 transition-colors"
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
      </div>
    </div>
  );
}
