// Texto visible para buscadores en juegos, quizzes y herramientas.
// Estas páginas se pintan en el navegador y el HTML llegaba casi vacío (93 % con menos de 300 palabras).
// Cada entrada: intro «qué es y cómo funciona» + preguntas frecuentes (también van como FAQPage).
import type { Quiz } from "@/data/quizzes";

export type Pregunta = { q: string; a: string };
export type TextoSeo = { titulo: string; intro: string[]; faq: Pregunta[] };

// Preguntas comunes a todos los juegos con ranking
const REGISTRO: Pregunta = {
  q: "¿Tengo que registrarme para jugar?",
  a: "No. Juegas gratis y sin cuenta. Si quieres que tu récord aparezca en el ranking con tu nombre, puedes reservar un apodo con un PIN de 4 cifras. No pedimos correo ni datos personales.",
};
const MOVIL: Pregunta = {
  q: "¿Funciona en el celular?",
  a: "Sí. Está pensado para jugar con el dedo en el móvil y también con ratón o teclado en la computadora. No hay que instalar nada.",
};
const juego = (titulo: string, intro: string[], faq: Pregunta[]): TextoSeo => ({ titulo, intro, faq: [...faq, REGISTRO, MOVIL] });

// Las herramientas calculan todo en el navegador: no envían nada a ningún servidor
const PRIVACIDAD: Pregunta = {
  q: "¿Guardan lo que escribo?",
  a: "No. El cálculo se hace en tu propio navegador y lo que escribes no se envía a ningún servidor.",
};

