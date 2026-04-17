"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt, CalendarDays, FileText, Wallet, Users } from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { groupApi } from "@/entities/group/api/groupApi";
import { ExpenseResponse } from "@/entities/expense/model/types";
import { GroupMemberResponse } from "@/entities/group/model/types";
import { useUser } from "@/shared/store/UserContext";
import { Skeleton } from "@/shared/ui";

interface ExpenseDetailPageProps {
    groupId: string;
    expenseId: string;
}

export const ExpenseDetailPage = ({ groupId, expenseId }: ExpenseDetailPageProps) => {
    const router = useRouter();
    const currentUserId = useUser()?.id ?? null;

    const [expense, setExpense] = useState<ExpenseResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingIds, setPayingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        Promise.all([
            expenseApi.getById(expenseId),
            groupApi.listMembers(groupId),
        ]).then(([exp, mems]) => {
            setExpense(exp);
            setMembers(mems);
        }).finally(() => setLoading(false));
    }, [expenseId, groupId]);

    const handlePay = async (splitId: string) => {
        if (!expense) return;
        setPayingIds((prev) => new Set(prev).add(splitId));
        try {
            const updated = await expenseApi.paySplit(expense.id, splitId);
            setExpense((prev) =>
                prev ? { ...prev, splits: prev.splits.map((s) => s.id === splitId ? updated : s) } : prev,
            );
        } finally {
            setPayingIds((prev) => { const n = new Set(prev); n.delete(splitId); return n; });
        }
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            <main className="max-w-5xl mx-auto px-6 pt-8 pb-12">

                <button
                    onClick={() => router.push(`/groups/${groupId}`)}
                    className="flex items-center gap-2 text-sm font-semibold mb-8 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Geri Dön
                </button>

                {loading ? (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-14 h-14 shrink-0" rounded="lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-3 w-24" rounded="full" />
                            </div>
                        </div>
                        <Skeleton className="h-24 w-full" rounded="lg" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full" rounded="lg" />
                        ))}
                    </div>
                ) : expense ? (
                    <div>
                        {/* Amount hero */}
                        {(() => {
                            const mySplit = expense.splits.find((s) => String(s.user_id) === String(currentUserId));
                            const myOwed = mySplit ? parseFloat(mySplit.owed_amount) : 0;
                            const myPaid = mySplit ? parseFloat(mySplit.paid_amount) : 0;
                            const mySettled = myOwed > 0 && myPaid >= myOwed;
                            const myPaying = mySplit ? payingIds.has(mySplit.id) : false;

                            return (
                                <div className="flex items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-[#00d186] shrink-0">
                                            <Receipt className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                                                ₺{parseFloat(expense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>{expense.title}</p>
                                        </div>
                                    </div>
                                    {mySplit && myOwed > 0 && (
                                        mySettled ? (
                                            <span className="shrink-0 text-sm font-bold text-[#00d186] bg-[#f0fdf4] px-4 py-2 rounded-xl">
                                                Borç Ödendi
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handlePay(mySplit.id)}
                                                disabled={myPaying}
                                                className="shrink-0 text-sm font-bold text-white bg-[#00d186] hover:bg-[#00c07c] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.35)] transition-all active:scale-95"
                                            >
                                                {myPaying ? "Ödeniyor..." : "Borcumu Öde"}
                                            </button>
                                        )
                                    )}
                                </div>
                            );
                        })()}

                        {/* Meta rows */}
                        <div className="rounded-2xl divide-y divide-gray-100 mb-8" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                            <div className="flex items-center gap-3 px-4 py-3.5">
                                <Wallet className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                                <span className="text-sm font-medium w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>Ödeyen</span>
                                <span className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>
                                    {(() => {
                                        const p = members.find((m) => String(m.user_id) === String(expense.paid_by));
                                        return p?.display_name ?? p?.username ?? expense.paid_by;
                                    })()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3.5">
                                <CalendarDays className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                                <span className="text-sm font-medium w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>Tarih</span>
                                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{expense.expense_date}</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3.5">
                                <span className="w-4 h-4 text-xs font-black flex items-center justify-center shrink-0" style={{ color: "var(--text-muted)" }}>₺</span>
                                <span className="text-sm font-medium w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>Para Birimi</span>
                                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{expense.currency}</span>
                            </div>
                            {expense.notes && (
                                <div className="flex items-start gap-3 px-4 py-3.5">
                                    <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
                                    <span className="text-sm font-medium w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>Not</span>
                                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{expense.notes}</span>
                                </div>
                            )}
                        </div>

                        {/* Splits */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>Paylaşım</p>
                            </div>
                            <div className="rounded-2xl divide-y divide-gray-100" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
                                {expense.splits.map((split) => {
                                    const member = members.find((m) => String(m.user_id) === String(split.user_id));
                                    const name = member?.display_name ?? member?.username ?? String(split.user_id);
                                    const owed = parseFloat(split.owed_amount);
                                    const paid = parseFloat(split.paid_amount);
                                    const settled = paid >= owed;

                                    return (
                                        <div key={split.id} className="flex items-center gap-3 px-4 py-3.5">
                                            <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                                                 style={{ background: "var(--surface-muted)", borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{name}</span>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                                                    ₺{owed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                </p>
                                                {settled ? (
                                                    <p className="text-[10px] font-semibold text-[#00d186] mt-0.5">Ödendi</p>
                                                ) : paid > 0 ? (
                                                    <p className="text-[10px] font-semibold text-orange-400 mt-0.5">
                                                        ₺{paid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ödendi
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] font-semibold text-red-400 mt-0.5">Bekliyor</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : null}

            </main>
            <BottomNav />
        </div>
    );
};
