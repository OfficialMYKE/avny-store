"use client";

import { useState } from "react";
import { LayoutDashboard, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase"; // Conectamos el puente

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Obtenemos los datos del formulario
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    // PREGUNTAMOS A SUPABASE SI EL USUARIO EXISTE
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Si falla (contraseña mal), mostramos error
      setErrorMsg("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
    } else {
      // Si todo bien, entramos
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 shadow-xl p-8 rounded-none">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-black text-white mb-4">
            <Lock size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Solo Personal
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Authentic Vintage New York Style
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 text-sm text-center mb-4 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="admin@authenticny.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verificando...
              </>
            ) : (
              "Entrar al Panel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
