"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Search, Layers } from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupResponse } from "@/entities/group/model/types";
import { GroupCard } from "@/entities/group";
import { CreateGroupModal } from "@/features/create-group";
import { SkeletonCard } from "@/shared/ui";

export const GroupsPage = () => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        groupApi
            .list()
            .then(setGroups)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleCreated = (group: GroupResponse) => {
        setGroups((prev) => [group, ...prev]);
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    const filtered = groups.filter((g) =>
        g.name.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>

                {/* ── Header ──────────────────────────────────── */}
                <header className="max-w-5xl mx-auto px-5 pt-12 pb-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Genel Bakış
                            </p>
                            <h1 className="text-[34px] font-black leading-none tracking-tight" style={{ color: "var(--foreground)" }}>
                                Grup
                            </h1>
                            <h1 className="text-[34px] font-black leading-none tracking-tight" style={{ color: "var(--primary)" }}>
                                Yönetimi
                            </h1>
                        </div>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-transform active:scale-95 cursor-pointer mt-1"
                            style={{
                                background: "var(--primary)",
                                color: "#000",
                                boxShadow: "0 4px 14px rgba(0, 209, 134, 0.28)",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Grup
                        </button>
                    </div>

                    {/* Accent line */}
                    <div className="flex items-center gap-2 mt-6 mb-1">
                        <div className="h-0.5 w-8 rounded-full" style={{ background: "var(--primary)" }} />
                        <div className="h-0.5 w-3 rounded-full" style={{ background: "var(--primary-border)" }} />
                        <div className="h-0.5 w-1.5 rounded-full" style={{ background: "var(--border-light)" }} />
                    </div>

                    {/* Stat pills */}
                    {!loading && groups.length > 0 && (
                        <div className="flex gap-2.5 mt-5">
                            <div
                                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border-light)",
                                    boxShadow: "var(--shadow-sm)",
                                }}
                            >
                                <Layers className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{groups.length}</span>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Grup</span>
                            </div>
                            <div
                                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border-light)",
                                    boxShadow: "var(--shadow-sm)",
                                }}
                            >
                                <Users className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
                                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                                    {groups.reduce((acc, g) => acc + (g.member_count ?? 0), 0)}
                                </span>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Üye</span>
                            </div>
                        </div>
                    )}
                </header>

                <main className="max-w-5xl mx-auto px-5 pt-5">

                    {/* ── Search ────────────────────────────────── */}
                    <div className="relative mb-6">
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--text-muted)" }}
                        />
                        <input
                            type="text"
                            placeholder="Grup ara..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                            style={{
                                background: "var(--surface)",
                                border: "1.5px solid var(--border-light)",
                                color: "var(--foreground)",
                            }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-light)")}
                        />
                    </div>

                    {/* ── Group Grid ────────────────────────────── */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-center gap-3">
                            <div
                                className="w-16 h-16 rounded-3xl flex items-center justify-center"
                                style={{ background: "var(--surface-muted)" }}
                            >
                                <Users className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
                            </div>
                            <p className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>
                                {query ? "Arama sonucu bulunamadı." : "Henüz grubun yok."}
                            </p>
                            {!query && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="text-sm font-bold underline cursor-pointer"
                                    style={{ color: "var(--primary)" }}
                                >
                                    İlk grubu oluştur
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-28">
                            {filtered.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onClick={() => router.push(`/groups/${group.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </main>

                <BottomNav />
            </div>
        </>
    );
};
