import { useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert(
          "Você precisa estar logado como administrador para acessar esta página."
        );
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userStr);
      if (user.role !== "Administrador") {
        alert(
          "Acesso negado. Apenas administradores podem acessar esta página."
        );
        router.replace("/login");
      }
    };

    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <header className="mb-8 w-full max-w-md">
          <div className="w-full flex items-center justify-center relative">
            <div className="flex flex-col items-center justify-center">
              <h1 className="font-poppins text-[2rem] font-bold mb-1 text-center">
                Painel Administrativo
              </h1>
              <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
                Bem-vindo ao painel de administração
              </p>
            </div>
          </div>
        </header>

        <div className="bg-[rgb(26,34,49)] p-8 rounded-lg shadow-lg w-full max-w-md">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center mb-4"
          >
            Estoque
          </button>
          <button
            onClick={() => router.push("/user-management")}
            className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center mb-4"
          >
            Usuários
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-red-700 transition-all flex items-center justify-center"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* ...cards... */}
        </div>
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
