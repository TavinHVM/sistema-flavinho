// Função para formatar números de telefone no formato "62 99524-1827"
export function formatTelefoneBR(phone?: string): string {
    if (!phone) return "";

    // Remove tudo que não for número
    const digits = phone.replace(/\D/g, "");

    // Verifica se tem pelo menos 10 ou 11 dígitos
    if (digits.length < 10 || digits.length > 11) return phone;

    const ddd = digits.substring(0, 2);
    const firstPart = digits.length === 11
        ? digits.substring(2, 7)
        : digits.substring(2, 6);
    const secondPart = digits.length === 11
        ? digits.substring(7)
        : digits.substring(6);

    return `${ddd} ${firstPart}-${secondPart}`;
}