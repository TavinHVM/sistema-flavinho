import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function UserManagement() {
  const [form, setForm] = useState({ email: '', password: '', role: 'funcionario' });
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    const { email, password, role } = form;

    if (!email || !password) {
      setMessage('Por favor, preencha todos os campos.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage('Erro ao registrar usuário: ' + error.message);
      return;
    }

    if (!data.user) {
      setMessage('Erro: Usuário não encontrado após o registro.');
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, role }]);

    if (profileError) {
      setMessage('Erro ao salvar o perfil do usuário: ' + profileError.message);
      return;
    }

    setMessage('Usuário registrado com sucesso!');
    setForm({ email: '', password: '', role: 'funcionario' });
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <header className="mb-8 w-full max-w-md">
        <div className="w-full flex items-center justify-center relative">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-poppins text-[2rem] font-bold mb-1 text-center">
              Gerenciamento de Usuários
            </h1>
            <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
              Adicione novos usuários ao sistema
            </p>
          </div>
        </div>
      </header>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border p-3 rounded bg-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
        >
          <option value="funcionario">Funcionário</option>
          <option value="admin">Administrador</option>
        </select>
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
        >
          Registrar
        </button>
        {message && (
          <p className="text-center text-gray-400 mt-4 font-inter">{message}</p>
        )}
      </div>
    </main>
  );
}