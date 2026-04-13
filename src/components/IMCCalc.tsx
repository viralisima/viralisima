"use client";

import { useState } from "react";
import Link from "next/link";

function interpret(imc: number) {
  if (imc < 18.5) return { label: "Bajo peso", color: "text-sky-600", bg: "bg-sky-50", desc: "Estás por debajo del rango saludable. Considera hablar con tu médico/a para ver si hay que ajustar la dieta." };
  if (imc < 25) return { label: "Peso saludable", color: "text-emerald-600", bg: "bg-emerald-50", desc: "¡Estás en el rango saludable! Mantén tus hábitos actuales." };
  if (imc < 30) return { label: "Sobrepeso", color: "text-amber-600", bg: "bg-amber-50", desc: "Ligeramente por encima del rango saludable. Pequeños cambios en dieta y movimiento pueden hacer una gran diferencia." };
  if (imc < 35) return { label: "Obesidad grado I", color: "text-orange-600", bg: "bg-orange-50", desc: "Se recomienda acompañamiento médico y cambios de hábitos sostenibles. Tu salud a largo plazo es lo primero." };
  if (imc < 40) return { label: "Obesidad grado II", color: "text-red-600", bg: "bg-red-50", desc: "Se recomienda valoración médica. Hay soluciones efectivas y seguras." };
  return { label: "Obesidad grado III", color: "text-red-800", bg: "bg-red-50", desc: "Consulta con un profesional de salud cuanto antes. Hay opciones para mejorar tu calidad de vida." };
}

export default function IMCCalc() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);

  const imc = weight / ((height / 100) ** 2);
  const info = interpret(imc);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-xl mx-auto px-4 pt-8 pb-16">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
          ← Viralísima
        </Link>
        <div className="text-center my-8">
          <div className="text-5xl mb-2">⚖️</div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Calculadora de IMC
          </h1>
          <p className="text-slate-600 mt-2">Mueve los deslizadores y ve tu IMC en tiempo real.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Peso: <strong>{weight} kg</strong>
            </label>
            <input
              type="range"
              min="30"
              max="200"
              step="1"
              value={weight}
              onChange={(e) => setWeight(+e.target.value)}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Altura: <strong>{height} cm</strong>
            </label>
            <input
              type="range"
              min="120"
              max="220"
              step="1"
              value={height}
              onChange={(e) => setHeight(+e.target.value)}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className={`${info.bg} rounded-3xl p-6 text-center border-2 border-slate-200`}>
            <div className="text-sm uppercase font-bold tracking-widest text-slate-600">Tu IMC</div>
            <div className={`text-7xl font-black my-2 font-mono ${info.color}`}>
              {imc.toFixed(1)}
            </div>
            <div className={`text-xl font-bold ${info.color}`}>{info.label}</div>
            <p className="text-sm text-slate-700 mt-3">{info.desc}</p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-4 text-xs text-slate-600">
            <strong>Rangos oficiales OMS:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Bajo peso: menos de 18.5</li>
              <li>• Peso saludable: 18.5 – 24.9</li>
              <li>• Sobrepeso: 25 – 29.9</li>
              <li>• Obesidad: 30 o más</li>
            </ul>
            <p className="mt-2 text-slate-500">
              El IMC es orientativo. No considera masa muscular, edad o composición corporal. Consulta siempre con tu médico/a.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
