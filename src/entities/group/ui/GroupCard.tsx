"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { GroupResponse } from "../model/types";
import { coverColors } from "@/shared/lib/ui";

interface GroupCardProps {
    group: GroupResponse;
    onClick: () => void;
    coverImageUrl?: string | null;
    className?: string;
}

export const GroupCard = ({ group, onClick, coverImageUrl, className = "" }: GroupCardProps) => {
    const [from, to] = coverColors(group.name);

    return (
        <div
            onClick={onClick}
            className={`w-full rounded-3xl overflow-hidden flex flex-col transition-all cursor-pointer active:scale-[0.98] ${className}`}
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            {/* Cover */}
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

                {/* Initial overlay */}
                {!coverImageUrl && (
                    <span
                        className="absolute bottom-3 right-4 font-black leading-none select-none pointer-events-none"
                        style={{ fontSize: "72px", color: "rgba(0,0,0,0.08)", letterSpacing: "-3px" }}
                    >
                        {group.name.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="px-4 py-3.5 flex flex-col gap-1.5">
                <h4 className="font-bold text-[15px] leading-tight" style={{ color: "var(--foreground)" }}>
                    {group.name}
                </h4>
                {group.description && (
                    <p className="text-xs line-clamp-1" style={{ color: "var(--text-muted)" }}>
                        {group.description}
                    </p>
                )}
                {group.member_count !== undefined && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                            {group.member_count} Üye
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
