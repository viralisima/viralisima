"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ShareButtons from "./ShareButtons";
import LeaderboardModal from "./LeaderboardModal";

// ─── Tipos ────────────────────────────────────────────────────────────────
type Entrada = { t: string; ok: boolean; r: string };
type Fase = "inicio" | "jugando" | "fin";
type Fallo = { entrada: Entrada; dijoBien: boolean };
type Flash = { tipo: "ok" | "ko"; texto: string; id: number } | null;
type Marcador = { puntos: number; aciertos: number; fallos: number; racha: number };

// ─── Constantes ───────────────────────────────────────────────────────────
const DURACION_MS = 45000;
const PENALIZACION_MS = 2000;
const UMBRAL_PX = 60;
const CLAVE_RECORD = "vl_tilde-veloz_best";
const URL_JUEGO = "https://www.viralisima.com/juegos/tilde-veloz";
const MARCADOR_VACIO: Marcador = { puntos: 0, aciertos: 0, fallos: 0, racha: 0 };

// Atajos para escribir el banco: B = bien escrita, M = con fallo de tilde
const B = (t: string, r: string): Entrada => ({ t, ok: true, r });
const M = (t: string, r: string): Entrada => ({ t, ok: false, r });

// ─── Banco nivel 1: agudas, llanas y esdrújulas ───────────────────────────
const NIVEL_1: Entrada[] = [
  B("examen", "Llana acabada en -n: no lleva tilde."),
  M("exámen", "Se escribe «examen»: llana acabada en -n, sin tilde."),
  B("exámenes", "Esdrújula (e-XÁ-me-nes): las esdrújulas siempre llevan tilde."),
  M("examenes", "Se escribe «exámenes»: esdrújula, siempre con tilde."),
  B("canción", "Aguda acabada en -n: lleva tilde."),
  M("cancion", "Se escribe «canción»: aguda acabada en -n, lleva tilde."),
  B("canciones", "Llana acabada en -s: no lleva tilde."),
  M("canciónes", "Se escribe «canciones»: en plural pasa a llana acabada en -s, sin tilde."),
  B("árbol", "Llana acabada en -l (ni -n, ni -s, ni vocal): lleva tilde."),
  M("arbol", "Se escribe «árbol»: llana acabada en -l, lleva tilde."),
  B("lápiz", "Llana acabada en -z: lleva tilde."),
  M("lapiz", "Se escribe «lápiz»: llana acabada en -z, lleva tilde."),
  B("café", "Aguda acabada en vocal: lleva tilde."),
  M("cafe", "Se escribe «café»: aguda acabada en vocal, lleva tilde."),
  B("reloj", "Aguda acabada en -j: no lleva tilde."),
  M("relój", "Se escribe «reloj»: aguda que no acaba en -n, -s ni vocal, sin tilde."),
  B("césped", "Llana acabada en -d: lleva tilde."),
  M("cesped", "Se escribe «césped»: llana acabada en -d, lleva tilde."),
  B("móvil", "Llana acabada en -l: lleva tilde."),
  M("movil", "Se escribe «móvil»: llana acabada en -l, lleva tilde."),
  B("azúcar", "Llana acabada en -r: lleva tilde."),
  M("azucar", "Se escribe «azúcar»: llana acabada en -r, lleva tilde."),
  B("difícil", "Llana acabada en -l: lleva tilde."),
  M("dificil", "Se escribe «difícil»: llana acabada en -l, lleva tilde."),
  B("joven", "Llana acabada en -n: no lleva tilde."),
  M("jóven", "Se escribe «joven»: llana acabada en -n, sin tilde."),
  B("jóvenes", "Esdrújula (JÓ-ve-nes): siempre con tilde."),
  M("jovenes", "Se escribe «jóvenes»: esdrújula, siempre con tilde."),
  B("carácter", "Llana acabada en -r: lleva tilde."),
  M("caracter", "Se escribe «carácter»: llana acabada en -r, lleva tilde."),
  B("caracteres", "El acento se desplaza (ca-rac-TE-res): llana acabada en -s, sin tilde."),
  M("carácteres", "Se escribe «caracteres»: el acento pasa a -te- y es llana acabada en -s."),
  B("regímenes", "El acento se desplaza (re-GÍ-me-nes): esdrújula, con tilde."),
  M("régimenes", "Se escribe «regímenes»: el acento se desplaza a -gí- y es esdrújula."),
  B("volumen", "Llana acabada en -n: no lleva tilde."),
  M("volúmen", "Se escribe «volumen»: llana acabada en -n, sin tilde."),
  B("crimen", "Llana acabada en -n: no lleva tilde."),
  M("crímen", "Se escribe «crimen»: llana acabada en -n, sin tilde."),
  B("imagen", "Llana acabada en -n: no lleva tilde."),
  M("imágen", "Se escribe «imagen»: llana acabada en -n, sin tilde."),
  B("imágenes", "Esdrújula (i-MÁ-ge-nes): siempre con tilde."),
  M("imagenes", "Se escribe «imágenes»: esdrújula, siempre con tilde."),
  B("resumen", "Llana acabada en -n: no lleva tilde."),
  M("resúmen", "Se escribe «resumen»: llana acabada en -n, sin tilde."),
  B("orden", "Llana acabada en -n: no lleva tilde."),
  M("órden", "Se escribe «orden»: llana acabada en -n, sin tilde."),
  B("también", "Aguda acabada en -n: lleva tilde."),
  M("tambien", "Se escribe «también»: aguda acabada en -n, lleva tilde."),
  B("además", "Aguda acabada en -s: lleva tilde."),
  M("ademas", "Se escribe «además»: aguda acabada en -s, lleva tilde."),
  B("sofá", "Aguda acabada en vocal: lleva tilde."),
  M("sofa", "Se escribe «sofá»: aguda acabada en vocal, lleva tilde."),
  B("camión", "Aguda acabada en -n: lleva tilde."),
  M("camion", "Se escribe «camión»: aguda acabada en -n, lleva tilde."),
  B("pared", "Aguda acabada en -d: no lleva tilde."),
  M("paréd", "Se escribe «pared»: aguda acabada en -d, sin tilde."),
  B("feliz", "Aguda acabada en -z: no lleva tilde."),
  M("felíz", "Se escribe «feliz»: aguda acabada en -z, sin tilde."),
  B("ciudad", "Aguda acabada en -d: no lleva tilde."),
  M("ciudád", "Se escribe «ciudad»: aguda acabada en -d, sin tilde."),
  B("comer", "Aguda acabada en -r: no lleva tilde."),
  M("comér", "Se escribe «comer»: aguda acabada en -r, sin tilde."),
  B("tenedor", "Aguda acabada en -r: no lleva tilde."),
  B("virtud", "Aguda acabada en -d: no lleva tilde."),
  B("música", "Esdrújula (MÚ-si-ca): siempre con tilde."),
  M("musica", "Se escribe «música»: esdrújula, siempre con tilde."),
  B("teléfono", "Esdrújula (te-LÉ-fo-no): siempre con tilde."),
  M("telefono", "Se escribe «teléfono»: esdrújula, siempre con tilde."),
  B("pájaro", "Esdrújula (PÁ-ja-ro): siempre con tilde."),
  M("pajaro", "Se escribe «pájaro»: esdrújula, siempre con tilde."),
  B("miércoles", "Esdrújula (MIÉR-co-les): siempre con tilde."),
  M("miercoles", "Se escribe «miércoles»: esdrújula, siempre con tilde."),
  B("sábado", "Esdrújula (SÁ-ba-do): siempre con tilde."),
  M("sabado", "Se escribe «sábado»: esdrújula, siempre con tilde."),
  B("murciélago", "Esdrújula (mur-CIÉ-la-go): siempre con tilde."),
  M("murcielago", "Se escribe «murciélago»: esdrújula, siempre con tilde."),
  B("rápido", "Esdrújula (RÁ-pi-do): siempre con tilde."),
  M("rapido", "Se escribe «rápido»: esdrújula, siempre con tilde."),
  B("océano", "Esdrújula (o-CÉ-a-no): siempre con tilde."),
  M("oceano", "Se escribe «océano»: esdrújula, siempre con tilde."),
  B("fútbol", "Llana acabada en -l: lleva tilde."),
  M("futbol", "Se escribe «fútbol» (en España): llana acabada en -l, lleva tilde."),
  B("después", "Aguda acabada en -s: lleva tilde."),
  M("despues", "Se escribe «después»: aguda acabada en -s, lleva tilde."),
  B("adiós", "Aguda acabada en -s: lleva tilde."),
  M("adios", "Se escribe «adiós»: aguda acabada en -s, lleva tilde."),
];

