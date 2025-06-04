import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import "tailwindcss/tailwind.css";
import Header from "../components/Header";
import UserForm from "@/components/UserForm";
import UserList from "@/components/UserList";

export default function UserManagement() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<
    {
      last_modified_by: string; id: string; nome: string; email: string; role: string
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", email: "", role: "", senha: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      setMessage("Erro ao buscar usuários: " + error.message);
      setUsers([]);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async () => {
    const { nome, email, password, role } = form;

    if (!nome || !email || !password || !role) {
      setMessage("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const { data: existing, error: findError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      setMessage("Já existe um usuário com este email.");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const { error } = await supabase
      .from("profiles")
      .insert([{
        nome,
        email,
        senha: password,
        role,
        last_modified_by: currentUser.nome || currentUser.email || "",
        last_modified_at: new Date().toISOString(),
      }]);

    if (error) {
      setMessage("Erro ao registrar usuário: " + error.message);
      return;
    }

    setMessage("Usuário registrado com sucesso!");
    setForm({ nome: "", email: "", password: "", role: "" });
    fetchUsers();
  };

  useEffect(() => {
    if (editingUserId) {
      setTimeout(() => setShowEdit(true), 10);
    }
  }, [editingUserId]);

  const handleEdit = (user: { id: string; nome: string; email: string; role: string }) => {
    if (editingUserId === user.id) {
      setShowEdit(false);
      setTimeout(() => setEditingUserId(null), 300);
    } else {
      setEditingUserId(user.id);
      setEditForm({ nome: user.nome, email: user.email, role: user.role, senha: "" });
    }
  };

  const handleUpdate = async () => {
    const { nome, email, role, senha } = editForm;
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updateData: Record<string, unknown> = {
      nome,
      email,
      role,
      last_modified_by: currentUser.nome || currentUser.email || "",
      last_modified_at: new Date().toISOString(),
    };
    if (senha && senha.length >= 6) updateData.senha = senha;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", editingUserId);

    if (!error) {
      setMessage("Usuário atualizado com sucesso!");
      setEditingUserId(null);
      fetchUsers();
    } else {
      setMessage("Erro ao atualizar usuário: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este usuário?"
    );
    if (!confirmar) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) {
      setMessage("Usuário excluído com sucesso!");
      fetchUsers();
    } else {
      setMessage("Erro ao excluir usuário: " + error.message);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert(
          "Você precisa estar logado como administrador para acessar esta página."
        );
        router.replace("/login");
        return;
      }
      const user = JSON.parse(userStr);
      const role = user.role;
      if (role !== "Administrador") {
        alert(
          "Acesso negado. Apenas administradores podem acessar esta página."
        );
        router.replace("/login");
      }
    };

    checkAdmin();
  }, [router]);

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-2">
        <header className="mb-8 w-full max-w-full sm:max-w-md">
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

        <UserForm form={form} setForm={setForm} onSubmit={handleRegister} loading={loading} />
        {message && (
          <div className="mt-4 text-center text-sm text-yellow-400">
            {message}
          </div>
        )}
        <section className="mt-8 w-full max-w-full sm:max-w-4xl px-0 sm:px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="font-poppins text-[1.1rem] sm:text-[1.2rem] font-semibold">
              Usuários
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
              <input
                type="text"
                placeholder="Pesquisar por nome"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter text-sm w-full sm:w-auto"
                style={{ minWidth: 0, flex: 1 }}
              />
              <button
                onClick={fetchUsers}
                className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-all font-poppins text-[0.95rem] font-medium w-full sm:w-auto"
                disabled={loading}
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Atualizar Lista
              </button>
            </div>
          </div>

          <UserList users={users} search={search} onEditar={handleEdit} onExcluir={handleDelete} />
          {editingUserId && (
            <div
              className={`mt-4 bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md transition-all duration-300
              ${showEdit ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
            `}
            >
              <h3 className="font-poppins text-[1.1rem] font-semibold mb-4">
                Editar Usuário
              </h3>

              <label
                htmlFor="edit-name"
                className="block text-sm font-medium mb-1"
              >
                Nome
              </label>
              <input
                id="edit-name"
                type="text"
                placeholder="Nome"
                value={editForm.nome}
                onChange={(e) =>
                  setEditForm({ ...editForm, nome: e.target.value })
                }
                className="w-full border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
              />

              <label
                htmlFor="edit-email"
                className="block text-sm font-medium mb-1"
              >
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
              />
              <label
                htmlFor="edit-role"
                className="block text-sm font-medium mb-1"
              >
                Cargo
              </label>
              <select
                id="edit-role"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value })
                }
                className="w-full border p-3 rounded bg-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
              >
                <option value="Funcionario">Funcionário</option>
                <option value="Administrador">Administrador</option>
              </select>
              <label htmlFor="edit-senha" className="block text-sm font-medium mb-1">
                Nova Senha (opcional)
              </label>
              <input
                id="edit-senha"
                type="password"
                placeholder="Nova senha"
                value={editForm.senha}
                onChange={(e) => setEditForm({ ...editForm, senha: e.target.value })}
                className="w-full border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter mb-4"
              />
              <button
                onClick={handleUpdate}
                className="w-full bg-blue-600 text-white py-3 rounded font-poppins text-[0.95rem] font-medium hover:bg-blue-700 transition-all flex items-center justify-center"
              >
                Atualizar
              </button>
            </div>
          )}
        </section>
        <span className="flex flex-col sm:flex-row items-center gap-1 font-inter text-[0.9rem] font-normal text-gray-500 mt-10 mb-4 text-center">
          Desenvolvido por:{" "}
          <a
            href="https://www.linkedin.com/in/gustavo-henrique-6b8352304/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Gustavo Henrique
          </a>
        </span>
      </main>
    </>
  );
}
