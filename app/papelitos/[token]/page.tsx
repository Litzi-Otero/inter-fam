import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Gift,
  Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import FormPin from "./FormPin";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ familia?: string }>;
};

type Datos = {
  intercambio: string;
  fecha: string | null;
  estado: string;
  familias: {
    id: string;
    nombre: string;
    total: number;
    revelados: number;
  }[];
};

export const dynamic = "force-dynamic";

export default async function EnlaceUnicoPage({
  params,
  searchParams,
}: Props) {
  const { token } = await params;
  const { familia: familiaId } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase.rpc("obtener_familias", {
    p_token: token,
  });

  if (!data) notFound();

  const datos = data as Datos;
  const iniciado = ["realizado", "finalizado"].includes(datos.estado);

  const elegida = familiaId
    ? datos.familias.find((f) => f.id === familiaId)
    : undefined;

  // Si este dispositivo ya entró a esa familia, pasar directo
  if (iniciado && elegida) {
    const cookieStore = await cookies();
    const guardado = cookieStore.get(`fam_${elegida.id}`)?.value;
    if (guardado) redirect(`/familiar/${guardado}`);
  }

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
        <section className="rounded-[2rem] border border-[#eaded4] bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f7e5d5]">
            <Gift className="h-8 w-8 text-[#a9684c]" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
            Intercambio familiar
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {datos.intercambio}
          </h1>

          {fecha && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#76685f]">
              <CalendarDays className="h-4 w-4 text-[#a9684c]" />
              {fecha}
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
        ) : elegida ? (
          <section className="mt-6 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
            <Link
              href={`/papelitos/${token}`}
              className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
            >
              <ArrowLeft className="h-4 w-4" />
              Elegir otra familia
            </Link>

            <h2 className="mt-4 text-2xl font-bold">
              Familia {elegida.nombre}
            </h2>

            <p className="mt-2 text-sm text-[#76685f]">
              Escribe el PIN que te dio el organizador para esta
              familia.
            </p>

            <FormPin token={token} familiaId={elegida.id} />
          </section>
        ) : (
          <section className="mt-6">
            <h2 className="text-lg font-bold">¿De qué familia eres?</h2>
            <p className="mt-1 text-sm text-[#76685f]">
              Elige tu familia. Necesitarás el PIN de tu familia para
              entrar.
            </p>

            <div className="mt-4 space-y-3">
              {datos.familias.map((f) => {
                const completo = f.total > 0 && f.revelados === f.total;

                return (
                  <Link
                    key={f.id}
                    href={`/papelitos/${token}?familia=${f.id}`}
                    className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[#eaded4] bg-white p-5 transition hover:border-[#d8b9a7] hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7e5d5]">
                        <Home className="h-5 w-5 text-[#a9684c]" />
                      </div>

                      <div>
                        <p className="font-semibold">
                          Familia {f.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-[#76685f]">
                          {completo
                            ? "✓ Todos revelados"
                            : `${f.revelados} de ${f.total} revelados`}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-5 w-5 text-[#a9684c]" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}