// ─── Banco nivel 2: hiatos, compuestas, mayúsculas y monosílabos ──────────
const NIVEL_2: Entrada[] = [
  B("día", "Hiato con vocal cerrada tónica (DÍ-a): lleva tilde siempre."),
  M("dia", "Se escribe «día»: la í tónica forma hiato y lleva tilde siempre."),
  B("tío", "Hiato con vocal cerrada tónica (TÍ-o): lleva tilde siempre."),
  M("tio", "Se escribe «tío»: la í tónica forma hiato y lleva tilde siempre."),
  B("baúl", "Hiato con vocal cerrada tónica (ba-ÚL): lleva tilde siempre."),
  M("baul", "Se escribe «baúl»: la ú tónica forma hiato y lleva tilde siempre."),
  B("búho", "Hiato (BÚ-ho): la h intercalada no impide la tilde."),
  M("buho", "Se escribe «búho»: hay hiato y la h intercalada no lo impide."),
  B("oído", "Hiato con vocal cerrada tónica (o-Í-do): lleva tilde."),
  M("oido", "Se escribe «oído»: la í tónica forma hiato y lleva tilde."),
  B("caída", "Hiato con vocal cerrada tónica (ca-Í-da): lleva tilde."),
  M("caida", "Se escribe «caída»: la í tónica forma hiato y lleva tilde."),
  B("país", "Hiato con vocal cerrada tónica (pa-ÍS): lleva tilde."),
  M("pais", "Se escribe «país»: la í tónica forma hiato y lleva tilde."),
  B("maíz", "Hiato con vocal cerrada tónica (ma-ÍZ): lleva tilde."),
  M("maiz", "Se escribe «maíz»: la í tónica forma hiato y lleva tilde."),
  B("raíces", "Hiato con vocal cerrada tónica (ra-Í-ces): lleva tilde."),
  M("raices", "Se escribe «raíces»: la í tónica forma hiato y lleva tilde."),
  B("policía", "Hiato con vocal cerrada tónica (po-li-CÍ-a): lleva tilde."),
  M("policia", "Se escribe «policía»: la í tónica forma hiato y lleva tilde."),
  B("reúne", "Hiato (re-Ú-ne): la ú tónica lleva tilde."),
  M("reune", "Se escribe «reúne»: la ú tónica forma hiato y lleva tilde."),
  B("prohíbe", "Hiato (pro-HÍ-be): la h intercalada no impide la tilde."),
  M("prohibe", "Se escribe «prohíbe»: hay hiato y la h intercalada no lo impide."),
  B("Raúl", "Hiato con vocal cerrada tónica (Ra-ÚL): lleva tilde."),
  M("Raul", "Se escribe «Raúl»: la ú tónica forma hiato y lleva tilde."),
  B("ahí", "Hiato (a-HÍ): la í tónica lleva tilde."),
  M("ahi", "Se escribe «ahí»: la í tónica forma hiato y lleva tilde."),
  B("héroe", "Esdrújula (HÉ-ro-e): siempre con tilde."),
  M("heroe", "Se escribe «héroe»: esdrújula, siempre con tilde."),
  B("aéreo", "Esdrújula (a-É-re-o): siempre con tilde."),
  M("aereo", "Se escribe «aéreo»: esdrújula, siempre con tilde."),
  B("construido", "«ui» cuenta como diptongo: llana acabada en vocal, sin tilde."),
  M("construído", "Se escribe «construido»: «ui» cuenta como diptongo, sin tilde."),
  B("incluido", "«ui» cuenta como diptongo: llana acabada en vocal, sin tilde."),
  M("incluído", "Se escribe «incluido»: «ui» cuenta como diptongo, sin tilde."),
  B("huir", "Aguda acabada en -r: no lleva tilde."),
  M("huír", "Se escribe «huir»: aguda acabada en -r, sin tilde."),
  B("dímelo", "Con pronombres pegados se aplica la regla general: esdrújula, con tilde."),
  M("dimelo", "Se escribe «dímelo»: con los pronombres pegados es esdrújula."),
  B("cómetelo", "Con pronombres pegados: sobresdrújula, con tilde."),
  M("cometelo", "Se escribe «cómetelo»: con los pronombres pegados es sobresdrújula."),
  B("dámelo", "Con pronombres pegados: esdrújula, con tilde."),
  M("damelo", "Se escribe «dámelo»: con los pronombres pegados es esdrújula."),
  B("fácilmente", "Los adverbios en -mente conservan la tilde del adjetivo (fácil)."),
  M("facilmente", "Se escribe «fácilmente»: conserva la tilde de «fácil»."),
  B("rápidamente", "Los adverbios en -mente conservan la tilde del adjetivo (rápido)."),
  M("rapidamente", "Se escribe «rápidamente»: conserva la tilde de «rápido»."),
  B("cortésmente", "Los adverbios en -mente conservan la tilde del adjetivo (cortés)."),
  M("cortesmente", "Se escribe «cortésmente»: conserva la tilde de «cortés»."),
  B("lentamente", "«lento» no lleva tilde, así que «lentamente» tampoco."),
  M("léntamente", "Se escribe «lentamente»: «lento» no lleva tilde."),
  B("veintidós", "Compuesto que es aguda acabada en -s: lleva tilde."),
  M("veintidos", "Se escribe «veintidós»: aguda acabada en -s, lleva tilde."),
  B("dieciséis", "Compuesto que es aguda acabada en -s: lleva tilde."),
  M("dieciseis", "Se escribe «dieciséis»: aguda acabada en -s, lleva tilde."),
  B("veintitrés", "Compuesto que es aguda acabada en -s: lleva tilde."),
  M("veintitres", "Se escribe «veintitrés»: aguda acabada en -s, lleva tilde."),
  B("decimoséptimo", "En los compuestos en una sola palabra solo cuenta el acento final."),
  M("décimoséptimo", "Se escribe «decimoséptimo»: el primer elemento pierde su tilde."),
  B("hispanoamericano", "Compuesto llano acabado en vocal: sin tilde."),
  M("hispanoaméricano", "Se escribe «hispanoamericano»: llana acabada en vocal, sin tilde."),
  B("ÁFRICA", "Las mayúsculas llevan tilde igual que las minúsculas."),
  M("AFRICA", "Se escribe «ÁFRICA»: las mayúsculas también llevan tilde."),
  B("Álvaro", "Las mayúsculas llevan tilde: esdrújula (ÁL-va-ro)."),
  M("Alvaro", "Se escribe «Álvaro»: esdrújula, y la mayúscula no exime de la tilde."),
  B("fue", "Monosílabo: no lleva tilde."),
  M("fué", "Se escribe «fue»: los monosílabos no llevan tilde."),
  B("fui", "Monosílabo: no lleva tilde."),
  M("fuí", "Se escribe «fui»: los monosílabos no llevan tilde."),
  B("dio", "Monosílabo: no lleva tilde."),
  M("dió", "Se escribe «dio»: los monosílabos no llevan tilde."),
  B("vio", "Monosílabo: no lleva tilde."),
  M("vió", "Se escribe «vio»: los monosílabos no llevan tilde."),
  B("pie", "Monosílabo: no lleva tilde."),
  M("pié", "Se escribe «pie»: los monosílabos no llevan tilde."),
  B("fe", "Monosílabo: no lleva tilde."),
  M("fé", "Se escribe «fe»: los monosílabos no llevan tilde."),
  B("guion", "Desde 2010 es monosílabo a efectos ortográficos: sin tilde."),
  M("guión", "Se escribe «guion»: desde 2010 es monosílabo ortográfico."),
  B("hui", "Monosílabo a efectos ortográficos: sin tilde."),
  M("huí", "Se escribe «hui»: monosílabo ortográfico, sin tilde."),
  B("Se rio mucho", "«rio» (de reír) es monosílabo ortográfico: sin tilde."),
  M("Se rió mucho", "Se escribe «se rio»: monosílabo ortográfico, sin tilde."),
  B("el río Ebro", "«río» (sustantivo) tiene hiato (RÍ-o): lleva tilde."),
  M("el rio Ebro", "Se escribe «el río»: el sustantivo tiene hiato y lleva tilde."),
  B("10 o 20", "Desde 2010 la «o» entre cifras ya no lleva tilde."),
  M("10 ó 20", "Se escribe «10 o 20»: la «o» entre cifras ya no lleva tilde."),
  B("esto", "Los pronombres neutros (esto, eso, aquello) nunca llevan tilde."),
  M("ésto", "Se escribe «esto»: los neutros nunca llevan tilde."),
  M("éso", "Se escribe «eso»: los neutros nunca llevan tilde."),
  B("aquello", "Los pronombres neutros nunca llevan tilde."),
  B("este coche", "«este» delante de un nombre es determinante: nunca lleva tilde."),
  M("éste coche", "Se escribe «este coche»: los determinantes nunca llevan tilde."),
];

