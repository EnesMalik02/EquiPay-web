"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { groupApi, GroupResponse, GroupWithStatsResponse, GroupListCard } from "@/entities/group";
import { CreateGroupModal } from "@/features/create-group";

interface GroupListProps {
    onNewGroup?: () => void;
    /** Header (title + new button) ve sona eklenen "Yeni Grup" kartını gizler.
     *  Parent kendi başlığını ve oluşturma butonunu yönetiyorsa false geçin. */
    showHeader?: boolean;
    limit?: number;
}

export const GroupList = ({ onNewGroup, showHeader = true, limit = 6 }: GroupListProps) => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupWithStatsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    const scroll = (dir: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
    };

    const openCreate = () => {
        if (onNewGroup) onNewGroup();
        else setShowCreateModal(true);
    };

    useEffect(() => {
        groupApi
            .list({ limit })
            .then((page) => setGroups(page.items))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [limit]);

    const handleGroupCreated = (group: GroupResponse) => {
        setShowCreateModal(false);
        router.push(`/groups/${group.id}`);
    };

    useEffect(() => {
        updateScrollState();
    }, [groups, loading]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver(updateScrollState);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <>
            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleGroupCreated}
                />
            )}

            <div className="mb-14">
                {showHeader && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                            Aktif Gruplar
                        </h3>
                        <div className="flex items-center gap-2">
                            {(canScrollLeft || canScrollRight) && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => scroll("left")}
                                        disabled={!canScrollLeft}
                                        className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                                        style={{
                                            background: "var(--surface-muted)",
                                            opacity: canScrollLeft ? 1 : 0.3,
                                        }}
                                    >
                                        <ChevronLeft className="w-4 h-4" style={{ color: "var(--foreground)" }} />
                                    </button>
                                    <button
                                        onClick={() => scroll("right")}
                                        disabled={!canScrollRight}
                                        className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity cursor-pointer"
                                        style={{
                                            background: "var(--surface-muted)",
                                            opacity: canScrollRight ? 1 : 0.3,
                                        }}
                                    >
                                        <ChevronRight className="w-4 h-4" style={{ color: "var(--foreground)" }} />
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-95 cursor-pointer"
                                style={{ background: "var(--primary)", color: "#000" }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Yeni
                            </button>
                        </div>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    onScroll={updateScrollState}
                    className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar"
                >
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="shrink-0 rounded-2xl animate-shimmer relative overflow-hidden min-w-[240px] w-[240px] h-[160px]"
                                style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
                            >
                                <div className="absolute top-4 left-4 w-12 h-12 rounded-[14px]" style={{ background: "var(--surface-muted)" }} />
                                <div className="absolute bottom-4 left-4 h-3 rounded-full" style={{ width: "100px", background: "var(--surface-muted)" }} />
                                <div className="absolute bottom-9 left-4 h-2 rounded-full" style={{ width: "60px", background: "var(--surface-muted)" }} />
                            </div>
                        ))
                    ) : groups.length === 0 ? (
                        <button
                            onClick={openCreate}
                            className="min-w-[196px] w-[196px] h-[140px] shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-xs font-semibold">Grup oluştur</span>
                        </button>
                    ) : (
                        <>
                            {groups.map((group) => (
                                <GroupListCard
                                    key={group.id}
                                    group={group}
                                    onClick={() => router.push(`/groups/${group.id}`)}
                                />
                            ))}

                            {showHeader && (
                                <button
                                    onClick={openCreate}
                                    className="min-w-[140px] w-[140px] h-[140px] shrink-0 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: "var(--surface-muted)" }}
                                    >
                                        <Plus className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                                    </div>
                                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                                        Yeni Grup
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
