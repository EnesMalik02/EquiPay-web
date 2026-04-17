"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { settlementApi, SettlementResponse, SettlementStatus } from "@/entities/settlement";
import { useUser } from "@/shared/store/UserContext";
import { CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import { SkeletonSettlementItem } from "@/shared/ui";
import { useState } from "react";
import { useMySplitExpenses } from "@/entities/expense/hooks/useMySplitExpenses";
import { RecentExpenseResponse } from "@/entities/expense/model/types";
import { expenseApi } from "@/entities/expense/api/expenseApi";

type Tab = "all" | "pending" | "paid";

const statusLabel: Record<SettlementStatus, string> = {
    pending: "Bekliyor",
    confirmed: "Ödendi",
    rejected: "Reddedildi",
    cancelled: "İptal",
};

const statusColor: Record<SettlementStatus, string> = {
    pending: "#9ca3af",
    confirmed: "#00d186",
    rejected: "#ef4444",
    cancelled: "#9ca3af",
};

/* ── My Split Expense Item ── */
function MySplitExpenseItem({
    expense,
    currentUserId,
    onPaid,
}: {
    expense: RecentExpenseResponse;
    currentUserId: string | null;
    onPaid: (expenseId: string, splitId: string) => void;
}) {
    const router = useRouter();
    const mySplit = expense.splits?.find((s) => String(s.user_id) === String(currentUserId));
    if (!mySplit) return null;

    const owed = parseFloat(mySplit.owed_amount);
    const paid = parseFloat(mySplit.paid_amount);
    const isPaid = paid >= owed;
    const isPayer = String(expense.paid_by) === String(currentUserId);

    return (
        <div
            className="flex items-center gap-4 p-4 rounded-2xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}
        >
            {/* Ikon */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                style={{ background: isPaid ? "var(--primary-light)" : "var(--surface-muted)" }}
                onClick={() => router.push(`/groups/${expense.group_id}/expenses/${expense.id}`)}
            >
                <Receipt className="w-5 h-5" style={{ color: isPaid ? "var(--primary)" : "var(--text-secondary)" }} />
            </div>

            {/* İçerik */}
            <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => router.push(`/groups/${expense.group_id}/expenses/${expense.id}`)}
            >
                <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                    {expense.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {expense.expense_date}
                    {expense.group_name ? ` · ${expense.group_name}` : ""}
                </p>
            </div>

            {/* Tutar + aksiyon */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    ₺{owed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                {isPaid ? (
                    <span className="text-[10px] font-bold" style={{ color: "var(--primary)" }}>
                        {isPayer ? "Sen Ödedin" : "Ödendi"}
                    </span>
                ) : (
                    <button
                        onClick={() => onPaid(expense.id, mySplit.id)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#00d186] text-white hover:bg-[#00c07c] transition-colors"
                    >
                        Öde
                    </button>
                )}
            </div>
        </div>
    );
}

/* ── Settlement Item ── */
function SettlementItem({
    s,
    currentUserId,
    onAction,
    actioningId,
}: {
    s: SettlementResponse;
    currentUserId: string | null;
    onAction: (id: string, status: SettlementStatus) => void;
    actioningId: string | null;
}) {
    const isOutgoing = s.payer_id === currentUserId;
    const amount = `₺${parseFloat(s.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
    const isActioning = actioningId === s.id;

    return (
        <div
            className="flex items-center gap-4 p-4 rounded-2xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isOutgoing ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
            }`}>
                {isOutgoing ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    {isOutgoing ? "Gönderilen" : "Alınan"} — {amount}
                </p>
                {s.note && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{s.note}</p>
                )}
                {s.settled_at ? (
                    <p className="text-xs text-[#00d186] mt-0.5">
                        {new Date(s.settled_at).toLocaleDateString("tr-TR")} tarihinde ödendi
                    </p>
                ) : (
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {new Date(s.created_at).toLocaleDateString("tr-TR")}
                    </p>
                )}
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: statusColor[s.status] }}>
                    {statusLabel[s.status]}
                </span>
                {s.status === "pending" && !isOutgoing && (
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => onAction(s.id, "confirmed")}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            title="Onayla"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction(s.id, "rejected")}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Reddet"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {s.status === "pending" && isOutgoing && (
                    <button
                        onClick={() => onAction(s.id, "cancelled")}
                        disabled={isActioning}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        <Clock className="w-3 h-3" />
                        İptal Et
                    </button>
                )}
            </div>
        </div>
    );
}

/* ── Section label ── */
function SectionLabel({ label }: { label: string }) {
    return (
        <p className="text-xs font-bold tracking-widest uppercase pt-2 pb-1" style={{ color: "var(--text-muted)" }}>
            {label}
        </p>
    );
}

