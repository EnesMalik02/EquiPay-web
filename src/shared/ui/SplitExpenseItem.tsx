"use client";

import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { ExpenseWithMySplitResponse } from "@/entities/expense/model/types";
import { getCurrencySymbol } from "@/shared/lib/currency";

interface SplitExpenseItemProps {
    expense: ExpenseWithMySplitResponse;
}

export function SplitExpenseItem({ expense }: SplitExpenseItemProps) {
    const router = useRouter();
    const amount = parseFloat(expense.user_amount.amount);
    const currencySymbol = getCurrencySymbol(expense.user_amount.currency);
    const isPaid = amount === 0;
    const isPayer = expense.user_amount.direction === "credit";

    const dateStr = expense.created_at
        ? new Date(expense.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
        : "";

    const navigateToExpense = () => {
        const groupId = expense.group?.group_id;
        if (groupId) {
            router.push(`/groups/${groupId}/expenses/${expense.id}`);
        } else {
            router.push(`/expenses/${expense.id}`);
        }
    };

    const amountColor = isPaid ? "var(--primary)" : isPayer ? "var(--primary)" : "var(--danger)";

    return (
        <div
            onClick={navigateToExpense}
            className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors active:bg-[var(--surface-alt)]"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isPaid ? "var(--primary-light)" : isPayer ? "var(--primary-light)" : "rgba(239,68,68,0.08)" }}
            >
                <Receipt
                    className="w-5 h-5"
                    style={{ color: isPaid ? "var(--primary)" : isPayer ? "var(--primary)" : "var(--danger)" }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <p
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                >
                    {expense.title}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {dateStr}
                    {expense.group?.name ? ` · ${expense.group.name}` : ""}
                </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1">
                {isPaid ? (
                    <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block w-fit"
                        style={{ background: "var(--primary-light)", color: "var(--primary-ink)" }}
                    >
                        ✓ Ödendi
                    </span>
                ) : (
                    <p
                        className="text-[13px] font-semibold"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: amountColor,
                        }}
                    >
                        {isPayer ? "+" : "−"}{currencySymbol}{amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </p>
                )}
            </div>
        </div>
    );
}
