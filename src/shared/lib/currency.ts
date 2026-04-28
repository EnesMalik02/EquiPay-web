const CURRENCY_SYMBOLS: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    JPY: "¥",
};

export function getCurrencySymbol(code: string): string {
    return CURRENCY_SYMBOLS[code] ?? code;
}
