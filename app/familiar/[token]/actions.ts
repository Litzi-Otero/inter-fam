"use server";

import { createClient } from "@/lib/supabase/server";

export type ResultadoReveal = { nombre?: string; error?: string };

export async function revelarPapelito(
  token: string,
  numero: number,
  posicion: number
): Promise<ResultadoReveal> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("revelar_papelito", {
    p_token: token,
    p_numero: numero,
    p_posicion: posicion,
  });

  if (error) return { error: error.message };

  return { nombre: data as string };
}