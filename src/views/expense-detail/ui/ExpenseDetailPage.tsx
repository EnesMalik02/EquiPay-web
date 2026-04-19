"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Receipt, CalendarDays, FileText, Wallet, Users,
    CheckCircle2, Clock3, TrendingUp, UserCheck, ChevronDown,
    Pencil, Trash2, X, AlertTriangle,
} from "lucide-react";
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
    const [statsOpen, setStatsOpen] = useState(false);
    const [barAnimated, setBarAnimated] = useState(false);

    // edit notes state
    const [showEditNotes, setShowEditNotes] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesError, setNotesError] = useState("");

    // delete state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        Promise.all([
            expenseApi.getById(expenseId),
            groupApi.listMembers(groupId),
        ]).then(([exp, mems]) => {
            setExpense(exp);
            setMembers(mems);
            setTimeout(() => setBarAnimated(true), 80);
        }).catch((err: unknown) => {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 403 || status === 404) {
                router.replace("/groups");
            }
        }).finally(() => setLoading(false));
    }, [expenseId, groupId]);

    const isOwner = expense ? String(expense.paid_by) === String(currentUserId) : false;

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

    const handleSaveNotes = async () => {
        if (!expense) return;
        setSavingNotes(true);
        setNotesError("");
        try {
            const updated = await expenseApi.update(expense.id, { notes: editNotes });
            setExpense((prev) => prev ? { ...prev, notes: updated.notes } : prev);
            setShowEditNotes(false);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setNotesError(e.response?.data?.detail ?? e.message ?? "Bir hata oluştu.");
        } finally {
            setSavingNotes(false);
        }
    };

    const handleDelete = async () => {
        if (!expense) return;
        setDeleting(true);
        setDeleteError("");
        try {
            await expenseApi.deleteById(expense.id);
            router.push(`/groups/${groupId}`);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setDeleteError(e.response?.data?.detail ?? e.message ?? "Bir hata oluştu.");
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>

            {/* ── Edit Notes Modal ─── */}
            {showEditNotes && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowEditNotes(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-extrabold text-black">Notu Düzenle</h3>
                            <button
                                onClick={() => setShowEditNotes(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {notesError && (
                            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl mb-3">{notesError}</p>
                        )}
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-[#00d186] focus:bg-white transition-colors resize-none mb-4"
                            placeholder="Harcama için not ekleyin..."
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditNotes(false)}
                                disabled={savingNotes}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="flex-1 py-3 rounded-2xl bg-[#00d186] hover:bg-[#00c07c] text-white font-bold text-sm shadow-[0_4px_14px_rgba(0,209,134,0.35)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {savingNotes ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ─── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
                        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-700 mb-1">Harcamayı silmek istediğine emin misin?</p>
                                <p className="text-xs text-red-400">Bu işlem geri alınamaz.</p>
                            </div>
                        </div>
                        {deleteError && (
                            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl mb-3">{deleteError}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-[0_4px_14px_rgba(239,68,68,0.35)] transition-all active:scale-95 disabled:opacity-50"
                            >
                                {deleting ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-5xl mx-auto px-6 pt-8 pb-12">

                {/* Back + owner actions */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push(`/groups/${groupId}`)}
                        className="flex items-center gap-2 text-sm font-semibold transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Geri Dön
                    </button>
                    {isOwner && expense && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setEditNotes(expense.notes ?? "");
                                    setNotesError("");
                                    setShowEditNotes(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                                style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Notu Düzenle
                            </button>
                            <button
                                onClick={() => { setDeleteError(""); setShowDeleteConfirm(true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors bg-red-50 text-red-500 hover:bg-red-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Sil
                            </button>
                        </div>
                    )}
                </div>

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
                                    {mySplit && myOwed > 0 && !isOwner && (
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

                        {/* ── Expense Stats ─────────────────────────── */}
                        {(() => {
                            const total = parseFloat(expense.amount);
                            const totalPaid = expense.splits.reduce((s, sp) => s + parseFloat(sp.paid_amount), 0);
                            const totalPending = total - totalPaid;
                            const settledCount = expense.splits.filter((sp) => parseFloat(sp.paid_amount) >= parseFloat(sp.owed_amount)).length;
                            const totalCount = expense.splits.length;
                            const perPerson = totalCount > 0 ? total / totalCount : 0;
                            const progressPct = total > 0 ? Math.min(100, Math.round((totalPaid / total) * 100)) : 0;

                            return (
                                <div
                                    className="rounded-2xl mb-6 overflow-hidden"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border-light)",
                                        boxShadow: "var(--shadow-sm)",
                                    }}
                                >
                                    <button
                                        onClick={() => setStatsOpen((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: "var(--surface-muted)" }}>
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: barAnimated ? `${progressPct}%` : "0%",
                                                        transition: "width 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                                        background: progressPct === 100 ? "var(--primary)" : "linear-gradient(90deg, var(--primary) 0%, var(--primary-hover) 100%)",
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className="text-xs font-bold"
                                                style={{ color: progressPct === 100 ? "var(--primary)" : "var(--text-secondary)" }}
                                            >
                                                %{progressPct} ödendi
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 shrink-0"
                                            style={{
                                                color: "var(--text-muted)",
                                                transform: statsOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                transition: "transform 250ms ease-out",
                                            }}
                                        />
                                    </button>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateRows: statsOpen ? "1fr" : "0fr",
                                            transition: "grid-template-rows 280ms ease-out",
                                        }}
                                    >
                                        <div className="overflow-hidden" style={{ minHeight: 0 }}>
                                            <div className="px-4 pb-4 grid grid-cols-2 gap-2.5">
                                                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "var(--primary-light)" }}>
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--primary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-semibold" style={{ color: "var(--primary)" }}>Ödenen</p>
                                                        <p className="text-sm font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>
                                                            ₺{totalPaid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "var(--surface-muted)" }}>
                                                    <Clock3 className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>Bekleyen</p>
                                                        <p className="text-sm font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>
                                                            ₺{totalPending.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "var(--surface-muted)" }}>
                                                    <TrendingUp className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>Kişi Başı</p>
                                                        <p className="text-sm font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>
                                                            ₺{perPerson.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "var(--surface-muted)" }}>
                                                    <UserCheck className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>Ödeyenler</p>
                                                        <p className="text-sm font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>
                                                            {settledCount}/{totalCount} kişi
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                            <div className="flex items-start gap-3 px-4 py-3.5">
                                <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
                                <span className="text-sm font-medium w-28 shrink-0" style={{ color: "var(--text-secondary)" }}>Not</span>
                                <span className="text-sm font-medium flex-1" style={{ color: expense.notes ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                    {expense.notes || (isOwner ? "Not yok · düzenlemek için yukarıdaki butonu kullan" : "—")}
                                </span>
                            </div>
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
