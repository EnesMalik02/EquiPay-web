"use client";

import { useRouter } from "next/navigation";
import { Receipt, Check, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { ExpenseWithMySplitResponse } from "@/entities/expense/model/types";
import { useUser } from "@/shared/store/UserContext";

interface SplitExpenseItemProps {
    expense: ExpenseWithMySplitResponse;
    /** card: standalone rounded card (default). row: flat list row inside a container. */
    variant?: "card" | "row";
    /** row variant: resolved payer display name */
    payerName?: string;
    /** row variant: hide bottom border on last item */
    isLast?: boolean;
}

export function SplitExpenseItem({
    expense,
    variant = "card",
    payerName,
    isLast = false,
}: SplitExpenseItemProps) {
    const router = useRouter();
    const currentUser = useUser();
    const mySplit = expense.my_split;
    const owed = mySplit ? parseFloat(mySplit.owed_amount) : 0;
    const paid = mySplit ? parseFloat(mySplit.paid_amount) : 0;
    const remaining = Math.max(0, owed - paid);
    const isPaid = expense.is_fully_paid || (mySplit ? paid >= owed : false);
    const isPayer = String(expense.paid_by) === String(currentUser?.id);
    const totalAmount = parseFloat(expense.amount);
    // Amount the payer is owed by others (total minus payer's own share)
    const creditorAmount = totalAmount - owed;

    const dateStr = expense.created_at
        ? new Date(expense.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })
        : expense.expense_date?.slice(5).replace("-", "/") ?? "";

    const navigateToExpense = () => {
        if (expense.group_id) {
            router.push(`/groups/${expense.group_id}/expenses/${expense.id}`);
        } else {
            router.push(`/expenses/${expense.id}`);
        }
    };

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
                            {dateStr}
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
                            {isPayer
                                ? `+₺${creditorAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                                : `−₺${remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                        </p>
                    ) : null}
                </div>
            </div>
        );
    }

    /* ── Card variant (default) ───────────────────── */
    const statusLabel = (() => {
        if (isPaid) return isPayer ? "Tamamen Ödendi" : "Ödendi";
        if (isPayer) return `Alacağın: ₺${creditorAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
        if (paid > 0 && remaining > 0) return `Kalan: ₺${remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
        return `Borcun: ₺${owed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
    })();

    const statusColor = isPaid
        ? "var(--primary)"
        : isPayer
        ? "var(--primary)"
        : "var(--danger)";

    const displayAmount = isPayer ? creditorAmount : remaining > 0 ? remaining : owed;

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
                style={{ background: isPaid ? "var(--primary-light)" : "var(--surface-muted)" }}
            >
                <Receipt
                    className="w-5 h-5"
                    style={{ color: isPaid ? "var(--primary)" : "var(--text-secondary)" }}
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
                    {expense.group_name ? ` · ${expense.group_name}` : ""}
                </p>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1">
                <p
                    className="text-[13px] font-semibold"
                    style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        color: "var(--foreground)",
                    }}
                >
                    {isPayer ? "+" : isPaid ? "" : "−"}₺{displayAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-semibold" style={{ color: statusColor }}>
                    {statusLabel}
                </span>
            </div>
        </div>
    );
}
