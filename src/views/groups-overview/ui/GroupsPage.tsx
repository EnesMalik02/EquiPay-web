"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Search, ChevronRight } from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupResponse } from "@/entities/group/model/types";
import { CreateGroupModal } from "@/features/create-group";

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

    /* colour palette for group avatars */
    const palette = [
        { bg: "var(--primary-light)", text: "var(--primary)" },
        { bg: "#eff6ff",              text: "#3b82f6" },
        { bg: "#fef3c7",              text: "#d97706" },
        { bg: "#fdf2f8",              text: "#db2777" },
        { bg: "#f0fdf4",              text: "#16a34a" },
        { bg: "#fef2f2",              text: "#ef4444" },
    ];
    const colorFor = (idx: number) => palette[idx % palette.length];

    return (
        <>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
                <main className="max-w-5xl mx-auto px-6 pt-10">

                    {/* ── Header ───────────────────────────────── */}
                    <div className="flex items-center justify-between mb-7">
                        <div>
                            <p className="text-[11px] font-bold tracking-widest uppercase mb-1"
                               style={{ color: "var(--text-muted)" }}>
                                Genel Bakış
                            </p>
                            <h1 className="text-3xl font-extrabold tracking-tight"
                                style={{ color: "var(--foreground)" }}>
                                Gruplarım
                            </h1>
                        </div>

                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                            style={{
                                background: "var(--foreground)",
                                color: "#fff",
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Grup
                        </button>
                    </div>

                    {/* ── Search ───────────────────────────────── */}
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
                            className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all border"
                            style={{
                                background: "var(--surface)",
                                border: "1.5px solid var(--border-light)",
                                color: "var(--foreground)",
                            }}
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = "var(--primary)")
                            }
                            onBlur={(e) =>
                                (e.currentTarget.style.borderColor = "var(--border-light)")
                            }
                        />
                    </div>

                    {/* ── Stats ────────────────────────────────── */}
                    {!loading && groups.length > 0 && (
                        <div
                            className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl border"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border-light)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            <div className="text-center">
                                <p className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>
                                    {groups.length}
                                </p>
                                <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    Aktif Grup
                                </p>
                            </div>
                            <div className="text-center border-l" style={{ borderColor: "var(--border-light)" }}>
                                <p className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>
                                    {groups.reduce((acc) => acc, 0)}
                                </p>
                                <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                                    Toplam Harcama
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── List ─────────────────────────────────── */}
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 rounded-2xl animate-pulse"
                                    style={{ background: "var(--surface-muted)" }}
                                />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-center gap-3">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center"
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
                                    className="text-sm font-bold underline"
                                    style={{ color: "var(--primary)" }}
                                >
                                    İlk grubu oluştur
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {filtered.map((group, idx) => {
                                const { bg, text } = colorFor(idx);
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => router.push(`/groups/${group.id}`)}
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
                                            <p
                                                className="font-bold text-sm truncate"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                {group.name}
                                            </p>
                                            {group.description && (
                                                <p
                                                    className="text-xs truncate mt-0.5"
                                                    style={{ color: "var(--text-muted)" }}
                                                >
                                                    {group.description}
                                                </p>
                                            )}
                                        </div>

                                        <ChevronRight
                                            className="w-4 h-4 shrink-0"
                                            style={{ color: "var(--text-muted)" }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </main>

                <BottomNav />
            </div>
        </>
    );
};
