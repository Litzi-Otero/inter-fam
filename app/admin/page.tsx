import Link from "next/link";
import { CalendarDays, Gift, Plus, Users } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function AdminPage() {
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#3d3028]">
            Sesión no encontrada
          </h1>

          <Link
            href="/admin/login"
            className="mt-4 inline-block rounded-2xl bg-[#a9684c] px-5 py-3 font-semibold text-white"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nombre, email, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: intercambios } = await supabase
    .from("intercambios")
    .select(
      `
        id,
        nombre,
        descripcion,
        fecha,
        presupuesto,
        estado,
        created_at,
        familias (
          id,
          participantes (
            id
          )
        )
      `
    )
    .eq("admin_id", user.id)
    .order("created_at", { ascending: false });

  const nombre =
    perfil?.nombre ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Organizador";

  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#3d3028]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7e5d5]">
              <Gift className="h-6 w-6 text-[#a9684c]" />
            </div>

            <div>
              <p className="font-bold">Intercambio Familiar</p>
              <p className="text-xs text-[#94857b]">Panel del organizador</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {perfil?.avatar_url && (
              <img
                src={perfil.avatar_url}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            )}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{nombre}</p>
              <p className="text-xs text-[#94857b]">{user.email}</p>
            </div>
          </div>
        </header>

        {/* WELCOME */}
        <section className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
              Mis intercambios
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Hola, {nombre.split(" ")[0]} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#76685f] sm:text-base">
              Organiza tus intercambios familiares y prepara todo para el gran
              momento.
            </p>
          </div>

          <Link
            href="/admin/intercambio/nuevo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#91583f]"
          >
            <Plus className="h-5 w-5" />
            Crear intercambio
          </Link>
        </section>

        {/* EXCHANGES */}
        <section className="mt-10">
          {!intercambios || intercambios.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {intercambios.map((intercambio) => {
                const participantes =
                  intercambio.familias?.reduce(
                    (total, familia) =>
                      total + (familia.participantes?.length ?? 0),
                    0
                  ) ?? 0;

                return (
                  <Link
                    key={intercambio.id}
                    href={`/admin/intercambio/${intercambio.id}`}
                    className="group rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                        <Gift className="h-6 w-6 text-[#a9684c]" />
                      </div>

                      <StatusBadge estado={intercambio.estado} />
                    </div>

                    <h2 className="mt-6 text-xl font-bold group-hover:text-[#a9684c]">
                      {intercambio.nombre}
                    </h2>

                    {intercambio.descripcion && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#76685f]">
                        {intercambio.descripcion}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#76685f]">
                      {intercambio.fecha && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(intercambio.fecha)}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {participantes}{" "}
                        {participantes === 1
                          ? "participante"
                          : "participantes"}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[#f0e6df] pt-5 text-sm font-semibold text-[#a9684c]">
                      Administrar intercambio →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#dfcfc2] bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e5d5]">
        <Gift className="h-8 w-8 text-[#a9684c]" />
      </div>

      <h2 className="mt-5 text-xl font-bold">
        Todavía no tienes intercambios
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#76685f]">
        Crea tu primer intercambio y comienza agregando familias y
        participantes.
      </p>

      <Link
        href="/admin/intercambio/nuevo"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-3 font-semibold text-white transition hover:bg-[#91583f]"
      >
        <Plus className="h-5 w-5" />
        Crear mi primer intercambio
      </Link>
    </div>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const labels: Record<string, string> = {
    borrador: "Borrador",
    listo: "Listo para sortear",
    realizado: "Sorteado",
    finalizado: "Finalizado",
  };

  return (
    <span className="rounded-full bg-[#f7e5d5] px-3 py-1.5 text-xs font-semibold text-[#8d5b43]">
      {labels[estado] ?? estado}
    </span>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}