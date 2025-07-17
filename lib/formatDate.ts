export function formatDateBR(dateStr?: string | Date): string {
  if (!dateStr) return "";

  let date: Date;
  if (typeof dateStr === "string") {
    const [year, month, day] = dateStr.split("-").map(Number);
    // Cria a data como local, sem considerar fuso
    date = new Date(year, month - 1, day);
  } else {
    date = dateStr;
  }

  return date.toLocaleDateString("pt-BR");
}
