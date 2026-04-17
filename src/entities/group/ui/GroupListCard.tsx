"use client";

import { Users } from "lucide-react";
import { GroupResponse } from "../model/types";

const CARD_GRADIENTS: [string, string][] = [
    ["#00d186", "#00a0b4"],
    ["#3b82f6", "#6366f1"],
    ["#f59e0b", "#ef4444"],
    ["#8b5cf6", "#ec4899"],
    ["#ec4899", "#f97316"],
    ["#14b8a6", "#6366f1"],
];

function cardGradient(name: string): [string, string] {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length];
}

interface GroupListCardProps {
    group: GroupResponse;
    onClick: () => void;
    isFeatured?: boolean;
}

export const GroupListCard = ({ group, onClick, isFeatured = false }: GroupListCardProps) => {
    const [from, to] = cardGradient(group.name);
    const initial = group.name.charAt(0).toUpperCase();

    return (
        <button
            onClick={onClick}
            className="shrink-0 rounded-2xl relative overflow-hidden text-left transition-transform active:scale-[0.97] cursor-pointer min-w-[260px] w-[260px] h-[160px]"
            style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
        >
            {/* Decorative initial */}
            <span
                className="absolute -right-3 -top-3 font-black leading-none select-none pointer-events-none"
                style={{
                    fontSize: "100px",
                    color: "rgba(255,255,255,0.10)",
                    letterSpacing: "-4px",
                }}
            >
                {initial}
            </span>

            <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.22)" }}
                >
                    <Users className="w-4 h-4 text-white" />
                </div>

                <div>
                    <p
                        className="font-bold text-white leading-tight line-clamp-1"
                        style={{ fontSize: "15px" }}
                    >
                        {group.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        {group.member_count !== undefined && (
                            <span
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}
                            >
                                {group.member_count} üye
                            </span>
                        )}
                        {isFeatured && (
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.7)" }}
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