export const TEXTOS: Record<string, TextoSeo> = {
  // ---------------- Juegos ----------------
  "juegos/asteroides": juego("Asteroides", [
    "Asteroides es la versión para navegador del arcade de los años 80. Controlas una nave en el centro de la pantalla: la giras, le das impulso y disparas a las rocas que flotan a tu alrededor. Cada asteroide grande se parte en dos más pequeños al recibir un disparo, así que la pantalla se llena rápido si no limpias bien.",
    "La nave conserva la inercia, igual que en el original: si aceleras hacia un lado, sigues deslizándote aunque sueltes el botón. Cuando despejas una oleada empieza otra con más rocas. La partida termina al perder todas las vidas y tus puntos entran en el ranking global.",
  ], [
    { q: "¿Cómo se maneja la nave?", a: "En la computadora con las flechas para girar y acelerar y la barra espaciadora para disparar. En el celular tienes botones en pantalla; si mantienes pulsado el de disparo, la nave dispara sola." },
    { q: "¿Cuánto vale cada asteroide?", a: "Los pequeños dan más puntos que los grandes, porque son más rápidos y cuesta más acertarles." },
  ]),
  "juegos/atrapa-la-palabra": juego("Atrapa la Palabra", [
    "En Atrapa la Palabra caen letras desde arriba y tienes que formar palabras en español antes de que lleguen al suelo. Tocas las letras en orden y, si la palabra existe, se suman los puntos y las letras desaparecen.",
    "Valen palabras de 3 a 7 letras. Tienes 60 segundos y 3 vidas: pierdes una cada vez que una letra toca el suelo sin que la hayas usado. Las palabras largas dan más puntos, así que compensa arriesgar un poco en vez de ir siempre a por las de tres letras.",
  ], [
    { q: "¿Qué palabras acepta?", a: "Palabras comunes del español de entre 3 y 7 letras, como «sol», «casa» o «verde». Los nombres propios no cuentan." },
    { q: "¿Qué pasa si me equivoco de letra?", a: "Tienes un botón para borrar la última letra. Sólo pierdes una vida cuando una letra llega al suelo." },
  ]),
  "juegos/atrapa-pastelitos": juego("Atrapa Pastelitos", [
    "Atrapa Pastelitos es un juego de reflejos con un gatito goloso. Por la parte de arriba de la pantalla pasan pastelitos y tienes que tocarlos en el momento justo para que caigan dentro de la bolsa del gato.",
    "Cada 10 segundos todo se mueve más rápido, así que lo que al principio parece fácil se complica en menos de un minuto. Gana quien consiga colar más pastelitos antes de fallar. Es un buen juego para partidas cortas y para competir con amigos por el récord.",
  ], [
    { q: "¿Qué cuenta para el ranking?", a: "El número de pastelitos que lograste colar en la bolsa del gatito." },
    { q: "¿Sube la dificultad?", a: "Sí. Cada 10 segundos aumenta la velocidad a la que pasan los pastelitos." },
  ]),
  "juegos/bloques": juego("Bloques", [
    "Bloques es el puzzle de piezas que caen de toda la vida. Van bajando figuras de cuatro cuadrados y tienes que girarlas y colocarlas para completar filas horizontales. Cada fila completa desaparece y te da puntos; si limpias varias a la vez, el premio es mayor.",
    "En un lateral ves cuál es la pieza siguiente, lo que te deja planificar la jugada. Con cada nivel las piezas caen más deprisa. La partida acaba cuando los bloques llegan hasta arriba y ya no cabe ninguna pieza nueva.",
  ], [
    { q: "¿Cómo se juega en el móvil?", a: "Con los botones en pantalla para mover, girar y bajar la pieza. Si mantienes pulsado un botón de movimiento, la pieza se desplaza sin soltarlo." },
    { q: "¿Qué da más puntos?", a: "Completar varias filas con una sola pieza. Cuatro filas de golpe vale mucho más que cuatro filas por separado." },
  ]),
  "juegos/bolsillo-exacto": juego("Bolsillo Exacto", [
    "En Bolsillo Exacto una moneda recorre un carril de lado a lado y tienes que pararla justo encima del objetivo. Un toque la detiene. Cuanto más cerca del centro del objetivo quede, más puntos sumas en esa ronda.",
    "La partida tiene varias rondas seguidas y al final se suman todas. Es un juego de puro cálculo de tiempo: la moneda va rápida y el truco está en anticipar el toque un instante antes de que llegue, en lugar de reaccionar cuando ya está encima.",
  ], [
    { q: "¿Cómo se puntúa?", a: "Por precisión. La moneda parada en el centro exacto del objetivo da la puntuación máxima de la ronda; cuanto más lejos, menos puntos." },
    { q: "¿Hay algún truco?", a: "Fijarte en el ritmo de la moneda durante una pasada completa y tocar un poco antes de que llegue al objetivo." },
  ]),
  "juegos/breakout": juego("Breakout", [
    "Breakout es el clásico de romper ladrillos. Mueves una paleta en la parte de abajo y haces rebotar una bola contra un muro de ladrillos de colores. Cada ladrillo que golpeas desaparece y suma puntos.",
    "Tienes 3 vidas: pierdes una cada vez que la bola se te escapa por debajo de la paleta. El ángulo del rebote depende del punto de la paleta donde golpee la bola, así que puedes dirigir los tiros hacia los huecos. Al romper todos los ladrillos pasas al siguiente nivel, sin límite.",
  ], [
    { q: "¿Cómo dirijo la bola?", a: "Golpeándola con los extremos de la paleta para que salga más inclinada, o con el centro para que suba más recta." },
    { q: "¿Cuántos niveles hay?", a: "No hay final. Cada vez que limpias la pantalla aparece un muro nuevo." },
  ]),
  "juegos/color-trampa": juego("Color Trampa", [
    "Color Trampa está basado en el test de Stroop, un experimento clásico de psicología. En pantalla aparece el nombre de un color escrito con tinta de otro color, por ejemplo la palabra «ROJO» pintada de azul. Tienes que pulsar el color de la tinta, no lo que dice la palabra.",
    "Leer es tan automático que el cerebro tiende a responder con la palabra, y por eso cuesta más de lo que parece. Tienes 30 segundos para acertar todas las que puedas. Cada acierto suma y cada fallo te quita 1,5 segundos.",
  ], [
    { q: "¿Qué es el efecto Stroop?", a: "Es la interferencia que se produce cuando el significado de una palabra choca con el color en que está escrita. Lo describió John Ridley Stroop en 1935." },
    { q: "¿Cuánto dura una partida?", a: "30 segundos. Tu marca es el número de aciertos." },
  ]),
  "juegos/cuanto-dura-un-segundo": juego("¿Cuánto dura un segundo?", [
    "Este juego mide tu sentido del tiempo. Te pedimos un tiempo concreto, por ejemplo 4,5 segundos, pones en marcha un cronómetro que no puedes ver y lo paras cuando creas que ha pasado justo ese tiempo.",
    "Hay cinco rondas con objetivos distintos entre 1 y 10 segundos, y son los mismos para todo el mundo el mismo día. Al final ves cuántos milisegundos te desviaste de media. En el ranking gana quien menos se equivoca, así que aquí menos es mejor.",
  ], [
    { q: "¿Se puede contar mentalmente?", a: "Sí, y ayuda. Aun así casi todo el mundo acelera o frena sin darse cuenta, sobre todo en los tiempos largos." },
    { q: "¿Por qué los objetivos son iguales para todos?", a: "Porque cambian cada día y son los mismos para todos los jugadores, así puedes comparar tu resultado con tus amigos en igualdad de condiciones." },
  ]),
  "juegos/cuanto-pesa-tu-intuicion": juego("¿Cuánto pesa?", [
    "En ¿Cuánto pesa? tienes una balanza con un objeto en un plato y tienes que equilibrarla a ojo. Tocas las pesas para pasarlas al otro plato, pulsas «Pesar» y miras hacia dónde se inclina.",
    "Son 8 rondas en 60 segundos y cada una puede darte hasta 100 puntos: cuanto más cerca quede la balanza del equilibrio, más sumas. Hay un reto del día con los mismos objetos para todo el mundo, para que puedas comparar tu puntuación con la de tus amigos.",
  ], [
    { q: "¿Cómo se consiguen los 100 puntos de una ronda?", a: "Dejando la balanza en equilibrio exacto con las pesas que elijas." },
    { q: "¿Qué es el reto del día?", a: "Una partida con los mismos objetos para todos los jugadores ese día. Cambia cada 24 horas." },
  ]),
  "juegos/esquiva-meteoritos": juego("Esquiva Meteoritos", [
    "Esquiva Meteoritos es un juego de supervivencia. Llevas una nave en la parte de abajo de la pantalla y del cielo caen meteoritos. La mueves arrastrando el dedo o el ratón en horizontal y tienes que evitar que te toque ninguno.",
    "No hay disparos ni puntos por destruir nada: tu marca es el tiempo que aguantas vivo, medido en segundos. Con el paso del tiempo caen más meteoritos y más rápido, así que los primeros segundos son tranquilos y luego hay que estar muy atento.",
  ], [
    { q: "¿Cómo se mueve la nave?", a: "Arrastrando el dedo en el celular o moviendo el ratón en la computadora, de izquierda a derecha." },
    { q: "¿Qué cuenta para el ranking?", a: "Los segundos que sobrevives sin que te toque un meteorito." },
  ]),
  "juegos/globo-valiente": juego("Globo Valiente", [
    "Globo Valiente es un juego de riesgo. Mantienes pulsado el globo para inflarlo y cada instante que aguantas suma aire, que son tus puntos. El problema es que el globo puede reventar en cualquier momento.",
    "Si te plantas antes de que reviente, guardas el aire de ese globo. Si revienta, pierdes todo lo de ese globo. La gracia está en decidir cuándo parar: ir a lo seguro da pocos puntos y apurar mucho puede dejarte sin nada. Al final de la partida se suma el aire de todos los globos que salvaste.",
  ], [
    { q: "¿Cuándo revienta el globo?", a: "No hay un punto fijo: cambia en cada globo, así que no se puede memorizar." },
    { q: "¿Qué estrategia funciona mejor?", a: "Plantarse a un ritmo constante suele dar más puntos a la larga que intentar inflar al máximo cada globo." },
  ]),
  "juegos/mama-dice": juego("Mamá Dice", [
    "Mamá Dice es la versión casera de «Simón dice». En pantalla aparecen órdenes y sólo tienes que obedecer las que empiezan por «Mamá dice». Si la orden es «Mamá dice: toca el 🍎», la tocas. Si sólo pone «toca el 🍎», no hagas nada.",
    "También hay trampas como «Mamá dice: NO toques el 🥦», donde lo correcto es no tocarlo. La partida dura 60 segundos, tienes 3 vidas y cada acierto hace que las órdenes lleguen más rápido. Tu marca es el número de aciertos.",
  ], [
    { q: "¿Qué pasa si toco cuando no lo dice mamá?", a: "Pierdes una vida. Con tres fallos se acaba la partida." },
    { q: "¿Cuánto dura?", a: "60 segundos como máximo, o menos si pierdes las 3 vidas antes." },
  ]),
  "juegos/memoria": juego("Memoria Simon", [
    "Memoria Simon es el juego de repetir secuencias de colores. Se iluminan unos botones en un orden y tienes que pulsarlos en el mismo orden. Si aciertas, la secuencia se repite con un paso más.",
    "Tu marca es el nivel al que llegas, que coincide con la longitud de la secuencia más larga que repetiste bien. Los primeros niveles son fáciles y a partir de los 8 o 10 pasos empieza la parte difícil. Es un buen ejercicio de memoria de trabajo y se juega en un par de minutos.",
  ], [
    { q: "¿Cómo memorizo secuencias largas?", a: "Agrupando los colores de tres en tres o diciéndolos en voz baja mientras se iluminan." },
    { q: "¿Qué pasa si fallo un color?", a: "La partida termina y queda guardado el último nivel completo." },
  ]),
  "juegos/no-despiertes-a-la-abuela": juego("No despiertes a la abuela", [
    "La abuela duerme la siesta y tu trabajo es que nada la despierte. Por la casa van saliendo ruidos y tienes que tocar cada uno para ponerle un 🤫 y silenciarlo.",
    "Cada ruido que se te escapa sube el medidor de sueño de la abuela; si se llena, se despierta y termina la partida. Una ronda dura entre 30 y 90 segundos y tu marca son los segundos que consigues mantenerla dormida. Los ruidos salen cada vez más seguidos, así que la calma del principio dura poco.",
  ], [
    { q: "¿Qué hace subir el medidor?", a: "Cada ruido que no silencias a tiempo. Cuantos más se te escapen, antes se despierta la abuela." },
    { q: "¿Cuánto dura una partida?", a: "Entre 30 y 90 segundos, según lo bien que vayas." },
  ]),
  "juegos/palabras-encadenadas": juego("Palabras Encadenadas", [
    "Palabras Encadenadas es el juego de toda la vida para viajes largos, ahora contra el reloj. Escribes una palabra y la siguiente tiene que empezar por la última letra de la anterior: casa, avión, nube, elefante…",
    "Las palabras se comprueban con un diccionario de más de 900.000 formas en español y otros idiomas, así que no valen las inventadas. Tampoco se pueden repetir. Tu marca es el número de palabras seguidas que consigues encadenar antes de que se acabe el tiempo.",
  ], [
    { q: "¿Valen tildes y eñes?", a: "Sí, puedes escribirlas. Para comparar letras se ignoran las tildes y la ñ cuenta como n." },
    { q: "¿Por qué no me acepta una palabra?", a: "Porque no está en el diccionario o ya la usaste en esa partida. Algunas conjugaciones verbales poco comunes no están incluidas." },
  ]),
  "juegos/parte-la-pizza": juego("Parte la Pizza", [
    "En Parte la Pizza tienes que cortar cada pizza en dos mitades lo más iguales posible, de un solo trazo. Parece sencillo con una pizza redonda, pero algunas vienen con formas raras o con un mordisco, y ahí cuesta calcular el centro.",
    "Son 5 pizzas distintas en 45 segundos. Cuanto más se parezcan las dos mitades, más puntos te llevas. Las pizzas de cada día son iguales para todo el mundo, así que puedes comparar tu puntuación con la de tus amigos.",
  ], [
    { q: "¿Cómo se corta?", a: "Arrastrando el dedo o el ratón de un lado a otro de la pizza. El corte es una línea recta." },
    { q: "¿Cómo se calcula la puntuación?", a: "Comparando el área de las dos partes. Un reparto 50/50 exacto da la puntuación máxima." },
  ]),
  "juegos/pong": juego("Pong", [
    "Pong es uno de los primeros videojuegos de la historia, de 1972. Dos paletas, una bola y nada más. Aquí juegas contra la máquina: mueves tu paleta arriba y abajo para devolver la bola y que no te pase.",
    "La bola acelera con cada golpe, así que los peloteos largos se vuelven muy rápidos. Puedes encajar 3 goles antes de perder y tu marca es el total de peloteos que devuelves. Es un juego corto, perfecto para echar unos minutos y probar tus reflejos. Si golpeas la bola con el borde de la paleta, sale con más ángulo y le cuesta más a la máquina.",
  ], [
    { q: "¿Cómo muevo la paleta?", a: "Con el dedo o el ratón, o con las flechas del teclado en la computadora." },
    { q: "¿Qué cuenta como peloteo?", a: "Cada vez que devuelves la bola con tu paleta." },
  ]),
  "juegos/portero-de-fiesta": juego("Portero de Fiesta", [
    "En Portero de Fiesta eres quien decide quién entra. Llegan invitados uno a uno y arriba ves la norma de la puerta, por ejemplo «sólo con sombrero». Deslizas la tarjeta a la derecha (o pulsas ✅) para dejar pasar y a la izquierda (o ❌) para rechazar.",
    "La norma cambia cada 10 segundos, así que hay que leerla de nuevo constantemente. La partida dura 60 segundos como máximo y cada acierto suma puntos. En la computadora también puedes jugar con las flechas del teclado.",
  ], [
    { q: "¿Cada cuánto cambia la norma?", a: "Cada 10 segundos. Fíjate en el aviso de la parte de arriba." },
    { q: "¿Qué pasa si me equivoco?", a: "Ese invitado no suma puntos y el error queda apuntado en el resumen de la partida." },
  ]),
  "juegos/reflejos": juego("Test de Reflejos", [
    "El Test de Reflejos mide tu tiempo de reacción en milisegundos. Esperas mirando un círculo y, en cuanto cambia de color, tienes que tocarlo lo más rápido posible. Si tocas antes de que cambie, cuenta como salida en falso.",
    "El momento del cambio es aleatorio para que no puedas adivinarlo. En el ranking gana el tiempo más bajo. Tu marca depende también del dispositivo: una pantalla o un ratón lentos suman unos milisegundos. Haz varias pruebas seguidas para tener una idea real de tu tiempo.",
  ], [
    { q: "¿Qué tiempo de reacción es normal?", a: "Para un estímulo visual sencillo, muchas personas están entre 200 y 300 milisegundos." },
    { q: "¿Por qué varía de una prueba a otra?", a: "Influyen el cansancio, la atención y el propio aparato. Repite varias veces y quédate con tu mejor marca." },
  ]),
  "juegos/refranes-en-emoji": juego("Refranes en Emoji", [
    "En Refranes en Emoji cada pregunta muestra tres emojis que esconden un refrán o dicho popular en español. Tienes que elegir el refrán correcto entre las opciones antes de que se acabe el tiempo.",
    "Hay dichos muy conocidos, como «Más vale pájaro en mano…», y otros que se usan sólo en algunas zonas. Cada acierto suma puntos y, a partir de 5 aciertos seguidos, cada uno vale el doble. Es un juego para probar cuántos refranes sabes y para descubrir algunos que no conocías.",
  ], [
    { q: "¿De dónde son los refranes?", a: "Son dichos populares del español, conocidos en España y en buena parte de Hispanoamérica." },
    { q: "¿Qué pasa si fallo?", a: "Pierdes la racha y ves cuál era el refrán correcto antes de seguir." },
  ]),
  "juegos/rey-por-un-minuto": juego("Rey por un minuto", [
    "En Rey por un minuto gobiernas un reino durante 60 segundos. Te llegan peticiones de tus súbditos una detrás de otra y decides deslizando: a la derecha (o ✅) apruebas y a la izquierda (o ❌) niegas.",
    "Cada decisión mueve tres barras: 💰 Oro, 😊 Ánimo y 🌾 Cosecha. Si alguna se vacía, el reino cae y termina la partida. Si aguantas el minuto completo, sumas puntos por cada barra que mantengas alta. El reto está en no contentar siempre a los mismos.",
  ], [
    { q: "¿Cuándo pierdo?", a: "Cuando una de las tres barras llega a cero antes de que acabe el minuto." },
    { q: "¿Cómo se consiguen más puntos?", a: "Terminando los 60 segundos con las tres barras lo más altas posible." },
  ]),
  "juegos/ritmo-emoji": juego("Ritmo Emoji", [
    "Ritmo Emoji es un juego de memoria con una cuadrícula de 9 emojis. Algunos se iluminan siguiendo un patrón y tienes que repetirlo tocándolos en el mismo orden y al mismo ritmo.",
    "Cada vez que aciertas, el patrón crece un emoji más. Tu marca es el nivel alcanzado, es decir, la longitud del patrón más largo que repetiste sin fallos. Los emojis cambian de partida a partida, así que no sirve memorizar posiciones de una vez para otra. Ayuda mucho fijarse en el ritmo además de en el orden.",
  ], [
    { q: "¿En qué se diferencia de Memoria Simon?", a: "Usa 9 emojis en lugar de 4 colores, así que hay más posiciones posibles y las secuencias cuestan más de recordar." },
    { q: "¿Hay límite de tiempo?", a: "Tienes un tiempo para empezar a repetir el patrón; si te quedas parado demasiado, se acaba la partida." },
  ]),
  "juegos/snake": juego("Snake", [
    "Snake es la serpiente que muchos jugaron por primera vez en un celular Nokia. Mueves una serpiente por la pantalla para comer manzanas; cada una te hace más larga y un poco más rápida.",
    "Pierdes si chocas contra las paredes o contra tu propio cuerpo. Cuanto más creces, menos espacio libre queda, así que hay que planear el recorrido para no encerrarte. Cada manzana suma puntos y tu récord entra en el ranking global. Un truco viejo: recorrer la pantalla en zigzag deja siempre una salida libre.",
  ], [
    { q: "¿Cómo se gira en el móvil?", a: "Deslizando el dedo en la dirección a la que quieres ir, o con los botones en pantalla." },
    { q: "¿Sube la velocidad?", a: "Sí, un poco con cada manzana que comes." },
  ]),
  "juegos/space-invaders": juego("Space Invaders", [
    "Space Invaders es el arcade de 1978 en el que defiendes la Tierra de una invasión alienígena. Los marcianos bajan en filas, de lado a lado, y tú los disparas desde un cañón que se mueve en la parte de abajo.",
    "Tienes búnkeres para cubrirte de sus disparos, aunque se van rompiendo. De vez en cuando cruza un OVNI por arriba que da puntos extra. Cada oleada que eliminas da paso a otra que baja más deprisa. Si los marcianos llegan hasta tu altura, la partida se acaba aunque te queden vidas.",
  ], [
    { q: "¿Cómo disparo en el celular?", a: "Con el botón de disparo en pantalla. Si lo mantienes pulsado, el cañón dispara de forma automática." },
    { q: "¿Para qué sirve el OVNI?", a: "Da una bonificación de puntos si le aciertas mientras cruza la pantalla." },
  ]),
  "juegos/tap-sprint": juego("Tap Sprint", [
    "Tap Sprint mide cuántas veces puedes tocar la pantalla o hacer clic en 10 segundos. El contador empieza con el primer toque y se para al terminar el tiempo.",
    "Es una prueba de velocidad de dedos sin más complicación. Funciona igual de bien en el móvil y en la computadora, aunque los resultados cambian bastante según el aparato: en pantalla táctil se suele llegar más lejos usando dos dedos. Al terminar ves tu total y puedes compartirlo para retar a otros.",
  ], [
    { q: "¿Qué resultado es bueno?", a: "Depende del aparato y de la técnica. Compárate con tus marcas anteriores y con el ranking del juego." },
    { q: "¿Vale usar varios dedos?", a: "Sí, cuenta cada toque, lo hagas con el dedo que lo hagas." },
  ]),
  "juegos/tilde-veloz": juego("Tilde Veloz", [
    "Tilde Veloz pone a prueba tu ortografía con prisa. Aparecen palabras una a una y tienes que decidir si están bien escritas o tienen un fallo de tilde. Deslizas o tocas a un lado o al otro según tu respuesta.",
    "Tienes 45 segundos y cada fallo te quita 2 segundos, así que contestar al azar no compensa. Al final ves las palabras en las que te equivocaste. Hay un reto del día con las mismas palabras para todo el mundo.",
  ], [
    { q: "¿Qué reglas de acentuación usa?", a: "Las normas de la RAE vigentes: agudas, llanas, esdrújulas, tilde diacrítica y casos como «solo» sin tilde." },
    { q: "¿Qué pasa si fallo?", a: "Pierdes 2 segundos del reloj y la palabra queda apuntada para repasarla al final." },
  ]),

  // ---------------- Herramientas ----------------
  memes: {
    titulo: "Generador de memes",
    intro: [
      "Con el generador de memes haces un meme en menos de un minuto. Subes una foto, escribes el texto de arriba y el de abajo y lo descargas listo para mandarlo por WhatsApp o subirlo a redes.",
      "Puedes usar la tipografía clásica de los memes, Impact en letras blancas con borde negro, que se lee bien sobre cualquier imagen, o elegir otra. Prueba varias frases hasta dar con la buena: el resultado se actualiza al momento.",
    ],
    faq: [
      { q: "¿Se sube mi foto a internet?", a: "No. La imagen se procesa en tu navegador y no sale de tu dispositivo hasta que tú la compartes." },
      { q: "¿El meme lleva marca de agua?", a: "Sólo un pequeño «viralisima.com» en la esquina inferior derecha." },
      { q: "¿Qué fotos funcionan mejor?", a: "Las que tienen espacio arriba y abajo para el texto y una expresión o situación clara." },
    ],
  },
  frases: {
    titulo: "Generador de frases",
    intro: [
      "El generador de frases te da ideas para el texto de una publicación, una historia o tu biografía de Instagram, TikTok o WhatsApp. Eliges el tono y te propone una frase; si no te convence, pides otra.",
      "Hay siete estilos: motivacional, romántico, sarcástico, reflexivo, fiesta, autoestima y frases para la bio de Instagram. Puedes copiar la frase con un toque y pegarla donde quieras. Son frases cortas, pensadas para leerse de un vistazo en el móvil.",
    ],
    faq: [
      { q: "¿Puedo usar las frases libremente?", a: "Sí, puedes copiarlas y usarlas en tus redes." },
      { q: "¿Cuántas frases hay?", a: "Unas 70, repartidas entre los siete estilos." },
      PRIVACIDAD,
    ],
  },
  historias: {
    titulo: "Generador de historias cortas",
    intro: [
      "El generador de historias cortas inventa un cuento divertido en segundos. Eliges un personaje, un lugar y una misión y la herramienta combina las piezas en una historia corta para leer en voz alta, compartir o regalar.",
      "Cada combinación da un resultado distinto, así que puedes generar varias y quedarte con la que más te guste. Funciona bien para entretener a los niños antes de dormir, para buscar una idea de cuento o para mandar algo gracioso a un amigo.",
    ],
    faq: [
      { q: "¿Las historias son aptas para niños?", a: "Sí. Están escritas para todos los públicos." },
      { q: "¿Puedo compartir la historia?", a: "Sí, con los botones para compartir o copiando el texto." },
      PRIVACIDAD,
    ],
  },
  "edad-mental": {
    titulo: "Calculadora de edad mental",
    intro: [
      "La calculadora de edad mental te hace 8 preguntas rápidas sobre tus gustos y tu forma de ver la vida y al final te da un número: la edad que «aparentas» por dentro.",
      "Cada respuesta tiene un valor y el resultado sale de la media de todas. Es un test para pasar el rato y comparar con amigos o con la familia, sin base científica. Lo divertido suele ser ver cómo cambia el resultado entre personas de la misma edad.",
    ],
    faq: [
      { q: "¿Es un test psicológico?", a: "No. Es un juego para entretenerse y no mide ninguna capacidad real." },
      { q: "¿Cuánto tarda?", a: "Alrededor de un minuto." },
      PRIVACIDAD,
    ],
  },
  aura: {
    titulo: "Generador de aura",
    intro: [
      "El generador de aura te dice de qué color sería tu energía según cómo respondas a unas preguntas sobre tu carácter y tu estado de ánimo. Cada color viene con una descripción de la personalidad que representa.",
      "El resultado se muestra con una imagen de colores que puedes compartir en historias. Es un juego inspirado en la idea popular del aura, sin ninguna base científica, pensado para entretenerse y comparar resultados con amigos.",
    ],
    faq: [
      { q: "¿Cómo se decide el color?", a: "Cada respuesta suma puntos a un color y gana el que más puntos reúne." },
      { q: "¿Puedo repetirlo?", a: "Sí. Si contestas distinto, puede salir otro color." },
      PRIVACIDAD,
    ],
  },
  compatibilidad: {
    titulo: "Calculadora de compatibilidad",
    intro: [
      "La calculadora de compatibilidad te da un porcentaje a partir de dos nombres: el tuyo y el de tu pareja, tu crush o quien quieras. Escribes los dos, pulsas el botón y aparece el resultado con un mensaje.",
      "El porcentaje se calcula con una fórmula fija a partir de las letras de los nombres, así que la misma pareja de nombres da siempre el mismo número. Es un juego para reírse y compartir, sin ningún valor como predicción.",
    ],
    faq: [
      { q: "¿Por qué sale siempre el mismo resultado?", a: "Porque se calcula a partir de las letras de los dos nombres. Si cambias uno, cambia el porcentaje." },
      { q: "¿Importa el orden de los nombres?", a: "No. Da igual cuál escribas primero." },
      PRIVACIDAD,
    ],
  },
  "dias-vividos": {
    titulo: "Calculadora de días vividos",
    intro: [
      "Con la calculadora de días vividos sabes cuántos días, horas y minutos llevas en el mundo. Sólo tienes que poner tu fecha de nacimiento y el resultado aparece al instante.",
      "El cálculo cuenta los años bisiestos, así que es exacto. Sirve para descubrir cuándo cumples tus 10.000 días, una cifra redonda que se alcanza a los 27 años y unos meses, o para preparar una felicitación original.",
    ],
    faq: [
      { q: "¿Tiene en cuenta los años bisiestos?", a: "Sí. Cuenta los días reales del calendario entre tu nacimiento y hoy." },
      { q: "¿Cuándo se cumplen 10.000 días?", a: "A los 27 años, 4 meses y unos días, según cuántos bisiestos haya en medio." },
      PRIVACIDAD,
    ],
  },
  "edad-perro": {
    titulo: "Calculadora de la edad de tu perro",
    intro: [
      "Esta calculadora pasa la edad de tu perro a años humanos según su tamaño, que es más preciso que la vieja regla de multiplicar por 7. Los perros maduran muy deprisa al principio y después envejecen a un ritmo que depende de su peso.",
      "La fórmula que usamos: el primer año equivale a 15 años humanos (12 en razas grandes y 14 en gigantes) y a los 2 años un perro tiene unos 24 años humanos (22 en grandes y gigantes). Desde ahí se suman 4 años por cada año en perros pequeños (menos de 10 kg), 5 en medianos (10-25 kg), 6 en grandes (25-45 kg) y 7 en gigantes (más de 45 kg).",
    ],
    faq: [
      { q: "¿Por qué no se multiplica por 7?", a: "Porque un perro de un año ya es adulto, algo que la regla del 7 no refleja, y porque las razas grandes envejecen más rápido que las pequeñas." },
      { q: "¿Sustituye la opinión del veterinario?", a: "No. Es una estimación orientativa. La salud y la etapa de vida de tu perro las valora mejor tu veterinario." },
      { q: "¿Qué tamaño elijo si mi perro es mestizo?", a: "El que corresponda a su peso de adulto." },
    ],
  },
  "calculadora-imc": {
    titulo: "Calculadora de IMC",
    intro: [
      "El índice de masa corporal (IMC) relaciona tu peso con tu altura. Se calcula dividiendo el peso en kilos entre la altura en metros al cuadrado: una persona de 70 kg y 1,75 m tiene un IMC de 70 / (1,75 × 1,75) = 22,9.",
      "Según los rangos de la OMS para adultos, menos de 18,5 es bajo peso, de 18,5 a 24,9 peso saludable, de 25 a 29,9 sobrepeso y 30 o más obesidad. Mueves los deslizadores de peso y altura y ves el resultado en tiempo real.",
    ],
    faq: [
      { q: "¿El IMC sirve para todo el mundo?", a: "Es orientativo. No distingue músculo de grasa ni tiene en cuenta la edad o la complexión, y en niños y adolescentes se usan otras tablas." },
      { q: "¿Sustituye una consulta médica?", a: "No. Si el resultado te preocupa, consulta con tu médico." },
      PRIVACIDAD,
    ],
  },
  horoscopo: {
    titulo: "Horóscopo",
    intro: [
      "En el horóscopo de Viralísima tienes los 12 signos del zodiaco con su personalidad, sus compatibilidades y una predicción semanal. Elige tu signo en la cuadrícula para ver su página.",
      "Las fechas de cada signo son las habituales del zodiaco occidental, de Aries (21 de marzo a 19 de abril) a Piscis (19 de febrero a 20 de marzo). Los textos están escritos para entretener y compartir; la astrología no tiene base científica.",
    ],
    faq: [
      { q: "¿Cada cuánto cambia la predicción?", a: "La predicción de cada signo rota cada semana." },
      { q: "¿Cómo sé cuál es mi signo?", a: "Busca tu fecha de nacimiento en las fechas que aparecen bajo cada signo." },
    ],
  },
  "generadores/nombre-artista": {
    titulo: "Generador de nombre artístico",
    intro: [
      "El generador de nombre artístico te propone un nombre de escenario según el estilo de música que elijas: reggaetón, rap y trap, pop, rock, banda y regional o electrónica.",
      "Cada estilo combina palabras y fórmulas típicas del género, así que un nombre de reggaetonero suena muy distinto a uno de banda de rock. Puedes generar tantos como quieras hasta encontrar uno que te guste para tu proyecto, tu perfil o simplemente para reírte con tus amigos.",
    ],
    faq: [
      { q: "¿Puedo usar el nombre para mi grupo?", a: "Sí, aunque antes conviene buscarlo en redes y plataformas de música para comprobar que nadie lo usa ya." },
      { q: "¿Cuántos estilos hay?", a: "Seis: reggaetón, rap y trap, pop, rock, banda y regional y electrónica." },
      PRIVACIDAD,
    ],
  },
  "generadores/username": {
    titulo: "Generador de username",
    intro: [
      "El generador de username te da ideas de nombre de usuario para Instagram, TikTok, X y otras redes. Escribes tu nombre o un apodo, eliges un estilo y te propone varias opciones basadas en él.",
      "Hay seis estilos: estético, gamer, cool, minimal, divertido y profesional. Cada uno combina tu nombre con palabras, números o símbolos distintos. Copias el que te guste con un toque y lo pruebas en la red social, que te dirá si está libre.",
    ],
    faq: [
      { q: "¿Sé si el username está libre?", a: "No lo comprobamos. Cada red social te avisa al intentar registrarlo si ya está ocupado." },
      { q: "¿Qué estilo elijo para trabajo?", a: "El profesional, que evita números raros y símbolos." },
      PRIVACIDAD,
    ],
  },
};

