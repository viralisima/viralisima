"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [topText, setTopText] = useState("CUANDO TU CRUSH");
  const [bottomText, setBottomText] = useState("TE DEJA EN VISTO");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fontSize, setFontSize] = useState(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;

    // Fondo
    if (img) {
      // Ajustar imagen manteniendo proporción (cover)
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    } else {
      // Placeholder
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#d946ef");
      gradient.addColorStop(1, "#fb923c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sube una foto 👇", canvas.width / 2, canvas.height / 2);
    }

    // Texto (Impact blanco con borde negro, estilo meme clásico)
    ctx.font = `bold ${fontSize}px Impact, 'Arial Black', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = Math.max(3, fontSize / 15);
    ctx.textBaseline = "top";

    const drawWrappedText = (text: string, y: number, alignBottom = false) => {
      const maxWidth = canvas.width - 40;
      const words = text.toUpperCase().split(" ");
      const lines: string[] = [];
      let current = "";
      for (const w of words) {
        const test = current ? `${current} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = w;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);

      const lineHeight = fontSize * 1.1;
      lines.forEach((line, i) => {
        const yy = alignBottom
          ? y - (lines.length - 1 - i) * lineHeight
          : y + i * lineHeight;
        ctx.strokeText(line, canvas.width / 2, yy);
        ctx.fillText(line, canvas.width / 2, yy);
      });
    };

    ctx.textBaseline = "top";
    drawWrappedText(topText, 20);
    ctx.textBaseline = "bottom";
    drawWrappedText(bottomText, canvas.height - 20, true);

    // Marca de agua
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 2;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.strokeText("viralisima.com", canvas.width - 12, canvas.height - 6);
    ctx.fillText("viralisima.com", canvas.width - 12, canvas.height - 6);
  }, [img, topText, bottomText, fontSize]);

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
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>

        <div className="text-center my-6">
          <div className="text-5xl mb-2">🎨</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Generador de Memes
          </h1>
          <p className="text-slate-600 mt-2">
            Sube tu foto, ponle texto, descarga y comparte.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="bg-slate-100 rounded-3xl p-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full max-w-md rounded-2xl shadow-lg"
            />
          </div>

          {/* Controles */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                📸 Imagen
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-500 file:text-white hover:file:bg-fuchsia-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ⬆️ Texto de arriba
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-medium"
                placeholder="Cuando tu crush..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ⬇️ Texto de abajo
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-fuchsia-500 focus:outline-none font-medium"
                placeholder="...te deja en visto"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                🔤 Tamaño del texto ({fontSize}px)
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

            <button
              onClick={download}
              className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform shadow-lg"
            >
              📥 Descargar Meme
            </button>

            <div className="text-xs text-slate-500 text-center">
              Ideal 1:1 (cuadrado). Se guarda como PNG 800×800 con marca Viralísima.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
