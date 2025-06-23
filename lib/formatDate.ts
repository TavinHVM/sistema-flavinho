// Função utilitária para formatar datas no padrão brasileiro dd/mm/yyyy
export function formatDateBR(dateStr?: string | Date): string {
  if (!dateStr) return "";
  let date: Date;
  if (typeof dateStr === "string") {
    // Tenta parsear ISO ou outros formatos
    date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Retorna original se inválida
  } else {
    date = dateStr;
  }
  return date.toLocaleDateString("pt-BR");
}
