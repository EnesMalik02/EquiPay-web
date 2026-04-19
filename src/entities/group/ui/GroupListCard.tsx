"use client";

import { Users } from "lucide-react";
import { GroupResponse } from "../model/types";

const CARD_PALETTES: { bg: string; text: string; sub: string; icon: string }[] = [
    { bg: "#DCF0E2", text: "#0E5C30", sub: "#1F8A4C", icon: "#B8E5CA" },
    { bg: "#DBEAFE", text: "#1E3A8A", sub: "#2563EB", icon: "#BFDBFE" },
    { bg: "#FEF3C7", text: "#78350F", sub: "#D97706", icon: "#FDE68A" },
    { bg: "#EDE9FE", text: "#4C1D95", sub: "#7C3AED", icon: "#DDD6FE" },
    { bg: "#FFE4E6", text: "#881337", sub: "#E11D48", icon: "#FECDD3" },
    { bg: "#CCFBF1", text: "#134E4A", sub: "#0D9488", icon: "#99F6E4" },
];

function cardPalette(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return CARD_PALETTES[Math.abs(hash) % CARD_PALETTES.length];
}

interface GroupListCardProps {
    group: GroupResponse;
    onClick: () => void;
    isFeatured?: boolean;
}

export const GroupListCard = ({ group, onClick, isFeatured = false }: GroupListCardProps) => {
    const palette = cardPalette(group.name);
    const initial = group.name.charAt(0).toUpperCase();

    return (
        <button
            onClick={onClick}
            className="shrink-0 rounded-2xl relative overflow-hidden text-left transition-transform active:scale-[0.97] cursor-pointer min-w-[260px] w-[260px] h-[160px]"
            style={{ background: palette.bg, border: `1px solid ${palette.icon}` }}
        >
            {/* Decorative initial */}
            <span
                className="absolute -right-3 -top-3 font-black leading-none select-none pointer-events-none"
                style={{
                    fontSize: "100px",
                    color: palette.icon,
                    letterSpacing: "-4px",
                    opacity: 0.5,
                }}
            >
                {initial}
            </span>

            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: palette.icon }}
                >
                    <Users className="w-4 h-4" style={{ color: palette.text }} />
                </div>

                <div>
                    <p
                        className="font-bold leading-tight line-clamp-1"
                        style={{ fontSize: "15px", color: palette.text }}
                    >
                        {group.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        {group.member_count !== undefined && (
                            <span
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: palette.icon, color: palette.text }}
                            >
                                {group.member_count} üye
                            </span>
                        )}
                        {isFeatured && (
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: palette.icon, color: palette.sub }}
                            >
                                Son aktif
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};
