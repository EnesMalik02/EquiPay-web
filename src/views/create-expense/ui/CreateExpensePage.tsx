"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, AlertCircle, Camera,
} from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { GroupMemberResponse, GroupWithStatsResponse } from "@/entities/group/model/types";
import { Skeleton } from "@/shared/ui";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { avatarColor } from "@/shared/lib/ui";
import { type SplitType, CATEGORIES, SPLIT_TYPE_OPTIONS } from "@/shared/config";

interface CreateExpensePageProps {
    groupId: string;
}

export const CreateExpensePage = ({ groupId }: CreateExpensePageProps) => {
    const router = useRouter();

    const [group, setGroup] = useState<GroupWithStatsResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [category, setCategory] = useState("");
    const [paidById, setPaidById] = useState("");
    const [splitType, setSplitType] = useState<SplitType>("equal");
    const [splits, setSplits] = useState<Record<string, string>>({});
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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
                    setSelectedMemberIds(new Set(m.map((mem) => mem.user_id)));
                }
            })
            .catch(() => setError("Grup bilgileri yüklenemedi."))
            .finally(() => setDataLoading(false));
    }, [groupId]);

    const parsedAmount = parseFloat(amount) || 0;
    const currencySymbol = getCurrencySymbol(group?.currency_code ?? "TRY");

    const selectedMembers = useMemo(
        () => members.filter((m) => selectedMemberIds.has(m.user_id)),
        [members, selectedMemberIds],
    );

    const splitSum = useMemo(() =>
        selectedMembers.reduce((acc, m) => acc + (parseFloat(splits[m.user_id]) || 0), 0),
    [splits, selectedMembers]);

    const splitsValid = useMemo(() => {
        if (parsedAmount <= 0) return false;
        if (selectedMembers.length === 0) return false;
        if (splitType === "equal") return true;
        if (splitType === "percentage") return Math.abs(splitSum - 100) < 0.01;
        return Math.abs(splitSum - parsedAmount) < 0.01;
    }, [splitType, splitSum, parsedAmount, selectedMembers.length]);

    const formValid =
        title.trim().length > 0 &&
        parsedAmount > 0 &&
        paidById.length > 0 &&
        splitsValid;

    const distributeEqually = () => {
        if (parsedAmount <= 0 || selectedMembers.length === 0) return;
        if (splitType === "percentage") {
            const base = Math.floor((100 / selectedMembers.length) * 100) / 100;
            const remainder = parseFloat((100 - base * selectedMembers.length).toFixed(2));
            const next: Record<string, string> = { ...splits };
            selectedMembers.forEach((m, i) => {
                next[m.user_id] = i === 0 ? (base + remainder).toFixed(2) : base.toFixed(2);
            });
            setSplits(next);
        } else {
            const base = Math.floor((parsedAmount / selectedMembers.length) * 100) / 100;
            const remainder = parseFloat((parsedAmount - base * selectedMembers.length).toFixed(2));
            const next: Record<string, string> = { ...splits };
            selectedMembers.forEach((m, i) => {
                next[m.user_id] = i === 0 ? (base + remainder).toFixed(2) : base.toFixed(2);
            });
            setSplits(next);
        }
    };

    const handleSplitTypeChange = (type: SplitType) => {
        setSplitType(type);
        const reset: Record<string, string> = {};
        members.forEach((m) => { reset[m.user_id] = ""; });
        setSplits(reset);
    };

    const toggleMember = (userId: string) => {
        setSelectedMemberIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
        setSplits((prev) => ({ ...prev, [userId]: "" }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formValid) return;
        setSubmitting(true);
        setError("");
        try {
            const splitPayload = selectedMembers.map((m) => {
                if (splitType === "equal") {
                    const base = Math.floor((parsedAmount / selectedMembers.length) * 100) / 100;
                    const idx = selectedMembers.indexOf(m);
                    const remainder = parseFloat((parsedAmount - base * selectedMembers.length).toFixed(2));
                    return { user_id: m.user_id, owed_amount: idx === 0 ? base + remainder : base };
                }
                if (splitType === "percentage") {
                    const pct = parseFloat(splits[m.user_id] || "0") / 100;
                    return { user_id: m.user_id, owed_amount: parseFloat((parsedAmount * pct).toFixed(2)) };
                }
                return { user_id: m.user_id, owed_amount: parseFloat(splits[m.user_id] || "0") };
            });
            await expenseApi.create({
                group_id: groupId,
                paid_by: paidById,
                title: title.trim(),
                amount: parsedAmount,
                currency: group?.currency_code,
                notes: notes.trim() || undefined,
                expense_date: expenseDate || undefined,
                split_type: splitType,
                splits: splitPayload,
            });
            router.push(`/groups/${groupId}`);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail || e.message || "Harcama kaydedilemedi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
                <main className="max-w-5xl mx-auto px-6 pt-8">
                    <Skeleton className="h-5 w-32 mb-10" rounded="full" />
                    <Skeleton className="h-8 w-48 mb-8" />
                    <div className="space-y-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="space-y-1.5">
                                <Skeleton className="h-3.5 w-20" rounded="full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ))}
                    </div>
                </main>
                <BottomNav />
            </div>
        );
    }



    const splitDiff = splitType === "percentage"
        ? parseFloat((100 - splitSum).toFixed(2))
        : parseFloat((parsedAmount - splitSum).toFixed(2));

    const perPerson = parsedAmount > 0 && selectedMembers.length > 0
        ? parsedAmount / selectedMembers.length
        : 0;

    const inputStyle = {
        background: "var(--surface-alt)",
        border: "1px solid var(--border-light)",
        color: "var(--foreground)",
    } as React.CSSProperties;

    const cardStyle = {
        background: "var(--surface)",
        borderColor: "var(--border-light)",
        boxShadow: "var(--shadow-sm)",
    } as React.CSSProperties;

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>

            {/* ── Sticky header ── */}
            <div
                className="sticky top-0 z-10 border-b"
                style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-xs)" }}
            >
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/groups/${groupId}`)}
                        className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {group?.name ?? "Gruba Dön"}
                    </button>
                    {/* Mobilde İptal göster, desktop'ta sağ panel var */}
                    <button
                        type="button"
                        onClick={() => router.push(`/groups/${groupId}`)}
                        className="lg:hidden text-sm font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        İptal
                    </button>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 pt-8 pb-32 lg:pb-12">
                <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ color: "var(--foreground)" }}>
                    Harcama Ekle
                </h1>

                <form id="expense-form" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 lg:items-start">

                        {/* ── Left column ── */}
                        <div className="space-y-5">

                            {/* Main details card */}
                            <div className="rounded-2xl border p-6 space-y-5" style={cardStyle}>

                                {/* Başlık */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                                        Başlık <span style={{ color: "var(--danger)" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Örn: Market alışverişi"
                                        maxLength={80}
                                        required
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all placeholder-[var(--text-placeholder)]"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Tutar + Tarih */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                                            Tutar <span style={{ color: "var(--danger)" }}>*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold select-none" style={{ color: "var(--text-muted)" }}>
                                                {currencySymbol}
                                            </span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0,00"
                                                min="0.01"
                                                step="0.01"
                                                required
                                                className="w-full pl-8 pr-3 py-3 rounded-xl text-sm font-medium outline-none transition-all placeholder-[var(--text-placeholder)]"
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                                            Tarih
                                        </label>
                                        <input
                                            type="date"
                                            value={expenseDate}
                                            onChange={(e) => setExpenseDate(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Kategori */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2.5" style={{ color: "var(--foreground)" }}>
                                        Kategori
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.map((cat) => {
                                            const Icon = cat.icon;
                                            const selected = category === cat.id;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(selected ? "" : cat.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                                                    style={selected ? {
                                                        background: "var(--primary-light)",
                                                        color: "var(--primary)",
                                                        border: "1px solid var(--primary-border)",
                                                    } : {
                                                        background: "var(--surface-alt)",
                                                        color: "var(--text-secondary)",
                                                        border: "1px solid var(--border-light)",
                                                    }}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {cat.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Not */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                                        Not{" "}
                                        <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(opsiyonel)</span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Market fişini ekledim. Haftalık alışveriş."
                                        maxLength={200}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all resize-none placeholder-[var(--text-placeholder)]"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Split card */}
                            <div className="rounded-2xl border p-6" style={cardStyle}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                                        Nasıl paylaşılsın?
                                    </h2>
                                    {splitType !== "equal" && (
                                        <button
                                            type="button"
                                            onClick={distributeEqually}
                                            disabled={parsedAmount <= 0}
                                            className="text-xs font-bold transition-opacity disabled:opacity-40"
                                            style={{ color: "var(--primary)" }}
                                        >
                                            Eşit Dağıt
                                        </button>
                                    )}
                                </div>

                                {/* Split tabs */}
                                <div className="flex rounded-xl p-1 gap-1 mb-5" style={{ background: "var(--surface-muted)" }}>
                                    {SPLIT_TYPE_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleSplitTypeChange(opt.value)}
                                            className="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
                                            style={splitType === opt.value ? {
                                                background: "var(--foreground)",
                                                color: "var(--surface)",
                                            } : {
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Member rows */}
                                <div className="space-y-3">
                                    {members.map((m, idx) => {
                                        const memberName = m.display_name ?? m.username ?? "—";
                                        const memberColor = avatarColor(m.user_id, idx);
                                        const initial = memberName.charAt(0).toUpperCase();
                                        const isSelected = selectedMemberIds.has(m.user_id);
                                        const activeCnt = selectedMemberIds.size;

                                        const Checkbox = () => (
                                            <button
                                                type="button"
                                                onClick={() => toggleMember(m.user_id)}
                                                className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                                                style={isSelected
                                                    ? { background: "var(--primary)", border: "none" }
                                                    : { background: "transparent", border: "2px solid var(--border)" }}
                                            >
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </button>
                                        );

                                        if (splitType === "equal") {
                                            const perPersonStr = parsedAmount > 0 && isSelected && activeCnt > 0
                                                ? `${currencySymbol}${(parsedAmount / activeCnt).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`
                                                : "—";
                                            return (
                                                <div key={m.user_id} className="flex items-center gap-3" style={{ opacity: isSelected ? 1 : 0.4 }}>
                                                    <Checkbox />
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                        style={{ background: memberColor }}>
                                                        {initial}
                                                    </div>
                                                    <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                                                        {memberName}
                                                    </span>
                                                    {isSelected && activeCnt > 0 && (
                                                        <span className="text-xs font-medium mr-2" style={{ color: "var(--text-muted)" }}>
                                                            %{(100 / activeCnt).toFixed(0)}
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                                                        {perPersonStr}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={m.user_id} className="flex items-center gap-3" style={{ opacity: isSelected ? 1 : 0.4 }}>
                                                <Checkbox />
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: memberColor }}>
                                                    {initial}
                                                </div>
                                                <span className="flex-1 text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                                                    {memberName}
                                                </span>
                                                <div className="relative w-28 shrink-0">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold select-none"
                                                        style={{ color: "var(--text-muted)" }}>
                                                        {splitType === "percentage" ? "%" : currencySymbol}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={splits[m.user_id] ?? ""}
                                                        onChange={(e) =>
                                                            setSplits((prev) => ({ ...prev, [m.user_id]: e.target.value }))
                                                        }
                                                        disabled={!isSelected}
                                                        placeholder="0"
                                                        min="0"
                                                        step={splitType === "percentage" ? "1" : "0.01"}
                                                        className="w-full pl-7 pr-3 py-2 rounded-xl text-sm font-medium outline-none transition-all disabled:cursor-not-allowed"
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Validation hint */}
                                {splitType !== "equal" && (
                                    <div className="mt-4 flex items-center justify-between text-xs font-semibold px-0.5"
                                        style={{
                                            color: parsedAmount > 0
                                                ? splitsValid ? "var(--primary)" : "var(--danger)"
                                                : "var(--text-muted)",
                                        }}>
                                        <span>
                                            {parsedAmount > 0
                                                ? splitsValid
                                                    ? "✓ Toplam eşleşiyor"
                                                    : splitDiff > 0
                                                        ? `${splitType === "percentage" ? `%${splitDiff.toFixed(0)}` : `${currencySymbol}${splitDiff.toFixed(2)}`} daha girilmesi gerekiyor`
                                                        : `${splitType === "percentage" ? `%${Math.abs(splitDiff).toFixed(0)}` : `${currencySymbol}${Math.abs(splitDiff).toFixed(2)}`} fazla`
                                                : "Önce toplam tutarı gir"}
                                        </span>
                                        <span>
                                            {splitType === "percentage"
                                                ? `${splitSum.toFixed(0)} / 100%`
                                                : `${splitSum.toFixed(2)} / ${parsedAmount > 0 ? parsedAmount.toFixed(2) : "—"} ${currencySymbol}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Right column ── */}
                        <div className="space-y-4 lg:sticky lg:top-[57px]">

                            {/* Kim ödedi? */}
                            <div className="rounded-2xl border p-5" style={cardStyle}>
                                <h2 className="text-base font-bold mb-4" style={{ color: "var(--foreground)" }}>
                                    Kim ödedi?
                                </h2>
                                <div className="space-y-2">
                                    {members.map((m, idx) => {
                                        const memberName = m.display_name ?? m.username ?? "—";
                                        const memberColor = avatarColor(m.user_id, idx);
                                        const initial = memberName.charAt(0).toUpperCase();
                                        const isSelected = paidById === m.user_id;
                                        return (
                                            <button
                                                key={m.user_id}
                                                type="button"
                                                onClick={() => setPaidById(m.user_id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                                                style={isSelected ? {
                                                    background: "var(--primary-light)",
                                                    border: "1px solid var(--primary-border)",
                                                } : {
                                                    background: "transparent",
                                                    border: "1px solid transparent",
                                                }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                                    style={{ background: memberColor }}
                                                >
                                                    {initial}
                                                </div>
                                                <span className="flex-1 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                                    {memberName}
                                                </span>
                                                <div
                                                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                                    style={isSelected
                                                        ? { background: "var(--primary)", borderColor: "var(--primary)" }
                                                        : { background: "transparent", borderColor: "var(--border)" }}
                                                >
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Özet */}
                            {parsedAmount > 0 && (
                                <div className="rounded-2xl border p-5" style={cardStyle}>
                                    <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                                        ÖZET
                                    </p>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: "var(--text-secondary)" }}>Tutar</span>
                                            <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                                                {currencySymbol}{parsedAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {group && (
                                            <div className="flex justify-between text-sm">
                                                <span style={{ color: "var(--text-secondary)" }}>Grup</span>
                                                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                                                    {group.name}
                                                </span>
                                            </div>
                                        )}
                                        {members.length > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span style={{ color: "var(--text-secondary)" }}>Kişi başı</span>
                                                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                                                    {currencySymbol}{perPerson.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span style={{ color: "var(--text-secondary)" }}>Senin payın</span>
                                            <span className="font-semibold" style={{ color: "var(--danger)" }}>
                                                -{currencySymbol}{perPerson.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-t mt-4 pt-4" style={{ borderColor: "var(--border-light)" }}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                                Alacağın
                                            </span>
                                            <span className="text-lg font-extrabold" style={{ color: "var(--primary)" }}>
                                                +{currencySymbol}{(parsedAmount - perPerson).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fiş ekle */}
                            <div className="rounded-2xl border p-4" style={cardStyle}>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                                    >
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Fiş ekle</p>
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Resim veya PDF · 10MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-sm font-bold transition-opacity hover:opacity-70"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        Yükle
                                    </button>
                                </div>
                            </div>

                            {/* ── Desktop Kaydet butonu (sadece lg+) ── */}
                            <div className="hidden lg:flex flex-col gap-2">
                                {error && (
                                    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-medium border"
                                        style={{ background: "var(--danger-light)", borderColor: "#f5b8ae", color: "var(--danger)" }}>
                                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={!formValid || submitting}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                    style={{
                                        background: "var(--primary)",
                                        boxShadow: formValid ? "0 2px 16px rgba(31,138,76,0.32)" : "none",
                                    }}
                                >
                                    {submitting ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push(`/groups/${groupId}`)}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Mobil Kaydet butonu (sadece < lg) ── */}
                    <div className="lg:hidden mt-6 flex flex-col items-stretch gap-3">
                        {error && (
                            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium border"
                                style={{ background: "var(--danger-light)", borderColor: "#f5b8ae", color: "var(--danger)" }}>
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={!formValid || submitting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            style={{
                                background: "var(--primary)",
                                boxShadow: formValid ? "0 2px 12px rgba(31,138,76,0.30)" : "none",
                            }}
                        >
                            {submitting ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                </form>
            </main>

            <BottomNav />
        </div>
    );
};
