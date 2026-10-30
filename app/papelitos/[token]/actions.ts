"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoPin = { error: string };

export async function entrarFamilia(
  _anterior: EstadoPin,
  formData: FormData
): Promise<EstadoPin> {
  const token = String(formData.get("token") ?? "");
  const familiaId = String(formData.get("familiaId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  if (!pin.trim()) {
    return { error: "Escribe el PIN de tu familia." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("entrar_familia", {
    p_token: token,
    p_familia_id: familiaId,
    p_pin: pin,
  });

  if (error) {
    console.error(error);
    return { error: "No se pudo verificar el PIN. Intenta de nuevo." };
  }

  const resultado = data as { token?: string; error?: string } | null;

  if (!resultado?.token) {
    return { error: resultado?.error ?? "PIN incorrecto." };
  }

  // Recordar en este dispositivo para no pedir el PIN otra vez
  const cookieStore = await cookies();
  cookieStore.set(`fam_${familiaId}`, resultado.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect(`/familiar/${resultado.token}`);
}