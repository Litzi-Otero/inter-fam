import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Gift, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RevelarPapelito from "./RevelarPapelito";

type Props = {
  params: Promise<{ token: string }>;
};

type Papelito = {
  numero: number;
  revelado: boolean;
  destinatario: string | null;
};

type Datos = {
  familia: string;
  intercambio: string;
  intercambio_token: string;
  fecha: string | null;
  presupuesto: number | null;
  estado: string;
  disponibles: number;
  papelitos: Papelito[];
};

export const dynamic = "force-dynamic";

export default async function FamiliarPage({ params }: Props) {
  const { token } = await params;

  const supabase = await createClient();

  const { data } = await supabase.rpc("obtener_papelitos", {
    p_token: token,
  });

  if (!data) notFound();

  const datos = data as Datos;
  const papelitos = datos.papelitos ?? [];

  const iniciado = ["realizado", "finalizado"].includes(datos.estado);
  const total = papelitos.length;
  const revelados = papelitos.filter((p) => p.revelado).length;
  const disponibles = total - revelados;

  // Solo se puede abrir el siguiente papelito, en orden
  const siguiente = papelitos.find((p) => !p.revelado)?.numero;

  const fecha = datos.fecha
    ? new Date(`${datos.fecha}T00:00:00`).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-[#fffaf5] px-5 py-10 text-[#3d3028] sm:px-8">
      <div className="mx-auto max-w-xl">
        <Link
          href={`/papelitos/${datos.intercambio_token}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar de familia
        </Link>

        {/* Encabezado */}
        <section className="rounded-[2rem] border border-[#eaded4] bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7e5d5]">
            <Gift className="h-8 w-8 text-[#a9684c]" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
            {datos.intercambio}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Familia {datos.familia}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-[#76685f]">
            {fecha && (
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#a9684c]" />
                {fecha}
              </span>
            )}
            {datos.presupuesto !== null && (
              <span>
                Presupuesto: $
                {Number(datos.presupuesto).toLocaleString("es-MX")}
              </span>
            )}
          </div>

          {iniciado && total > 0 && (
            <p className="mt-6 text-sm text-[#5c4b40]">
              {disponibles === 0
                ? "Ya revelaron todos sus papelitos 🎉"
                : `Les ${disponibles === 1 ? "queda" : "quedan"} ${disponibles} ${
                    disponibles === 1
                      ? "papelito por sacar"
                      : "papelitos por sacar"
                  }.`}
            </p>
          )}
        </section>

        {!iniciado ? (
          <section className="mt-6 rounded-[2rem] border border-dashed border-[#dfcfc2] bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold">
              El intercambio todavía no inicia
            </p>
            <p className="mt-2 text-sm text-[#76685f]">
              Vuelve a abrir este enlace cuando el organizador lo avise.
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-4">
            {papelitos.map((p) => {
              const esSiguiente = p.numero === siguiente;

              return (
                <div
                  key={p.numero}
                  className={`rounded-[1.5rem] border p-5 ${
                    p.revelado
                      ? "border-[#eaded4] bg-white"
                      : esSiguiente
                        ? "border-[#d8b9a7] bg-white shadow-sm"
                        : "border-[#eaded4] bg-[#faf7f4]"
                  }`}
                >
                  <p className="text-sm text-[#94857b]">
                    Papelito {p.numero} de {total}
                  </p>

                  {p.revelado ? (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7e5d5]">
                        <Check className="h-4 w-4 text-[#a9684c]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#94857b]">
                          Revelado · es para
                        </p>
                        <p className="text-lg font-bold">
                          {p.destinatario}
                        </p>
                      </div>
                    </div>
                  ) : esSiguiente ? (
                    <RevelarPapelito
                      token={token}
                      numero={p.numero}
                      disponibles={datos.disponibles}
                    />
                  ) : (
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#94857b]">
                      <Lock className="h-4 w-4" />
                      Aún no revelado
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}