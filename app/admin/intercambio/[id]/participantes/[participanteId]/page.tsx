"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  params: Promise<{
    id: string;
    participanteId: string;
  }>;
};

type Familia = {
  id: string;
  nombre: string;
};

export default function EditarParticipantePage({
  params,
}: Props) {
  const [intercambioId, setIntercambioId] = useState("");
  const [participanteId, setParticipanteId] = useState("");

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [familiaId, setFamiliaId] = useState("");

  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id, participanteId }) => {
      setIntercambioId(id);
      setParticipanteId(participanteId);
    });
  }, [params]);

  useEffect(() => {
    if (!intercambioId || !participanteId) return;

    async function cargarDatos() {
      const supabase = createClient();

      const { data: familiasData, error: familiasError } =
        await supabase
          .from("familias")
          .select("id, nombre")
          .eq("intercambio_id", intercambioId)
          .order("created_at", { ascending: true });

      if (familiasError) {
        console.error(familiasError);
        setError("No fue posible cargar las familias.");
        setCargando(false);
        return;
      }

      const { data: participante, error: participanteError } =
        await supabase
          .from("participantes")
          .select("id, nombre, familia_id, activo")
          .eq("id", participanteId)
          .single();

      if (participanteError || !participante) {
        console.error(participanteError);
        setError("No se encontró el participante.");
        setCargando(false);
        return;
      }

      setFamilias((familiasData ?? []) as Familia[]);
      setNombre(participante.nombre);
      setFamiliaId(participante.familia_id);
      setActivo(participante.activo);

      setCargando(false);
    }

    cargarDatos();
  }, [intercambioId, participanteId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!nombre.trim()) {
      setError("Escribe el nombre del participante.");
      return;
    }

    if (!familiaId) {
      setError("Selecciona una familia.");
      return;
    }

    setGuardando(true);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("participantes")
      .update({
        nombre: nombre.trim(),
        familia_id: familiaId,
        activo,
      })
      .eq("id", participanteId);

    if (updateError) {
      console.error(updateError);

      setError(
        updateError.message ||
          "No fue posible actualizar el participante."
      );

      setGuardando(false);
      return;
    }

    window.location.href = `/admin/intercambio/${intercambioId}/participantes`;
  }

  async function handleDelete() {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar a ${nombre}?`
    );

    if (!confirmado) return;

    setEliminando(true);
    setError("");

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("participantes")
      .delete()
      .eq("id", participanteId);

    if (deleteError) {
      console.error(deleteError);

      setError(
        deleteError.message ||
          "No fue posible eliminar el participante."
      );

      setEliminando(false);
      return;
    }

    window.location.href = `/admin/intercambio/${intercambioId}/participantes`;
  }

  if (cargando) {
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
          href={`/admin/intercambio/${intercambioId}/participantes`}
          className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a participantes
        </Link>

        <div className="mt-8 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7e5d5]">
            <User className="h-7 w-7 text-[#a9684c]" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
            Participante
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Editar participante
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#76685f]">
            Cada participante representa un regalo dentro del
            intercambio.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="familia"
                className="mb-2 block text-sm font-semibold"
              >
                Familia
              </label>

              <div className="relative">
                <Users className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94857b]" />

                <select
                  id="familia"
                  value={familiaId}
                  onChange={(event) =>
                    setFamiliaId(event.target.value)
                  }
                  className="w-full appearance-none rounded-2xl border border-[#dfcfc2] bg-white py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
                >
                  <option value="" disabled>
                    Selecciona una familia
                  </option>

                  {familias.map((familia) => (
                    <option key={familia.id} value={familia.id}>
                      {familia.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold"
              >
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) =>
                  setNombre(event.target.value)
                }
                maxLength={100}
                placeholder="Ej. Vane"
                className="w-full rounded-2xl border border-[#dfcfc2] px-4 py-3.5 text-sm outline-none focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
              />
            </div>

            <div className="rounded-2xl border border-[#eaded4] bg-[#fffaf5] p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    Participante activo
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#76685f]">
                    Los participantes inactivos no participarán en
                    el próximo sorteo.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(event) =>
                    setActivo(event.target.checked)
                  }
                  className="h-5 w-5 accent-[#a9684c]"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando || eliminando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-4 font-semibold text-white transition hover:bg-[#91583f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={guardando || eliminando}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-5 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {eliminando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar participante
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}