interface PainelAdminButtonProps {
  onClick: () => void;
}

export default function PainelAdminButton({ onClick }: PainelAdminButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-poppins py-2 px-4 rounded transition-all"
    >
      Voltar
    </button>
  );
}