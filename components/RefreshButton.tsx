import { FaSyncAlt } from "react-icons/fa";

interface RefreshButtonProps {
  onClick: () => void;
  loading: boolean;
}

export default function RefreshButton({ onClick, loading }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-all font-poppins text-[0.95rem] font-medium"
      disabled={loading}
    >
      <FaSyncAlt className={loading ? "animate-spin" : ""} />
      Atualizar Lista
    </button>
  );
}