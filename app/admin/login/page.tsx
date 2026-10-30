"use client";

import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf5] px-6 py-10 text-[#3d3028]">
      <div className="mx-auto flex min-h-[90vh] max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#76685f] transition hover:text-[#a9684c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="rounded-[2rem] border border-[#eaded4] bg-white p-8 shadow-sm sm:p-10">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e5d5]">
              <Gift className="h-8 w-8 text-[#a9684c]" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#a9684c]">
              Área del organizador
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Bienvenido
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#76685f]">
              Inicia sesión para crear y administrar tu intercambio familiar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#dfcfc2] bg-white px-5 py-4 font-semibold text-[#4d4038] transition hover:bg-[#faf5f0]"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <p className="mt-6 text-center text-xs leading-5 text-[#94857b]">
            Al continuar, podrás administrar tus intercambios y participantes.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.54-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />

      <path
        fill="#34A853"
        d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.79A5.86 5.86 0 0 1 6.23 12c0-.62.11-1.22.31-1.79V7.68H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.32l3.24-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.18c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.18 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.9 9.46 6.18 12 6.18Z"
      />
    </svg>
  );
}