import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === "/login") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Autenticação usando Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: usuario,
      password: password,
    });

    if (authError || !data?.user) {
      setError("Usuário ou senha inválidos.");
      setLoading(false);
      return;
    }

    // Buscar perfil do usuário na tabela user_profiles pelo id do usuário autenticado
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setError("Perfil do usuário não encontrado.");
      setLoading(false);
      return;
    }

    localStorage.setItem("user", JSON.stringify(profile));

    if (profile.role === "Administrador" || profile.role === "Funcionario") {
      router.replace("/dashboard");
    } else {
      setError("Usuário sem permissão.");
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "https://sistema-flavinho.vercel.app/update-password",
    });
    
    if (error) {
      setResetMessage("Erro ao enviar e-mail de redefinição. Verifique o e-mail informado.");
    } else {
      setResetMessage("E-mail de redefinição enviado! Verifique sua caixa de entrada.");
    }
    setResetLoading(false);
  };

  return (
    <>
      <Header />
      <main className="h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <header className="mb-8 w-full max-w-md">
          <div className="w-full flex items-center justify-center relative">
            <div className="flex flex-col items-center justify-center">
              <img
                src="/favicon.ico"
                alt="Favicon"
                width={112}
                height={112}
                className="w-28 h-28 ml-2 mr-0 justify-end items-center"
              />
              <h1 className="mt-4 font-poppins text-[2rem] font-bold mb-1 text-center ml-2">
                Flavinho Festas
              </h1>
              <p className="ml-2 font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
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
            <button
              type="button"
              className="mt-2 text-blue-400 hover:underline text-xs font-inter"
              onClick={() => {
                setShowResetModal(true);
                setResetEmail("");
                setResetMessage("");
              }}
            >
              Esqueci minha senha
            </button>
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
        {showResetModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowResetModal(false)}
                aria-label="Fechar"
              >
                ×
              </button>
              <h3 className="text-lg font-poppins font-semibold mb-4 text-center">Redefinir senha</h3>
              <form onSubmit={handlePasswordReset}>
                <label className="block mb-2 font-inter text-sm text-gray-300">E-mail cadastrado</label>
                <input
                  type="email"
                  className="w-full p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="Digite seu e-mail"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Enviando..." : "Enviar e-mail de redefinição"}
                </button>
              </form>
              {resetMessage && (
                <div className="mt-4 text-center text-sm text-blue-300">{resetMessage}</div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
