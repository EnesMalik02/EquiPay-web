"use client";

import { Receipt, ChevronRight } from "lucide-react";
import { ExpenseResponse } from "@/entities/expense/model/types";

interface ExpenseListItemProps {
    expense: ExpenseResponse;
    /** Resolved display name of the person who paid */
    payerName: string;
    onClick: () => void;
}

/**
 * A single expense row item.
 * Use this everywhere an expense needs to be shown in a list.
 */
export const ExpenseListItem = ({ expense, payerName, onClick }: ExpenseListItemProps) => {
    const isPaid = expense.is_fully_paid;
    const formattedAmount = `₺${parseFloat(expense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 py-4 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-2xl transition-colors group"
        >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isPaid ? "bg-gray-100 text-gray-400" : "bg-emerald-50 text-emerald-700"
            }`}>
                <Receipt className="w-5 h-5" />
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
                <p className={`font-semibold text-base truncate ${isPaid ? "text-gray-400" : "text-black"}`}>
                    {expense.title}
                </p>
                <p className="text-[13px] text-gray-400 mt-0.5">
                    {payerName} ödedi • {expense.expense_date}
                </p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
                {isPaid ? (
                    <>
                        <p className="font-extrabold text-base text-gray-400 line-through">
                            {formattedAmount}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Ödendi</p>
                    </>
                ) : (
                    <p className="font-extrabold text-base text-black">
                        {formattedAmount}
                    </p>
                )}
            </div>

            <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${
                isPaid ? "text-gray-200" : "text-gray-300 group-hover:text-gray-400"
            }`} />
        </div>
    );
};
