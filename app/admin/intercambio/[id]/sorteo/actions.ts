"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function iniciarIntercambio(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.rpc("iniciar_intercambio", {
    p_intercambio_id: id,
  });

  if (error) {
    redirect(
      `/admin/intercambio/${id}/sorteo?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/admin/intercambio/${id}/sorteo`);
}