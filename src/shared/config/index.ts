import {
    ShoppingBag, UtensilsCrossed, FileText,
    Navigation, Home, Globe, Plus,
} from "lucide-react";

export type SplitType = "equal" | "exact" | "percentage";

export const CATEGORIES = [
    { id: "market",    label: "Market",    icon: ShoppingBag },
    { id: "yemek",     label: "Yemek",     icon: UtensilsCrossed },
    { id: "fatura",    label: "Fatura",    icon: FileText },
    { id: "ulasim",    label: "Ulaşım",    icon: Navigation },
    { id: "konaklama", label: "Konaklama", icon: Home },
    { id: "eglence",   label: "Eğlence",   icon: Globe },
    { id: "diger",     label: "Diğer",     icon: Plus },
];

export const SPLIT_TYPE_LABELS: Record<string, string> = {
    equal: "Eşit paylaşım",
    exact: "Tutara göre",
    percentage: "Yüzde",
};

export const SPLIT_TYPE_OPTIONS: { value: SplitType; label: string }[] = [
    { value: "equal",      label: "Eşit" },
    { value: "exact",      label: "Tutara göre" },
    { value: "percentage", label: "Yüzde" },
];
