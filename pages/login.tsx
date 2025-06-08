import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/header";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", usuario)
      .eq("senha", password)
      .single();

    if (error || !user) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "Administrador" || "Funcionario") {
      router.replace("/dashboard");
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <header className="mb-8 w-full max-w-md">
          <div className="w-full flex items-center justify-center relative">
            <div className="flex flex-col items-center justify-center">
              <h1 className="font-poppins text-[2rem] font-bold mb-1 text-center">
                Flavinho Festas
              </h1>
              <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
                Sistema de gerenciamento de estoque
              </p>
            </div>
          </div>
        </header>
        <form
          onSubmit={handleLogin}
          className="bg-[rgb(26,34,49)] p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="font-poppins text-[1.3rem] font-semibold mb-6 text-center">
            Login
          </h2>
          {error && (
            <div className="mb-4 text-red-500 text-center font-inter">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block mb-1 font-medium font-poppins text-xs text-gray-300">
              Email
            </label>
            <input
              type="text"
              className="w-full p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              placeholder="Digite seu email"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium font-poppins text-xs text-gray-300">
              Senha
            </label>
            <input
              type="password"
              className="w-full p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <span className="flex items-center gap-1 font-inter text-[0.9rem] font-normal text-gray-500 mt-10 mb-0">
          Desenvolvido por:{" "}
          <a
            href="https://www.linkedin.com/in/gustavo-henrique-6b8352304/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Gustavo Henrique
          </a>
        </span>
      </main>
    </>
  );
}
