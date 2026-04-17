"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { GroupList } from "@/widgets/group-list/ui/GroupList";
import { Clock, Plus, TrendingUp, Receipt, ArrowUpRight } from "lucide-react";
import { CreateGroupModal } from "@/features/create-group";
import { GroupResponse } from "@/entities/group/model/types";
import { useRecentExpenses } from "@/entities/expense/hooks/useRecentExpenses";
import { useUser } from "@/shared/store/UserContext";
import { RecentExpenseResponse } from "@/entities/expense/model/types";

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Bugün";
    if (diffDays === 1) return "Dün";
    return `${diffDays} gün önce`;
}

function RecentExpenseCard({ expense, currentUserId, onClick }: {
    expense: RecentExpenseResponse;
    currentUserId: string | null;
    onClick: () => void;
}) {
    const isPayer = String(expense.paid_by) === String(currentUserId);
    const mySplit = expense.splits?.find((s) => String(s.user_id) === String(currentUserId));
    const amount = `₺${parseFloat(expense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 rounded-2xl px-4 py-3.5 cursor-pointer transition-transform active:scale-[0.99]"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: isPayer ? "var(--primary-light)" : "var(--surface-muted)" }}
            >
                {isPayer ? (
                    <Receipt className="w-5 h-5" style={{ color: "var(--primary)" }} />
                ) : (
                    <ArrowUpRight className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>
                    {expense.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatRelativeDate(expense.expense_date)}
                        {expense.group_name ? ` · ${expense.group_name}` : ""}
                    </p>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="font-extrabold text-sm" style={{ color: "var(--foreground)" }}>{amount}</p>
                {isPayer ? (
                    <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                    >
                        Sen Ödedin
                    </span>
                ) : mySplit ? (
                    <span
                        className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                    >
                        Payın: ₺{parseFloat(mySplit.owed_amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export const HomePage = () => {
    const router = useRouter();
    const currentUser = useUser();
    const [showCreate, setShowCreate] = useState(false);
    const { data: recentExpenses, isLoading } = useRecentExpenses(10);

    const handleCreated = (group: GroupResponse) => {
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            {/* ── Top Header ─────────────────────────────────── */}
            <header className="max-w-5xl mx-auto px-5 pt-12 pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <p
                            className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <h1 className="text-[34px] font-black leading-none tracking-tight" style={{ color: "var(--foreground)" }}>
                            Harcama
                        </h1>
                        <h1 className="text-[34px] font-black leading-none tracking-tight" style={{ color: "var(--primary)" }}>
                            Takibi
                        </h1>
                    </div>
                </div>

                {/* Accent line */}
                <div className="flex items-center gap-2 mt-6 mb-1">
                    <div className="h-0.5 w-8 rounded-full" style={{ background: "var(--primary)" }} />
                    <div className="h-0.5 w-3 rounded-full" style={{ background: "var(--primary-border)" }} />
                    <div className="h-0.5 w-1.5 rounded-full" style={{ background: "var(--border-light)" }} />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-5">

                {/* ── New Group CTA ─────────────────────────────── */}
                <button
                    onClick={() => setShowCreate(true)}
                    className="w-full flex items-center justify-between rounded-2xl px-5 py-4 mb-8 mt-4 transition-all active:scale-[0.98] cursor-pointer"
                    style={{
                        background: "var(--primary)",
                        boxShadow: "0 4px 20px rgba(0, 209, 134, 0.30)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.20)" }}
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[15px] font-extrabold text-white leading-tight">Yeni Grup Oluştur</p>
                            <p className="text-[11px] text-white/70 font-medium">Arkadaşlarınla harcama paylaş</p>
                        </div>
                    </div>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                        <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                </button>

                {/* ── Groups Section ────────────────────────────── */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
                        <h2 className="text-base font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                            Gruplarım
                        </h2>
                    </div>
                    <GroupList onNewGroup={() => setShowCreate(true)} showHeader={false} />
                </div>

                {/* ── Recent Transactions ──────────────────────── */}
                <div className="mb-28">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-5 rounded-full" style={{ background: "var(--foreground)" }} />
                            <h2 className="text-base font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                                Son Hareketler
                            </h2>
                        </div>
                        <button
                            onClick={() => router.push("/settlements")}
                            className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                            style={{
                                color: "var(--text-muted)",
                                border: "1px solid var(--border-light)",
                            }}
                        >
                            Tümü
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 rounded-2xl px-4 py-3.5 animate-pulse"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
                                >
                                    <div className="w-11 h-11 rounded-2xl" style={{ background: "var(--surface-muted)" }} />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 rounded-full w-32" style={{ background: "var(--surface-muted)" }} />
                                        <div className="h-2 rounded-full w-20" style={{ background: "var(--surface-muted)" }} />
                                    </div>
                                    <div className="h-4 rounded-full w-16" style={{ background: "var(--surface-muted)" }} />
                                </div>
                            ))
                        ) : !recentExpenses || recentExpenses.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-3 text-center">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ background: "var(--surface-muted)" }}
                                >
                                    <Receipt className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                                </div>
                                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                                    Henüz harcama yok.
                                </p>
                            </div>
                        ) : (
                            recentExpenses.map((expense) => (
                                <RecentExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                    currentUserId={currentUser?.id ?? null}
                                    onClick={() =>
                                        router.push(`/groups/${expense.group_id}/expenses/${expense.id}`)
                                    }
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};
