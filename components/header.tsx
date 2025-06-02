import { useEffect, useState } from "react";

export default function Header() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setNome(user.nome || user.email || "");
    }
  }, []);

  return (
    <div className="w-full bg-[#0a0a0a] text-white py-2 px-4 flex justify-end text-sm font-inter">
      {nome && <span>Logado como: <strong>{nome}</strong></span>}
    </div>
  );
}