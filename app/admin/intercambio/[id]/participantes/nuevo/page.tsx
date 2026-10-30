"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Familia = {
  id: string;
  nombre: string;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const MAX_POR_LOTE = 50;
const MAX_LARGO_NOMBRE = 100;

export default function NuevoParticipantePage({ params }: Props) {
  const searchParams = useSearchParams();

  const [intercambioId, setIntercambioId] = useState("");
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [existentes, setExistentes] = useState<string[]>([]);
  const [familiaId, setFamiliaId] = useState(
    searchParams.get("familia") ?? ""
  );

  const [texto, setTexto] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    params.then(({ id }) => {
      if (activo) {
        setIntercambioId(id);
      }
    });

    return () => {
      activo = false;
    };
  }, [params]);

  useEffect(() => {
    if (!intercambioId) return;

    async function cargarFamilias() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("familias")
        .select("id, nombre, participantes ( nombre )")
        .eq("intercambio_id", intercambioId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setError("No fue posible cargar las familias.");
        setCargando(false);
        return;
      }

      const lista = data ?? [];

      setFamilias(
        lista.map((f) => ({ id: f.id, nombre: f.nombre }))
      );

      // Nombres que ya existen en todo el intercambio
      setExistentes(
        lista.flatMap((f) =>
          (f.participantes ?? []).map((p) => p.nombre)
        )
      );

      setFamiliaId((actual) =>
        actual || lista.length === 0 ? actual : lista[0].id
      );

      setCargando(false);
    }

    cargarFamilias();
  }, [intercambioId]);

  // Un nombre por línea (también acepta comas o punto y coma)
  const nombres = useMemo(() => {
    const vistos = new Set<string>();
    const resultado: string[] = [];

    for (const bruto of texto.split(/[\n,;]+/)) {
      const nombre = bruto.trim().replace(/\s+/g, " ");
      if (!nombre) continue;

      const clave = nombre.toLowerCase();
      if (vistos.has(clave)) continue;

      vistos.add(clave);
      resultado.push(nombre);
    }

    return resultado;
  }, [texto]);

  const repetidosEnLista = useMemo(() => {
    const total = texto
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean).length;

    return total - nombres.length;
  }, [texto, nombres]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!familiaId) {
      setError("Selecciona una familia.");
      return;
    }

    if (nombres.length === 0) {
      setError("Escribe al menos un nombre.");
      return;
    }

    if (nombres.length > MAX_POR_LOTE) {
      setError(
        `Puedes agregar hasta ${MAX_POR_LOTE} personas a la vez.`
      );
      return;
    }

    const muyLargo = nombres.find(
      (n) => n.length > MAX_LARGO_NOMBRE
    );

    if (muyLargo) {
      setError(
        `Un nombre es demasiado largo (máximo ${MAX_LARGO_NOMBRE} caracteres): "${muyLargo.slice(0, 30)}…"`
      );
      return;
    }

    // Nombres repetidos con personas que ya están en el intercambio
    const yaExisten = new Set(
      existentes.map((n) => n.trim().toLowerCase())
    );

    const duplicados = nombres.filter((n) =>
      yaExisten.has(n.toLowerCase())
    );

    if (duplicados.length > 0) {
      setError(
        `Ya existe en este intercambio: ${duplicados.join(", ")}. Quítalos o cámbialos (por ejemplo, agrega la inicial del apellido).`
      );
      return;
    }

    setGuardando(true);

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("participantes")
      .insert(
        nombres.map((nombre) => ({
          familia_id: familiaId,
          nombre,
        }))
      );

    if (insertError) {
      console.error(insertError);

      setError(
        insertError.message ||
          "No fue posible crear los participantes."
      );

      setGuardando(false);
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
            <UserPlus className="h-7 w-7 text-[#a9684c]" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
            Nuevos participantes
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Agrega personas
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#76685f]">
            Escribe un nombre por línea y se agregarán todos a la
            familia que elijas.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* FAMILIA */}
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
                  onChange={(event) => setFamiliaId(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#dfcfc2] bg-white py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
                >
                  <option value="">
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

            {/* NOMBRES */}
            <div>
              <label
                htmlFor="nombres"
                className="mb-2 block text-sm font-semibold"
              >
                Nombres
              </label>

              <textarea
                id="nombres"
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                placeholder={"María\nCarlos\nAna"}
                rows={7}
                autoFocus
                className="w-full resize-y rounded-2xl border border-[#dfcfc2] px-4 py-3.5 text-sm leading-6 outline-none placeholder:text-[#b4a69d] focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
              />

              <p className="mt-2 text-xs text-[#94857b]">
                Un nombre por línea. También puedes separarlos con
                comas.
              </p>

              {nombres.length > 0 && (
                <div className="mt-4 rounded-2xl bg-[#fffaf5] p-4">
                  <p className="text-sm font-semibold">
                    {nombres.length}{" "}
                    {nombres.length === 1
                      ? "persona se agregará"
                      : "personas se agregarán"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {nombres.map((nombre) => (
                      <span
                        key={nombre}
                        className="rounded-full bg-[#f7e5d5] px-3 py-1 text-xs font-medium text-[#8d5b43]"
                      >
                        {nombre}
                      </span>
                    ))}
                  </div>

                  {repetidosEnLista > 0 && (
                    <p className="mt-3 text-xs text-[#94857b]">
                      Se ignoraron {repetidosEnLista}{" "}
                      {repetidosEnLista === 1
                        ? "nombre repetido"
                        : "nombres repetidos"}{" "}
                      en tu lista.
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                guardando ||
                familias.length === 0 ||
                nombres.length === 0
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-4 font-semibold text-white transition hover:bg-[#91583f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {nombres.length > 1
                    ? `Agregar ${nombres.length} participantes`
                    : "Agregar participante"}
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