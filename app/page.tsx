import Link from "next/link";
import { Gift, Users, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#3d3028]">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12 text-center">

        {/* Decoración */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7e5d5]">
          <Gift className="h-10 w-10 text-[#a9684c]" />
        </div>

        <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#a9684c]">
          Intercambio familiar
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Una forma más bonita de descubrir tus regalos 🎁
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-[#76685f] sm:text-lg">
          Organiza el intercambio de tu familia, realiza el sorteo y deja que
          cada persona descubra sus regalos uno por uno.
        </p>

        {/* Botones */}
        <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-md sm:flex-row">
          <Link
            href="/admin/login"
            className="flex flex-1 items-center justify-center rounded-2xl bg-[#a9684c] px-6 py-4 font-semibold text-white transition hover:bg-[#91583f]"
          >
            Crear intercambio
          </Link>

          <Link
            href="/familiar"
            className="flex flex-1 items-center justify-center rounded-2xl border border-[#dfcfc2] bg-white px-6 py-4 font-semibold text-[#5c4b40] transition hover:bg-[#faf5f0]"
          >
            Tengo una invitación
          </Link>
        </div>

        {/* Características */}
        <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          <Feature
            icon={<Users className="h-5 w-5" />}
            title="Organiza"
            description="Crea familias y agrega a todos los participantes."
          />

          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="Sortea"
            description="Genera las asignaciones automáticamente."
          />

          <Feature
            icon={<Gift className="h-5 w-5" />}
            title="Descubre"
            description="Revela tus regalos uno por uno."
          />
        </div>
      </section>
    </main>
  );
}

type FeatureProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="rounded-3xl border border-[#eaded4] bg-white p-6 text-left">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7e5d5] text-[#a9684c]">
        {icon}
      </div>

      <h2 className="font-semibold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-[#76685f]">
        {description}
      </p>
    </div>
  );
}