"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, Receipt, CalendarDays, FileText, Wallet, Users,
    CheckCircle2, Clock3, TrendingUp, UserCheck, ChevronDown,
    Pencil, Trash2, X, AlertTriangle,
} from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { groupApi } from "@/entities/group/api/groupApi";
import { ExpenseResponse } from "@/entities/expense/model/types";
import { GroupMemberResponse } from "@/entities/group/model/types";
import { useUser } from "@/shared/store/UserContext";

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
    const [showPayModal, setShowPayModal] = useState(false);
    const [payMode, setPayMode] = useState<"full" | "partial">("full");
    const [partialAmount, setPartialAmount] = useState("");
    const [payError, setPayError] = useState("");
    const [statsOpen, setStatsOpen] = useState(false);
    const [barAnimated, setBarAnimated] = useState(false);

    const [showEditNotes, setShowEditNotes] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesError, setNotesError] = useState("");

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
            if (status === 403 || status === 404) router.replace("/groups");
        }).finally(() => setLoading(false));
    }, [expenseId, groupId]);

    const isOwner = expense ? String(expense.paid_by) === String(currentUserId) : false;

    const handlePay = async (splitId: string, paidAmount?: number) => {
        if (!expense) return;
        setPayingIds((prev) => new Set(prev).add(splitId));
        setPayError("");
        try {
            const updated = await expenseApi.paySplit(expense.id, splitId, paidAmount);
            setExpense((prev) =>
                prev ? { ...prev, splits: prev.splits.map((s) => s.id === splitId ? updated : s) } : prev,
            );
            setShowPayModal(false);
            setPartialAmount("");
            setPayMode("full");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setPayError(e.response?.data?.detail ?? e.message ?? "Bir hata oluştu.");
        } finally {
            setPayingIds((prev) => { const n = new Set(prev); n.delete(splitId); return n; });
        }
    };

    const handleOpenPayModal = () => {
        setPayMode("full");
        setPartialAmount("");
        setPayError("");
        setShowPayModal(true);
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
        <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>

            {/* ── Edit Notes Modal ── */}
            {showEditNotes && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ background: "rgba(18,21,18,0.3)" }}
                        onClick={() => setShowEditNotes(false)}
                    />
                    <div
                        className="relative w-full max-w-sm p-5 animate-fade-in-up"
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-xl)",
                            boxShadow: "var(--shadow-lg)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-semibold" style={{ color: "var(--foreground)" }}>
                                Notu Düzenle
                            </h3>
                            <button
                                onClick={() => setShowEditNotes(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                                style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {notesError && (
                            <p
                                className="text-[13px] px-3 py-2 rounded-[var(--radius-md)] mb-3"
                                style={{ background: "var(--danger-light)", color: "var(--danger)" }}
                            >
                                {notesError}
                            </p>
                        )}
                        <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={4}
                            className="w-full px-3.5 py-2.5 text-[13.5px] outline-none resize-none mb-4"
                            style={{
                                background: "var(--surface-muted)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-md)",
                                color: "var(--foreground)",
                            }}
                            placeholder="Harcama için not ekleyin..."
                        />
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setShowEditNotes(false)}
                                disabled={savingNotes}
                                className="flex-1 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50"
                                style={{
                                    background: "var(--surface-muted)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes}
                                className="flex-1 py-2.5 text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50"
                                style={{
                                    background: "var(--primary)",
                                    borderRadius: "var(--radius-md)",
                                    color: "#fff",
                                }}
                            >
                                {savingNotes ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ background: "rgba(18,21,18,0.3)" }}
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div
                        className="relative w-full max-w-sm p-5 animate-fade-in-up"
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-xl)",
                            boxShadow: "var(--shadow-lg)",
                        }}
                    >
                        <div
                            className="flex items-start gap-3 p-3.5 rounded-[var(--radius-md)] mb-4"
                            style={{ background: "var(--danger-light)", border: "1px solid rgba(208,73,47,0.2)" }}
                        >
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
                            <div>
                                <p className="text-[13px] font-semibold mb-0.5" style={{ color: "var(--danger)" }}>
                                    Harcamayı silmek istediğine emin misin?
                                </p>
                                <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                    Bu işlem geri alınamaz.
                                </p>
                            </div>
                        </div>
                        {deleteError && (
                            <p
                                className="text-[13px] px-3 py-2 rounded-[var(--radius-md)] mb-3"
                                style={{ background: "var(--danger-light)", color: "var(--danger)" }}
                            >
                                {deleteError}
                            </p>
                        )}
                        <div className="flex gap-2.5">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="flex-1 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50"
                                style={{
                                    background: "var(--surface-muted)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50"
                                style={{
                                    background: "var(--danger)",
                                    borderRadius: "var(--radius-md)",
                                    color: "#fff",
                                }}
                            >
                                {deleting ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Pay Modal ── */}
            {showPayModal && (() => {
                const mySplit = expense?.splits.find((s) => String(s.user_id) === String(currentUserId));
                if (!mySplit) return null;
                const owed = parseFloat(mySplit.owed_amount);
                const paid = parseFloat(mySplit.paid_amount);
                const remaining = owed - paid;
                const isPaying = payingIds.has(mySplit.id);
                const partialVal = parseFloat(partialAmount);
                const partialInvalid = payMode === "partial" && (isNaN(partialVal) || partialVal <= 0 || partialVal > remaining);

                const confirm = () => {
                    if (payMode === "full") handlePay(mySplit.id);
                    else if (!partialInvalid) handlePay(mySplit.id, partialVal);
                };

                return (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
                        <div
                            className="absolute inset-0 backdrop-blur-sm"
                            style={{ background: "rgba(18,21,18,0.3)" }}
                            onClick={() => setShowPayModal(false)}
                        />
                        <div
                            className="relative w-full max-w-sm p-5 animate-slide-up"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-xl)",
                                boxShadow: "var(--shadow-lg)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[16px] font-semibold" style={{ color: "var(--foreground)" }}>
                                    Borcunu Öde
                                </h3>
                                <button
                                    onClick={() => setShowPayModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full"
                                    style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div
                                className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] mb-4"
                                style={{ background: "var(--primary-light)" }}
                            >
                                <span className="text-[13px] font-medium" style={{ color: "var(--primary-ink)" }}>
                                    Kalan Borç
                                </span>
                                <span
                                    className="text-[15px] font-semibold"
                                    style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--primary)" }}
                                >
                                    ₺{remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                {(["full", "partial"] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setPayMode(mode)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                                        style={{
                                            borderRadius: "var(--radius-md)",
                                            border: `1.5px solid ${payMode === mode ? "var(--primary-border)" : "var(--border)"}`,
                                            background: payMode === mode ? "var(--primary-light)" : "var(--surface-muted)",
                                        }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                                            style={{ borderColor: payMode === mode ? "var(--primary)" : "var(--border)" }}
                                        >
                                            {payMode === mode && (
                                                <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                                                {mode === "full" ? "Tamamını Öde" : "Belirli Tutar Öde"}
                                            </p>
                                            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                {mode === "full"
                                                    ? `₺${remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ödenecek`
                                                    : "Kısmi ödeme yap"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {payMode === "partial" && (
                                <div className="mb-3">
                                    <div className="relative">
                                        <span
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-medium"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            ₺
                                        </span>
                                        <input
                                            type="number"
                                            min="0.01"
                                            max={remaining}
                                            step="0.01"
                                            value={partialAmount}
                                            onChange={(e) => { setPartialAmount(e.target.value); setPayError(""); }}
                                            placeholder={`Maks. ${remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                                            className="w-full pl-8 pr-4 py-2.5 text-[13.5px] outline-none"
                                            style={{
                                                background: "var(--surface-muted)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "var(--radius-md)",
                                                color: "var(--foreground)",
                                                fontFamily: "var(--font-geist-mono, monospace)",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {payError && (
                                <p
                                    className="text-[13px] px-3 py-2 rounded-[var(--radius-md)] mb-3"
                                    style={{ background: "var(--danger-light)", color: "var(--danger)" }}
                                >
                                    {payError}
                                </p>
                            )}

                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => setShowPayModal(false)}
                                    disabled={isPaying}
                                    className="flex-1 py-2.5 text-[13px] font-medium disabled:opacity-50"
                                    style={{
                                        background: "var(--surface-muted)",
                                        borderRadius: "var(--radius-md)",
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={confirm}
                                    disabled={isPaying || partialInvalid}
                                    className="flex-1 py-2.5 text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: "var(--primary)",
                                        borderRadius: "var(--radius-md)",
                                        color: "#fff",
                                    }}
                                >
                                    {isPaying ? "Ödeniyor..." : "Onayla"}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Top nav ── */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3">
                <button
                    onClick={() => router.push(`/groups/${groupId}`)}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    aria-label="Geri dön"
                >
                    <ChevronLeft className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>

                <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                    Harcama Detayı
                </span>

                {isOwner && expense ? (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => { setEditNotes(expense.notes ?? ""); setNotesError(""); setShowEditNotes(true); }}
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            aria-label="Notu düzenle"
                        >
                            <Pencil className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                        </button>
                        <button
                            onClick={() => { setDeleteError(""); setShowDeleteConfirm(true); }}
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                            style={{ background: "var(--danger-light)", border: "1px solid rgba(208,73,47,0.2)" }}
                            aria-label="Sil"
                        >
                            <Trash2 className="w-4 h-4" style={{ color: "var(--danger)" }} />
                        </button>
                    </div>
                ) : (
                    <div className="w-9" />
                )}
            </div>

            <main className="px-4 pb-32">
                {loading ? (
                    <div className="space-y-3">
                        <div
                            className="rounded-[var(--radius-lg)] p-5 animate-pulse"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            <div className="w-12 h-12 rounded-[var(--radius-md)] mb-3" style={{ background: "var(--surface-muted)" }} />
                            <div className="h-6 w-32 rounded-full mb-2" style={{ background: "var(--surface-muted)" }} />
                            <div className="h-4 w-20 rounded-full" style={{ background: "var(--surface-muted)" }} />
                        </div>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-14 rounded-[var(--radius-lg)] animate-pulse"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            />
                        ))}
                    </div>
                ) : expense ? (
                    <>
                        {/* ── Hero card ── */}
                        {(() => {
                            const mySplit = expense.splits.find((s) => String(s.user_id) === String(currentUserId));
                            const myOwed = mySplit ? parseFloat(mySplit.owed_amount) : 0;
                            const myPaid = mySplit ? parseFloat(mySplit.paid_amount) : 0;
                            const mySettled = myOwed > 0 && myPaid >= myOwed;
                            const myPaying = mySplit ? payingIds.has(mySplit.id) : false;

                            return (
                                <div
                                    className="rounded-[var(--radius-lg)] p-5 mb-3"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-4"
                                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                                    >
                                        <Receipt className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p
                                                className="text-[22px] font-semibold mb-0.5"
                                                style={{
                                                    fontFamily: "var(--font-geist-mono, monospace)",
                                                    color: "var(--foreground)",
                                                    letterSpacing: "-0.5px",
                                                }}
                                            >
                                                ₺{parseFloat(expense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[14px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                                {expense.title}
                                            </p>
                                        </div>
                                        {mySplit && myOwed > 0 && !isOwner && (
                                            mySettled ? (
                                                <span
                                                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full shrink-0"
                                                    style={{ background: "var(--primary-light)", color: "var(--primary-ink)" }}
                                                >
                                                    Ödendi ✓
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={handleOpenPayModal}
                                                    disabled={myPaying}
                                                    className="text-[13px] font-semibold px-4 py-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                                    style={{
                                                        background: "var(--primary)",
                                                        borderRadius: "var(--radius-md)",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    {myPaying ? "Ödeniyor..." : "Borcumu Öde"}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ── Expense Stats ── */}
                        {(() => {
                            // Ödeyen kişinin kendi borcu stats'tan hariç tutulur;
                            // o kişi harcamayı zaten peşin ödedi, kendine ödeme yapmaz.
                            const debtSplits = expense.splits.filter(
                                (sp) => String(sp.user_id) !== String(expense.paid_by),
                            );
                            const totalOwed = debtSplits.reduce((s, sp) => s + parseFloat(sp.owed_amount), 0);
                            const totalPaid = debtSplits.reduce((s, sp) => s + parseFloat(sp.paid_amount), 0);
                            const totalPending = totalOwed - totalPaid;
                            const settledCount = debtSplits.filter(
                                (sp) => parseFloat(sp.paid_amount) >= parseFloat(sp.owed_amount),
                            ).length;
                            const totalCount = debtSplits.length;
                            const progressPct = totalOwed > 0
                                ? Math.min(100, Math.round((totalPaid / totalOwed) * 100))
                                : 100;

                            const splitTypeLabel: Record<string, string> = {
                                equal: "Eşit",
                                exact: "Tutara Göre",
                                percentage: "Yüzde",
                            };

                            return (
                                <div
                                    className="rounded-[var(--radius-lg)] mb-3 overflow-hidden"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                >
                                    <button
                                        onClick={() => setStatsOpen((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="h-1.5 w-20 rounded-full overflow-hidden"
                                                style={{ background: "var(--surface-muted)" }}
                                            >
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: barAnimated ? `${progressPct}%` : "0%",
                                                        transition: "width 900ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                                        background: "var(--primary)",
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className="text-[12px] font-medium"
                                                style={{ color: progressPct === 100 ? "var(--primary)" : "var(--text-muted)" }}
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
                                            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                                <div
                                                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5"
                                                    style={{ background: "var(--primary-light)" }}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--primary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--primary-ink)" }}>
                                                            Ödenen
                                                        </p>
                                                        <p
                                                            className="text-[13px] font-semibold leading-tight"
                                                            style={{
                                                                fontFamily: "var(--font-geist-mono, monospace)",
                                                                color: "var(--foreground)",
                                                            }}
                                                        >
                                                            ₺{totalPaid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5"
                                                    style={{ background: "var(--surface-muted)" }}
                                                >
                                                    <Clock3 className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                                            Bekleyen
                                                        </p>
                                                        <p
                                                            className="text-[13px] font-semibold leading-tight"
                                                            style={{
                                                                fontFamily: "var(--font-geist-mono, monospace)",
                                                                color: "var(--foreground)",
                                                            }}
                                                        >
                                                            ₺{totalPending.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5"
                                                    style={{ background: "var(--surface-muted)" }}
                                                >
                                                    <TrendingUp className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                                            Bölüşüm
                                                        </p>
                                                        <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                                                            {splitTypeLabel[expense.split_type] ?? expense.split_type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5"
                                                    style={{ background: "var(--surface-muted)" }}
                                                >
                                                    <UserCheck className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                                                            Ödeyenler
                                                        </p>
                                                        <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
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

                        {/* ── Meta rows ── */}
                        <div
                            className="rounded-[var(--radius-lg)] overflow-hidden mb-3"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            {[
                                {
                                    icon: <Wallet className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />,
                                    label: "Ödeyen",
                                    value: (() => {
                                        const p = members.find((m) => String(m.user_id) === String(expense.paid_by));
                                        return p?.display_name ?? p?.username ?? expense.paid_by;
                                    })(),
                                },
                                {
                                    icon: <CalendarDays className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />,
                                    label: "Tarih",
                                    value: expense.expense_date,
                                },
                                {
                                    icon: <span className="w-4 h-4 text-[12px] font-bold flex items-center justify-center shrink-0" style={{ color: "var(--text-muted)" }}>₺</span>,
                                    label: "Para Birimi",
                                    value: expense.currency,
                                },
                            ].map((row, i, arr) => (
                                <div
                                    key={row.label}
                                    className="flex items-center gap-3 px-4 py-3.5"
                                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none" }}
                                >
                                    {row.icon}
                                    <span className="text-[13px] w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
                                        {row.label}
                                    </span>
                                    <span
                                        className="text-[13px] font-medium"
                                        style={{
                                            fontFamily: row.label === "Tarih" ? "var(--font-geist-mono, monospace)" : undefined,
                                            color: "var(--foreground)",
                                        }}
                                    >
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                            <div
                                className="flex items-start gap-3 px-4 py-3.5"
                                style={{ borderTop: "1px solid var(--border-light)" }}
                            >
                                <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
                                <span className="text-[13px] w-24 shrink-0" style={{ color: "var(--text-muted)" }}>Not</span>
                                <span
                                    className="text-[13px] flex-1"
                                    style={{ color: expense.notes ? "var(--text-secondary)" : "var(--text-placeholder)" }}
                                >
                                    {expense.notes || (isOwner ? "Not yok · düzenlemek için kalem ikonuna tıkla" : "—")}
                                </span>
                            </div>
                        </div>

                        {/* ── Splits ── */}
                        <div className="mb-3">
                            <div className="flex items-center gap-2 px-1 mb-2">
                                <Users className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                                <span
                                    className="text-[10px] uppercase font-medium tracking-wider"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Paylaşım
                                </span>
                            </div>
                            <div
                                className="rounded-[var(--radius-lg)] overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                {expense.splits.map((split, i) => {
                                    const member = members.find((m) => String(m.user_id) === String(split.user_id));
                                    const name = member?.display_name ?? member?.username ?? String(split.user_id);
                                    const owed = parseFloat(split.owed_amount);
                                    const paid = parseFloat(split.paid_amount);
                                    const settled = paid >= owed;
                                    const isPayer = String(split.user_id) === String(expense.paid_by);

                                    return (
                                        <div
                                            key={split.id}
                                            className="flex items-center gap-3 px-4 py-3.5"
                                            style={{
                                                borderBottom: i < expense.splits.length - 1
                                                    ? "1px solid var(--border-light)"
                                                    : "none",
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
                                                style={{
                                                    background: isPayer ? "var(--primary-light)" : "var(--surface-muted)",
                                                    color: isPayer ? "var(--primary-ink)" : "var(--text-secondary)",
                                                }}
                                            >
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13.5px] font-medium truncate" style={{ color: "var(--foreground)" }}>
                                                    {name}
                                                </p>
                                                {isPayer && (
                                                    <p className="text-[11px]" style={{ color: "var(--primary)" }}>Ödeyen</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p
                                                    className="text-[13px] font-semibold"
                                                    style={{
                                                        fontFamily: "var(--font-geist-mono, monospace)",
                                                        color: "var(--foreground)",
                                                    }}
                                                >
                                                    ₺{owed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                </p>
                                                {isPayer ? (
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                        hissesi
                                                    </p>
                                                ) : settled ? (
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--primary)" }}>
                                                        Ödendi ✓
                                                    </p>
                                                ) : paid > 0 ? (
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--warning)" }}>
                                                        ₺{paid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ödendi
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--danger)" }}>
                                                        Bekliyor
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : null}
            </main>
            <BottomNav />
        </div>
    );
};
