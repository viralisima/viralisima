import type { PointerEvent as RPointerEvent } from "react";

// Botón de "mantener pulsado" fiable en móvil: captura el puntero para que el
// hold NO se pierda aunque el dedo se deslice fuera del botón (el problema típico
// de girar/propulsar/disparar a la vez). onUp se dispara igual con captura.
export function holdBtn(onDown: () => void, onUp: () => void) {
  return {
    onPointerDown: (e: RPointerEvent) => {
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
      onDown();
    },
    onPointerUp: () => onUp(),
    onPointerCancel: () => onUp(),
  };
}

// Botón de acción puntual (girar, soltar pieza…): dispara en cuanto se toca.
export function tapBtn(fn: () => void) {
  return {
    onPointerDown: (e: RPointerEvent) => {
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
      fn();
    },
  };
}

// Clase base para los botones táctiles (grandes, sin selección ni scroll).
export const BTN =
  "select-none touch-none flex items-center justify-center rounded-2xl bg-white/15 " +
  "border border-white/25 active:bg-white/35 text-3xl font-black h-[72px] w-[72px]";
