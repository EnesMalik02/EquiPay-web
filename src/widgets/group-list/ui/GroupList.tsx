"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { groupApi, GroupResponse } from "@/entities/group";
import { CreateGroupModal } from "@/features/create-group";

interface GroupListProps {
    onNewGroup?: () => void;
}

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

export const GroupList = ({ onNewGroup }: GroupListProps) => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const openCreate = () => {
        if (onNewGroup) onNewGroup();
        else setShowCreateModal(true);
    };

    useEffect(() => {
        groupApi
            .list()
            .then(setGroups)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleGroupCreated = (group: GroupResponse) => {
        setGroups((prev) => [group, ...prev]);
        setShowCreateModal(false);
        router.push(`/groups/${group.id}`);
    };

    return (
        <>
            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleGroupCreated}
                />
            )}

            <div className="mb-14">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                        Aktif Gruplar
                    </h3>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-95"
                        style={{ background: "var(--primary)", color: "#000" }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Yeni
                    </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[196px] w-[196px] h-[140px] rounded-2xl shrink-0 animate-shimmer"
                            />
                        ))
                    ) : groups.length === 0 ? (
                        <button
                            onClick={openCreate}
                            className="min-w-[196px] w-[196px] h-[140px] shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
                            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-xs font-semibold">Grup oluştur</span>
                        </button>
                    ) : (
                        <>
                            {groups.map((group, idx) => {
                                const [from, to] = cardGradient(group.name);
                                const initial = group.name.charAt(0).toUpperCase();
                                const isFeatured = idx === 0;
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => router.push(`/groups/${group.id}`)}
                                        className={`shrink-0 rounded-2xl relative overflow-hidden text-left transition-transform active:scale-[0.97] ${
                                            isFeatured
                                                ? "min-w-[260px] w-[260px] h-[160px]"
                                                : "min-w-[196px] w-[196px] h-[140px]"
                                        }`}
                                        style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
                                    >
                                        {/* Large decorative initial */}
                                        <span
                                            className="absolute -right-3 -top-3 font-black leading-none select-none pointer-events-none"
                                            style={{
                                                fontSize: isFeatured ? "100px" : "84px",
                                                color: "rgba(255,255,255,0.10)",
                                                letterSpacing: "-4px",
                                            }}
                                        >
                                            {initial}
                                        </span>

                                        {/* Card content */}
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
                                                    style={{ fontSize: isFeatured ? "15px" : "14px" }}
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
                            })}

                            {/* Add new group card */}
                            <button
                                onClick={openCreate}
                                className="min-w-[140px] w-[140px] h-[140px] shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
                                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: "var(--surface-muted)" }}
                                >
                                    <Plus className="w-4.5 h-4.5 w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                                </div>
                                <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                                    Yeni Grup
                                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
