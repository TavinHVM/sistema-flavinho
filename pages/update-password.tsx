// pages/update-password.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Usuário autenticado para redefinir senha.");
        setShowForm(true);
      }
    });

    // Check if the user is already authenticated via hash
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setShowForm(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("Erro ao redefinir senha: " + error.message);
    } else {
      setMessage("Senha atualizada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded w-full max-w-sm shadow">
        <h1 className="text-xl font-bold mb-4 text-center">Redefinir Senha</h1>

        {!showForm ? (
          <p className="text-center text-gray-400">Carregando ou link inválido/expirado...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              className="w-full p-3 mb-4 rounded bg-gray-900 placeholder-gray-400"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 py-2 rounded hover:bg-blue-700 transition"
            >
              Atualizar senha
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-center text-blue-400">{message}</p>}
      </div>
    </main>
  );
}
