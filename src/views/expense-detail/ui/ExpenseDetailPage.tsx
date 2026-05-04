"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, Receipt, CalendarDays, FileText, Wallet, Users,
    CheckCircle2, Clock3, Pencil, X, AlertTriangle,
    Bell, Settings2, Plus, ChevronRight, Hash, History,
} from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { ExpenseFullDetailResponse } from "@/entities/expense/model/types";
import { useUser } from "@/shared/store/UserContext";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { SPLIT_TYPE_LABELS } from "@/shared/config";
import { getCategoryMeta, getCategoryMetaWithFallback } from "@/shared/lib/categoryIcons";

interface ExpenseDetailPageProps {
    groupId: string;
    expenseId: string;
}

const MOCK_ACTIVITY = [
    {
        id: 1,
        icon: "plus",
        actor: "Enes",
        action: "harcamayı oluşturdu",
        time: "18 Nis · 19:30",
    },
    {
        id: 2,
        icon: "file",
        actor: "Enes",
        action: "fiş ekledi (carrefour-receipt.pdf)",
        time: "18 Nis · 19:32",
    },
    {
        id: 3,
        icon: "check",
        actor: "Kerem",
        action: "₺171,37 ödedi",
        time: "21 Nis · 14:08",
    },
    {
        id: 4,
        icon: "bell",
        actor: "Sistem",
        action: "Ayşe ve Merve'ye hatırlatma gönderildi",
        time: "23 Nis · 09:14",
    },
];

