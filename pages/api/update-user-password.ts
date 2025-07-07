import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role Key (NUNCA expor no frontend)
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simples proteção: só permite se o usuário autenticado for admin
  // (Ajuste conforme sua lógica de autenticação real)
  const userStr = req.headers["x-user-role"] || req.body.role;
  if (userStr !== "Administrador") {
    return res.status(403).json({ error: "Apenas administradores podem alterar senhas." });
  }

  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: "Missing userId or newPassword" });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: "Senha atualizada com sucesso!" });
}
