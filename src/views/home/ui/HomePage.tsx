"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { GroupList } from "@/widgets/group-list/ui/GroupList";
import { Plus, Users, Receipt, ArrowDownLeft, ArrowUpRight, Check } from "lucide-react";
import { CreateGroupModal } from "@/features/create-group";
import { GroupResponse } from "@/entities/group/model/types";
import { useRecentExpenses } from "@/entities/expense/hooks/useRecentExpenses";
import { useUser } from "@/shared/store/UserContext";
import { ExpenseWithMySplitResponse } from "@/entities/expense/model/types";

function formatMoney(val: number | string): string {
    const n = typeof val === "string" ? parseFloat(val) : val;
    return `₺${Math.abs(n).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Bugün";
    if (diffDays === 1) return "Dün";
    return `${diffDays} gün önce`;
}

function ActivityRow({
    expense,
    currentUserId,
    onClick,
    isLast,
}: {
    expense: ExpenseWithMySplitResponse;
    currentUserId: string | null;
    onClick: () => void;
    isLast: boolean;
}) {
    const isPayer = String(expense.paid_by) === String(currentUserId);
    const isSettled = expense.is_fully_paid;
    const mySplit = expense.my_split;
    const myOwed = mySplit ? parseFloat(mySplit.owed_amount) : 0;

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors active:bg-[var(--surface-alt)]"
            style={{ borderBottom: isLast ? "none" : "1px solid var(--border-light)" }}
        >
            {/* Direction icon */}
            <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                style={{
                    background: "var(--surface-alt)",
                    border: "1px solid var(--border)",
                    color: isSettled
                        ? "var(--text-muted)"
                        : isPayer
                        ? "var(--primary)"
                        : "var(--danger)",
                }}
            >
                {isSettled ? (
                    <Check className="w-[14px] h-[14px]" />
                ) : isPayer ? (
                    <ArrowDownLeft className="w-[14px] h-[14px]" />
                ) : (
                    <ArrowUpRight className="w-[14px] h-[14px]" />
                )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p
                    className="font-medium text-[13.5px] truncate"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                >
                    {expense.title}
                </p>
                <p className="text-[12px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {expense.group_name && (
                        <span style={{ color: "var(--text-muted)" }}>{expense.group_name}</span>
                    )}
                    {expense.group_name && (
                        <span
                            className="inline-block w-[2px] h-[2px] rounded-full"
                            style={{ background: "var(--text-placeholder)" }}
                        />
                    )}
                    <span
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                        }}
                    >
                        {formatRelativeDate(expense.expense_date)}
                    </span>
                </p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
                <p
                    className="text-[13px] font-medium"
                    style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        color: "var(--text-secondary)",
                    }}
                >
                    {formatMoney(expense.amount)}
                </p>
                {isSettled ? (
                    <span
                        className="inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-0.5"
                        style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                    >
                        Ödendi
                    </span>
                ) : mySplit ? (
                    <p
                        className="text-[11px] mt-0.5 font-medium"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: isPayer ? "var(--primary)" : "var(--danger)",
                        }}
                    >
                        {isPayer ? "+" : "−"}{formatMoney(myOwed)}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

export const HomePage = () => {
    const router = useRouter();
    const currentUser = useUser();
    const [showCreate, setShowCreate] = useState(false);
    const { data: recentExpenses, isLoading } = useRecentExpenses(8);

    const handleCreated = (group: GroupResponse) => {
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    const quickActions = [
        {
            label: "Harcama",
            icon: <Plus className="w-[15px] h-[15px]" />,
            onClick: () => router.push("/groups"),
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

            {/* ── Header ─────────────────────────────────────── */}
            <header className="px-4 pt-14 pb-4">
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

                    <div
                        className="rounded-[var(--radius-lg)] overflow-hidden"
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-4 py-3"
                                    style={{
                                        borderBottom:
                                            i < 3
                                                ? "1px solid var(--border-light)"
                                                : "none",
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-[10px] shrink-0 animate-pulse"
                                        style={{ background: "var(--surface-muted)" }}
                                    />
                                    <div className="flex-1 space-y-2">
                                        <div
                                            className="h-3 rounded-full w-32 animate-pulse"
                                            style={{ background: "var(--surface-muted)" }}
                                        />
                                        <div
                                            className="h-2.5 rounded-full w-20 animate-pulse"
                                            style={{ background: "var(--surface-muted)" }}
                                        />
                                    </div>
                                    <div
                                        className="h-4 w-16 rounded-full animate-pulse"
                                        style={{ background: "var(--surface-muted)" }}
                                    />
                                </div>
                            ))
                        ) : !recentExpenses || recentExpenses.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-2 text-center">
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
                            recentExpenses.map((expense, i) => (
                                <ActivityRow
                                    key={expense.id}
                                    expense={expense}
                                    currentUserId={currentUser?.id ?? null}
                                    isLast={i === recentExpenses.length - 1}
                                    onClick={() =>
                                        router.push(
                                            `/groups/${expense.group_id}/expenses/${expense.id}`
                                        )
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
