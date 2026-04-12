// Datos de los quizzes de Viralísima.
// Español neutro, apto para toda LatAm + España.

export type QuizOption = {
  text: string;
  points?: Record<string, number>; // puntos por resultado
  isCorrect?: boolean; // para trivias
};

export type QuizQuestion = {
  id: string;
  text: string;
  emoji?: string;
  options: QuizOption[];
};

export type QuizResult = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  bgGradient: string; // classes tailwind
  shareText: string;
};

export type Quiz = {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  coverGradient: string;
  timeEstimate: string;
  type: "personality" | "trivia" | "generator";
  questions: QuizQuestion[];
  results: QuizResult[];
  // Para trivia: cuenta aciertos. Para personality: suma puntos por categoría.
};

export const QUIZZES: Quiz[] = [
  {
    slug: "famoso-hispano-segun-mes-nacimiento",
    title: "¿Qué famoso hispano eres según tu mes de nacimiento?",
    subtitle: "Descubre con quién compartes alma, desde Shakira hasta Messi",
    emoji: "⭐",
    coverGradient: "from-fuchsia-500 via-pink-500 to-orange-400",
    timeEstimate: "30 segundos",
    type: "personality",
    questions: [
      {
        id: "mes",
        text: "¿En qué mes naciste?",
        emoji: "🎂",
        options: [
          { text: "Enero", points: { shakira: 3 } },
          { text: "Febrero", points: { shakira: 3 } },
          { text: "Marzo", points: { penelope: 3 } },
          { text: "Abril", points: { penelope: 3 } },
          { text: "Mayo", points: { bad_bunny: 3 } },
          { text: "Junio", points: { bad_bunny: 3 } },
          { text: "Julio", points: { messi: 3 } },
          { text: "Agosto", points: { messi: 3 } },
          { text: "Septiembre", points: { rosalia: 3 } },
          { text: "Octubre", points: { rosalia: 3 } },
          { text: "Noviembre", points: { canelo: 3 } },
          { text: "Diciembre", points: { canelo: 3 } },
        ],
      },
      {
        id: "actividad",
        text: "¿Qué harías un viernes a las 10 de la noche?",
        emoji: "🌙",
        options: [
          { text: "Bailar hasta que salga el sol", points: { shakira: 2, bad_bunny: 2, rosalia: 2 } },
          { text: "Cenar con los amigos de siempre", points: { penelope: 2, messi: 2 } },
          { text: "Entrenar / preparar algo importante", points: { messi: 2, canelo: 2 } },
          { text: "Crear algo nuevo (escribir, componer, grabar)", points: { rosalia: 2, shakira: 2 } },
        ],
      },
      {
        id: "superpoder",
        text: "Si tuvieras un superpoder sería…",
        emoji: "✨",
        options: [
          { text: "Hipnotizar con tu mirada", points: { shakira: 2, penelope: 2 } },
          { text: "Volverte invisible cuando quieras", points: { penelope: 2, rosalia: 1 } },
          { text: "Ser imparable físicamente", points: { messi: 2, canelo: 3 } },
          { text: "Convertir cualquier momento en fiesta", points: { bad_bunny: 3, shakira: 1 } },
        ],
      },
      {
        id: "sueno",
        text: "Tu sueño secreto es…",
        emoji: "💭",
        options: [
          { text: "Llenar estadios cantando", points: { shakira: 3, bad_bunny: 2, rosalia: 2 } },
          { text: "Ganar un Óscar o premio mundial", points: { penelope: 3, messi: 2 } },
          { text: "Ser leyenda en tu disciplina", points: { messi: 3, canelo: 3 } },
          { text: "Crear algo que cambie la cultura", points: { rosalia: 3, bad_bunny: 2 } },
        ],
      },
      {
        id: "comida",
        text: "Te invitan a cenar. Pides…",
        emoji: "🍽️",
        options: [
          { text: "Algo latino casero y reconfortante", points: { shakira: 2, bad_bunny: 2, messi: 1 } },
          { text: "Mariscos y vino bueno", points: { penelope: 3, rosalia: 1 } },
          { text: "Carne al punto, sin adornos", points: { canelo: 3, messi: 2 } },
          { text: "Algo raro y experimental", points: { rosalia: 3 } },
        ],
      },
    ],
    results: [
      {
        id: "shakira",
        title: "Shakira",
        emoji: "💃",
        bgGradient: "from-pink-500 to-rose-500",
        description: "Carismática, magnética y con fuego interior. Conviertes cualquier espacio en escenario. Tu energía contagia y no hay quien te siga el paso cuando te sueltas.",
        shareText: "Resulté Shakira en @viralisima 💃🔥",
      },
      {
        id: "penelope",
        title: "Penélope Cruz",
        emoji: "🎬",
        bgGradient: "from-rose-500 to-orange-500",
        description: "Elegante, intensa, con una mirada que dice más que mil palabras. Eres pasión pura envuelta en clase. La gente se queda mirándote sin saber por qué.",
        shareText: "Soy Penélope Cruz en @viralisima 🎬✨",
      },
      {
        id: "bad_bunny",
        title: "Bad Bunny",
        emoji: "🐰",
        bgGradient: "from-violet-500 to-fuchsia-500",
        description: "Libre, irreverente, sin miedo a ser tú mismo. Haces las cosas a tu manera y si al mundo no le gusta, problema del mundo. Creas tendencia sin intentarlo.",
        shareText: "Resulté Bad Bunny en @viralisima 🐰🔥",
      },
      {
        id: "messi",
        title: "Lionel Messi",
        emoji: "⚽",
        bgGradient: "from-sky-500 to-blue-600",
        description: "Silencioso, humilde, pero letal cuando importa. Dejas que tus resultados hablen por ti. La gente subestima tu fuerza hasta que ven lo que puedes hacer.",
        shareText: "Soy Messi en @viralisima ⚽🐐",
      },
      {
        id: "rosalia",
        title: "Rosalía",
        emoji: "🌹",
        bgGradient: "from-red-500 to-pink-600",
        description: "Creativa, disruptiva, artística hasta la médula. Mezclas mundos, creas tu propio lenguaje y no encajas en ninguna caja. Eres la rareza más bonita.",
        shareText: "Salí Rosalía en @viralisima 🌹✨",
      },
      {
        id: "canelo",
        title: "Canelo Álvarez",
        emoji: "🥊",
        bgGradient: "from-amber-500 to-red-600",
        description: "Disciplina, trabajo y garra. Cuando te propones algo no hay nada que te pare. Eres de los que convierten cada golpe en motivación para llegar más alto.",
        shareText: "Soy Canelo en @viralisima 🥊🏆",
      },
    ],
  },

  {
    slug: "cuanto-sabes-musica-espanol",
    title: "¿Cuánto sabes de música en español?",
    subtitle: "10 preguntas que separan al fan casual del verdadero melómano",
    emoji: "🎵",
    coverGradient: "from-indigo-500 via-purple-500 to-pink-500",
    timeEstimate: "2 minutos",
    type: "trivia",
    questions: [
      {
        id: "q1",
        text: "¿Quién canta 'Bésame Mucho' en su versión original (1941)?",
        emoji: "💋",
        options: [
          { text: "Consuelo Velázquez", isCorrect: true },
          { text: "Edith Piaf" },
          { text: "Luis Miguel" },
          { text: "Thalía" },
        ],
      },
      {
        id: "q2",
        text: "'Livin' la Vida Loca' fue un éxito mundial de…",
        emoji: "🌎",
        options: [
          { text: "Ricky Martin", isCorrect: true },
          { text: "Enrique Iglesias" },
          { text: "Chayanne" },
          { text: "Marc Anthony" },
        ],
      },
      {
        id: "q3",
        text: "¿De qué país es originario el reggaetón?",
        emoji: "🎤",
        options: [
          { text: "Puerto Rico y Panamá", isCorrect: true },
          { text: "Colombia" },
          { text: "República Dominicana" },
          { text: "Cuba" },
        ],
      },
      {
        id: "q4",
        text: "¿Cuál fue la primera canción de Shakira que la hizo famosa fuera de Colombia?",
        emoji: "💃",
        options: [
          { text: "Estoy Aquí", isCorrect: true },
          { text: "Waka Waka" },
          { text: "Hips Don't Lie" },
          { text: "Ojos Así" },
        ],
      },
      {
        id: "q5",
        text: "'Macarena' es una canción de…",
        emoji: "🕺",
        options: [
          { text: "Los del Río", isCorrect: true },
          { text: "Los Hermanos Rosario" },
          { text: "Gipsy Kings" },
          { text: "David Bisbal" },
        ],
      },
      {
        id: "q6",
        text: "¿Qué banda de rock argentino hizo 'De Música Ligera'?",
        emoji: "🎸",
        options: [
          { text: "Soda Stereo", isCorrect: true },
          { text: "Los Fabulosos Cadillacs" },
          { text: "Enanitos Verdes" },
          { text: "Babasónicos" },
        ],
      },
      {
        id: "q7",
        text: "¿Cuál NO es un álbum de Bad Bunny?",
        emoji: "🐰",
        options: [
          { text: "YHLQMDLG" },
          { text: "Un Verano Sin Ti" },
          { text: "El Último Tour Del Mundo" },
          { text: "Formula Vol. 4", isCorrect: true },
        ],
      },
      {
        id: "q8",
        text: "Rosalía conquistó al mundo con un disco basado en el flamenco llamado…",
        emoji: "🌹",
        options: [
          { text: "El Mal Querer", isCorrect: true },
          { text: "Motomami" },
          { text: "Los Ángeles" },
          { text: "LUX" },
        ],
      },
      {
        id: "q9",
        text: "'La Bamba' original (1958) fue grabada por un artista de…",
        emoji: "🎺",
        options: [
          { text: "Ritchie Valens", isCorrect: true },
          { text: "Selena" },
          { text: "Los Lobos" },
          { text: "Carlos Santana" },
        ],
      },
      {
        id: "q10",
        text: "Selena Quintanilla fue conocida como la reina de…",
        emoji: "👑",
        options: [
          { text: "Tex-Mex / Cumbia", isCorrect: true },
          { text: "Salsa" },
          { text: "Bolero" },
          { text: "Reggaetón" },
        ],
      },
    ],
    results: [
      {
        id: "legend",
        title: "Leyenda viviente",
        emoji: "👑",
        bgGradient: "from-yellow-400 to-orange-500",
        description: "9-10 aciertos. Tú no escuchas música, la vives. Cualquier artista hispano te tiembla cuando entras a una conversación musical.",
        shareText: "¡Saqué LEYENDA en el quiz de música en español de @viralisima! 👑🎵",
      },
      {
        id: "master",
        title: "Maestro melómano",
        emoji: "🎧",
        bgGradient: "from-purple-500 to-pink-500",
        description: "7-8 aciertos. Sabes mucho más que el promedio. Tu playlist debe ser una joya.",
        shareText: "Saqué MAESTRO MELÓMANO en el quiz de música en español 🎧✨",
      },
      {
        id: "fan",
        title: "Fan casual",
        emoji: "🎶",
        bgGradient: "from-blue-500 to-indigo-500",
        description: "4-6 aciertos. Conoces los clásicos pero aún puedes descubrir joyas ocultas. Buen punto de partida.",
        shareText: "Saqué FAN CASUAL en el quiz de música de @viralisima 🎶",
      },
      {
        id: "novato",
        title: "Se te escaparon los 2000",
        emoji: "🔇",
        bgGradient: "from-gray-500 to-slate-600",
        description: "0-3 aciertos. Es hora de abrir Spotify y perderte una tarde entera. La cultura musical hispana te está esperando.",
        shareText: "Saqué NOVATO en el quiz de música — yo no dejo que me ganes 🔇 @viralisima",
      },
    ],
  },

  {
    slug: "tu-vida-en-2030",
    title: "¿Cómo será tu vida en 2030?",
    subtitle: "Un simulador medio serio, medio broma, muy compartible",
    emoji: "🔮",
    coverGradient: "from-cyan-400 via-violet-500 to-fuchsia-500",
    timeEstimate: "1 minuto",
    type: "personality",
    questions: [
      {
        id: "trabajo",
        text: "¿A qué le dedicas más horas hoy?",
        emoji: "💼",
        options: [
          { text: "A mi trabajo de siempre, rutina de oficina", points: { tranqui: 3 } },
          { text: "A un negocio propio o freelance", points: { millonario: 2, nomada: 2 } },
          { text: "A estudiar / aprender algo nuevo", points: { tranqui: 1, nomada: 2, famoso: 1 } },
          { text: "A crear contenido en redes", points: { famoso: 3, millonario: 1 } },
        ],
      },
      {
        id: "ahorro",
        text: "¿Qué haces cuando te entra dinero extra?",
        emoji: "💸",
        options: [
          { text: "Lo ahorro / lo invierto", points: { millonario: 3, tranqui: 1 } },
          { text: "Me doy un gusto o viaje", points: { nomada: 3, famoso: 1 } },
          { text: "Lo gasto en cosas para mi trabajo / pasión", points: { famoso: 2, millonario: 1 } },
          { text: "Ni lo noto, se va solo", points: { tranqui: 1, nomada: 1 } },
        ],
      },
      {
        id: "social",
        text: "En redes sociales eres de los que…",
        emoji: "📱",
        options: [
          { text: "Miran todo, publican poco", points: { tranqui: 3, millonario: 1 } },
          { text: "Publican cada momento", points: { famoso: 3 } },
          { text: "Solo subes fotos de viajes", points: { nomada: 3 } },
          { text: "Tienes una cuenta de nicho con seguidores fieles", points: { famoso: 2, millonario: 2 } },
        ],
      },
      {
        id: "futuro",
        text: "Pensando en 5 años, ¿qué te motiva más?",
        emoji: "🎯",
        options: [
          { text: "Tener una vida estable y sin estrés", points: { tranqui: 3 } },
          { text: "Conseguir libertad financiera", points: { millonario: 3 } },
          { text: "Viajar por el mundo sin atarme a un sitio", points: { nomada: 3 } },
          { text: "Que la gente me reconozca y admire", points: { famoso: 3 } },
        ],
      },
      {
        id: "miedo",
        text: "Tu mayor miedo es…",
        emoji: "😰",
        options: [
          { text: "Quedarme sin dinero", points: { millonario: 2, tranqui: 1 } },
          { text: "Aburrirme, que mi vida sea gris", points: { nomada: 2, famoso: 2 } },
          { text: "Que me olviden / ser irrelevante", points: { famoso: 3 } },
          { text: "Perder a la gente que quiero", points: { tranqui: 3 } },
        ],
      },
    ],
    results: [
      {
        id: "millonario",
        title: "Millonario discreto",
        emoji: "💰",
        bgGradient: "from-emerald-500 to-teal-600",
        description: "En 2030 tienes tu propio negocio o inversiones que te generan ingresos mientras duermes. Nadie en Instagram sabe cuánto tienes, y eso te gusta. Coche modesto pero cuenta bancaria gorda.",
        shareText: "En 2030 seré MILLONARIO DISCRETO 💰 (según @viralisima)",
      },
      {
        id: "famoso",
        title: "Influencer consolidado",
        emoji: "⭐",
        bgGradient: "from-pink-500 to-rose-600",
        description: "Para 2030 eres una referencia en tu nicho. Cientos de miles de seguidores, marcas que te buscan, tu cara en stories ajenas. Vives de crear contenido y te encanta.",
        shareText: "En 2030 seré INFLUENCER CONSOLIDADO ⭐ (según @viralisima)",
      },
      {
        id: "nomada",
        title: "Nómada digital",
        emoji: "🌍",
        bgGradient: "from-sky-500 to-indigo-600",
        description: "En 2030 trabajas desde Bali, Medellín o Barcelona según la temporada. Tu maleta siempre lista, tu laptop siempre contigo. Dejaste la oficina atrás y no volverías ni por millones.",
        shareText: "En 2030 seré NÓMADA DIGITAL 🌍✈️ (según @viralisima)",
      },
      {
        id: "tranqui",
        title: "Vida tranquila y feliz",
        emoji: "🌿",
        bgGradient: "from-lime-500 to-emerald-600",
        description: "Para 2030 tienes tu casa, tu gente y tu rutina. No eres rico ni famoso pero estás donde quieres estar. La paz te cuesta más que a nadie y la valoras como oro.",
        shareText: "En 2030 tendré VIDA TRANQUILA Y FELIZ 🌿 (según @viralisima)",
      },
    ],
  },
];

export const getQuiz = (slug: string) => QUIZZES.find(q => q.slug === slug);
