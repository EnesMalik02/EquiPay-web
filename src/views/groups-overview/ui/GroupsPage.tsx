"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, ChevronRight } from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupResponse, GroupWithStatsResponse } from "@/entities/group/model/types";
import { CreateGroupModal } from "@/features/create-group";

const GROUP_TINTS = [
    { bg: "#1F8A4C", ink: "#FFFFFF" },
    { bg: "#E0A32A", ink: "#FFFFFF" },
    { bg: "#2E7BC9", ink: "#FFFFFF" },
    { bg: "#D7456B", ink: "#FFFFFF" },
    { bg: "#7C5AD9", ink: "#FFFFFF" },
    { bg: "#D46A3A", ink: "#FFFFFF" },
];

function getTint(name: string) {
    let hash = 0;
    for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return GROUP_TINTS[hash % GROUP_TINTS.length];
}

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const diffDays = Math.floor(
        (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "bugün";
    if (diffDays === 1) return "dün";
    if (diffDays < 7) return `${diffDays} gün önce`;
    const w = Math.floor(diffDays / 7);
    if (w < 5) return `${w} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
}

function GroupRow({ group, onClick }: { group: GroupWithStatsResponse; onClick: () => void }) {
    const tint = getTint(group.name);
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors active:bg-[var(--surface-alt)]"
        >
            {/* Tint icon */}
            <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 text-[15px] font-semibold"
                style={{ background: tint.bg, color: tint.ink }}
            >
                {group.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p
                    className="font-medium text-[14px] truncate"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                >
                    {group.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                    <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                        {group.member_count ?? "?"} üye
                    </span>
                    {(group.updated_at ?? group.created_at) && (
                        <>
                            <span
                                className="inline-block w-[2px] h-[2px] rounded-full"
                                style={{ background: "var(--text-placeholder)" }}
                            />
                            <span
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    fontSize: "11px",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {formatTimeAgo(group.updated_at ?? group.created_at)}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {(() => {
                const bal = parseFloat(group.balance);
                if (bal === 0) return null;
                return (
                    <span
                        className="text-[12px] font-semibold shrink-0 mr-1"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: bal > 0 ? "var(--primary)" : "var(--danger)",
                        }}
                    >
                        {bal > 0 ? "+" : ""}₺{Math.abs(bal).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                );
            })()}
            <ChevronRight
                className="w-4 h-4 shrink-0"
                style={{ color: "var(--text-placeholder)" }}
            />
        </div>
    );
}

export const GroupsPage = () => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupWithStatsResponse[]>([]);
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
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    const filtered = groups.filter((g) =>
        g.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            <div className="min-h-screen" style={{ background: "var(--background)" }}>

                {/* ── Header ──────────────────────────────────── */}
                <header className="px-4 pt-14 pb-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p
                                className="text-[10px] uppercase mb-1"
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    color: "var(--text-muted)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Genel Bakış
                            </p>
                            <h1
                                className="text-[24px] font-semibold"
                                style={{
                                    color: "var(--foreground)",
                                    letterSpacing: "-0.5px",
                                    lineHeight: 1.2,
                                }}
                            >
                                Gruplarım
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium cursor-pointer active:scale-95 transition-transform mt-1 shrink-0"
                            style={{ background: "var(--primary)", color: "#fff" }}
                        >
                            <Plus className="w-4 h-4" />
                            Yeni Grup
                        </button>
                    </div>

                    {/* Search */}
                    <div
                        className="flex items-center gap-2.5 mt-4 px-3.5 rounded-[var(--radius-md)] h-10"
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <Search
                            className="w-4 h-4 shrink-0"
                            style={{ color: "var(--text-muted)" }}
                        />
                        <input
                            type="text"
                            placeholder="Grup ara…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 text-[13px] outline-none bg-transparent"
                            style={{ color: "var(--foreground)" }}
                        />
                    </div>
                </header>

                {/* ── Stat pills ──────────────────────────────── */}
                {!loading && groups.length > 0 && (
                    <div className="px-4 pb-4 flex gap-2">
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)]"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <span
                                className="text-[13px] font-semibold"
                                style={{ color: "var(--foreground)" }}
                            >
                                {groups.length}
                            </span>
                            <span
                                className="text-[12px]"
                                style={{ color: "var(--text-muted)" }}
                            >
                                grup
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)]"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <span
                                className="text-[13px] font-semibold"
                                style={{ color: "var(--foreground)" }}
                            >
                                {groups.reduce((a, g) => a + (g.member_count ?? 0), 0)}
                            </span>
                            <span
                                className="text-[12px]"
                                style={{ color: "var(--text-muted)" }}
                            >
                                üye
                            </span>
                        </div>
                    </div>
                )}

                <main className="px-4 pb-32">
                    {loading ? (
                        /* Skeleton list */
                        <div
                            className="rounded-[var(--radius-lg)] overflow-hidden"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 px-5 py-4"
                                    style={{
                                        borderBottom:
                                            i < 3
                                                ? "1px solid var(--border-light)"
                                                : "none",
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-[10px] shrink-0 animate-pulse"
                                        style={{ background: "var(--surface-muted)" }}
                                    />
                                    <div className="flex-1 space-y-2">
                                        <div
                                            className="h-3 rounded-full w-36 animate-pulse"
                                            style={{ background: "var(--surface-muted)" }}
                                        />
                                        <div
                                            className="h-2.5 rounded-full w-24 animate-pulse"
                                            style={{ background: "var(--surface-muted)" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        /* Empty state */
                        <div className="py-20 flex flex-col items-center gap-3 text-center">
                            <div
                                className="w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                <Users
                                    className="w-6 h-6"
                                    style={{ color: "var(--text-muted)" }}
                                />
                            </div>
                            <p
                                className="text-[14px] font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {query
                                    ? "Arama sonucu bulunamadı."
                                    : "Henüz grubun yok."}
                            </p>
                            {!query && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="text-[13px] font-semibold cursor-pointer"
                                    style={{ color: "var(--primary)" }}
                                >
                                    İlk grubu oluştur
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Group list */
                        <div
                            className="rounded-[var(--radius-lg)] overflow-hidden"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {filtered.map((group, i) => (
                                <div
                                    key={group.id}
                                    style={{
                                        borderBottom:
                                            i < filtered.length - 1
                                                ? "1px solid var(--border-light)"
                                                : "none",
                                    }}
                                >
                                    <GroupRow
                                        group={group}
                                        onClick={() =>
                                            router.push(`/groups/${group.id}`)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <BottomNav />
            </div>
        </>
    );
};