function ActivityIcon({ type }: { type: string }) {
    const base = "w-7 h-7 rounded-full flex items-center justify-center shrink-0";
    if (type === "plus")
        return (
            <div className={base} style={{ background: "var(--primary-light)" }}>
                <Plus className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            </div>
        );
    if (type === "file")
        return (
            <div className={base} style={{ background: "var(--surface-muted)" }}>
                <FileText className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            </div>
        );
    if (type === "check")
        return (
            <div className={base} style={{ background: "var(--primary-light)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
            </div>
        );
    return (
        <div className={base} style={{ background: "var(--surface-muted)" }}>
            <Bell className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        </div>
    );
}


export const ExpenseDetailPage = ({ groupId, expenseId }: ExpenseDetailPageProps) => {
    const router = useRouter();
    const currentUserId = useUser()?.id ?? null;

    const [expense, setExpense] = useState<ExpenseFullDetailResponse | null>(null);
    const [splitIdMap, setSplitIdMap] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [payingIds, setPayingIds] = useState<Set<string>>(new Set());
    const [showPayModal, setShowPayModal] = useState(false);
    const [payMode, setPayMode] = useState<"full" | "partial">("full");
    const [partialAmount, setPartialAmount] = useState("");
    const [payError, setPayError] = useState("");

    const [showEditNotes, setShowEditNotes] = useState(false);
    const [editNotes, setEditNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesError, setNotesError] = useState("");

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        expenseApi.getById(expenseId).then((exp) => {
            setExpense(exp);
            setSplitIdMap(new Map(exp.splits.map((s) => [s.user.id, s.id])));
        }).catch((err: unknown) => {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 403 || status === 404) router.replace("/groups");
        }).finally(() => setLoading(false));
    }, [expenseId]);

    const isOwner = expense ? String(expense.paid_by.id) === String(currentUserId) : false;
    const currencySymbol = getCurrencySymbol(expense?.currency ?? "TRY");

    const handlePay = async (splitId: string, paidAmount?: number) => {
        if (!expense) return;
        setPayingIds((prev) => new Set(prev).add(splitId));
        setPayError("");
        try {
            await expenseApi.paySplit(expense.id, splitId, paidAmount);
            const refreshed = await expenseApi.getById(expenseId);
            setExpense(refreshed);
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
                const mySplit = expense?.splits.find((s) => String(s.user.id) === String(currentUserId));
                const mySplitId = currentUserId ? splitIdMap.get(currentUserId) : undefined;
                if (!mySplit) return null;
                const remaining = parseFloat(mySplit.remaining_amount);
                const isPaying = mySplitId ? payingIds.has(mySplitId) : false;
                const partialVal = parseFloat(partialAmount);
                const partialInvalid = payMode === "partial" && (isNaN(partialVal) || partialVal <= 0 || partialVal > remaining);

                const confirm = () => {
                    if (!mySplitId) { setPayError("Ödeme bilgisi yüklenemedi, sayfayı yenileyin."); return; }
                    if (payMode === "full") handlePay(mySplitId);
                    else if (!partialInvalid) handlePay(mySplitId, partialVal);
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
                                    {currencySymbol}{remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
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
                                                    ? `${currencySymbol}${remaining.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ödenecek`
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
                                            {currencySymbol}
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
            <div className="px-4 md:px-8 pt-14 pb-2">
                <button
                    onClick={() => router.push(`/groups/${groupId}`)}
                    className="flex items-center gap-1.5 mb-4 active:opacity-70 transition-opacity"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Gruba Dön</span>
                </button>

                <div className="flex items-center justify-between">
                    <h1 className="text-[22px] font-bold" style={{ color: "var(--foreground)" }}>
                        Harcama Detayı
                    </h1>
                    {expense && (
                        <div className="flex items-center gap-2">
                            <button
                                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-all active:scale-95"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Fişi gör</span>
                            </button>
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => { setEditNotes(expense.notes ?? ""); setNotesError(""); setShowEditNotes(true); }}
                                        className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-all active:scale-95"
                                        style={{
                                            background: "var(--surface)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--radius-md)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        <Settings2 className="w-3.5 h-3.5" />
                                        <span>Düzenle</span>
                                    </button>
                                    <button
                                        onClick={() => { setDeleteError(""); setShowDeleteConfirm(true); }}
                                        className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-all active:scale-95"
                                        style={{
                                            background: "var(--danger-light)",
                                            border: "1px solid rgba(208,73,47,0.2)",
                                            borderRadius: "var(--radius-md)",
                                            color: "var(--danger)",
                                        }}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Sil</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <main className="px-4 md:px-8 pb-32 mt-4">
                {loading ? (
                    <div className="space-y-3 max-w-6xl mx-auto">
                        <div
                            className="rounded-[var(--radius-lg)] p-5 animate-pulse"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            <div className="h-5 w-40 rounded-full mb-4" style={{ background: "var(--surface-muted)" }} />
                            <div className="h-8 w-52 rounded-full mb-2" style={{ background: "var(--surface-muted)" }} />
                            <div className="h-4 w-28 rounded-full" style={{ background: "var(--surface-muted)" }} />
                        </div>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 rounded-[var(--radius-lg)] animate-pulse"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            />
                        ))}
                    </div>
                ) : expense ? (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">

                        {/* ── Left column ── */}
                        <div className="space-y-4">

                            {/* Hero card */}
                            {(() => {
                                const mySplit = expense.splits.find((s) => String(s.user.id) === String(currentUserId));
                                const myOwed = mySplit ? parseFloat(mySplit.owed_amount) : 0;
                                const mySettled = mySplit?.status === "paid";
                                const mySplitId = currentUserId ? splitIdMap.get(currentUserId) : undefined;
                                const myPaying = mySplitId ? payingIds.has(mySplitId) : false;

                                const formatDate = (d: string | null) => {
                                    if (!d) return "—";
                                    try {
                                        return new Intl.DateTimeFormat("tr-TR", {
                                            day: "numeric", month: "long", year: "numeric",
                                        }).format(new Date(d));
                                    } catch { return d; }
                                };

                                return (
                                    <div
                                        className="rounded-[var(--radius-lg)] p-5"
                                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                    >
                                        {/* Header: icon + content + total */}
                                        {(() => {
                                            const catMeta = getCategoryMetaWithFallback(expense.category);
                                            const CatIcon = catMeta.icon;
                                            const perPerson = expense.splits.length > 0
                                                ? parseFloat(expense.amount) / expense.splits.length
                                                : null;

                                            return (
                                                <>
                                                    <div className="flex items-start gap-4 mb-5">
                                                        {/* Category icon square */}
                                                        <div
                                                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                                            style={{ background: catMeta.bg }}
                                                        >
                                                            <CatIcon className="w-6 h-6" style={{ color: catMeta.color }} />
                                                        </div>

                                                        {/* Middle: badges + title + date */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                                                {expense.category && (
                                                                    <span
                                                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                                        style={{ background: catMeta.bg, color: catMeta.color }}
                                                                    >
                                                                        {catMeta.label}
                                                                    </span>
                                                                )}
                                                                <span
                                                                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                                                                    style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                                                                >
                                                                    {SPLIT_TYPE_LABELS[expense.split_type] ?? expense.split_type}
                                                                </span>
                                                                <span
                                                                    className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                                                                    style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                                                                >
                                                                    {expense.currency}
                                                                </span>
                                                            </div>
                                                            <h2 className="text-[20px] font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>
                                                                {expense.title}
                                                            </h2>
                                                            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                                                                {formatDate(expense.expense_date)}
                                                            </p>
                                                        </div>

                                                        {/* Total */}
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5" style={{ color: "var(--text-muted)" }}>
                                                                TOPLAM
                                                            </p>
                                                            <p
                                                                className="text-[26px] font-bold leading-none"
                                                                style={{
                                                                    fontFamily: "var(--font-geist-mono, monospace)",
                                                                    color: "var(--foreground)",
                                                                    letterSpacing: "-1px",
                                                                }}
                                                            >
                                                                {currencySymbol}{parseFloat(expense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Info boxes */}
                                                    <div
                                                        className="grid rounded-[var(--radius-md)] overflow-hidden"
                                                        style={{
                                                            gridTemplateColumns: perPerson !== null ? "1fr 1fr 1fr" : "1fr 1fr",
                                                            border: "1px solid var(--border-light)",
                                                        }}
                                                    >
                                                        <div className="px-3.5 py-3" style={{ borderRight: "1px solid var(--border-light)" }}>
                                                            <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                                                                ÖDEYEN
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                                                                    style={{ background: catMeta.bg, color: catMeta.color }}
                                                                >
                                                                    {expense.paid_by.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <p className="text-[12px] font-semibold truncate" style={{ color: "var(--foreground)" }}>
                                                                    {expense.paid_by.name}
                                                                    {String(expense.paid_by.id) === String(currentUserId) && (
                                                                        <span className="ml-1 text-[11px] font-normal" style={{ color: "var(--text-muted)" }}>(sen)</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="px-3.5 py-3"
                                                            style={{ borderRight: perPerson !== null ? "1px solid var(--border-light)" : "none" }}
                                                        >
                                                            <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                                                                GRUP
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                                    style={{ background: "var(--primary)" }}
                                                                />
                                                                <p className="text-[12px] font-semibold truncate" style={{ color: "var(--foreground)" }}>
                                                                    {expense.group?.name ?? "—"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {perPerson !== null && (
                                                            <div className="px-3.5 py-3">
                                                                <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                                                                    KİŞİ BAŞI
                                                                </p>
                                                                <p
                                                                    className="text-[12px] font-semibold"
                                                                    style={{
                                                                        fontFamily: "var(--font-geist-mono, monospace)",
                                                                        color: "var(--foreground)",
                                                                    }}
                                                                >
                                                                    {currencySymbol}{perPerson.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}

                                        {/* Pay button for non-owners */}
                                        {mySplit && myOwed > 0 && !isOwner && (
                                            <div className="mt-4">
                                                {mySettled ? (
                                                    <div
                                                        className="flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-md)]"
                                                        style={{ background: "var(--primary-light)" }}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                                        <span className="text-[13px] font-semibold" style={{ color: "var(--primary-ink)" }}>
                                                            Borcun ödendi
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={handleOpenPayModal}
                                                        disabled={myPaying}
                                                        className="w-full py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                        style={{
                                                            background: "var(--primary)",
                                                            borderRadius: "var(--radius-md)",
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        {myPaying ? "Ödeniyor..." : `Borcumu Öde · ${currencySymbol}${myOwed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Tahsilat Durumu */}
                            {(() => {
                                const debtSplits = expense.splits.filter(
                                    (sp) => String(sp.user.id) !== String(expense.paid_by.id),
                                );
                                const totalOwed = debtSplits.reduce((s, sp) => s + parseFloat(sp.owed_amount), 0);
                                const totalPaid = debtSplits.reduce((s, sp) => s + parseFloat(sp.paid_amount), 0);
                                const totalPending = totalOwed - totalPaid;
                                const settledCount = debtSplits.filter((sp) => sp.status === "paid").length;
                                const pendingCount = debtSplits.length - settledCount;
                                const progressPct = totalOwed > 0
                                    ? Math.min(100, Math.round((totalPaid / totalOwed) * 100))
                                    : 100;

                                return (
                                    <div
                                        className="rounded-[var(--radius-lg)] p-5"
                                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                    >
                                        <p className="text-[10px] uppercase tracking-wider font-medium mb-3" style={{ color: "var(--text-muted)" }}>
                                            TAHSİLAT DURUMU
                                        </p>
                                        <div className="flex items-end justify-between gap-3 mb-3">
                                            <p
                                                className="text-[24px] font-bold leading-none"
                                                style={{
                                                    fontFamily: "var(--font-geist-mono, monospace)",
                                                    color: "var(--foreground)",
                                                    letterSpacing: "-0.5px",
                                                }}
                                            >
                                                {currencySymbol}{totalPaid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                <span className="text-[14px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                                                    / {currencySymbol}{totalOwed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span
                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: "var(--primary-light)", color: "var(--primary-ink)" }}
                                                >
                                                    %{progressPct} tamamlandı
                                                </span>
                                                {pendingCount > 0 && (
                                                    <span
                                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                        style={{ background: "rgba(234,115,28,0.12)", color: "var(--warning)" }}
                                                    >
                                                        {pendingCount} bekliyor
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div
                                            className="h-2 w-full rounded-full overflow-hidden mb-4"
                                            style={{ background: "var(--surface-muted)" }}
                                        >
                                            <div
                                                className="h-full rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${progressPct}%`,
                                                    background: "var(--primary)",
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                                                <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                                    Ödenen:
                                                    <span
                                                        className="ml-1 font-semibold"
                                                        style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--foreground)" }}
                                                    >
                                                        {currencySymbol}{totalPaid.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock3 className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                                                <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                                    Bekleyen:
                                                    <span
                                                        className="ml-1 font-semibold"
                                                        style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--foreground)" }}
                                                    >
                                                        {currencySymbol}{totalPending.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Not */}
                            <div
                                className="rounded-[var(--radius-lg)] p-5"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Not</span>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => { setEditNotes(expense.notes ?? ""); setNotesError(""); setShowEditNotes(true); }}
                                            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors active:scale-90"
                                            style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <p
                                    className="text-[13px] leading-relaxed"
                                    style={{ color: expense.notes ? "var(--text-secondary)" : "var(--text-placeholder)" }}
                                >
                                    {expense.notes || (isOwner ? "Not yok · düzenlemek için kalem ikonuna tıkla" : "—")}
                                </p>
                            </div>

                            {/* Paylaşım */}
                            <div
                                className="rounded-[var(--radius-lg)] overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: "1px solid var(--border-light)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                                            Paylaşım
                                        </span>
                                        <span
                                            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                                            style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                                        >
                                            {expense.splits.length} kişi
                                        </span>
                                    </div>

                                    {/*
                                    <button
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95"
                                        style={{
                                            background: "var(--surface-muted)",
                                            borderRadius: "var(--radius-md)",
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        <Bell className="w-3 h-3" />
                                        Hatırlat
                                    </button>
                                    */}
                                </div>

                                {/* Column headers */}
                                <div
                                    className="grid px-4 py-2"
                                    style={{
                                        gridTemplateColumns: "1fr 60px 90px 100px 24px",
                                        borderBottom: "1px solid var(--border-light)",
                                    }}
                                >
                                    {["ÜYE", "YÜZDE", "PAY", "DURUM"].map((h) => (
                                        <span key={h} className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>
                                            {h}
                                        </span>
                                    ))}
                                    <span />
                                </div>

                                {/* Scrollable list */}
                                <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
                                    {expense.splits.map((split, i) => {
                                        const name = split.user.name;
                                        const owed = parseFloat(split.owed_amount);
                                        const total = parseFloat(expense.amount);
                                        const pct = total > 0 ? Math.round((owed / total) * 100) : 0;
                                        const isPayer = String(split.user.id) === String(expense.paid_by.id);
                                        const isMe = String(split.user.id) === String(currentUserId);

                                        return (
                                            <div
                                                key={split.user.id}
                                                className="grid items-center px-4 py-3"
                                                style={{
                                                    gridTemplateColumns: "1fr 60px 90px 100px 24px",
                                                    borderTop: i > 0 ? "1px solid var(--border-light)" : "none",
                                                }}
                                            >
                                                {/* Member */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                                                        style={{
                                                            background: isPayer ? "var(--primary)" : "var(--surface-muted)",
                                                            color: isPayer ? "#fff" : "var(--text-secondary)",
                                                        }}
                                                    >
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-medium truncate" style={{ color: "var(--foreground)" }}>
                                                            {name}{isMe && <span className="ml-1 text-[11px] font-normal" style={{ color: "var(--text-muted)" }}>(sen)</span>}
                                                        </p>
                                                        <p className="text-[11px]" style={{ color: isPayer ? "var(--primary)" : "var(--text-muted)" }}>
                                                            {isPayer ? "Ödeyen" : split.status === "paid" ? "Ödedi" : "Ödeme bekleniyor"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Percentage */}
                                                <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                                                    %{pct}
                                                </span>

                                                {/* Amount */}
                                                <span
                                                    className="text-[13px] font-semibold"
                                                    style={{
                                                        fontFamily: "var(--font-geist-mono, monospace)",
                                                        color: "var(--foreground)",
                                                    }}
                                                >
                                                    {currencySymbol}{owed.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                </span>

                                                {/* Status */}
                                                {isPayer ? (
                                                    <span
                                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block w-fit"
                                                        style={{ background: "var(--primary-light)", color: "var(--primary-ink)" }}
                                                    >
                                                        ✓ Ödendi
                                                    </span>
                                                ) : split.status === "paid" ? (
                                                    <span
                                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block w-fit"
                                                        style={{ background: "var(--primary-light)", color: "var(--primary-ink)" }}
                                                    >
                                                        ✓ Ödendi
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block w-fit"
                                                        style={{ background: "rgba(234,115,28,0.12)", color: "var(--warning)" }}
                                                    >
                                                        Bekliyor
                                                    </span>
                                                )}

                                                {/* Chevron */}
                                                <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--border)" }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Right sidebar ── */}
                        <div className="space-y-4">

                            {/* Detaylar */}
                            <div
                                className="rounded-[var(--radius-lg)] overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
                                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Detaylar</span>
                                </div>
                                {[
                                    {
                                        icon: <CalendarDays className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />,
                                        label: "Tarih",
                                        value: expense.expense_date ?? "—",
                                        mono: true,
                                    },
                                    {
                                        icon: <span className="w-4 h-4 text-[12px] font-bold flex items-center justify-center shrink-0" style={{ color: "var(--text-muted)" }}>{currencySymbol}</span>,
                                        label: "Para birimi",
                                        value: expense.currency,
                                    },
                                    {
                                        icon: <Users className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />,
                                        label: "Paylaşım",
                                        value: `${SPLIT_TYPE_LABELS[expense.split_type] ?? expense.split_type}`,
                                    },
                                    {
                                        icon: <Clock3 className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />,
                                        label: "Oluşturuldu",
                                        value: expense.created_at
                                            ? new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(expense.created_at))
                                            : "—",
                                        mono: true,
                                    }
                                    //{
                                    //    icon: <Hash className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />,
                                    //    label: "Harcama ID",
                                    //    value: expense.id.slice(0, 12).toUpperCase(),
                                    //    mono: true,
                                    //},
                                ].map((row, i, arr) => (
                                    <div
                                        key={row.label}
                                        className="flex items-center gap-3 px-4 py-3"
                                        style={{ borderBottom: i < arr.length - 1 || expense.category ? "1px solid var(--border-light)" : "none" }}
                                    >
                                        {row.icon}
                                        <span className="text-[12px] w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
                                            {row.label}
                                        </span>
                                        <span
                                            className="text-[12px] font-medium text-right flex-1"
                                            style={{
                                                fontFamily: row.mono ? "var(--font-geist-mono, monospace)" : undefined,
                                                color: "var(--foreground)",
                                            }}
                                        >
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                                {expense.category && (() => {
                                    const meta = getCategoryMeta(expense.category);
                                    if (!meta) return null;
                                    const Icon = meta.icon;
                                    return (
                                        <div
                                            className="flex items-center gap-3 px-4 py-3"
                                            style={{ borderBottom: "none" }}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                                style={{ background: meta.bg }}
                                            >
                                                <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                                            </div>
                                            <span className="text-[12px] w-24 shrink-0" style={{ color: "var(--text-muted)" }}>
                                                Kategori
                                            </span>
                                            <span
                                                className="text-[12px] font-medium text-right flex-1"
                                                style={{ color: meta.color }}
                                            >
                                                {meta.label}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Fiş */}
                            <div
                                className="rounded-[var(--radius-lg)] overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <div
                                    className="flex items-center justify-between px-4 py-3.5"
                                    style={{ borderBottom: "1px solid var(--border-light)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Receipt className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Fiş</span>
                                    </div>
                                    <span
                                        className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                        style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                                    >
                                        PDF
                                    </span>
                                </div>
                                <div className="p-4">
                                    <div
                                        className="flex flex-col items-center justify-center py-6 rounded-[var(--radius-md)]"
                                        style={{ background: "var(--surface-muted)" }}
                                    >
                                        <FileText className="w-8 h-8 mb-2" style={{ color: "var(--border)" }} />
                                        <p className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>
                                            Fiş yüklenmemiş
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            className="flex-1 py-2 text-[12px] font-medium transition-all active:scale-95"
                                            style={{
                                                background: "var(--surface-muted)",
                                                borderRadius: "var(--radius-md)",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            Görüntüle
                                        </button>
                                        <button
                                            className="flex-1 py-2 text-[12px] font-medium transition-all active:scale-95"
                                            style={{
                                                background: "var(--surface-muted)",
                                                borderRadius: "var(--radius-md)",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            İndir
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Aktivite */}
                            <div
                                className="rounded-[var(--radius-lg)] overflow-hidden"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <div
                                    className="flex items-center gap-2 px-4 py-3.5"
                                    style={{ borderBottom: "1px solid var(--border-light)" }}
                                >
                                    <History className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                    <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Aktivite</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    {MOCK_ACTIVITY.map((item) => (
                                        <div key={item.id} className="flex items-start gap-3">
                                            <ActivityIcon type={item.icon} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12.5px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                                                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                                                        {item.actor}
                                                    </span>
                                                    {" "}{item.action}
                                                </p>
                                                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                    {item.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>
            <BottomNav />
        </div>
    );
};
