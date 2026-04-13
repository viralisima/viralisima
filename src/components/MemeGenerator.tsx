"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const FONTS = [
  { id: "impact", label: "Impact (clásico meme)", css: `Impact, 'Arial Black', sans-serif` },
  { id: "sans", label: "Sans moderno", css: `'Helvetica Neue', Arial, sans-serif` },
  { id: "serif", label: "Serif elegante", css: `Georgia, 'Times New Roman', serif` },
  { id: "comic", label: "Comic divertido", css: `'Comic Sans MS', 'Chalkboard SE', cursive` },
  { id: "mono", label: "Mono tech", css: `'Courier New', monospace` },
  { id: "cursive", label: "Cursiva suave", css: `'Brush Script MT', cursive` },
];

const COLORS = [
  { id: "white", hex: "#ffffff", name: "Blanco" },
  { id: "yellow", hex: "#ffeb3b", name: "Amarillo" },
  { id: "red", hex: "#ef4444", name: "Rojo" },
  { id: "pink", hex: "#ec4899", name: "Rosa" },
  { id: "blue", hex: "#3b82f6", name: "Azul" },
  { id: "green", hex: "#22c55e", name: "Verde" },
  { id: "black", hex: "#000000", name: "Negro" },
  { id: "cyan", hex: "#06b6d4", name: "Cyan" },
];

const STROKES = [
  { id: "black", hex: "#000000", name: "Negro" },
  { id: "white", hex: "#ffffff", name: "Blanco" },
  { id: "red", hex: "#dc2626", name: "Rojo" },
  { id: "none", hex: "transparent", name: "Sin borde" },
];

export default function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [topText, setTopText] = useState("CUANDO TU CRUSH");
  const [bottomText, setBottomText] = useState("TE DEJA EN VISTO");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fontSize, setFontSize] = useState(60);
  const [fontId, setFontId] = useState("impact");
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;

    if (img) {
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    } else {
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, "#d946ef");
      g.addColorStop(1, "#fb923c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sube una foto 👇", canvas.width / 2, canvas.height / 2);
    }

    const fontCss = FONTS.find((f) => f.id === fontId)?.css ?? FONTS[0].css;
    ctx.font = `bold ${fontSize}px ${fontCss}`;
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeColor === "transparent" ? 0 : Math.max(3, fontSize / 15);
    ctx.lineJoin = "round";

    const drawWrapped = (text: string, y: number, bottom = false) => {
      const maxWidth = canvas.width - 40;
      const words = text.toUpperCase().split(" ");
      const lines: string[] = [];
      let current = "";
      for (const w of words) {
        const test = current ? `${current} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = w;
        } else current = test;
      }
      if (current) lines.push(current);
      const lh = fontSize * 1.1;
      lines.forEach((line, i) => {
        const yy = bottom ? y - (lines.length - 1 - i) * lh : y + i * lh;
        if (strokeColor !== "transparent") ctx.strokeText(line, canvas.width / 2, yy);
        ctx.fillText(line, canvas.width / 2, yy);
      });
    };

    ctx.textBaseline = "top";
    drawWrapped(topText, 20);
    ctx.textBaseline = "bottom";
    drawWrapped(bottomText, canvas.height - 20, true);

    // Marca de agua
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.strokeText("viralisima.com", canvas.width - 12, canvas.height - 6);
    ctx.fillText("viralisima.com", canvas.width - 12, canvas.height - 6);
  }, [img, topText, bottomText, fontSize, fontId, textColor, strokeColor]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = url;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "meme-viralisima.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-6">
          <div className="text-5xl mb-2">🎨</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Generador de Memes
          </h1>
          <p className="text-slate-600 mt-2">
            Sube tu foto, elige fuente y color, descarga y comparte.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-100 rounded-3xl p-4 flex items-center justify-center order-2 lg:order-1">
            <canvas ref={canvasRef} className="w-full max-w-md rounded-2xl shadow-lg" />
          </div>

          <div className="space-y-4 order-1 lg:order-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">📸 Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500 file:text-white hover:file:bg-fuchsia-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">⬆️ Texto de arriba</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">⬇️ Texto de abajo</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                🔤 Tamaño ({fontSize}px)
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(+e.target.value)}
                className="w-full accent-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">✍️ Fuente</label>
              <select
                value={fontId}
                onChange={(e) => setFontId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-medium bg-white"
              >
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">🎨 Color del texto</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setTextColor(c.hex)}
                    title={c.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                      textColor === c.hex ? "border-fuchsia-500 scale-110 ring-2 ring-fuchsia-300" : "border-slate-200"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-slate-200"
                  title="Color personalizado"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">🖋️ Borde</label>
              <div className="flex flex-wrap gap-2">
                {STROKES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStrokeColor(s.hex)}
                    title={s.name}
                    className={`px-4 h-10 rounded-full border-2 text-sm font-semibold transition-all ${
                      strokeColor === s.hex
                        ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={download}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              📥 Descargar Meme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
