// Formata CPF ou CNPJ com base no tamanho
export function formatCpfCnpjBR(value?: string): string {
    if (!value) return "";

    const digits = value.replace(/\D/g, "");

    if (digits.length === 11) {
        // Formata como CPF: 000.000.000-00
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (digits.length === 14) {
        // Formata como CNPJ: 00.000.000/0000-00
        return digits.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5"
        );
    } else {
        // Retorna sem formatação se não for 11 nem 14
        return value;
    }
}
