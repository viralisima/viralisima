export type Sign = {
  id: string;
  name: string;
  emoji: string;
  dates: string;
  personality: string;
  // Horóscopos rotativos — 5 predicciones que van cambiando por semana
  predictions: {
    amor: string[];
    trabajo: string[];
    salud: string[];
    suerte: string[];
  };
  compatibilidad: string[];
  shareText: string;
};

const P = {
  amor_general: [
    "Semana favorable para abrir conversaciones pendientes con tu pareja o crush. Lo que digas hoy se queda.",
    "Hay una energía que te pide soltar lo que te estanca. Si alguien no te responde, no insistas.",
    "Te llega señal de alguien del pasado. Decide con cabeza, no con ego.",
    "La soltería te sienta bien esta semana. Disfruta de estar contigo.",
    "Si tienes pareja, organicen algo distinto. La rutina está apagando la chispa.",
  ],
  trabajo_general: [
    "Oportunidad nueva a la vista. Mantén los ojos abiertos a mensajes inesperados.",
    "Toca cobrar lo que te deben (en dinero o reconocimiento). No te quedes callado/a.",
    "Un cambio de rumbo está en camino. No te resistas, te va a favorecer.",
    "Semana ideal para pedir aumento o presentar ese proyecto que tienes guardado.",
    "Alguien te pondrá a prueba. Responde con calma, te observan.",
  ],
  salud_general: [
    "Duerme mejor. Tu cuerpo te está pidiendo descanso.",
    "Muévete más, aunque sea 20 minutos diarios. Tu mente lo agradecerá.",
    "Baja la cafeína esta semana. Tu sistema nervioso está sensible.",
    "Hidratación y menos pantalla por la noche.",
    "Tu energía subirá si comes menos procesados esta semana.",
  ],
  suerte_general: [
    "Los números 3 y 7 te acompañan. Juega con ellos si te tienta.",
    "Viernes es tu día de más brillo. Aprovecha.",
    "El color verde te trae calma y oportunidades.",
    "Algo inesperado llegará por redes. Abre todos los mensajes.",
    "Un encuentro casual cambiará tu semana. Di sí.",
  ],
};