// ─── Banco nivel 3: tilde diacrítica e interrogativas ─────────────────────
const NIVEL_3: Entrada[] = [
  B("él vino", "«él» es pronombre personal: lleva tilde diacrítica."),
  B("el vino tinto", "«el» es artículo: sin tilde."),
  M("él vino tinto", "Se escribe «el vino tinto»: «el» artículo no lleva tilde."),
  B("para ti", "«ti» nunca lleva tilde: no hay otro «ti» del que distinguirlo."),
  M("para tí", "Se escribe «para ti»: «ti» nunca lleva tilde."),
  B("a mí", "«mí» pronombre lleva tilde; «mi» posesivo, no."),
  M("dámelo a mi", "Se escribe «a mí»: es pronombre y lleva tilde."),
  B("mi casa", "«mi» posesivo no lleva tilde."),
  M("mí casa", "Se escribe «mi casa»: el posesivo no lleva tilde."),
  B("tu perro", "«tu» posesivo no lleva tilde."),
  M("tú perro", "Se escribe «tu perro»: el posesivo no lleva tilde."),
  B("tú eres listo", "«tú» pronombre personal lleva tilde."),
  M("tu eres listo", "Se escribe «tú eres»: el pronombre personal lleva tilde."),
  B("Yo sé nadar", "«sé» del verbo saber lleva tilde."),
  M("Yo se nadar", "Se escribe «yo sé»: del verbo saber, lleva tilde."),
  B("Se fue pronto", "«se» pronombre no lleva tilde."),
  M("Sé fue pronto", "Se escribe «se fue»: el pronombre «se» no lleva tilde."),
  B("que me dé la mano", "«dé» del verbo dar lleva tilde."),
  M("que me de la mano", "Se escribe «me dé»: del verbo dar, lleva tilde."),
  B("Vengo de casa", "«de» preposición no lleva tilde."),
  M("Vengo dé casa", "Se escribe «de casa»: la preposición no lleva tilde."),
  B("Quiero más agua", "«más» de cantidad lleva tilde; «mas» (= pero), no."),
  M("Quiero mas agua", "Se escribe «más agua»: indica cantidad y lleva tilde."),
  B("Tomo té con limón", "«té» (la bebida) lleva tilde."),
  M("Tomo te con limón", "Se escribe «té»: la bebida lleva tilde diacrítica."),
  B("Te quiero", "«te» pronombre no lleva tilde."),
  M("Té quiero", "Se escribe «te quiero»: el pronombre no lleva tilde."),
  B("Sí, claro", "«sí» afirmativo lleva tilde."),
  M("Si, claro", "Se escribe «Sí, claro»: el adverbio de afirmación lleva tilde."),
  B("Si llueve, me quedo", "«si» condicional no lleva tilde."),
  M("Sí llueve, me quedo", "Se escribe «Si llueve»: el condicional no lleva tilde."),
  B("Aún no ha llegado", "«aún» = todavía: lleva tilde."),
  M("Aun no ha llegado", "Se escribe «aún no»: equivale a «todavía» y lleva tilde."),
  B("Aun así, iré", "«aun» = incluso: sin tilde."),
  M("Aún así, iré", "Se escribe «aun así»: equivale a «incluso así», sin tilde."),
  B("¿Qué quieres?", "Los interrogativos llevan tilde."),
  M("¿Que quieres?", "Se escribe «¿Qué quieres?»: el interrogativo lleva tilde."),
  B("No sé qué hacer", "Las interrogativas indirectas también llevan tilde."),
  M("No se que hacer", "Se escribe «No sé qué hacer»: «sé» de saber y «qué» interrogativo."),
  B("¿Por qué lloras?", "Pregunta: «por qué», separado y con tilde."),
  M("¿Porqué lloras?", "Se escribe «¿Por qué…?»: en preguntas va separado y con tilde."),
  B("Lloro porque sí", "Causal: «porque», junto y sin tilde."),
  M("Lloro porqué sí", "Se escribe «porque»: la causa va junta y sin tilde."),
  B("el porqué de todo", "Sustantivo (= el motivo): «porqué», junto y con tilde."),
  M("el por qué de todo", "Se escribe «el porqué»: el sustantivo va junto y con tilde."),
  M("No sé porqué", "Se escribe «No sé por qué»: pregunta indirecta, separado y con tilde."),
  B("No sé por qué", "Pregunta indirecta: «por qué», separado y con tilde."),
  B("¿Cómo estás?", "«cómo» interrogativo y «estás» (aguda en -s) llevan tilde."),
  M("¿Como estas?", "Se escribe «¿Cómo estás?»: interrogativo y aguda acabada en -s."),
  B("¿Dónde vives?", "Los interrogativos llevan tilde."),
  M("¿Donde vives?", "Se escribe «¿Dónde vives?»: el interrogativo lleva tilde."),
  B("¿Cuánto cuesta?", "Los interrogativos llevan tilde."),
  M("¿Cuanto cuesta?", "Se escribe «¿Cuánto cuesta?»: el interrogativo lleva tilde."),
  B("¿Quién es?", "Los interrogativos llevan tilde."),
  M("¿Quien es?", "Se escribe «¿Quién es?»: el interrogativo lleva tilde."),
  B("¡Qué frío!", "Los exclamativos también llevan tilde."),
  M("¡Que frío!", "Se escribe «¡Qué frío!»: el exclamativo lleva tilde."),
  B("Pregúntale quién vino", "Pregunta indirecta: «quién» lleva tilde."),
  M("Pregúntale quien vino", "Se escribe «quién vino»: es una pregunta indirecta."),
  B("Como pan", "«como» (del verbo comer) no lleva tilde."),
  M("Cómo pan", "Se escribe «Como pan»: aquí es el verbo comer, sin tilde."),
  B("Lo que quieras", "«que» relativo no lleva tilde."),
  M("Lo qué quieras", "Se escribe «lo que»: el relativo no lleva tilde."),
  B("Cuando llegues, avisa", "«cuando» no interrogativo: sin tilde."),
  M("Cuándo llegues, avisa", "Se escribe «Cuando llegues»: no es pregunta, sin tilde."),
  B("Él mismo lo hizo", "«él» pronombre personal lleva tilde."),
  B("Ven aquí", "Aguda acabada en vocal: lleva tilde."),
  M("Ven aqui", "Se escribe «aquí»: aguda acabada en vocal, lleva tilde."),
  B("Lo hizo así", "Aguda acabada en vocal: lleva tilde."),
  M("Lo hizo asi", "Se escribe «así»: aguda acabada en vocal, lleva tilde."),
  B("Solo quiero agua", "Desde 2010 «solo» se escribe, por norma general, sin tilde."),
];

