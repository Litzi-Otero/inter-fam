"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function NuevaFamiliaPage({ params }: Props) {
  const [intercambioId, setIntercambioId] = useState("");
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Obtener el ID de la URL
  useState(() => {
    params.then((value) => {
      setIntercambioId(value.id);
    });
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!intercambioId) {
      setError("No se encontró el intercambio.");
      return;
    }

    if (!nombre.trim()) {
      setError("Escribe el nombre de la familia.");
      return;
    }

    setGuardando(true);
    setError("");

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("familias")
      .insert({
        intercambio_id: intercambioId,
        nombre: nombre.trim(),
      });

    if (insertError) {
      console.error(insertError);

      setError(
        insertError.message ||
          "No fue posible crear la familia."
      );

      setGuardando(false);
      return;
    }

    window.location.href = `/admin/intercambio/${intercambioId}/familias`;
  }

  if (!intercambioId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5]">
        <Loader2 className="h-6 w-6 animate-spin text-[#a9684c]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-5 py-8 text-[#3d3028] sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link
          href={`/admin/intercambio/${intercambioId}/familias`}
          className="inline-flex items-center gap-2 text-sm text-[#76685f] hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a familias
        </Link>

        <div className="mt-8 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7e5d5]">
            <Home className="h-7 w-7 text-[#a9684c]" />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Nueva familia
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#76685f]">
            Agrega una familia que participará en este intercambio.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="nombre"
              className="mb-2 block text-sm font-semibold"
            >
              Nombre de la familia
            </label>

            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej. Familia Otero"
              maxLength={100}
              autoFocus
              className="w-full rounded-2xl border border-[#dfcfc2] px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b4a69d] focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
            />

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-4 font-semibold text-white transition hover:bg-[#91583f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Crear familia
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}