/* ── Main Page ── */
export const SettlementsPage = () => {
    const currentUser = useUser();
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [actioningId, setActioningId] = useState<string | null>(null);
    const [payingIds, setPayingIds] = useState<Set<string>>(new Set());
    const qc = useQueryClient();

    /* Queries */
    const { data: allSplitExpenses = [], isLoading: expensesLoading } = useMySplitExpenses();
    const { data: settlements = [], isLoading: settlementsLoading } = useQuery({
        queryKey: ["settlements", "mine"],
        queryFn: () => settlementApi.listMine(),
    });

    const isLoading = expensesLoading || settlementsLoading;

    /* Mutations */
    const settlementMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: SettlementStatus }) =>
            settlementApi.updateStatus(id, { status }),
        onMutate: ({ id }) => setActioningId(id),
        onSettled: () => setActioningId(null),
        onSuccess: (updated) => {
            qc.setQueryData<SettlementResponse[]>(["settlements", "mine"], (prev) =>
                prev ? prev.map((s) => (s.id === updated.id ? updated : s)) : prev,
            );
        },
    });

    const handleSettlementAction = (id: string, status: SettlementStatus) =>
        settlementMutation.mutate({ id, status });

    const handlePaySplit = async (expenseId: string, splitId: string) => {
        setPayingIds((p) => new Set(p).add(splitId));
        try {
            await expenseApi.paySplit(expenseId, splitId);
            qc.invalidateQueries({ queryKey: ["expenses", "my-splits"] });
        } finally {
            setPayingIds((p) => { const n = new Set(p); n.delete(splitId); return n; });
        }
    };

    /* Filtering */
    const currentUserId = currentUser?.id ?? null;

    const hasMySplit = (exp: RecentExpenseResponse) =>
        exp.splits?.some((s) => String(s.user_id) === String(currentUserId));

    const myExpenses = allSplitExpenses.filter(hasMySplit);

    const unpaidExpenses = myExpenses.filter((exp) => {
        const split = exp.splits.find((s) => String(s.user_id) === String(currentUserId));
        return split && parseFloat(split.paid_amount) < parseFloat(split.owed_amount);
    });

    const paidExpenses = myExpenses.filter((exp) => {
        const split = exp.splits.find((s) => String(s.user_id) === String(currentUserId));
        return split && parseFloat(split.paid_amount) >= parseFloat(split.owed_amount);
    });

    const pendingCount = unpaidExpenses.length;

    const tabs: { id: Tab; label: string }[] = [
        { id: "all", label: "Tümü" },
        { id: "pending", label: "Bekleyenler" },
        { id: "paid", label: "Ödenenler" },
    ];

    /* Content per tab */
    const isEmptyAll = myExpenses.length === 0 && settlements.length === 0;
    const isEmptyTab =
        activeTab === "all" ? isEmptyAll
        : activeTab === "pending" ? unpaidExpenses.length === 0
        : paidExpenses.length === 0;

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
            <main className="max-w-5xl mx-auto px-6 pt-10 pb-28">
                <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                    Hareketler
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ color: "var(--foreground)" }}>
                    Tüm Hareketler
                </h1>

                {/* Tabs */}
                <div className="flex gap-6 border-b mb-8" style={{ borderColor: "var(--border-light)" }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id
                                    ? "border-[#00d186] text-black"
                                    : "border-transparent text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                            {tab.id === "pending" && pendingCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-[#00d186] text-white rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonSettlementItem key={i} />
                        ))}
                    </div>
                ) : isEmptyTab ? (
                    <div className="py-20 flex flex-col items-center gap-3 text-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "var(--surface-muted)" }}>
                            <Clock className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                            Bu kategoride hareket yok.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">

                        {/* ── TÜMÜ ── */}
                        {activeTab === "all" && (
                            <>
                                {unpaidExpenses.length > 0 && (
                                    <>
                                        <SectionLabel label="Ödenmemiş Paylarım" />
                                        {unpaidExpenses.map((exp) => (
                                            <MySplitExpenseItem
                                                key={exp.id}
                                                expense={exp}
                                                currentUserId={currentUserId}
                                                onPaid={handlePaySplit}
                                            />
                                        ))}
                                    </>
                                )}
                                {paidExpenses.length > 0 && (
                                    <>
                                        <SectionLabel label="Ödediğim Paylar" />
                                        {paidExpenses.map((exp) => (
                                            <MySplitExpenseItem
                                                key={exp.id}
                                                expense={exp}
                                                currentUserId={currentUserId}
                                                onPaid={handlePaySplit}
                                            />
                                        ))}
                                    </>
                                )}
                                {settlements.length > 0 && (
                                    <>
                                        <SectionLabel label="Ödeme Transferleri" />
                                        {settlements.map((s) => (
                                            <SettlementItem
                                                key={s.id}
                                                s={s}
                                                currentUserId={currentUserId}
                                                onAction={handleSettlementAction}
                                                actioningId={actioningId}
                                            />
                                        ))}
                                    </>
                                )}
                            </>
                        )}

                        {/* ── BEKLEYENLEr ── */}
                        {activeTab === "pending" &&
                            unpaidExpenses.map((exp) => (
                                <MySplitExpenseItem
                                    key={exp.id}
                                    expense={exp}
                                    currentUserId={currentUserId}
                                    onPaid={handlePaySplit}
                                />
                            ))
                        }

                        {/* ── ÖDENENLEr ── */}
                        {activeTab === "paid" &&
                            paidExpenses.map((exp) => (
                                <MySplitExpenseItem
                                    key={exp.id}
                                    expense={exp}
                                    currentUserId={currentUserId}
                                    onPaid={handlePaySplit}
                                />
                            ))
                        }
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};
