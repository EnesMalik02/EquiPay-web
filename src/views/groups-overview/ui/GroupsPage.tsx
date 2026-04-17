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

                {/* ── Gradient Header ─────────────────────────── */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, #0a0a0a 0%, #1c1c2e 55%, #16213e 100%)",
                        paddingTop: 48,
                        paddingBottom: 32,
                        paddingLeft: 24,
                        paddingRight: 24,
                    }}
                >
                    {/* Glow — right side */}
                    <div
                        className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full"
                        style={{
                            background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
                            opacity: 0.15,
                            transform: "translate(25%, -25%)",
                        }}
                    />
                    {/* Glow — left bottom */}
                    <div
                        className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full"
                        style={{
                            background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
                            opacity: 0.12,
                            transform: "translate(-20%, 20%)",
                        }}
                    />

                    <div className="max-w-5xl mx-auto relative z-10">
                        {/* Title row */}
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="text-[11px] font-bold tracking-widest uppercase mb-1"
                                    style={{ color: "rgba(255,255,255,0.4)" }}
                                >
                                    Genel Bakış
                                </p>
                                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                    Gruplarım
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-transform active:scale-95"
                                style={{ background: "var(--primary)", color: "#000" }}
                            >
                                <Plus className="w-4 h-4" />
                                Yeni Grup
                            </button>
                        </div>

                        {/* Stat pills */}
                        {!loading && groups.length > 0 && (
                            <div className="flex gap-3 mt-5">
                                <div
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
                                    style={{ background: "rgba(255,255,255,0.08)" }}
                                >
                                    <Layers className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                    <span className="text-sm font-bold text-white">{groups.length}</span>
                                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                                        Grup
                                    </span>
                                </div>
                                <div
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl"
                                    style={{ background: "rgba(255,255,255,0.08)" }}
                                >
                                    <Users className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
                                    <span className="text-sm font-bold text-white">
                                        {groups.reduce((acc, g) => acc + (g.member_count ?? 0), 0)}
                                    </span>
                                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                                        Üye
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor = "var(--primary)")
                            }
                            onBlur={(e) =>
                                (e.currentTarget.style.borderColor = "var(--border-light)")
                            }
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
                                    className="text-sm font-bold underline"
                                    style={{ color: "var(--primary)" }}
                                >
                                    İlk grubu oluştur
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
