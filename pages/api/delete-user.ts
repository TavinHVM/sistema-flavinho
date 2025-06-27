import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing user id" });
  }
  // Exclui do Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Exclui do profiles (opcional, pois trigger já faz isso)
  await supabaseAdmin.from("profiles").delete().eq("id", id);
  return res.status(200).json({ success: true });
}
