import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Gift,
  Users,
  UserRound,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function IntercambioPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: intercambio, error: intercambioError } =
    await supabase
      .from("intercambios")
      .select(`
        id,
        nombre,
        descripcion,
        fecha,
        presupuesto,
        estado,
        codigo,
        created_at,
        familias (
          id,
          nombre,
          participantes (
            id,
            nombre,
            activo
          )
        )
      `)
      .eq("id", id)
      .eq("admin_id", user.id)
      .single();

  if (intercambioError || !intercambio) {
    notFound();
  }

  const familias = intercambio.familias ?? [];

  const participantes = familias.flatMap(
    (familia) => familia.participantes ?? []
  );

  const participantesActivos = participantes.filter(
    (participante) => participante.activo
  );

  const totalFamilias = familias.length;
  const totalParticipantes = participantes.length;
  const totalActivos = participantesActivos.length;

  const fechaFormateada = intercambio.fecha
    ? new Date(`${intercambio.fecha}T00:00:00`).toLocaleDateString(
        "es-MX",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Sin fecha definida";

  const puedeAgregarParticipantes = totalFamilias > 0;
  const puedeSortear = totalActivos >= 2;

  return (
    <main className="min-h-screen bg-[#fffaf5] px-5 py-8 text-[#3d3028] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        {/* Encabezado */}
        <section className="mt-8 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7e5d5]">
                <Gift className="h-7 w-7 text-[#a9684c]" />
              </div>

              <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
                Intercambio familiar
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {intercambio.nombre}
              </h1>

              {intercambio.descripcion && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#76685f]">
                  {intercambio.descripcion}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-[#fffaf5] px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-wider text-[#94857b]">
                Estado
              </p>

              <p className="mt-1 font-semibold capitalize text-[#a9684c]">
                {intercambio.estado}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <InfoCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Fecha"
              value={fechaFormateada}
            />

            <InfoCard
              icon={<Users className="h-5 w-5" />}
              label="Familias"
              value={String(totalFamilias)}
            />

            <InfoCard
              icon={<UserRound className="h-5 w-5" />}
              label="Participantes"
              value={`${totalActivos} activos`}
            />
          </div>

          {intercambio.presupuesto !== null && (
            <div className="mt-4 rounded-2xl border border-[#eaded4] bg-[#fffaf5] px-4 py-3 text-sm">
              <span className="text-[#76685f]">
                Presupuesto por regalo:
              </span>{" "}
              <span className="font-semibold">
                ${Number(intercambio.presupuesto).toLocaleString(
                  "es-MX",
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          )}
        </section>

        {/* Regla del intercambio */}
        <section className="mt-6 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7e5d5]">
              <Sparkles className="h-5 w-5 text-[#a9684c]" />
            </div>

            <div>
              <h2 className="font-semibold">
                Intercambio 1 a 1
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#76685f]">
                Cada participante regalará a una sola persona y
                recibirá un regalo de otra persona. Los papelitos evitarán
                asignaciones dentro de la misma familia.
              </p>

              <p className="mt-3 text-sm font-medium text-[#5c4b40]">
                {totalParticipantes} participantes ={" "}
                {totalParticipantes} regalos
              </p>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="mt-6">
          <div className="mb-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
              Configuración
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Prepara tu intercambio
            </h2>

            <p className="mt-2 text-sm text-[#76685f]">
              Completa estos pasos antes de iniciar el intercambio.
            </p>
          </div>

          <div className="grid gap-4">
            <StepCard
              number="01"
              icon={<Users className="h-5 w-5" />}
              title="Crear familias"
              description={
                totalFamilias > 0
                  ? `${totalFamilias} ${
                      totalFamilias === 1
                        ? "familia registrada"
                        : "familias registradas"
                    }.`
                  : "Agrega las familias que participarán en el intercambio."
              }
              href={`/admin/intercambio/${id}/familias`}
              action="Administrar familias"
            />

            <StepCard
              number="02"
              icon={<UserRound className="h-5 w-5" />}
              title="Agregar participantes"
              description={
                totalParticipantes > 0
                  ? `${totalParticipantes} ${
                      totalParticipantes === 1
                        ? "participante registrado"
                        : "participantes registrados"
                    }. Cada uno representa un regalo.`
                  : "Agrega a las personas que participarán en el intercambio."
              }
              href={
                puedeAgregarParticipantes
                  ? `/admin/intercambio/${id}/participantes`
                  : undefined
              }
              action="Administrar participantes"
              disabled={!puedeAgregarParticipantes}
            />

            <StepCard
              number="03"
              icon={<Sparkles className="h-5 w-5" />}
              title="Iniciar intercambio"
              description={
                puedeSortear
                  ? `${totalActivos} participantes activos están listos para generar los papelitos.`
                  : "Necesitas al menos 2 participantes activos para iniciar el intercambio."
              }
              href={
                puedeSortear
                  ? `/admin/intercambio/${id}/sorteo`
                  : undefined
              }
              action="Iniciar intercambio"
              disabled={!puedeSortear}
            />
          </div>
        </section>

        {/* Resumen de familias */}
        {familias.length > 0 && (
          <section className="mt-6 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
                  Resumen
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Familias participantes
                </h2>
              </div>

              <Link
                href={`/admin/intercambio/${id}/familias`}
                className="text-sm font-semibold text-[#a9684c] hover:text-[#91583f]"
              >
                Ver todas
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {familias.map((familia) => {
                const integrantes = familia.participantes ?? [];
                const activos = integrantes.filter(
                  (participante) => participante.activo
                ).length;

                return (
                  <Link
                    key={familia.id}
                    href={`/admin/intercambio/${id}/familias/${familia.id}`}
                    className="rounded-2xl border border-[#eaded4] bg-[#fffaf5] p-4 transition hover:border-[#d8b9a7] hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {familia.nombre}
                        </p>

                        <p className="mt-1 text-xs text-[#76685f]">
                          {integrantes.length}{" "}
                          {integrantes.length === 1
                            ? "integrante"
                            : "integrantes"}{" "}
                          · {activos} activos
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-[#94857b]" />
                    </div>
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

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoCard({
  icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-[#eaded4] bg-[#fffaf5] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#a9684c]">
          {icon}
        </div>

        <div>
          <p className="text-xs text-[#94857b]">{label}</p>
          <p className="mt-0.5 text-sm font-semibold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

type StepCardProps = {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  action: string;
  disabled?: boolean;
};

function StepCard({
  number,
  icon,
  title,
  description,
  href,
  action,
  disabled = false,
}: StepCardProps) {
  const content = (
    <div
      className={`rounded-[1.5rem] border p-5 transition sm:p-6 ${
        disabled
          ? "cursor-not-allowed border-[#eaded4] bg-[#faf7f4] opacity-60"
          : "border-[#eaded4] bg-white hover:border-[#d8b9a7] hover:shadow-sm"
      }`}
    >
      <div className="flex gap-4">
        <div className="hidden text-xs font-bold text-[#c5b5aa] sm:block">
          {number}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7e5d5] text-[#a9684c]">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">{title}</h3>

              <p className="mt-1 text-sm leading-6 text-[#76685f]">
                {description}
              </p>
            </div>

            {!disabled && (
              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#a9684c]" />
            )}
          </div>

          <p
            className={`mt-4 text-sm font-semibold ${
              disabled
                ? "text-[#94857b]"
                : "text-[#a9684c]"
            }`}
          >
            {action}
          </p>
        </div>
      </div>
    </div>
  );

  if (disabled || !href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}