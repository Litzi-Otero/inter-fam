"use client";

import { useActionState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { entrarFamilia, type EstadoPin } from "./actions";

const inicial: EstadoPin = { error: "" };

export default function FormPin({
  token,
  familiaId,
}: {
  token: string;
  familiaId: string;
}) {
  const [estado, accion, pendiente] = useActionState(
    entrarFamilia,
    inicial
  );

  return (
    <form action={accion} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="familiaId" value={familiaId} />

      <div>
        <label
          htmlFor="pin"
          className="mb-2 block text-sm font-semibold"
        >
          PIN de tu familia
        </label>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94857b]" />

          <input
            id="pin"
            name="pin"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={12}
            autoFocus
            placeholder="000000"
            className="w-full rounded-2xl border border-[#dfcfc2] py-3.5 pl-12 pr-4 text-center text-lg tracking-[0.4em] outline-none placeholder:text-[#c9bbb1] focus:border-[#a9684c] focus:ring-2 focus:ring-[#f7e5d5]"
          />
        </div>
      </div>

      {estado.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {estado.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a9684c] px-5 py-4 font-semibold text-white transition hover:bg-[#91583f] disabled:opacity-60"
      >
        {pendiente ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verificando...
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}