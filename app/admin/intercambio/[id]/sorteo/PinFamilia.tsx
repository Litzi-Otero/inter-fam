"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

export default function PinFamilia({ pin }: { pin: string }) {
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(pin);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-xl bg-white px-3 py-2 font-mono text-sm tracking-[0.25em]">
        {visible ? pin : "••••••"}
      </span>

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar PIN" : "Mostrar PIN"}
        className="rounded-xl border border-[#dfcfc2] p-2.5 text-[#5c4b40] transition hover:bg-[#faf5f0]"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>

      <button
        type="button"
        onClick={copiar}
        aria-label="Copiar PIN"
        className="rounded-xl border border-[#dfcfc2] p-2.5 text-[#5c4b40] transition hover:bg-[#faf5f0]"
      >
        {copiado ? (
          <Check className="h-4 w-4 text-[#a9684c]" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}