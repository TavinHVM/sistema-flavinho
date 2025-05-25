import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function UserManagement() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "funcionario",
  });
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ email: "", role: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleRegister = async () => {
    const { email, password, role } = form;

    if (!email || !password) {
      setMessage("Por favor, preencha todos os campos.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("Erro ao registrar usuário: " + error.message);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: data.user.id, role }]);

    if (profileError) {
      setMessage("Erro ao salvar o perfil do usuário: " + profileError.message);
      return;
    }

    setMessage("Usuário registrado com sucesso!");
    setForm({ email: "", password: "", role: "funcionario" });
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditForm({ email: user.email, role: user.role });
  };

  const handleUpdate = async () => {
    const { email, role } = editForm;

    const { error } = await supabase
      .from("profiles")
      .update({ email, role })
      .eq("id", editingUserId);

    if (!error) {
      setMessage("Usuário atualizado com sucesso!");
      setEditingUserId(null);
      fetchUsers();
    } else {
      setMessage("Erro ao atualizar usuário: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este usuário?");
    if (!confirmar) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) {
      setMessage("Usuário excluído com sucesso!");
      fetchUsers();
    } else {
      setMessage("Erro ao excluir usuário: " + error.message);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <header className="mb-8 w-full max-w-md">
        <div className="w-full flex items-center justify-center relative">
          <div className="flex flex-col items-center justify-center">
            <h1 className="mt-8 font-poppins text-[2rem] font-bold mb-1 text-center">
              Gerenciamento de Usuários
            </h1>
            <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
              Adicione, edite ou exclua usuários do sistema
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
          className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center mb-4"
        >
          Registrar
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-gray-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-gray-700 transition-all flex items-center justify-center"
        >
          Voltar para o Dashboard
        </button>
      </div>
      <section className="mt-8 w-full max-w-4xl">
        <h2 className="font-poppins text-[1.2rem] font-semibold mb-4">Usuários</h2>
        <ul className="bg-gray-800 p-6 rounded-lg shadow-md divide-y divide-gray-700 mb-8">
          {users.map((user) => (
            <li key={user.id} className="py-4 flex justify-between items-center">
              <div>
                <strong className="font-poppins text-[1.1rem] font-semibold">
                  {user.email}
                </strong>
                <p className="font-inter text-[0.9rem] font-normal text-gray-400">
                  Papel: {user.role}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-all font-poppins text-[0.95rem] font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all font-poppins text-[0.95rem] font-medium"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
        {editingUserId && (
          <div className="mt-4 bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="font-poppins text-[1.1rem] font-semibold mb-4">Editar Usuário</h3>
            <input
              type="email"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
            />
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full border p-3 rounded bg-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Administrador</option>
            </select>
            <button
              onClick={handleUpdate}
              className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
            >
              Atualizar
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
