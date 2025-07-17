// pages/update-password.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function UpdatePassword() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
            supabase.auth.exchangeCodeForSession(hash).then(() => {
                console.log("Sessão iniciada com token de redefinição.");
            });
        }
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setMessage("Erro ao atualizar senha: " + error.message);
        } else {
            setMessage("Senha atualizada com sucesso! Redirecionando...");
            setTimeout(() => router.push("/login"), 2000);
        }
    };

    return (
        <main className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">Redefinir Senha</h1>
            <form onSubmit={handleUpdate} className="bg-gray-800 p-6 rounded w-full max-w-sm">
                <input
                    type="password"
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full p-3 rounded bg-gray-900 text-white mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 py-2 rounded font-medium hover:bg-blue-700"
                >
                    Atualizar Senha
                </button>
            </form>
            {message && <p className="mt-4 text-blue-400">{message}</p>}
        </main>
    );
}
