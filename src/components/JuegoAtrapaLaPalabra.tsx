"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// Diccionario reducido de palabras comunes en español (3-7 letras)
const DICCIONARIO = new Set<string>([
  "sol","mar","pan","luz","paz","voz","dos","tres","mes","rey","ley","pie","fin","ven","ver","vas","van","son","ser","soy",
  "casa","mesa","silla","perro","gato","rojo","azul","verde","negro","blanco","amor","vida","mano","pelo","ojos","boca",
  "cara","agua","vino","pato","rana","lobo","zorro","tigre","leon","mono","raton","pez","ave","flor","rosa","hoja",
  "arbol","rama","tallo","raiz","nube","lluvia","viento","fuego","tierra","monte","valle","rio","lago","playa","arena",
  "libro","lapiz","papel","goma","regla","clase","mapa","globo","plato","vaso","copa","taza","fork","pala","sofa","cama",
  "cocina","bano","sala","patio","jardin","parque","plaza","calle","barrio","ciudad","pueblo","pais","mundo","cielo",
  "luna","estrella","planeta","sistema","galaxia","coche","avion","barco","tren","bici","moto","camion","taxi","bus",
  "reloj","hora","dia","noche","tarde","manana","semana","ano","siglo","minuto","lunes","martes","jueves","viernes",
  "sabado","domingo","enero","marzo","abril","mayo","junio","julio","agosto","madre","padre","hijo","hija","tio","tia",
  "primo","abuelo","abuela","amigo","amiga","novio","novia","jefe","medico","doctor","actor","actriz","cantar","bailar",
  "saltar","correr","andar","comer","beber","dormir","jugar","ganar","perder","hablar","leer","mirar","oir","tocar",
  "oler","sentir","amar","odiar","reir","llorar","pensar","creer","saber","tener","poner","hacer","decir","ir","dar",
  "ver","salir","entrar","subir","bajar","abrir","cerrar","romper","pegar","cortar","limpiar","lavar","secar","planchar",
  "cocinar","comprar","vender","pagar","cobrar","deber","poder","querer","gustar","amigo","bonito","feliz","triste",
  "grande","pequeno","alto","bajo","gordo","flaco","nuevo","viejo","joven","rapido","lento","fuerte","debil","duro",
  "blando","frio","calor","seco","mojado","limpio","sucio","claro","oscuro","dulce","amargo","salado","rico","pobre",
  "bueno","malo","facil","dificil","cerca","lejos","aqui","alli","arriba","abajo","dentro","fuera","antes","despues",
  "siempre","nunca","hoy","ayer","pronto","tarde","mucho","poco","nada","todo","algo","alguien","nadie","uno","dos",
  "tres","cuatro","cinco","seis","siete","ocho","nueve","diez","cero","mil","cien","media","doble","triple","parte",
  "total","suma","resta","color","forma","figura","linea","punto","circulo","cuadro","triangulo","angulo","altura",
  "ancho","largo","peso","fuerza","ritmo","musica","sonido","ruido","canto","voz","tono","nota","piano","flauta",
  "violin","tambor","guitarra","banda","grupo","coro","show","fiesta","baile","cine","teatro","museo","obra","libro",
  "cuento","novela","poema","verso","autor","lector","pagina","letra","palabra","frase","texto","tema","idea","mente",
  "razon","logica","duda","miedo","alegria","rabia","ira","odio","amor","pasion","calma","estres","salud","cuerpo",
  "cabeza","pelo","frente","cejas","nariz","labio","diente","lengua","oreja","cuello","hombro","brazo","codo","muneca",
  "dedo","uña","pecho","espalda","cintura","cadera","pierna","rodilla","tobillo","pie","talon","planta","piel","hueso",
  "sangre","nervio","musculo","corazon","pulmon","higado","rinon","cerebro","dia","suerte","cambio","mejora","error",
  "fallo","acierto","premio","regalo","compra","venta","precio","coste","dinero","euro","banco","cuenta","ahorro",
  "deuda","firma","papel","sello","carta","correo","email","web","red","nube","dato","texto","audio","video","foto",
  "imagen","pagina","menu","boton","enlace","click","touch","mouse","teclado","pantalla","movil","celular","tablet",
  "portatil","camara","radio","tele","antena","cable","pila","carga","luz","lampara","vela","linterna","bombilla"
]);

type Letra = { id: number; char: string; x: number; y: number; vy: number; color: string };

const COLORES = ["bg-indigo-400","bg-purple-400","bg-pink-400","bg-fuchsia-400","bg-violet-400"];
const LETRAS_POOL = "AEIOUAEIOUAEIOUBCDFGHLMNPRSTVYZ";

