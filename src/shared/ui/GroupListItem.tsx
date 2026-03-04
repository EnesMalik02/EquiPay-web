"use client";

import { ChevronRight } from "lucide-react";
import { GroupResponse } from "@/entities/group/model/types";

/** Colour palette for group avatars – cycles by index */
const PALETTE = [
    { bg: "var(--primary-light)", text: "var(--primary)" },
    { bg: "#eff6ff",              text: "#3b82f6" },
    { bg: "#fef3c7",              text: "#d97706" },
    { bg: "#fdf2f8",              text: "#db2777" },
    { bg: "#f0fdf4",              text: "#16a34a" },
    { bg: "#fef2f2",              text: "#ef4444" },
];

export const colorForIndex = (idx: number) => PALETTE[idx % PALETTE.length];

interface GroupListItemProps {
    group: GroupResponse;
    onClick: () => void;
    /** Used to pick a colour from the palette */
    colorIndex?: number;
}

/**
 * A single group row item.
 * Use this everywhere a group needs to be displayed in a list.
 */
export const GroupListItem = ({ group, onClick, colorIndex = 0 }: GroupListItemProps) => {
    const { bg, text } = colorForIndex(colorIndex);

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] text-left"
            style={{
                background: "var(--surface)",
                borderColor: "var(--border-light)",
                boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
        >
            {/* Avatar */}
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                style={{ background: bg, color: text }}
            >
                {group.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>
                    {group.name}
                </p>
                {group.description && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {group.description}
                    </p>
                )}
                {group.member_count !== undefined && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {group.member_count} üye
                    </p>
                )}
            </div>

            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
        </button>
    );
};
