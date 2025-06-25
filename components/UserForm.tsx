import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import PainelAdminButton from "./PainelAdminButton";

interface UserFormProps {
    form: { nome: string; email: string; password: string; role: string };
    setForm: (form: { nome: string; email: string; password: string; role: string }) => void;
    onSubmit: () => void;
    loading: boolean;
}

export default function UserForm({ form, setForm, onSubmit, loading }: UserFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="bg-[rgb(26,34,49)] p-4 sm:p-8 rounded-lg shadow-lg w-full max-w-full sm:max-w-md">
            <label htmlFor="nome" className="block text-sm font-medium mb-1">
                Nome
            </label>
            <input
                id="nome"
                type="text"
                placeholder="Nome do Usuário"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
            />

            <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
            </label>
            <input
                id="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
            />

            <label htmlFor="password" className="block text-sm font-medium mb-1">
                Senha
            </label>
            <div className="relative">
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-1 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xl"
                    tabIndex={-1}
                >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
            </div>
            <p className="text-xs text-gray-400 mb-3 ml-1">
                A senha deve ter pelo menos 6 caracteres
            </p>

            <label htmlFor="role" className="block text-sm font-medium mb-1">
                Cargo
            </label>
            <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-3 rounded bg-gray-900 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
            >
                <option value="">Selecione o cargo</option>
                <option value="Funcionário">Funcionário</option>
                <option value="Administrador">Administrador</option>
            </select>
            <p className="text-xs text-gray-400 mb-3 ml-1">
                Apenas administradores podem gerenciar usuários
            </p>

            <button
                onClick={onSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center mb-4"
                disabled={loading}
            >
                Registrar
            </button>

            <PainelAdminButton />
        </div>
    );
}