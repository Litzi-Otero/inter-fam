"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revelarPapelito } from "./actions";

type Props = {
  token: string;
  numero: number;
  disponibles: number;
};

// Pequeñas inclinaciones para que la pila parezca papelitos sueltos
const INCLINACIONES = [-4, 3, -2, 5, -3, 2, -5, 4];

export default function RevelarPapelito({
  token,
  numero,
  disponibles,
}: Props) {
  const router = useRouter();
  const [pendiente, startTransition] = useTransition();
  const [elegido, setElegido] = useState<number | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [error, setError] = useState("");

  function elegir(posicion: number) {
    if (pendiente) return;

    setError("");
    setElegido(posicion);

    startTransition(async () => {
      const resultado = await revelarPapelito(token, numero, posicion);

      if (resultado.error || !resultado.nombre) {
        setError(resultado.error ?? "No se pudo abrir el papelito.");
        setElegido(null);
        return;
      }

      setNombre(resultado.nombre);
    });
  }

  function cerrar() {
    setNombre(null);
    setElegido(null);
    router.refresh();
  }

  if (disponibles < 1) {
    return (
      <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No hay papelitos disponibles. Avisa al administrador.
      </p>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm text-[#5c4b40]">
        Elige un papelito de la pila ({disponibles}{" "}
        {disponibles === 1 ? "disponible" : "disponibles"}).
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: disponibles }, (_, i) => {
          const posicion = i + 1;
          const activo = elegido === posicion;

          return (
            <button
              key={posicion}
              type="button"
              onClick={() => elegir(posicion)}
              disabled={pendiente}
              aria-label={`Papelito ${posicion}`}
              style={{
                transform: `rotate(${INCLINACIONES[i % INCLINACIONES.length]}deg)${
                  activo ? " scale(1.08)" : ""
                }`,
              }}
              className={`relative flex aspect-[4/3] items-center justify-center rounded-lg border text-xl shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:cursor-not-allowed ${
                activo
                  ? "border-[#a9684c] bg-[#f7e5d5]"
                  : "border-[#e6d3c3] bg-[#fdf1e4] disabled:opacity-60"
              }`}
            >
              {/* doblez del papel */}
              <span className="pointer-events-none absolute inset-x-2 top-1/2 h-px bg-[#e6d3c3]" />
              <span className="relative">{activo ? "✨" : "🎁"}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {nombre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d3028]/60 px-5">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e5d5] text-3xl">
              🎁
            </div>

            <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
              Papelito {numero}
            </p>

            <p className="mt-3 text-lg text-[#76685f]">
              ✨ Este papelito es para
            </p>

            <p className="mt-1 text-3xl font-bold">{nombre}</p>

            <button
              type="button"
              onClick={cerrar}
              className="mt-8 w-full rounded-2xl bg-[#a9684c] px-5 py-4 font-semibold text-white transition hover:bg-[#91583f]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}