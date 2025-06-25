import { useRouter } from "next/router";

interface PainelAdminButtonProps {
  onClick?: () => void;
}

export default function PainelAdminButton({ onClick }: PainelAdminButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role === "Administrador" || user.role === "Funcionario") {
      if (onClick) {
        onClick();
      } else {
        router.push("/dashboard");
      }
    } else {
      router.replace("/login");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-poppins py-2 px-4 rounded transition-all"
    >
      Voltar ao Painel
    </button>
  );
}