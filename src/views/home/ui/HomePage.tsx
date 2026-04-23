"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { GroupList } from "@/widgets/group-list/ui/GroupList";
import { Plus, Users, Receipt, Bell } from "lucide-react";
import { CreateGroupModal } from "@/features/create-group";
import { SelectGroupModal } from "@/features/select-group/ui/SelectGroupModal";
import { GroupResponse } from "@/entities/group/model/types";
import { useMySplitExpenses } from "@/entities/expense/hooks/useMySplitExpenses";
import { useUser } from "@/shared/store/UserContext";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { SplitExpenseItem, SkeletonSettlementItem } from "@/shared/ui";

export const HomePage = () => {
    const router = useRouter();
    const currentUser = useUser();
    const qc = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [showSelectGroup, setShowSelectGroup] = useState(false);
    const { data: recentExpenses, isLoading } = useMySplitExpenses({ limit: 10 });

    const handleCreated = (group: GroupResponse) => {
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    const handlePaySplit = async (expenseId: string, splitId: string) => {
        await expenseApi.paySplit(expenseId, splitId);
        qc.invalidateQueries({ queryKey: ["expenses", "my-splits"] });
    };

    const quickActions = [
        {
            label: "Harcama",
            icon: <Plus className="w-[15px] h-[15px]" />,
            onClick: () => setShowSelectGroup(true),
        },
        {
            label: "Gruplar",
            icon: <Users className="w-[15px] h-[15px]" />,
            onClick: () => router.push("/groups"),
        },
        {
            label: "Geçmiş",
            icon: <Receipt className="w-[15px] h-[15px]" />,
            onClick: () => router.push("/settlements"),
        },
    ];

    const greeting = currentUser?.display_name
        ? `Merhaba ${currentUser.display_name.split(" ")[0]}`
        : "Merhaba";

    return (
        <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}
            {showSelectGroup && (
                <SelectGroupModal onClose={() => setShowSelectGroup(false)} />
            )}

            {/* ── Header ─────────────────────────────────────── */}
            <header className="px-4 pt-14 pb-4 flex items-start justify-between">
                <div>
                    <p
                        className="text-[10px] uppercase mb-1"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: "var(--text-muted)",
                            letterSpacing: "0.08em",
                        }}
                    >
                        {new Date().toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date().toLocaleDateString("tr-TR", { weekday: "long" })}
                    </p>
                    <h1
                        className="text-[24px] font-semibold"
                        style={{ letterSpacing: "-0.5px", lineHeight: 1.2 }}
                    >
                        {greeting}
                    </h1>
                </div>
                <button
                    onClick={() => router.push("/notifications")}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center active:scale-95 transition-transform mt-1"
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                    }}
                >
                    <Bell className="w-[18px] h-[18px]" />
                </button>
            </header>

            <main className="px-4 pb-32">
                {/* ── Quick Actions ─────────────────────────────── */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {quickActions.map((a) => (
                        <button
                            key={a.label}
                            onClick={a.onClick}
                            className="rounded-[var(--radius-lg)] p-3 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                                style={{
                                    background: "var(--primary-light)",
                                    color: "var(--primary)",
                                }}
                            >
                                {a.icon}
                            </div>
                            <span
                                className="text-[11px] font-medium"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {a.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Groups ────────────────────────────────────── */}
                <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-2.5">
                        <div>
                            <p
                                className="text-[10px] uppercase mb-1"
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    color: "var(--text-muted)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Aktif
                            </p>
                            <h2
                                className="text-[15px] font-semibold"
                                style={{ letterSpacing: "-0.3px" }}
                            >
                                Gruplarım
                            </h2>
                        </div>
                        <button
                            onClick={() => router.push("/groups")}
                            className="text-[12px] cursor-pointer"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Tümü →
                        </button>
                    </div>
                    <GroupList onNewGroup={() => setShowCreate(true)} showHeader={false} />
                </div>

                {/* ── Recent Activity ──────────────────────────── */}
                <div>
                    <div className="flex items-baseline justify-between mb-2.5">
                        <div>
                            <p
                                className="text-[10px] uppercase mb-1"
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    color: "var(--text-muted)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Son 7 gün
                            </p>
                            <h2
                                className="text-[15px] font-semibold"
                                style={{ letterSpacing: "-0.3px" }}
                            >
                                Hareketler
                            </h2>
                        </div>
                        <button
                            onClick={() => router.push("/settlements")}
                            className="text-[12px] cursor-pointer"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Tümü →
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonSettlementItem key={i} />
                            ))}
                        </div>
                    ) : !recentExpenses || recentExpenses.length === 0 ? (
                        <div
                            className="rounded-[var(--radius-lg)] py-10 flex flex-col items-center gap-2 text-center"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <Receipt
                                className="w-6 h-6"
                                style={{ color: "var(--text-placeholder)" }}
                            />
                            <p
                                className="text-[13px] font-medium"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Henüz harcama yok.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentExpenses.map((expense) => (
                                <SplitExpenseItem
                                    key={expense.id}
                                    expense={expense}
                                    onPaid={handlePaySplit}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    );
};