export default function JuegoAtrapaLaPalabra() {
  const [estado, setEstado] = useState<"idle"|"playing"|"ended">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [tiempo, setTiempo] = useState(60);
  const [letras, setLetras] = useState<Letra[]>([]);
  const [palabra, setPalabra] = useState<{id:number;char:string}[]>([]);
  const [mensaje, setMensaje] = useState<string>("");
  const [palabrasLogradas, setPalabrasLogradas] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const areaRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const ultimoSpawnRef = useRef<number>(0);
  const ultimoTickRef = useRef<number>(0);
  const idCounterRef = useRef<number>(1);
  const startTimeRef = useRef<number>(0);
  const estadoRef = useRef(estado);
  const areaSizeRef = useRef<{w:number;h:number}>({w:360,h:480});

  useEffect(() => { estadoRef.current = estado; }, [estado]);

  useEffect(() => {
    try {
      const b = localStorage.getItem("vl_atrapa-la-palabra_best");
      if (b) setBest(parseInt(b, 10) || 0);
    } catch {}
  }, []);

  const medirArea = useCallback(() => {
    if (areaRef.current) {
      const r = areaRef.current.getBoundingClientRect();
      areaSizeRef.current = { w: r.width, h: r.height };
    }
  }, []);

  useEffect(() => {
    medirArea();
    window.addEventListener("resize", medirArea);
    return () => window.removeEventListener("resize", medirArea);
  }, [medirArea]);

  const iniciar = useCallback(() => {
    medirArea();
    setScore(0);
    setVidas(3);
    setTiempo(60);
    setLetras([]);
    setPalabra([]);
    setMensaje("");
    setPalabrasLogradas([]);
    ultimoSpawnRef.current = 0;
    ultimoTickRef.current = 0;
    idCounterRef.current = 1;
    startTimeRef.current = performance.now();
    setEstado("playing");
  }, [medirArea]);

  const terminar = useCallback((finalScore: number) => {
    setEstado("ended");
    setBest(prev => {
      const nuevo = Math.max(prev, finalScore);
      try { localStorage.setItem("vl_atrapa-la-palabra_best", String(nuevo)); } catch {}
      return nuevo;
    });
  }, []);

  // Bucle principal
  useEffect(() => {
    if (estado !== "playing") return;

    const loop = (now: number) => {
      if (estadoRef.current !== "playing") return;
      const { w, h } = areaSizeRef.current;
      const elapsed = (now - startTimeRef.current) / 1000;
      const restante = Math.max(0, 60 - elapsed);
      setTiempo(Math.ceil(restante));

      // Dificultad creciente: intervalo de spawn y velocidad
      const dificultad = Math.min(1, elapsed / 60);
      const spawnInterval = 1100 - dificultad * 550; // 1100ms -> 550ms
      const velBase = 40 + dificultad * 70; // px/s

      if (now - ultimoSpawnRef.current > spawnInterval) {
        ultimoSpawnRef.current = now;
        const char = LETRAS_POOL[Math.floor(Math.random() * LETRAS_POOL.length)];
        const nueva: Letra = {
          id: idCounterRef.current++,
          char,
          x: Math.max(24, Math.random() * (w - 48)),
          y: -32,
          vy: velBase + Math.random() * 30,
          color: COLORES[Math.floor(Math.random() * COLORES.length)],
        };
        setLetras(prev => [...prev, nueva]);
      }

      const dt = ultimoTickRef.current ? (now - ultimoTickRef.current) / 1000 : 0;
      ultimoTickRef.current = now;

      let perdidas = 0;
      setLetras(prev => {
        const actualizadas: Letra[] = [];
        for (const l of prev) {
          const ny = l.y + l.vy * dt;
          if (ny >= h - 32) {
            perdidas++;
          } else {
            actualizadas.push({ ...l, y: ny });
          }
        }
        return actualizadas;
      });

      if (perdidas > 0) {
        setVidas(v => {
          const nv = v - perdidas;
          if (nv <= 0) {
            setTimeout(() => {
              setScore(s => { terminar(s); return s; });
            }, 0);
            return 0;
          }
          return nv;
        });
      }

      if (restante <= 0) {
        setScore(s => { terminar(s); return s; });
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ultimoTickRef.current = 0;
    };
  }, [estado, terminar]);

  const tocarLetra = useCallback((l: Letra) => {
    if (estadoRef.current !== "playing") return;
    setLetras(prev => prev.filter(x => x.id !== l.id));
    setPalabra(prev => prev.length >= 7 ? prev : [...prev, { id: l.id, char: l.char }]);
  }, []);

  const normalizar = (s: string) => s.toLowerCase()
    .replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u").replace(/ñ/g,"n");

  const enviarPalabra = useCallback(() => {
    if (palabra.length < 3) {
      setMensaje("Mínimo 3 letras");
      setTimeout(() => setMensaje(""), 900);
      return;
    }
    const w = palabra.map(p => p.char).join("").toLowerCase();
    const existe = DICCIONARIO.has(w) || DICCIONARIO.has(normalizar(w));
    if (existe) {
      const pts = palabra.length * 10 + (palabra.length >= 5 ? 20 : 0);
      setScore(s => s + pts);
      setPalabrasLogradas(prev => [w, ...prev].slice(0, 10));
      setMensaje(`+${pts} · ${w.toUpperCase()}`);
    } else {
      setMensaje("No válida");
    }
    setPalabra([]);
    setTimeout(() => setMensaje(""), 1000);
  }, [palabra]);

  const borrarUltima = useCallback(() => {
    setPalabra(prev => prev.slice(0, -1));
  }, []);

  const limpiar = useCallback(() => setPalabra([]), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <Link href="/juegos" className="text-white/90 hover:text-white text-sm" aria-label="Volver a juegos">
            ← Juegos
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span aria-hidden>🔤</span> Atrapa la Palabra
          </h1>
          <div className="w-14" />
        </div>

        {estado === "idle" && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center shadow-xl">
            <p className="text-lg mb-2">Forma palabras antes de que caigan al suelo</p>
            <p className="text-sm text-white/80 mb-4">
              Toca las letras en orden para formar palabras en español de 3 a 7 letras.
              Tienes 3 vidas y 60 segundos.
            </p>
            <p className="text-sm text-white/80 mb-6">Mejor récord: <b>{best}</b> puntos</p>
            <button
              onClick={iniciar}
              className="bg-white text-purple-700 font-bold px-8 py-3 rounded-full hover:scale-105 transition shadow-lg"
              aria-label="Empezar partida"
            >
              Empezar
            </button>
          </div>
        )}

        {estado === "playing" && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 shadow-xl">
            <div className="flex justify-between items-center text-sm mb-2 font-semibold">
              <span aria-label="Puntuación">⭐ {score}</span>
              <span aria-label="Vidas">{"❤️".repeat(vidas)}</span>
              <span aria-label="Tiempo restante">⏱ {tiempo}s</span>
            </div>

            <div
              ref={areaRef}
              className="relative w-full h-[420px] bg-black/30 rounded-xl overflow-hidden border border-white/20 select-none"
              aria-label="Área de juego"
            >
              {letras.map(l => (
                <button
                  key={l.id}
                  onClick={() => tocarLetra(l)}
                  onTouchStart={(e) => { e.preventDefault(); tocarLetra(l); }}
                  className={`absolute ${l.color} text-white font-bold rounded-lg w-10 h-10 flex items-center justify-center shadow-md active:scale-90 transition-transform`}
                  style={{ left: l.x, top: l.y }}
                  aria-label={`Letra ${l.char}`}
                >
                  {l.char}
                </button>
              ))}
              {mensaje && (
                <div className="absolute inset-x-0 top-2 text-center text-yellow-200 font-bold drop-shadow pointer-events-none">
                  {mensaje}
                </div>
              )}
            </div>

            <div className="mt-3 bg-white/15 rounded-lg px-3 py-2 min-h-[44px] flex items-center justify-center gap-1 text-xl font-bold tracking-widest">
              {palabra.length === 0 ? (
                <span className="text-white/60 text-sm font-normal">Toca letras para formar una palabra…</span>
              ) : (
                palabra.map((p, i) => <span key={i}>{p.char}</span>)
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={borrarUltima}
                className="bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-semibold"
                aria-label="Borrar última letra"
              >
                ⌫ Borrar
              </button>
              <button
                onClick={enviarPalabra}
                className="bg-white text-purple-700 py-2 rounded-lg text-sm font-bold"
                aria-label="Validar palabra"
              >
                ✓ Enviar
              </button>
              <button
                onClick={limpiar}
                className="bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-semibold"
                aria-label="Limpiar palabra"
              >
                ✗ Limpiar
              </button>
            </div>
          </div>
        )}

        {estado === "ended" && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-2">¡Fin de la partida!</h2>
            <p className="text-5xl font-extrabold my-4">{score}</p>
            <p className="text-sm text-white/80 mb-1">puntos</p>
            <p className="text-sm text-white/80 mb-4">
              Mejor récord: <b>{Math.max(best, score)}</b>
            </p>

            {palabrasLogradas.length > 0 && (
              <div className="bg-black/20 rounded-lg p-3 mb-4 text-left">
                <p className="text-xs uppercase tracking-wide text-white/70 mb-1">Palabras formadas</p>
                <p className="text-sm break-words">{palabrasLogradas.map(p => p.toUpperCase()).join(" · ")}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={iniciar}
                className="bg-white text-purple-700 font-bold px-6 py-3 rounded-full hover:scale-105 transition shadow-lg"
                aria-label="Jugar otra vez"
              >
                🔁 Jugar otra vez
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className="bg-white/20 hover:bg-white/30 font-bold px-6 py-3 rounded-full transition"
                aria-label="Ver ranking"
              >
                🏆 Ver ranking
              </button>
              <div className="mt-2">
                <ShareButtons
                  url="https://viralisima.com/juegos/atrapa-la-palabra"
                  text={`He conseguido ${score} puntos en Atrapa la Palabra 🔤 ¿Superas mi vocabulario?`}
                />
              </div>
            </div>
          </div>
        )}

        {showLeaderboard && (
          <LeaderboardModal
            game="atrapa-la-palabra"
            score={score}
            unit="puntos"
            scoreOrder="high"
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    </div>
  );
}
