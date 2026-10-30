import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  UserPlus,
} from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ParticipantesPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Las cookies pueden no poder modificarse durante el render.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verificar que el intercambio pertenece al administrador
  const { data: intercambio, error: intercambioError } = await supabase
    .from("intercambios")
    .select("id, nombre")
    .eq("id", id)
    .eq("admin_id", user.id)
    .single();

  if (intercambioError || !intercambio) {
    notFound();
  }

  // Obtener familias y participantes
  const { data: familias, error: familiasError } = await supabase
    .from("familias")
    .select(
      `
        id,
        nombre,
        participantes (
          id,
          nombre,
          activo
        )
      `
    )
    .eq("intercambio_id", id)
    .order("created_at", { ascending: true });

  if (familiasError) {
    console.error(familiasError);
  }

  const totalParticipantes =
    familias?.reduce(
      (total, familia) =>
        total + (familia.participantes?.length ?? 0),
      0
    ) ?? 0;

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#3d3028]">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* REGRESAR */}
        <Link
          href={`/admin/intercambio/${id}`}
          className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al intercambio
        </Link>

        {/* HEADER */}
        <section className="mt-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
            {intercambio.nombre}
          </p>

          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Participantes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#76685f]">
                Agrega a las personas que participarán y define cuántos
                regalos dará cada una.
              </p>
            </div>

            <Link
              href={`/admin/intercambio/${id}/participantes/nuevo`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#91583f]"
            >
              <Plus className="h-5 w-5" />
              Agregar participante
            </Link>
          </div>
        </section>

        {/* RESUMEN */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#eaded4] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                <Users className="h-5 w-5 text-[#a9684c]" />
              </div>

              <div>
                <p className="text-sm text-[#76685f]">
                  Participantes
                </p>

                <p className="text-2xl font-bold">
                  {totalParticipantes}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#eaded4] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                <UserPlus className="h-5 w-5 text-[#a9684c]" />
              </div>

              <div>
                <p className="text-sm text-[#76685f]">
                  Familias
                </p>

                <p className="text-2xl font-bold">
                  {familias?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAMILIAS */}
        <section className="mt-10">
          {!familias || familias.length === 0 ? (
            <EmptyFamilies id={id} />
          ) : (
            <div className="space-y-6">
              {familias.map((familia) => {
                const participantes = familia.participantes ?? [];

                return (
                  <div
                    key={familia.id}
                    className="overflow-hidden rounded-[2rem] border border-[#eaded4] bg-white shadow-sm"
                  >
                    {/* ENCABEZADO FAMILIA */}
                    <div className="flex flex-col gap-4 border-b border-[#f0e6df] bg-[#fffdfb] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                          <Users className="h-5 w-5 text-[#a9684c]" />
                        </div>

                        <div>
                          <h2 className="font-bold">
                            {familia.nombre}
                          </h2>

                          <p className="text-sm text-[#76685f]">
                            {participantes.length}{" "}
                            {participantes.length === 1
                              ? "participante"
                              : "participantes"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/admin/intercambio/${id}/participantes/nuevo?familia=${familia.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfcfc2] px-4 py-2.5 text-sm font-semibold text-[#5c4b40] transition hover:bg-[#faf5f0]"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </Link>
                    </div>

                    {/* PARTICIPANTES */}
                    {participantes.length === 0 ? (
                      <div className="px-5 py-8 text-center sm:px-6">
                        <p className="text-sm text-[#94857b]">
                          Esta familia todavía no tiene participantes.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f0e6df]">
                        {participantes.map((participante) => (
                          <div
                            key={participante.id}
                            className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7e5d5] font-bold text-[#a9684c]">
                                {participante.nombre
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {participante.nombre}
                                </p>

                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                              <div className="text-right">
                                <p className="text-xs text-[#94857b]">
                                  Regalos
                                </p>

                                <p className="font-bold text-[#a9684c]">
                                  {participante.cantidad_regalos}
                                </p>
                              </div>

                              <Link
                                href={`/admin/intercambio/${id}/participantes/${participante.id}`}
                                className="rounded-xl border border-[#dfcfc2] px-4 py-2 text-sm font-semibold text-[#5c4b40] transition hover:bg-[#faf5f0]"
                              >
                                Editar
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyFamilies({ id }: { id: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#dfcfc2] bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e5d5]">
        <Users className="h-8 w-8 text-[#a9684c]" />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        Primero agrega familias
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#76685f]">
        Antes de registrar participantes necesitas crear al menos una
        familia.
      </p>

      <Link
        href={`/admin/intercambio/${id}/familias`}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3 font-semibold text-white transition hover:bg-[#91583f]"
      >
        Administrar familias
      </Link>
    </div>
  );
}