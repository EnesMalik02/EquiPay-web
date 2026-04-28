"use client";

import { Users, ChevronRight } from "lucide-react";
import { GroupWithStatsResponse } from "../model/types";

const AVATAR_COLORS = [
    "#1F8A4C", "#2563EB", "#D97706", "#7C3AED",
    "#E11D48", "#0D9488", "#EA580C", "#0891B2",
];

function avatarColor(seed: string, offset = 0): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[(Math.abs(h) + offset) % AVATAR_COLORS.length];
}

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return "az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} saat önce`;
    if (hrs < 48) return "dün";
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} gün önce`;
    return `${Math.floor(days / 7)} hafta önce`;
}

interface GroupListCardProps {
    group: GroupWithStatsResponse;
    onClick: () => void;
}

export const GroupListCard = ({ group, onClick }: GroupListCardProps) => {
    const iconBg = avatarColor(group.name);
    const timeStr = group.updated_at ? relativeTime(group.updated_at) : "";
    const isDebt = group.balance_direction === "debt";
    const isSettled = group.balance_direction === "settled";
    const balanceColor = isSettled ? "var(--text-muted)" : isDebt ? "#D0492F" : "#1F8A4C";

    const memberCount = group.member_count ?? 0;
    const visibleAvatars = Math.min(memberCount, 4);

    return (
        <button
            onClick={onClick}
            className="shrink-0 rounded-2xl text-left transition-transform active:scale-[0.97] cursor-pointer min-w-[240px] w-[240px] p-4 flex flex-col gap-3"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            {/* Top row: icon + chevron */}
            <div className="flex items-start justify-between">
                <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{ background: iconBg }}
                >
                    <Users className="w-5 h-5" style={{ color: "#fff" }} />
                </div>
                <ChevronRight
                    className="w-4 h-4 mt-1"
                    style={{ color: "var(--text-placeholder)" }}
                />
            </div>

            {/* Name + time */}
            <div className="flex-1">
                <p
                    className="font-semibold leading-snug line-clamp-2"
                    style={{ fontSize: "14px", color: "var(--foreground)", letterSpacing: "-0.2px" }}
                >
                    {group.name}
                </p>
                {timeStr && (
                    <p
                        className="mt-0.5"
                        style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-geist-mono, monospace)",
                        }}
                    >
                        {timeStr}
                    </p>
                )}
            </div>

            {/* Bottom: avatars + balance */}
            <div className="flex items-center justify-between gap-2">
                {/* Member avatars */}
                <div className="flex items-center" style={{ gap: "-4px" }}>
                    {Array.from({ length: visibleAvatars }).map((_, i) => (
                        <div
                            key={i}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold border-2"
                            style={{
                                fontSize: "9px",
                                background: avatarColor(group.id, i),
                                borderColor: "var(--surface)",
                                marginLeft: i === 0 ? 0 : -6,
                                zIndex: visibleAvatars - i,
                                position: "relative",
                            }}
                        >
                            {String.fromCharCode(65 + ((group.name.charCodeAt(i % group.name.length) + i) % 26))}
                        </div>
                    ))}
                </div>

                {/* Balance */}
                {isSettled ? (
                    <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                    >
                        Denk
                    </span>
                ) : (
                    <p
                        className="font-semibold shrink-0"
                        style={{
                            fontSize: "12px",
                            color: balanceColor,
                            fontFamily: "var(--font-geist-mono, monospace)",
                        }}
                    >
                        {group.balance_formatted}
                    </p>
                )}
            </div>
        </button>
    );
};
