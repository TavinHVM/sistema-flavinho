interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder || "Pesquisar"}
      value={value}
      onChange={onChange}
      className="p-2 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter text-sm"
      style={{ minWidth: 180 }}
    />
  );
}