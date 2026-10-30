"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopiarEnlace({ ruta }: { ruta: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}${ruta}`;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfcfc2] px-4 py-2.5 text-sm font-semibold text-[#5c4b40] transition hover:bg-[#faf5f0]"
    >
      {copiado ? (
        <>
          <Check className="h-4 w-4 text-[#a9684c]" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copiar enlace
        </>
      )}
    </button>
  );
}