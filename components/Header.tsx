import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa"; // Importação do ícone

export default function Header() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setNome(user.nome || user.email || "");
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem("user"); // Remove o usuário do localStorage
    setNome("");
    window.location.href = "/login";
  };

  return (
    <div className="w-full bg-gray-900 text-white py-3 px-4 flex justify-center text-sm font-inter mt-2">
      {nome && (
        <span className="text-base flex items-center gap-2">
          Usuário: <strong>{nome}</strong>
          <button
            onClick={onLogout}
            className="text-red-600 hover:text-red-700 transition-all"
          >
            <FaSignOutAlt size={20} />
          </button>
        </span>
      )}
    </div>
  );
}