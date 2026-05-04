import {
    ShoppingCart,
    Utensils,
    Receipt,
    Car,
    BedDouble,
    Gamepad2,
    Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryMeta {
    icon: LucideIcon;
    label: string;
    color: string;
    bg: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
    market: {
        icon: ShoppingCart,
        label: "Market",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.12)",
    },
    yemek: {
        icon: Utensils,
        label: "Yemek",
        color: "#f97316",
        bg: "rgba(249,115,22,0.12)",
    },
    fatura: {
        icon: Receipt,
        label: "Fatura",
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.12)",
    },
    ulasim: {
        icon: Car,
        label: "Ulaşım",
        color: "#a855f7",
        bg: "rgba(168,85,247,0.12)",
    },
    konaklama: {
        icon: BedDouble,
        label: "Konaklama",
        color: "#14b8a6",
        bg: "rgba(20,184,166,0.12)",
    },
    eglence: {
        icon: Gamepad2,
        label: "Eğlence",
        color: "#ec4899",
        bg: "rgba(236,72,153,0.12)",
    },
    diger: {
        icon: Tag,
        label: "Diğer",
        color: "#6b7280",
        bg: "rgba(107,114,128,0.12)",
    },
};

export function getCategoryMeta(category?: string | null): CategoryMeta | null {
    if (!category) return null;
    return CATEGORY_META[category] ?? CATEGORY_META["diger"];
}

export function getCategoryMetaWithFallback(category?: string | null): CategoryMeta {
    return CATEGORY_META[category ?? ""] ?? CATEGORY_META["diger"];
}