// ─── Utilidades ───────────────────────────────────────────────────────────
// Generador pseudoaleatorio con semilla (mulberry32)
function crearRng(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function semillaDiaria(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// Fisher-Yates
function barajar<T>(lista: T[], rng: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Mazo con dificultad escalonada: primero agudas/llanas, luego hiatos y
// monosílabos, y a partir de ahí se mezclan con las diacríticas
function construirMazo(rng: () => number): Entrada[] {
  const p1 = barajar(NIVEL_1, rng);
  const p2 = barajar(NIVEL_2, rng);
  const p3 = barajar(NIVEL_3, rng);
  const total = p1.length + p2.length + p3.length;
  const mazo: Entrada[] = [];
  for (let i = 0; i < total; i++) {
    let orden: Entrada[][];
    if (i < 8) orden = [p1, p2, p3];
    else if (i < 18) orden = i % 2 === 0 ? [p2, p1, p3] : [p1, p2, p3];
    else orden = i % 3 === 0 ? [p2, p3, p1] : [p3, p2, p1];
    const pila = orden.find((p) => p.length > 0);
    const carta = pila?.pop();
    if (carta) mazo.push(carta);
  }
  return mazo;
}

function multiplicadorDe(racha: number): number {
  if (racha >= 10) return 3;
  if (racha >= 5) return 2;
  return 1;
}

// ─── Componente ───────────────────────────────────────────────────────────
export default function JuegoTildeVeloz() {
  const [fase, setFase] = useState<Fase>("inicio");
  const [carta, setCarta] = useState<Entrada | null>(null);
  const [turno, setTurno] = useState(0);
  const [restanteMs, setRestanteMs] = useState(DURACION_MS);
  const [marcador, setMarcador] = useState<Marcador>(MARCADOR_VACIO);
  const [flash, setFlash] = useState<Flash>(null);
  const [dx, setDx] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [salida, setSalida] = useState<"izq" | "der" | null>(null);
  const [score, setScore] = useState(0);
  const [mejor, setMejor] = useState(0);
  const [nuevoRecord, setNuevoRecord] = useState(false);
  const [fallidas, setFallidas] = useState<Fallo[]>([]);
  const [diario, setDiario] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const faseRef = useRef<Fase>("inicio");
  const mazoRef = useRef<Entrada[]>([]);
  const idxRef = useRef(0);
  const finRef = useRef(0);
  const rafRef = useRef(0);
  const bloqueoRef = useRef(false);
  const marcadorRef = useRef<Marcador>(MARCADOR_VACIO);
  const fallidasRef = useRef<Fallo[]>([]);
  const mejorRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const arrastreRef = useRef<{ x: number; activo: boolean }>({ x: 0, activo: false });

  // Cargar récord guardado
  useEffect(() => {
    try {
      const guardado = Number(localStorage.getItem(CLAVE_RECORD) ?? "0");
      if (Number.isFinite(guardado) && guardado > 0) {
        mejorRef.current = Math.floor(guardado);
        setMejor(mejorRef.current);
      }
    } catch {
      // localStorage no disponible
    }
  }, []);

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      cancelAnimationFrame(rafRef.current);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const programar = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const terminar = useCallback(() => {
    if (faseRef.current !== "jugando") return;
    faseRef.current = "fin";
    cancelAnimationFrame(rafRef.current);
    const final = Math.floor(marcadorRef.current.puntos);
    const esRecord = final > mejorRef.current;
    if (esRecord) {
      mejorRef.current = final;
      try {
        localStorage.setItem(CLAVE_RECORD, String(final));
      } catch {
        // localStorage no disponible
      }
    }
    setScore(final);
    setMejor(mejorRef.current);
    setNuevoRecord(esRecord);
    setFallidas([...fallidasRef.current]);
    setRestanteMs(0);
    setDx(0);
    setSalida(null);
    setFase("fin");
  }, []);

  // Reloj con requestAnimationFrame
  useEffect(() => {
    if (fase !== "jugando") return;
    const bucle = () => {
      const r = finRef.current - performance.now();
      if (r <= 0) {
        terminar();
        return;
      }
      setRestanteMs(r);
      rafRef.current = requestAnimationFrame(bucle);
    };
    rafRef.current = requestAnimationFrame(bucle);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fase, terminar]);

  const empezar = useCallback(
    (modoDiario: boolean) => {
      const semilla = modoDiario ? semillaDiaria() : Math.floor(Math.random() * 2147483647);
      mazoRef.current = construirMazo(crearRng(semilla));
      idxRef.current = 0;
      marcadorRef.current = { ...MARCADOR_VACIO };
      fallidasRef.current = [];
      bloqueoRef.current = false;
      finRef.current = performance.now() + DURACION_MS;
      faseRef.current = "jugando";
      setDiario(modoDiario);
      setMarcador({ ...MARCADOR_VACIO });
      setFallidas([]);
      setCarta(mazoRef.current[0] ?? null);
      setTurno(0);
      setRestanteMs(DURACION_MS);
      setDx(0);
      setSalida(null);
      setFlash(null);
      setScore(0);
      setNuevoRecord(false);
      setShowLeaderboard(false);
      setFase("jugando");
    },
    []
  );

  const responder = useCallback(
    (diceBien: boolean) => {
      if (faseRef.current !== "jugando" || bloqueoRef.current) return;
      const entrada = mazoRef.current[idxRef.current];
      if (!entrada) return;
      bloqueoRef.current = true;

      const acierto = entrada.ok === diceBien;
      const m = { ...marcadorRef.current };
      if (acierto) {
        m.racha += 1;
        const mult = multiplicadorDe(m.racha);
        m.puntos += mult;
        m.aciertos += 1;
        setFlash({ tipo: "ok", texto: `+${mult}`, id: Date.now() });
      } else {
        m.racha = 0;
        m.fallos += 1;
        finRef.current -= PENALIZACION_MS;
        fallidasRef.current.push({ entrada, dijoBien: diceBien });
        setFlash({ tipo: "ko", texto: "−2 s", id: Date.now() });
      }
      marcadorRef.current = m;
      setMarcador(m);
      setSalida(diceBien ? "der" : "izq");

      programar(() => {
        if (faseRef.current !== "jugando") return;
        idxRef.current += 1;
        if (idxRef.current >= mazoRef.current.length) {
          // Si se agota el mazo, se vuelve a barajar
          mazoRef.current = construirMazo(crearRng(Math.floor(Math.random() * 2147483647)));
          idxRef.current = 0;
        }
        setCarta(mazoRef.current[idxRef.current] ?? null);
        setTurno((t) => t + 1);
        setDx(0);
        setSalida(null);
        bloqueoRef.current = false;
      }, 170);
      programar(() => setFlash(null), 600);
    },
    [programar]
  );

  // Teclado: flechas izquierda/derecha
  useEffect(() => {
    if (fase !== "jugando") return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        responder(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        responder(false);
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [fase, responder]);

  // Gestos con pointer events (ratón y táctil por igual)
  const alBajar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (faseRef.current !== "jugando" || bloqueoRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastreRef.current = { x: e.clientX, activo: true };
    setArrastrando(true);
  };

  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastreRef.current.activo) return;
    setDx(e.clientX - arrastreRef.current.x);
  };

  const alSoltar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastreRef.current.activo) return;
    arrastreRef.current.activo = false;
    setArrastrando(false);
    const d = e.clientX - arrastreRef.current.x;
    if (Math.abs(d) >= UMBRAL_PX) {
      responder(d > 0);
    } else if (Math.abs(d) < 8) {
      // Toque: mitad derecha = bien escrita, mitad izquierda = fallo
      const rect = e.currentTarget.getBoundingClientRect();
      responder(e.clientX > rect.left + rect.width / 2);
    } else {
      setDx(0);
    }
  };

  const alCancelar = () => {
    arrastreRef.current.activo = false;
    setArrastrando(false);
    setDx(0);
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  const segundos = (restanteMs / 1000).toFixed(1);
  const porcentaje = Math.max(0, Math.min(100, (restanteMs / DURACION_MS) * 100));
  const mult = multiplicadorDe(marcador.racha);

  let transformCarta = `translateX(${dx}px) rotate(${dx / 14}deg)`;
  if (salida === "der") transformCarta = "translateX(140%) rotate(20deg)";
  if (salida === "izq") transformCarta = "translateX(-140%) rotate(-20deg)";

  const inclinacion = salida ?? (dx > 20 ? "der" : dx < -20 ? "izq" : null);

  const textoCompartir =
    score > 0
      ? `✍️ He hecho ${score} aciertos en Tilde Veloz${diario ? " (reto del día)" : ""}. ¿Sabes de verdad dónde va la tilde? A ver si me superas en 45 segundos 👇`
      : "✍️ Tilde Veloz: ¿sabes de verdad dónde va la tilde? Demuéstralo en 45 segundos 👇";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 select-none">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 p-1 shadow-xl">
        <div className="rounded-[1.35rem] bg-white/95 p-4 sm:p-6">
          {/* ─── Pantalla de inicio ─── */}
          {fase === "inicio" && (
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl" aria-hidden="true">
                ✍️
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Tilde Veloz</h1>
              <p className="mt-2 text-slate-600">
                ¿Sabes de verdad dónde va la tilde? Demuéstralo en 45 segundos.
              </p>
              <ul className="mt-5 w-full space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-700">
                <li>👉 Desliza o toca a la <strong>derecha</strong> si está <strong>bien escrita</strong>.</li>
                <li>👈 Desliza o toca a la <strong>izquierda</strong> si tiene <strong>un fallo de tilde</strong>.</li>
                <li>🔥 Encadena aciertos: x2 a partir de 5 seguidos, x3 a partir de 10.</li>
                <li>⏱️ Cada fallo te quita 2 segundos.</li>
                <li>⌨️ En ordenador también puedes usar las flechas ← →.</li>
              </ul>
              {mejor > 0 && (
                <p className="mt-4 text-sm text-slate-600">
                  Tu récord: <strong className="text-indigo-600">{mejor} aciertos</strong>
                </p>
              )}
              <button
                type="button"
                onClick={() => empezar(false)}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition active:scale-95"
              >
                ▶️ Empezar
              </button>
              <button
                type="button"
                onClick={() => empezar(true)}
                className="mt-3 w-full rounded-2xl border-2 border-indigo-200 bg-white px-6 py-3 font-semibold text-indigo-700 transition active:scale-95"
              >
                📅 Reto del día (mismas palabras para todos)
              </button>
            </div>
          )}

          {/* ─── Partida ─── */}
          {fase === "jugando" && (
            <div className="flex flex-col items-center">
              <div className="flex w-full items-center justify-between text-sm font-semibold text-slate-700">
                <span aria-label={`Puntuación: ${marcador.puntos}`}>⭐ {marcador.puntos}</span>
                <span
                  className={`rounded-full px-3 py-1 text-white ${
                    mult === 3 ? "bg-violet-600" : mult === 2 ? "bg-indigo-500" : "bg-slate-400"
                  }`}
                  aria-label={`Multiplicador x${mult}, racha de ${marcador.racha}`}
                >
                  x{mult} · 🔥{marcador.racha}
                </span>
                <span
                  className={`tabular-nums ${restanteMs < 10000 ? "text-rose-600" : ""}`}
                  aria-label={`Quedan ${segundos} segundos`}
                >
                  ⏱️ {segundos}s
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    restanteMs < 10000 ? "bg-rose-500" : "bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500"
                  }`}
                  style={{ width: `${porcentaje}%` }}
                />
              </div>

              {/* Tarjeta */}
              <div className="relative mt-6 h-64 w-full">
                {flash && (
                  <div
                    key={flash.id}
                    className={`pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 animate-bounce rounded-full px-4 py-1 text-lg font-extrabold text-white shadow ${
                      flash.tipo === "ok" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    aria-hidden="true"
                  >
                    {flash.texto}
                  </div>
                )}
                {carta && (
                  <div
                    key={turno}
                    role="group"
                    aria-label={`Palabra: ${carta.t}. ¿Está bien escrita?`}
                    onPointerDown={alBajar}
                    onPointerMove={alMover}
                    onPointerUp={alSoltar}
                    onPointerCancel={alCancelar}
                    className={`absolute inset-0 flex touch-none cursor-grab flex-col items-center justify-center rounded-3xl border-4 bg-white p-6 shadow-lg active:cursor-grabbing ${
                      inclinacion === "der"
                        ? "border-emerald-400"
                        : inclinacion === "izq"
                        ? "border-rose-400"
                        : "border-indigo-100"
                    }`}
                    style={{
                      transform: transformCarta,
                      transition: arrastrando ? "none" : "transform 170ms ease-out, opacity 170ms ease-out",
                      opacity: salida ? 0 : 1,
                    }}
                  >
                    <span className="break-words text-center text-4xl font-extrabold text-slate-900 sm:text-5xl">
                      {carta.t}
                    </span>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-between px-5 text-xs font-semibold">
                      <span className="text-rose-500">◀ Fallo</span>
                      <span className="text-emerald-600">Bien ▶</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones alternativos */}
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => responder(false)}
                  aria-label="Tiene un fallo de tilde"
                  className="rounded-2xl bg-rose-500 px-4 py-5 text-lg font-bold text-white shadow-md transition active:scale-95"
                >
                  ✗ Tiene fallo
                </button>
                <button
                  type="button"
                  onClick={() => responder(true)}
                  aria-label="Está bien escrita"
                  className="rounded-2xl bg-emerald-500 px-4 py-5 text-lg font-bold text-white shadow-md transition active:scale-95"
                >
                  ✓ Bien escrita
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                ✅ {marcador.aciertos} aciertos · ❌ {marcador.fallos} fallos
                {diario ? " · 📅 Reto del día" : ""}
              </p>
            </div>
          )}

          {/* ─── Fin de partida ─── */}
          {fase === "fin" && (
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl" aria-hidden="true">
                {score >= 30 ? "🏆" : score >= 15 ? "🎉" : "✍️"}
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">¡Se acabó el tiempo!</h2>
              {diario && <p className="text-sm font-semibold text-indigo-600">📅 Reto del día</p>}

              <div className="mt-4 w-full rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 p-5 text-white">
                <p className="text-sm uppercase tracking-wide opacity-90">Tu puntuación</p>
                <p className="text-6xl font-black tabular-nums">{score}</p>
                <p className="text-sm opacity-90">aciertos (con multiplicador de racha)</p>
                <p className="mt-2 text-xs opacity-90">
                  ✅ {marcador.aciertos} respuestas correctas · ❌ {marcador.fallos} fallos
                </p>
              </div>

              <p className="mt-3 text-slate-700">
                {nuevoRecord && score > 0 ? (
                  <strong className="text-emerald-600">🎊 ¡Nuevo récord personal!</strong>
                ) : (
                  <>
                    Tu récord: <strong className="text-indigo-600">{mejor} aciertos</strong>
                  </>
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {score >= 30
                  ? "Nivel académico: pocos llegan a 30. ¡Reta a tu profe de Lengua!"
                  : score >= 15
                  ? "¡Muy bien! ¿Llegarás a 30 en la próxima?"
                  : "Las tildes tienen truco… ¡repasa las reglas y vuelve a intentarlo!"}
              </p>

              <div className="mt-5 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => empezar(diario)}
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition active:scale-95"
                >
                  🔄 Jugar otra vez
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaderboard(true)}
                  disabled={score <= 0}
                  aria-label={score > 0 ? "Ver ranking" : "Consigue al menos un acierto para entrar en el ranking"}
                  className="w-full rounded-2xl border-2 border-indigo-200 bg-white px-6 py-3 font-semibold text-indigo-700 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🏆 Ver ranking
                </button>
                {score <= 0 && (
                  <p className="text-xs text-slate-500">Consigue al menos un acierto para entrar en el ranking.</p>
                )}
              </div>

              <div className="mt-5 w-full">
                <ShareButtons url={URL_JUEGO} text={textoCompartir} />
              </div>

              {/* Palabras falladas con la regla */}
              {fallidas.length > 0 ? (
                <div className="mt-6 w-full text-left">
                  <h3 className="mb-2 text-lg font-bold text-slate-900">📚 Las que se te escaparon</h3>
                  <ul className="space-y-2">
                    {fallidas.map((f, i) => (
                      <li key={`${f.entrada.t}-${i}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              f.entrada.ok ? "text-emerald-700" : "text-rose-600 line-through"
                            }`}
                          >
                            {f.entrada.t}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${
                              f.entrada.ok ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          >
                            {f.entrada.ok ? "Estaba bien" : "Tenía fallo"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{f.entrada.r}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                score > 0 && (
                  <p className="mt-6 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                    🥇 ¡Cero fallos! Ortografía impecable.
                  </p>
                )
              )}

              <Link href="/juegos" className="mt-6 text-sm font-semibold text-indigo-600 underline">
                ← Más juegos
              </Link>
            </div>
          )}
        </div>
      </div>

      {showLeaderboard && (
        <LeaderboardModal
          game="tilde-veloz"
          score={score}
          unit="aciertos"
          scoreOrder="high"
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