// Quizzes: el texto se arma con los datos de cada quiz (preguntas y resultados reales)
const sinEmoji = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️]/gu, "").trim();
const lista = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}` : xs[0] ?? "");

export function textoQuiz(quiz: Quiz): TextoSeo {
  const n = quiz.questions.length;
  const resultados = quiz.results.map((r) => sinEmoji(r.title));
  if (quiz.type === "trivia") {
    return {
      titulo: quiz.title,
      intro: [
        `${quiz.subtitle}. Este quiz tiene ${n} preguntas con varias opciones y una sola respuesta correcta en cada una. Se responde en unos ${quiz.timeEstimate}.`,
        `Al terminar ves cuántas acertaste y en qué nivel quedas. Los niveles posibles son ${lista(resultados)}. Las preguntas no cambian, así que puedes repetirlo para mejorar o mandárselo a alguien para ver quién sabe más.`,
      ],
      faq: [
        { q: "¿Cuántas preguntas tiene?", a: `${n} preguntas.` },
        { q: "¿Qué pasa si fallo una?", a: "Sigues con la siguiente. Al final se cuentan los aciertos y te decimos tu nivel." },
        { q: "¿Puedo compartir mi resultado?", a: "Sí. Cada nivel tiene su propia página con imagen para mandarla por WhatsApp o publicarla en redes." },
        { q: "¿Guardan mis respuestas?", a: "No. El quiz funciona en tu navegador y no enviamos tus respuestas a ningún sitio." },
      ],
    };
  }
  return {
    titulo: quiz.title,
    intro: [
      `${quiz.subtitle}. Este test tiene ${n} preguntas y se responde en unos ${quiz.timeEstimate}. Cada respuesta suma puntos a uno de los ${resultados.length} resultados posibles y al final te mostramos el que más puntos reunió.`,
      `Los resultados son ${lista(resultados)}. Cada uno viene con una descripción y una imagen para compartir. Es un test para entretenerse y comparar con tus amigos, sin base científica.`,
    ],
    faq: [
      { q: "¿Cómo se calcula el resultado?", a: "Cada opción suma puntos a uno o varios resultados. Gana el que acumula más puntos al terminar." },
      { q: "¿Puedo repetirlo?", a: "Sí. Si cambias tus respuestas, puede salirte otro resultado." },
      { q: "¿Puedo compartir mi resultado?", a: "Sí. Cada resultado tiene su propia página con imagen para mandarla por WhatsApp o publicarla en redes." },
      { q: "¿Guardan mis respuestas?", a: "No. El test funciona en tu navegador y no enviamos tus respuestas a ningún sitio." },
    ],
  };
}
