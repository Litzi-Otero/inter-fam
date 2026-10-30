import Link from "next/link";
import { ArrowLeft, Home, Plus, Users } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FamiliasPage({ params }: PageProps) {
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

  // Verificar usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Obtener intercambio
  const { data: intercambio, error: intercambioError } = await supabase
    .from("intercambios")
    .select("id, nombre")
    .eq("id", id)
    .eq("admin_id", user.id)
    .single();

  if (intercambioError || !intercambio) {
    notFound();
  }

  // Obtener familias
  const { data: familias, error: familiasError } = await supabase
    .from("familias")
    .select(
      `
        id,
        nombre,
        created_at,
        participantes (
          id
        )
      `
    )
    .eq("intercambio_id", id)
    .order("created_at", { ascending: true });

  if (familiasError) {
    console.error(familiasError);
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#3d3028]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
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

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Familias
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#76685f]">
                Crea las familias que participarán en este intercambio.
              </p>
            </div>

            <Link
              href={`/admin/intercambio/${id}/familias/nueva`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3.5 font-semibold text-white transition hover:bg-[#91583f]"
            >
              <Plus className="h-5 w-5" />
              Agregar familia
            </Link>
          </div>
        </section>

        {/* LISTA */}
        <section className="mt-8">
          {!familias || familias.length === 0 ? (
            <EmptyState id={id} />
          ) : (
            <div className="space-y-4">
              {familias.map((familia) => {
                const participantes = familia.participantes?.length ?? 0;

                return (
                  <div
                    key={familia.id}
                    className="flex flex-col gap-5 rounded-3xl border border-[#eaded4] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                        <Home className="h-6 w-6 text-[#a9684c]" />
                      </div>

                      <div>
                        <h2 className="font-bold">{familia.nombre}</h2>

                        <div className="mt-1 flex items-center gap-2 text-sm text-[#76685f]">
                          <Users className="h-4 w-4" />

                          {participantes}{" "}
                          {participantes === 1
                            ? "participante"
                            : "participantes"}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/admin/intercambio/${id}/familias/${familia.id}`}
                      className="rounded-xl border border-[#dfcfc2] px-4 py-2.5 text-center text-sm font-semibold text-[#5c4b40] transition hover:bg-[#faf5f0]"
                    >
                      Administrar
                    </Link>
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

function EmptyState({ id }: { id: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#dfcfc2] bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e5d5]">
        <Home className="h-8 w-8 text-[#a9684c]" />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        Todavía no hay familias
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#76685f]">
        Agrega la primera familia para comenzar a registrar a los
        participantes.
      </p>

      <Link
        href={`/admin/intercambio/${id}/familias/nueva`}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3 font-semibold text-white transition hover:bg-[#91583f]"
      >
        <Plus className="h-5 w-5" />
        Agregar familia
      </Link>
    </div>
  );
}