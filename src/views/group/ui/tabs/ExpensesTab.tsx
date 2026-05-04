"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { SplitExpenseItem, SkeletonSettlementItem } from "@/shared/ui";
import { useMySplitExpenses } from "@/entities/expense/hooks/useMySplitExpenses";
import { formatMoney } from "@/shared/lib/ui";

type ExpenseTab = "all" | "paid" | "unpaid";

const EXPENSE_TABS: { id: ExpenseTab; label: string }[] = [
    { id: "all", label: "Hepsi" },
    { id: "unpaid", label: "Ödemediklerim" },
    { id: "paid", label: "Ödediklerim" },
];

interface ExpensesTabProps {
    groupId: string;
    currencySymbol: string;
}

export function ExpensesTab({ groupId, currencySymbol }: ExpensesTabProps) {
    const [activeFilter, setActiveFilter] = useState<ExpenseTab>("all");

    const { data: expenses = [], isLoading } = useMySplitExpenses({
        group_id: groupId,
        status: activeFilter,
        limit: 50,
    });

    return (
        <>
            {/* Filter tabs */}
            <div
                className="flex gap-1 p-1 rounded-[var(--radius-lg)] mb-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
                {EXPENSE_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className="flex-1 py-2 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all cursor-pointer"
                        style={{
                            background: activeFilter === tab.id ? "var(--background)" : "transparent",
                            color: activeFilter === tab.id ? "var(--foreground)" : "var(--text-muted)",
                            boxShadow: activeFilter === tab.id ? "var(--shadow-sm)" : "none",
                            border: activeFilter === tab.id ? "1px solid var(--border)" : "1px solid transparent",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonSettlementItem key={i} />
                    ))}
                </div>
            ) : expenses.length === 0 ? (
                <div className="py-14 text-center">
                    <Receipt className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-placeholder)" }} />
                    <p className="text-[14px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                        Henüz harcama yok.
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>
                        Yukarıdaki butonu kullanarak ilk harcamayı ekle.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {groupByMonth(expenses).map(({ key, label, items }) => {
                        const groupTotal = items.reduce((s, e) => s + parseFloat(e.amount), 0);
                        return (
                            <div key={key}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span
                                            className="text-[11px] font-semibold"
                                            style={{
                                                fontFamily: "var(--font-geist-mono, monospace)",
                                                color: "var(--text-muted)",
                                                letterSpacing: "0.1em",
                                            }}
                                        >
                                            {label}
                                        </span>
                                        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                                    </div>
                                    <span
                                        className="text-[11px] ml-3 shrink-0"
                                        style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)" }}
                                    >
                                        {items.length} harcama · {formatMoney(groupTotal, currencySymbol)}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {items.map((exp) => (
                                        <SplitExpenseItem key={exp.id} expense={exp} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}

function groupByMonth<T extends { expense_date?: string | null; created_at?: string | null }>(
    expenses: T[]
): { key: string; label: string; items: T[] }[] {
    const groups: { key: string; label: string; items: T[] }[] = [];
    const seen = new Map<string, T[]>();
    for (const exp of expenses) {
        const raw = exp.expense_date ?? exp.created_at;
        const d = raw ? new Date(raw) : new Date(0);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }).toUpperCase();
        if (!seen.has(key)) {
            seen.set(key, []);
            groups.push({ key, label, items: seen.get(key)! });
        }
        seen.get(key)!.push(exp);
    }
    groups.sort((a, b) => b.key.localeCompare(a.key));
    return groups;
}
