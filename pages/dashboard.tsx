import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "../components/Footer";
import Header from "../components/Header";


export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    nome?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setIsLoggedIn(false);
      router.replace("/login");
      return;
    }
    const userObj = JSON.parse(userStr);
    setUser(userObj);
    if (userObj.role !== "Administrador" && userObj.role !== "Funcionario") {
      setIsLoggedIn(false);
      router.replace("/login");
      return;
    }
    setIsLoggedIn(true);
  }, [router]);

  const isAdmin = user?.role === "Administrador";

  if (isLoggedIn === null) {
    // Em verificação
    return null;
  }

  if (!isLoggedIn) {
    return (
      <main className="h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-2">
        <div className="mt-10 text-center text-lg text-yellow-400">
          {"Você precisa estar logado para acessar esta página."}
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-2">
        <div className="flex flex-1 flex-col justify-center items-center w-full h-screen">
          <div className="w-full max-w-md flex flex-col items-center mb-6 px-2">
            <h1 className="font-poppins text-[2rem] font-bold text-center">
              {isAdmin ? "Painel Administrativo" : "Painel do Usuário"}
            </h1>
            <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-2 mb-4">
              {isAdmin
                ? "Gerencie usuários, pedidos e o estoque do sistema."
                : "Acesse e gerencie os pedidos e o estoque."}
            </p>
          </div>
          <section className="w-full max-w-md flex flex-col justify-center items-center">
            <div className="bg-[rgb(26,34,49)] p-8 rounded-lg shadow-lg w-full">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => router.push("/orders")}
                  className="w-full bg-blue-500 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
                >
                  📋 Pedidos
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-green-500 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-green-600 transition-all flex items-center justify-center"
                >
                  📦 Estoque
                </button>
                <button
                  onClick={() => router.push("/conjuntos")}
                  className="w-full bg-pink-500 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-pink-600 transition-all flex items-center justify-center"
                >
                  🎁 Conjuntos
                </button>
                <button
                  onClick={() => router.push("/devolucoes")}
                  className="w-full bg-purple-500 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-purple-600 transition-all flex items-center justify-center"
                >
                  📊 Relatório de Devoluções
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push("/user-management")}
                    className="w-full bg-orange-500 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-orange-600 transition-all flex items-center justify-center"
                  >
                    👥 Gerenciar Usuários
                  </button>
                )}
              </div>
            </div>
          </section>
          <div className="mt-8 w-full flex justify-center">
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