export const SIGNS: Sign[] = [
  {
    id: "aries",
    name: "Aries",
    emoji: "♈",
    dates: "21 mar - 19 abr",
    personality: "Fuego puro. Eres impulsivo, valiente, directo. No te gusta perder tiempo: si algo te llama, vas. A veces te estrellas, pero te levantas más rápido que nadie.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Leo", "Sagitario", "Géminis"],
    shareText: "Mi signo es ARIES ♈🔥 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "tauro",
    name: "Tauro",
    emoji: "♉",
    dates: "20 abr - 20 may",
    personality: "Terrestre, cabezota, sensorial. Disfrutas como pocos: buena comida, buena música, buena compañía. No te mueven con facilidad, y cuando amas, amas fuerte.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Virgo", "Capricornio", "Cáncer"],
    shareText: "Mi signo es TAURO ♉🌿 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "geminis",
    name: "Géminis",
    emoji: "♊",
    dates: "21 may - 20 jun",
    personality: "Mente veloz, mil intereses, nunca aburrido/a. Te adaptas a todo y a todos, lees el ambiente en segundos. A veces te acusan de inconstante, pero simplemente estás evolucionando.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Libra", "Acuario", "Aries"],
    shareText: "Mi signo es GÉMINIS ♊💫 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "cancer",
    name: "Cáncer",
    emoji: "♋",
    dates: "21 jun - 22 jul",
    personality: "Sensible, intuitivo, protector. Tu hogar es tu refugio y cuidas a los tuyos como leche en fuego. Lees a la gente en 2 minutos. Tu emoción es tu superpoder.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Escorpio", "Piscis", "Tauro"],
    shareText: "Mi signo es CÁNCER ♋🌙 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "leo",
    name: "Leo",
    emoji: "♌",
    dates: "23 jul - 22 ago",
    personality: "Rey o reina del escenario. Generoso/a, leal, con presencia que no pasa desapercibida. Brillas de forma natural y atraes miradas. Tu ego es grande, tu corazón también.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Aries", "Sagitario", "Géminis"],
    shareText: "Mi signo es LEO ♌🦁 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "virgo",
    name: "Virgo",
    emoji: "♍",
    dates: "23 ago - 22 sep",
    personality: "Analítico/a, observador/a, detallista. Tu mente ve lo que los demás pasan por alto. Exigente contigo mismo/a, a veces demasiado. Cuando cuidas, cuidas perfecto.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Tauro", "Capricornio", "Cáncer"],
    shareText: "Mi signo es VIRGO ♍🌿 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "libra",
    name: "Libra",
    emoji: "♎",
    dates: "23 sep - 22 oct",
    personality: "Armonía, elegancia, diplomacia. Odias el conflicto y buscas que todos estén bien (a veces a costa tuya). Tienes un gusto estético impecable.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Géminis", "Acuario", "Leo"],
    shareText: "Mi signo es LIBRA ♎⚖️ — ¿y el tuyo? viralisima.com",
  },
  {
    id: "escorpio",
    name: "Escorpio",
    emoji: "♏",
    dates: "23 oct - 21 nov",
    personality: "Intenso/a, magnético/a, profundo/a. No haces nada a medias. Tu mirada atraviesa, tu lealtad no se compra, y tu rencor tampoco se olvida. Respeto ante todo.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Cáncer", "Piscis", "Capricornio"],
    shareText: "Mi signo es ESCORPIO ♏🦂 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "sagitario",
    name: "Sagitario",
    emoji: "♐",
    dates: "22 nov - 21 dic",
    personality: "Aventurero/a, optimista, sin filtros. Quieres ver mundo, aprender, reírte. No soportas mentiras ni límites. Vives rápido, amas intenso, te cuesta quedarte quieto/a.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Aries", "Leo", "Libra"],
    shareText: "Mi signo es SAGITARIO ♐🏹 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "capricornio",
    name: "Capricornio",
    emoji: "♑",
    dates: "22 dic - 19 ene",
    personality: "Disciplina pura. Te pones metas y no paras hasta lograrlas. Pareces serio/a pero tienes un humor seco genial. Madurez desde joven, legado siempre en mente.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Tauro", "Virgo", "Escorpio"],
    shareText: "Mi signo es CAPRICORNIO ♑⛰️ — ¿y el tuyo? viralisima.com",
  },
  {
    id: "acuario",
    name: "Acuario",
    emoji: "♒",
    dates: "20 ene - 18 feb",
    personality: "Original, independiente, diferente. Piensas distinto y te encanta. Ves el futuro antes que los demás. Humanitario/a en el fondo, aunque a veces parezcas distante.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Géminis", "Libra", "Sagitario"],
    shareText: "Mi signo es ACUARIO ♒💡 — ¿y el tuyo? viralisima.com",
  },
  {
    id: "piscis",
    name: "Piscis",
    emoji: "♓",
    dates: "19 feb - 20 mar",
    personality: "Soñador/a, empático/a, artístico/a. Sientes lo que otros no. Tu intuición casi nunca falla. Vives entre la realidad y tu mundo interior, y ese mundo es bellísimo.",
    predictions: { amor: P.amor_general, trabajo: P.trabajo_general, salud: P.salud_general, suerte: P.suerte_general },
    compatibilidad: ["Cáncer", "Escorpio", "Tauro"],
    shareText: "Mi signo es PISCIS ♓🌊 — ¿y el tuyo? viralisima.com",
  },
];

export const getSign = (id: string) => SIGNS.find((s) => s.id === id);

// Índice rotativo por semana del año — garantiza que todos los usuarios
// vean la misma predicción dentro de la semana
export function weekIndex(arr: string[]): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return arr[week % arr.length];
}
