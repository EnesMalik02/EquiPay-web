"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Equal, AlertCircle } from "lucide-react";
import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { GroupMemberResponse, GroupResponse } from "@/entities/group/model/types";

interface CreateExpensePageProps {
    groupId: string;
}

export const CreateExpensePage = ({ groupId }: CreateExpensePageProps) => {
    const router = useRouter();

    // Remote data
    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    // Form fields
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [paidById, setPaidById] = useState("");
    // splits: userId → raw input string
    const [splits, setSplits] = useState<Record<string, string>>({});

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    /* ── Load group + members ─────────────────────────────────── */
    useEffect(() => {
        Promise.all([groupApi.get(groupId), groupApi.listMembers(groupId)])
            .then(([g, m]) => {
                setGroup(g);
                setMembers(m);
                if (m.length > 0) {
                    setPaidById(m[0].user_id);
                    const initialSplits: Record<string, string> = {};
                    m.forEach((mem) => { initialSplits[mem.user_id] = ""; });
                    setSplits(initialSplits);
                }
            })
            .catch(() => setError("Grup bilgileri yüklenemedi."))
            .finally(() => setDataLoading(false));
    }, [groupId]);

    /* ── Derived ──────────────────────────────────────────────── */
    const parsedAmount = parseFloat(amount) || 0;

    const splitSum = useMemo(
        () => Object.values(splits).reduce((acc, v) => acc + (parseFloat(v) || 0), 0),
        [splits],
    );

    const splitDiff = parseFloat((parsedAmount - splitSum).toFixed(2));
    const splitsValid = splitDiff === 0 && parsedAmount > 0;

    const formValid =
        title.trim().length > 0 &&
        parsedAmount > 0 &&
        paidById.length > 0 &&
        splitsValid;

    /* ── Eşit böl ─────────────────────────────────────────────── */
    const distributeEqually = () => {
        if (parsedAmount <= 0 || members.length === 0) return;
        const base = Math.floor((parsedAmount / members.length) * 100) / 100;
        const remainder = parseFloat((parsedAmount - base * members.length).toFixed(2));
        const next: Record<string, string> = {};
        members.forEach((m, i) => {
            next[m.user_id] = i === 0
                ? (base + remainder).toFixed(2)
                : base.toFixed(2);
        });
        setSplits(next);
    };

    /* ── Submit ───────────────────────────────────────────────── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formValid) return;

        setSubmitting(true);
        setError("");

        try {
            await expenseApi.create({
                group_id: groupId,
                paid_by: paidById,
                title: title.trim(),
                amount: parsedAmount,
                notes: notes.trim() || undefined,
                expense_date: expenseDate || undefined,
                splits: members.map((m) => ({
                    user_id: m.user_id,
                    owed_amount: parseFloat(splits[m.user_id] || "0"),
                })),
            });
            router.push(`/groups/${groupId}`);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail || e.message || "Harcama kaydedilemedi.");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Loading ──────────────────────────────────────────────── */
    if (dataLoading) {
        return (
            <div className="min-h-screen bg-white font-sans pb-32">
                <Navbar />
                <main className="max-w-2xl mx-auto px-6 pt-8">
                    <div className="h-5 w-32 bg-gray-100 rounded-full animate-pulse mb-10" />
                    <div className="space-y-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </main>
                <BottomNav />
            </div>
        );
    }

    /* ── Render ───────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-32">
            <Navbar />

            <main className="max-w-2xl mx-auto px-6 pt-8">

                {/* Back */}
                <button
                    onClick={() => router.push(`/groups/${groupId}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {group ? group.name : "Gruba Dön"}
                </button>

                <h1 className="text-3xl font-extrabold tracking-tight text-black mb-8">
                    Harcama Ekle
                </h1>

                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Başlık <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Örn: Akşam yemeği"
                            maxLength={80}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium placeholder-gray-400"
                        />
                    </div>

                    {/* Amount + Date row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Tutar (₺) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Tarih <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
                            </label>
                            <input
                                type="date"
                                value={expenseDate}
                                onChange={(e) => setExpenseDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium"
                            />
                        </div>
                    </div>

                    {/* Paid by */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Kim Ödedi? <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={paidById}
                            onChange={(e) => setPaidById(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium"
                        >
                            {members.map((m) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.name ?? m.username ?? m.user_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Not <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ek bilgi"
                            maxLength={200}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium placeholder-gray-400"
                        />
                    </div>

                    {/* Splits */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-gray-700">
                                Paylaşım <span className="text-red-400">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={distributeEqually}
                                disabled={parsedAmount <= 0}
                                className="flex items-center gap-1.5 text-xs font-bold text-[#00d186] hover:text-[#00b070] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <Equal className="w-3.5 h-3.5" />
                                Eşit Böl
                            </button>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                            {members.map((m) => (
                                <div key={m.user_id} className="flex items-center gap-4 px-4 py-3">
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#00d186] font-bold text-xs shrink-0">
                                        {m.name?.charAt(0).toUpperCase() ?? "?"}
                                    </div>
                                    {/* Name */}
                                    <span className="flex-1 text-sm font-semibold text-black truncate">
                                        {m.name ?? m.username ?? "—"}
                                    </span>
                                    {/* Amount input */}
                                    <div className="relative w-28 shrink-0">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₺</span>
                                        <input
                                            type="number"
                                            value={splits[m.user_id] ?? ""}
                                            onChange={(e) =>
                                                setSplits((prev) => ({ ...prev, [m.user_id]: e.target.value }))
                                            }
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-black outline-none focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sum validation bar */}
                        <div className={`mt-3 flex items-center justify-between text-xs font-semibold px-1 transition-colors ${
                            parsedAmount > 0
                                ? splitsValid
                                    ? "text-[#00d186]"
                                    : "text-red-500"
                                : "text-gray-400"
                        }`}>
                            <span>
                                {parsedAmount > 0
                                    ? splitsValid
                                        ? "✓ Toplam tutar eşleşiyor"
                                        : splitDiff > 0
                                            ? `₺${splitDiff.toFixed(2)} daha girilmesi gerekiyor`
                                            : `₺${Math.abs(splitDiff).toFixed(2)} fazla girildi`
                                    : "Önce toplam tutarı gir"}
                            </span>
                            <span>
                                {splitSum.toFixed(2)} / {parsedAmount > 0 ? parsedAmount.toFixed(2) : "—"} ₺
                            </span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!formValid || submitting}
                        className="w-full py-3.5 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Kaydediliyor..." : "Harcamayı Kaydet"}
                    </button>

                </form>
            </main>

            <BottomNav />
        </div>
    );
};
