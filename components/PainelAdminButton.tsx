interface PainelAdminButtonProps {
  onClick: () => void;
}

export default function PainelAdminButton({ onClick }: PainelAdminButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-all font-poppins text-[0.95rem] font-medium mb-8"
    >
      Voltar ao Painel
    </button>
  );
}