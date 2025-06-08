import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Header from "@/components/header";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    nome?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Você precisa estar logado para acessar esta página.");
      router.replace("/login");
      return;
    }
    const userObj = JSON.parse(userStr);
    setUser(userObj);
    if (userObj.role !== "Administrador" && userObj.role !== "Funcionario") {
      alert("Acesso negado.");
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const isAdmin = user?.role === "Administrador";

  return (
    <>
    < Header />
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-2">
        <div className="flex flex-1 flex-col justify-center items-center w-full min-h-screen">
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
                  className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
                >
                  Pedidos
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
                >
                  Estoque
                </button>
                {isAdmin && (
                  <button
                    onClick={() => router.push("/user-management")}
                    className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    Gerenciar Usuários
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-red-700 transition-all flex items-center justify-center"
                >
                  Logout
                </button>
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
