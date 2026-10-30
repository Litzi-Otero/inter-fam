import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Mail,
  Plus,
  User,
  Users,
} from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
    familiaId: string;
  }>;
};

export default async function FamiliaPage({ params }: PageProps) {
  const { id, familiaId } = await params;

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

  // Verificar intercambio
  const { data: intercambio, error: intercambioError } =
    await supabase
      .from("intercambios")
      .select("id, nombre")
      .eq("id", id)
      .eq("admin_id", user.id)
      .single();

  if (intercambioError || !intercambio) {
    notFound();
  }

  // Obtener familia
  const { data: familia, error: familiaError } = await supabase
    .from("familias")
    .select(
      `
        id,
        nombre,
        created_at,
        participantes (
          id,
          nombre,
          activo
        )
      `
    )
    .eq("id", familiaId)
    .eq("intercambio_id", id)
    .single();

  if (familiaError || !familia) {
    notFound();
  }

  const participantes = familia.participantes ?? [];

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#3d3028]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        {/* VOLVER */}
        <Link
          href={`/admin/intercambio/${id}/familias`}
          className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a familias
        </Link>

        {/* HEADER */}
        <section className="mt-8 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                <Home className="h-7 w-7 text-[#a9684c]" />
              </div>

              <div>
                <p className="text-sm text-[#76685f]">
                  Familia
                </p>

                <h1 className="text-2xl font-bold sm:text-3xl">
                  {familia.nombre}
                </h1>

                <p className="mt-1 text-sm text-[#94857b]">
                  {intercambio.nombre}
                </p>
              </div>
            </div>

            <Link
              href={`/admin/intercambio/${id}/participantes/nuevo?familia=${familia.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3 font-semibold text-white transition hover:bg-[#91583f]"
            >
              <Plus className="h-5 w-5" />
              Agregar participante
            </Link>
          </div>
        </section>

        {/* PARTICIPANTES */}
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
                Integrantes
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Participantes
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#76685f]">
              <Users className="h-4 w-4" />
              {participantes.length}
            </div>
          </div>

          {participantes.length === 0 ? (
            <div className="mt-5 rounded-[2rem] border border-dashed border-[#dfcfc2] bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7e5d5]">
                <User className="h-7 w-7 text-[#a9684c]" />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Todavía no hay participantes
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#76685f]">
                Agrega a las personas que pertenecen a esta familia.
              </p>

              <Link
                href={`/admin/intercambio/${id}/participantes/nuevo?familia=${familia.id}`}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3 font-semibold text-white"
              >
                <Plus className="h-5 w-5" />
                Agregar participante
              </Link>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-[2rem] border border-[#eaded4] bg-white shadow-sm">
              <div className="divide-y divide-[#f0e6df]">
                {participantes.map((participante) => (
                  <div
                    key={participante.id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e5d5] font-bold text-[#a9684c]">
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

                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="text-xs text-[#94857b]">
                          Regalos
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
            </div>
          )}
        </section>
      </div>
    </main>
  );
}