"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { settlementApi, SettlementResponse, SettlementStatus } from "@/entities/settlement";
import { useUser } from "@/shared/store/UserContext";
import { CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { SkeletonSettlementItem, SplitExpenseItem } from "@/shared/ui";
import { useState } from "react";
import { useMySplitExpenses } from "@/entities/expense/hooks/useMySplitExpenses";


type Tab = "all" | "pending" | "paid";

const statusLabel: Record<SettlementStatus, string> = {
    pending: "Bekliyor",
    confirmed: "Ödendi",
    rejected: "Reddedildi",
    cancelled: "İptal",
};

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

    const statusColors: Record<SettlementStatus, string> = {
        pending: "var(--text-muted)",
        confirmed: "var(--primary)",
        rejected: "var(--danger)",
        cancelled: "var(--text-muted)",
    };

    return (
        <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                    background: isOutgoing ? "rgba(239,68,68,0.08)" : "var(--primary-light)",
                    color: isOutgoing ? "var(--danger)" : "var(--primary)",
                }}
            >
                {isOutgoing
                    ? <ArrowUpRight className="w-5 h-5" />
                    : <ArrowDownLeft className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
                <p
                    className="text-[13.5px] font-semibold"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                >
                    {isOutgoing ? "Gönderilen" : "Alınan"} — {amount}
                </p>
                {s.note && (
                    <p className="text-[12px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                        {s.note}
                    </p>
                )}
                <p
                    className="text-[11px] mt-0.5"
                    style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        color: s.settled_at ? "var(--primary)" : "var(--text-muted)",
                    }}
                >
                    {s.settled_at
                        ? `${new Date(s.settled_at).toLocaleDateString("tr-TR")} tarihinde ödendi`
                        : new Date(s.created_at).toLocaleDateString("tr-TR")}
                </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        color: statusColors[s.status],
                    }}
                >
                    {statusLabel[s.status]}
                </span>
                {s.status === "pending" && !isOutgoing && (
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => onAction(s.id, "confirmed")}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                            title="Onayla"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onAction(s.id, "rejected")}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: "rgba(239,68,68,0.08)", color: "var(--danger)" }}
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
                        className="text-[10px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                        style={{ color: "var(--text-muted)" }}
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
        <p
            className="text-[10px] font-semibold tracking-widest uppercase pt-2 pb-1"
            style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
            }}
        >
            {label}
        </p>
    );
}

/* ── Main Page ── */
export const SettlementsPage = () => {
    const currentUser = useUser();
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [actioningId, setActioningId] = useState<string | null>(null);
    const qc = useQueryClient();

    const { data: allSplitExpenses = [], isLoading: expensesLoading } = useMySplitExpenses();
    const { data: settlements = [], isLoading: settlementsLoading } = useQuery({
        queryKey: ["settlements", "mine"],
        queryFn: () => settlementApi.listMine(),
    });

    const isLoading = expensesLoading || settlementsLoading;

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

    const currentUserId = currentUser?.id ?? null;

    const unpaidExpenses = allSplitExpenses.filter(
        (exp) => exp.my_split && parseFloat(exp.my_split.paid_amount) < parseFloat(exp.my_split.owed_amount)
    );
    const paidExpenses = allSplitExpenses.filter(
        (exp) => exp.my_split && parseFloat(exp.my_split.paid_amount) >= parseFloat(exp.my_split.owed_amount)
    );

    const pendingCount = unpaidExpenses.length;

    const tabs: { id: Tab; label: string }[] = [
        { id: "all", label: "Tümü" },
        { id: "pending", label: "Bekleyenler" },
        { id: "paid", label: "Ödenenler" },
    ];

    const isEmptyAll = allSplitExpenses.length === 0 && settlements.length === 0;
    const isEmptyTab =
        activeTab === "all" ? isEmptyAll
        : activeTab === "pending" ? unpaidExpenses.length === 0
        : paidExpenses.length === 0;

    return (
        <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            <main className="max-w-5xl mx-auto px-4 pt-14 pb-28">
                {/* Header */}
                <header className="mb-6">
                    <p
                        className="text-[10px] uppercase mb-1"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: "var(--text-muted)",
                            letterSpacing: "0.08em",
                        }}
                    >
                        Hareketler
                    </p>
                    <h1
                        className="text-[24px] font-semibold"
                        style={{ letterSpacing: "-0.5px", lineHeight: 1.2 }}
                    >
                        Tüm Hareketler
                    </h1>
                </header>

                {/* Tabs */}
                <div
                    className="flex gap-1 p-1 rounded-[var(--radius-lg)] mb-6"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] text-[12.5px] font-semibold transition-all"
                            style={{
                                background: activeTab === tab.id ? "var(--background)" : "transparent",
                                color: activeTab === tab.id ? "var(--foreground)" : "var(--text-muted)",
                                boxShadow: activeTab === tab.id ? "var(--shadow-sm)" : "none",
                                border: activeTab === tab.id ? "1px solid var(--border)" : "1px solid transparent",
                            }}
                        >
                            {tab.label}
                            {tab.id === "pending" && pendingCount > 0 && (
                                <span
                                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                                    style={{ background: "var(--danger)", color: "#fff" }}
                                >
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
                        <div
                            className="w-14 h-14 rounded-[16px] flex items-center justify-center"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            <Clock className="w-6 h-6" style={{ color: "var(--text-placeholder)" }} />
                        </div>
                        <p className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>
                            Bu kategoride hareket yok.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeTab === "all" && (
                            <>
                                {unpaidExpenses.length > 0 && (
                                    <>
                                        <SectionLabel label="Ödenmemiş Paylarım" />
                                        {unpaidExpenses.map((exp) => (
                                            <SplitExpenseItem key={exp.id} expense={exp}  />
                                        ))}
                                    </>
                                )}
                                {paidExpenses.length > 0 && (
                                    <>
                                        <SectionLabel label="Ödediğim Paylar" />
                                        {paidExpenses.map((exp) => (
                                            <SplitExpenseItem key={exp.id} expense={exp}  />
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

                        {activeTab === "pending" &&
                            unpaidExpenses.map((exp) => (
                                <SplitExpenseItem key={exp.id} expense={exp}  />
                            ))}

                        {activeTab === "paid" &&
                            paidExpenses.map((exp) => (
                                <SplitExpenseItem key={exp.id} expense={exp}  />
                            ))}
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};
