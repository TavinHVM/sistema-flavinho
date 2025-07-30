import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import Header from "../components/Header";
import UserForm from "@/components/UserForm";
import UserList from "@/components/UserList";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import RefreshButton from "@/components/RefreshButton";
import SectionTitle from "@/components/SectionTitle";

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export default function UserManagement() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", email: "", role: "", senha: "" });
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      setMessage("Erro ao buscar usuários: " + error.message);
      setUsers([]);
    } else {
      setUsers(
        (data || []).map((user: User) => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Função para inserir usuário na tabela profiles E no Auth
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

    // Verifica se já existe usuário
    const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).single();
    if (existing) {
      setMessage("Já existe um usuário com este email.");
      return;
    }

    // Cria usuário no Auth (frontend, método signUp)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, role } // Campos extras para o trigger preencher em profiles
      }
    });

    if (signUpError || !signUpData?.user?.id) {
      setMessage("Erro ao criar usuário: " + (signUpError?.message || "Erro desconhecido"));
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

  // Atualizar usuário (exceto senha)
  const handleUpdate = async () => {
    const { nome, email, role, senha } = editForm;
    const updateData: Record<string, unknown> = { nome, email, role };

    // Atualiza perfil
    const { error: profileError } = await supabase.from("profiles").update(updateData).eq("id", editingUserId);

    if (profileError) {
      setMessage("Erro ao atualizar usuário: " + profileError.message);
      return;
    }

    // Atualiza senha se fornecida
    if (senha && senha.length >= 6) {
      // Pega o role do usuário autenticado do localStorage
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const roleAtual = user?.role;
      const res = await fetch("/api/update-user-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUserId, newPassword: senha, role: roleAtual }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage("Usuário atualizado, mas erro ao atualizar senha: " + (result.error || "Erro desconhecido"));
        setEditingUserId(null);
        fetchUsers();
        return;
      }
    }

    setMessage("Usuário atualizado com sucesso!");
    setEditingUserId(null);
    fetchUsers();
  };

  // Excluir usuário do Auth e do profiles
  const handleDelete = async (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete.id) return;
    setLoading(true);
    // Chama a API interna protegida
    const res = await fetch("/api/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: confirmDelete.id }),
    });
    const result = await res.json();
    setLoading(false);
    setConfirmDelete({ open: false, id: null });
    if (!res.ok) {
      setToast({ type: 'error', message: "Erro ao excluir usuário: " + (result.error || "Erro desconhecido") });
      return;
    }
    setToast({ type: 'success', message: "Usuário excluído com sucesso!" });
    fetchUsers();
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setMessage("Você precisa estar logado como administrador para acessar esta página.");
        setIsLoggedIn(false);
        router.replace("/login");
        return;
      }
      const user = JSON.parse(userStr);
      const role = user.role;
      if (role !== "Administrador") {
        setMessage("Acesso negado. Apenas administradores podem acessar esta página.");
        setIsLoggedIn(false);
        router.replace("/login");
        return;
      }
      setIsLoggedIn(true);
    };

    checkAdmin();
  }, [router]);

  if (isLoggedIn === null) {
    // Em verificação, pode mostrar um loading ou nada
    return null;
  }

  if (!isLoggedIn) {
    // Usuário não autorizado, não mostra nada (ou pode mostrar uma mensagem)
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-2">
        <div className="mt-10 text-center text-lg text-yellow-400">
          {message || "Acesso restrito."}
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={confirmDelete.open}
        onConfirm={confirmDeleteUser}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        message="Tem certeza que deseja excluir este usuário?"
      />
      <main className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-2">
        <UserForm form={form} setForm={setForm} onSubmit={handleRegister} loading={loading} />
        {(message && !toast) && (
          <div className="mt-4 text-center text-sm text-yellow-400">
            {message}
          </div>
        )}
        <section className="mt-8 w-full max-w-full sm:max-w-4xl px-0 sm:px-4">
          <div className="items-center justify-center">
            <SectionTitle className="text-center mt-12">Usuários</SectionTitle>
            <div className="flex items-center justify-center mb-2">
              <RefreshButton onClick={fetchUsers} loading={loading} />
            </div>
            <input
              className="rounded p-2 text-black mb-2 w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por usuário"
            />
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