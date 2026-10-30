"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NuevoIntercambioPage() {
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setGuardando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Tu sesión ha expirado. Inicia sesión nuevamente.");
        return;
      }

      const { data, error } = await supabase
        .from("intercambios")
        .insert({
          admin_id: user.id,
          nombre: nombre.trim(),
          fecha: fecha || null,
          presupuesto: presupuesto ? Number(presupuesto) : null,
          descripcion: descripcion.trim() || null,
          estado: "borrador",
        })
        .select("id")
        .single();

      if (error) {
        console.error(error);
        setError("No se pudo crear el intercambio.");
        return;
      }

      window.location.href = `/admin/intercambio/${data.id}`;
    } catch (error) {
      console.error(error);
      setError("Ocurrió un error inesperado.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] px-5 py-8 text-[#3d3028] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <div className="mt-8 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7e5d5]">
            <Gift className="h-7 w-7 text-[#a9684c]" />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
              Nuevo intercambio
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Crea tu intercambio 🎁
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#76685f]">
              Primero vamos a definir los datos básicos. Después podrás
              agregar las familias y participantes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* NOMBRE */}
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold"
              >
                Nombre del intercambio
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Intercambio Familiar 2026"
                required
                maxLength={100}
                className="w-full rounded-2xl border border-[#dfcfc2] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b4a69d] focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
              />
            </div>

            {/* FECHA */}
            <div>
              <label
                htmlFor="fecha"
                className="mb-2 block text-sm font-semibold"
              >
                Fecha del intercambio
              </label>

              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                className="w-full rounded-2xl border border-[#dfcfc2] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
              />

              <p className="mt-2 text-xs text-[#94857b]">
                Puedes dejarla vacía y agregarla después.
              </p>
            </div>

            {/* PRESUPUESTO */}
            <div>
              <label
                htmlFor="presupuesto"
                className="mb-2 block text-sm font-semibold"
              >
                Presupuesto por persona
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#94857b]">
                  $
                </span>

                <input
                  id="presupuesto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={presupuesto}
                  onChange={(event) => setPresupuesto(event.target.value)}
                  placeholder="500"
                  className="w-full rounded-2xl border border-[#dfcfc2] bg-white py-3.5 pl-8 pr-4 text-sm outline-none transition placeholder:text-[#b4a69d] focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
                />
              </div>

              <p className="mt-2 text-xs text-[#94857b]">
                Opcional. Puedes modificarlo más adelante.
              </p>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label
                htmlFor="descripcion"
                className="mb-2 block text-sm font-semibold"
              >
                Descripción
                <span className="ml-2 font-normal text-[#94857b]">
                  Opcional
                </span>
              </label>

              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Ej. Este año nos reuniremos en casa de la abuelita..."
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-2xl border border-[#dfcfc2] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#b4a69d] focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
              />

              <p className="mt-2 text-xs text-[#94857b]">
                {descripcion.length}/500
              </p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-4 font-semibold text-white transition hover:bg-[#91583f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando intercambio...
                </>
              ) : (
                <>
                  Crear intercambio
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