"use client";

import Image from "next/image";
import { GroupResponse } from "../model/types";

/** Colour palette used when there is no cover image */
const COVER_PALETTE: [string, string][] = [
    ["#d1fae5", "#6ee7b7"],  // green
    ["#dbeafe", "#93c5fd"],  // blue
    ["#fef3c7", "#fcd34d"],  // amber
    ["#fce7f3", "#f9a8d4"],  // pink
    ["#ede9fe", "#c4b5fd"],  // violet
    ["#fee2e2", "#fca5a5"],  // red
];

function coverColors(name: string): [string, string] {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return COVER_PALETTE[Math.abs(hash) % COVER_PALETTE.length];
}

interface GroupCardProps {
    group: GroupResponse;
    onClick: () => void;
    /** Optional cover image URL */
    coverImageUrl?: string | null;
    className?: string;
}

export const GroupCard = ({ group, onClick, coverImageUrl, className = "" }: GroupCardProps) => {
    const [from, to] = coverColors(group.name);

    return (
        <div
            onClick={onClick}
            className={`w-full bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer active:scale-[0.98] ${className}`}
        >
            {/* ── Cover ─────────────────────────────────── */}
            <div
                className="h-[140px] w-full relative shrink-0"
                style={
                    coverImageUrl
                        ? undefined
                        : { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }
                }
            >
                {coverImageUrl && (
                    <Image
                        src={coverImageUrl}
                        alt={group.name}
                        fill
                        className="object-cover"
                    />
                )}
            </div>

            {/* ── Body ──────────────────────────────────── */}
            <div className="p-5 flex flex-col gap-1">
                <h4 className="font-bold text-black text-base leading-tight">{group.name}</h4>
                {group.description && (
                    <p className="text-xs text-gray-400 line-clamp-1">{group.description}</p>
                )}
                {group.member_count !== undefined && (
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {group.member_count} Üye
                    </p>
                )}
            </div>
        </div>
    );
};
