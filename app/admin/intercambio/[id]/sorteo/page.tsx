import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Gift,
  Info,
  Sparkles,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { iniciarIntercambio } from "./actions";
import CopiarEnlace from "./CopiarEnlace";
import PinFamilia from "./PinFamilia";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

type Progreso = {
  familia_id: string;
  familia: string;
  pin: string;
  total: number;
  revelados: number;
};

export default async function IniciarIntercambioPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { error: errorAccion } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: intercambio, error } = await supabase
    .from("intercambios")
    .select(
      `
      id,
      nombre,
      estado,
      token,
      familias (
        id,
        nombre,
        participantes ( id, activo )
      )
    `
    )
    .eq("id", id)
    .eq("admin_id", user.id)
    .single();

  if (error || !intercambio) {
    console.error("Error cargando el intercambio:", error);
    notFound();
  }

  const iniciado = !["borrador", "listo"].includes(intercambio.estado);

  // ---- Validaciones previas (la base de datos las vuelve a validar) ----
  const familias = (intercambio.familias ?? []).map((f) => ({
    id: f.id,
    nombre: f.nombre,
    activos: (f.participantes ?? []).filter((p) => p.activo).length,
  }));

  const conActivos = familias.filter((f) => f.activos > 0);
  const totalActivos = conActivos.reduce((s, f) => s + f.activos, 0);
  const mayor = conActivos.reduce<(typeof conActivos)[number] | null>(
    (m, f) => (!m || f.activos > m.activos ? f : m),
    null
  );

  const problemas: string[] = [];
  if (totalActivos < 2 || conActivos.length < 2) {
    problemas.push(
      "Necesitas al menos 2 familias con participantes activos."
    );
  } else if (mayor && mayor.activos * 2 > totalActivos) {
    problemas.push(
      `La familia ${mayor.nombre} tiene ${mayor.activos} de ${totalActivos} participantes. Ninguna familia puede tener más de la mitad, porque no habría suficientes personas de otras familias a quienes regalar.`
    );
  }

  const puedeIniciar = problemas.length === 0;

  // ---- Avance (solo después de iniciar) ----
  let progreso: Progreso[] = [];
  if (iniciado) {
    const { data } = await supabase.rpc("progreso_intercambio", {
      p_intercambio_id: id,
    });
    progreso = (data ?? []) as Progreso[];
  }

  const totalPapelitos = progreso.reduce((s, p) => s + p.total, 0);
  const totalRevelados = progreso.reduce((s, p) => s + p.revelados, 0);

  return (
    <main className="min-h-screen bg-[#fffaf5] px-5 py-8 text-[#3d3028] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/admin/intercambio/${id}`}
          className="inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al intercambio
        </Link>

        {/* Encabezado */}
        <section className="mt-8 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7e5d5]">
            <Sparkles className="h-7 w-7 text-[#a9684c]" />
          </div>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
            Paso 3
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {iniciado ? "Intercambio en marcha" : "Iniciar intercambio"}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#76685f] sm:text-base">
            {iniciado
              ? "Cada familia ya puede abrir su enlace y revelar sus papelitos."
              : "Se creará un papelito por cada participante activo. Cada familia recibirá un enlace secreto para revelarlos."}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Resumen
              icon={<Users className="h-5 w-5" />}
              label="Participantes"
              value={String(totalActivos)}
            />
            <Resumen
              icon={<Gift className="h-5 w-5" />}
              label="Papelitos"
              value={String(iniciado ? totalPapelitos : totalActivos)}
            />
            <Resumen
              icon={<Sparkles className="h-5 w-5" />}
              label={iniciado ? "Revelados" : "Familias"}
              value={
                iniciado
                  ? `${totalRevelados} / ${totalPapelitos}`
                  : String(conActivos.length)
              }
            />
          </div>
        </section>

        {errorAccion && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorAccion}
          </div>
        )}

        {!iniciado ? (
          <>
            {/* Reglas */}
            <section className="mt-6 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
                Reglas
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Así funcionarán los papelitos
              </h2>

              <div className="mt-6 space-y-3">
                <Regla text="Cada familia tiene tantos papelitos como participantes activos." />
                <Regla text="Al revelar un papelito, el sistema saca al azar a una persona de otra familia." />
                <Regla text="Cada persona sale exactamente una vez: todos reciben un solo regalo." />
                <Regla text="Nadie puede sacar a alguien de su propia familia." />
                <Regla text="Ni tú ni nadie podrá ver quién sacó a quién; solo cada familia ve sus propios papelitos." />
                <Regla text="Una vez iniciado, ya no se pueden agregar ni quitar participantes." />
              </div>
            </section>

            {problemas.length > 0 && (
              <section className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-amber-900">
                      Todavía no puedes iniciar
                    </h2>
                    {problemas.map((p) => (
                      <p
                        key={p}
                        className="mt-2 text-sm leading-6 text-amber-800"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Acción */}
            <section className="mt-6 rounded-[2rem] border border-[#eaded4] bg-white p-6 text-center shadow-sm sm:p-8">
              <h2 className="text-xl font-bold">¿Todo listo?</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#76685f]">
                Revisa que las familias y participantes estén completos. Esta
                acción no se puede deshacer.
              </p>

              <form action={iniciarIntercambio} className="mt-6">
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={!puedeIniciar}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-6 py-4 font-semibold text-white transition hover:bg-[#91583f] disabled:cursor-not-allowed disabled:bg-[#d8cbc2] sm:w-auto"
                >
                  <Sparkles className="h-5 w-5" />
                  Iniciar intercambio
                </button>
              </form>
            </section>
          </>
        ) : (
          /* Enlace único y avance por familia */
          <section className="mt-6 rounded-[2rem] border border-[#eaded4] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
              Enlace para todos
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              Comparte un solo enlace
            </h2>
            <p className="mt-2 text-sm text-[#76685f]">
              Mándalo al grupo familiar. Cada persona elige su familia y
              escribe el PIN de esa familia para revelar sus papelitos.
            </p>

            <div className="mt-5">
              <CopiarEnlace ruta={`/papelitos/${intercambio.token}`} />
            </div>

            <h3 className="mt-8 font-semibold">PIN y avance por familia</h3>
            <p className="mt-1 text-xs text-[#94857b]">
              Envía a cada familia solo su PIN. Los PINs están ocultos para
              que no veas sin querer los papelitos de otras familias.
            </p>

            <div className="mt-3 space-y-3">
              {progreso.map((p) => (
                <div
                  key={p.familia_id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#eaded4] bg-[#fffaf5] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{p.familia}</p>
                    <p className="mt-1 text-sm text-[#76685f]">
                      {p.revelados === p.total
                        ? "✓ Todos revelados"
                        : `${p.revelados} de ${p.total} revelados`}
                    </p>
                  </div>

                  <PinFamilia pin={p.pin} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Resumen({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[#eaded4] bg-[#fffaf5] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7e5d5] text-[#a9684c]">
          {icon}
        </div>
        <div>
          <p className="text-xs text-[#94857b]">{label}</p>
          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Regla({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#fffaf5] p-4">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f7e5d5]">
        <Check className="h-3.5 w-3.5 text-[#a9684c]" />
      </div>
      <p className="text-sm leading-6 text-[#5c4b40]">{text}</p>
    </div>
  );
}