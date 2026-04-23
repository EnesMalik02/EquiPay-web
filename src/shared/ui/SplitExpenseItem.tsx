"use client";

import { useRouter } from "next/navigation";
import { Receipt, Check, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { ExpenseWithMySplitResponse } from "@/entities/expense/model/types";
import { useUser } from "@/shared/store/UserContext";

interface SplitExpenseItemProps {
    expense: ExpenseWithMySplitResponse;
    onPaid: (expenseId: string, splitId: string) => void;
    /** card: standalone rounded card (default). row: flat list row inside a container. */
    variant?: "card" | "row";
    /** row variant: resolved payer display name */
    payerName?: string;
    /** row variant: hide bottom border on last item */
    isLast?: boolean;
}

export function SplitExpenseItem({
    expense,
    onPaid,
    variant = "card",
    payerName,
    isLast = false,
}: SplitExpenseItemProps) {
    const router = useRouter();
    const currentUser = useUser();
    const mySplit = expense.my_split;
    const owed = mySplit ? parseFloat(mySplit.owed_amount) : 0;
    const paid = mySplit ? parseFloat(mySplit.paid_amount) : 0;
    const isPaid = expense.is_fully_paid || (mySplit ? paid >= owed : false);
    const isPayer = String(expense.paid_by) === String(currentUser?.id);
    const totalAmount = parseFloat(expense.amount);

    const navigateToExpense = () =>
        router.push(`/groups/${expense.group_id}/expenses/${expense.id}`);

    /* ── Row variant ──────────────────────────────── */
    if (variant === "row") {
        const iconColor = isPaid
            ? "var(--text-muted)"
            : isPayer
            ? "var(--primary)"
            : "var(--danger)";

        return (
            <div
                onClick={navigateToExpense}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors active:bg-[var(--surface-alt)]"
                style={{ borderBottom: isLast ? "none" : "1px solid var(--border-light)" }}
            >
                <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{
                        background: "var(--surface-alt)",
                        border: "1px solid var(--border)",
                        color: iconColor,
                    }}
                >
                    {isPaid ? (
                        <Check className="w-[14px] h-[14px]" />
                    ) : isPayer ? (
                        <ArrowDownLeft className="w-[14px] h-[14px]" />
                    ) : (
                        <ArrowUpRight className="w-[14px] h-[14px]" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p
                        className="font-medium text-[13.5px] truncate"
                        style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                    >
                        {expense.title}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {isPayer ? "Sen" : (payerName ?? "Bilinmeyen")} ödedi
                        <span className="mx-1.5" style={{ color: "var(--text-placeholder)" }}>·</span>
                        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: "11px" }}>
                            {expense.expense_date.slice(5).replace("-", "/")}
                        </span>
                    </p>
                </div>

                <div className="text-right shrink-0">
                    <p
                        className="text-[13px] font-medium"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </p>
                    {isPaid ? (
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
                            {isPayer ? "+" : "−"}₺{owed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </p>
                    ) : null}
                </div>
            </div>
        );
    }

    /* ── Card variant (default) ───────────────────── */
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
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                style={{ background: isPaid ? "var(--primary-light)" : "var(--surface-muted)" }}
                onClick={navigateToExpense}
            >
                <Receipt
                    className="w-5 h-5"
                    style={{ color: isPaid ? "var(--primary)" : "var(--text-secondary)" }}
                />
            </div>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={navigateToExpense}>
                <p
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                >
                    {expense.title}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {expense.expense_date}
                    {expense.group_name ? ` · ${expense.group_name}` : ""}
                </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1.5">
                <p
                    className="text-[13px] font-semibold"
                    style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        color: "var(--foreground)",
                    }}
                >
                    ₺{(mySplit ? owed : totalAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                {isPaid ? (
                    <span className="text-[11px] font-semibold" style={{ color: "var(--primary)" }}>
                        {isPayer ? "Sen Ödedin" : "Ödendi"}
                    </span>
                ) : mySplit ? (
                    <button
                        onClick={() => onPaid(expense.id, mySplit.id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                        style={{ background: "var(--primary)", color: "#000" }}
                    >
                        Öde
                    </button>
                ) : null}
            </div>
        </div>
    );
}
