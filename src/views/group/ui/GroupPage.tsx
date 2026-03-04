"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Settings, Receipt, ChevronRight, UserPlus, Users, CalendarDays, FileText, Wallet } from "lucide-react";
import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupResponse } from "@/entities/group/model/types";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { ExpenseResponse } from "@/entities/expense/model/types";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";
import { GroupSettingsModal } from "@/features/manage-group/ui/GroupSettingsModal";
import { useAuthStore } from "@/shared/store/authStore";

type Tab = "expenses" | "members";

function groupExpensesByMonth(expenses: ExpenseResponse[]): { label: string; items: ExpenseResponse[] }[] {
    const map = new Map<string, ExpenseResponse[]>();
    for (const exp of expenses) {
        const [year, month] = exp.expense_date.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        const label = date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
        if (!map.has(label)) map.set(label, []);
        map.get(label)!.push(exp);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

interface GroupPageProps {
    groupId: string;
}

export const GroupPage = ({ groupId }: GroupPageProps) => {
    const router = useRouter();
    const currentUserId = useAuthStore((s) => s.user?.id ?? null);
    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("expenses");
    const [showAddMember, setShowAddMember] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Tracks split IDs currently being paid
    const [payingIds, setPayingIds] = useState<Set<string>>(new Set());

    // Detail panel
    const [selectedExpense, setSelectedExpense] = useState<ExpenseResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openExpense = useCallback(async (expenseId: string) => {
        setDetailLoading(true);
        setSelectedExpense(null);
        setPanelOpen(true);
        try {
            const detail = await expenseApi.getById(expenseId);
            setSelectedExpense(detail);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const closePanel = useCallback(() => {
        setPanelOpen(false);
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => setSelectedExpense(null), 350);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupData, membersData, expensesData] = await Promise.all([
                    groupApi.get(groupId),
                    groupApi.listMembers(groupId),
                    expenseApi.listByGroup(groupId, { limit: 20, offset: 0 }),
                ]);
                setGroup(groupData);
                setMembers(membersData);
                setExpenses(expensesData);
            } catch {
                setError("Grup bilgileri yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId]);

    /* ── LOADING ─────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="min-h-screen bg-white text-gray-900 font-sans pb-32">
                <Navbar />
                <main className="max-w-5xl mx-auto px-6 pt-8">
                    <div className="h-5 w-32 bg-gray-100 rounded-full animate-pulse mb-8" />
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-7 w-48 bg-gray-100 rounded-xl animate-pulse" />
                            <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
                        </div>
                        <div className="h-9 w-36 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                    <div className="flex gap-6 border-b border-gray-100 mb-8">
                        <div className="h-4 w-24 bg-gray-100 rounded-full animate-pulse mb-4" />
                        <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse mb-4" />
                    </div>
                    <div className="divide-y divide-gray-50">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 bg-gray-100 rounded-full animate-pulse" />
                                    <div className="h-3 w-28 bg-gray-100 rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-2 flex flex-col items-end">
                                    <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
                                    <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <BottomNav />
            </div>
        );
    }

    /* ── ERROR ───────────────────────────────────────────────── */
    if (error || !group) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
                <p className="text-gray-500 text-sm font-medium">{error || "Grup bulunamadı."}</p>
                <button
                    onClick={() => router.push("/home")}
                    className="text-[#00d186] font-bold text-sm hover:underline"
                >
                    Ana Sayfaya Dön
                </button>
            </div>
        );
    }

    const tabs: { id: Tab; label: string }[] = [
        { id: "expenses", label: "Harcamalar" },
        { id: "members",  label: "Üyeler" },
    ];

    /* ── RENDER ──────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-32 overflow-hidden">

            {showAddMember && (
                <AddMemberModal
                    groupId={groupId}
                    onClose={() => setShowAddMember(false)}
                    onAdded={(member) => {
                        setMembers((prev) => [...prev, member]);
                        setShowAddMember(false);
                    }}
                />
            )}
            {showSettings && group && (() => {
                const me = members.find((m) => m.user_id === currentUserId);
                return (
                    <GroupSettingsModal
                        groupId={groupId}
                        groupName={group.name}
                        isAdmin={me?.role === "admin"}
                        onClose={() => setShowSettings(false)}
                    />
                );
            })()}
            <Navbar />

            {/* Sliding pages */}
            <div className="overflow-hidden">
                <div
                    className={`flex transition-transform duration-300 ease-in-out ${
                        panelOpen ? "-translate-x-full" : "translate-x-0"
                    }`}
                >

                {/* ── Slide 1: Group ─────────────────── */}
                <div className="w-full shrink-0">
                <main className="max-w-5xl mx-auto px-6 pt-8">

                {/* Back */}
                <button
                    onClick={() => router.push("/home")}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Gruplara Dön
                </button>

                {/* ── Group Header ─────────────────────────────── */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-[#00d186] shrink-0">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="7" height="7" x="3"  y="3"  rx="1" />
                                <rect width="7" height="7" x="14" y="3"  rx="1" />
                                <rect width="7" height="7" x="3"  y="14" rx="1" />
                                <rect width="7" height="7" x="14" y="14" rx="1" />
                            </svg>
                        </div>

                        {/* Name + meta */}
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-black leading-tight">
                                {group.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {/* Mini avatars */}
                                <div className="flex -space-x-2">
                                    {members.slice(0, 3).map((m) => (
                                        <div
                                            key={m.id}
                                            className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600"
                                        >
                                            {m.name?.charAt(0).toUpperCase() ?? "?"}
                                        </div>
                                    ))}
                                    {members.length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-[#f0fdf4] border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#00d186]">
                                            +{members.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm text-gray-400 font-medium">{members.length} Üye</span>
                                {group.description && (
                                    <>
                                        <span className="text-gray-200">•</span>
                                        <span className="text-sm text-gray-400">{group.description}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Harcama Ekle
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Tabs ─────────────────────────────────────── */}
                <div className="flex gap-6 border-b border-gray-100 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id
                                    ? "border-[#00d186] text-black"
                                    : "border-transparent text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Harcamalar ──────────────────────────── */}
                {activeTab === "expenses" && (
                    <div>
                        {expenses.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-400 text-sm font-medium">Henüz harcama yok.</p>
                                <p className="text-gray-300 text-xs mt-1">
                                    İlk harcamayı eklemek için yukarıdaki butonu kullan.
                                </p>
                            </div>
                        ) : (
                            groupExpensesByMonth(expenses).map((group) => (
                                <div key={group.label} className="mb-8">
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-4">
                                        {group.label}
                                    </p>
                                    <div className="divide-y divide-gray-50">
                                        {group.items.map((expense) => {
                                            const payer = members.find((m) => m.user_id === expense.paid_by);
                                            const payerName = payer?.name ?? payer?.username ?? "Bilinmeyen";
                                            return (
                                                <div
                                                    key={expense.id}
                                                    onClick={() => openExpense(expense.id)}
                                                    className="flex items-center gap-4 py-3.5 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                        <Receipt className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm text-black truncate">
                                                            {expense.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {payerName} ödedi • {expense.expense_date}
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="font-bold text-sm text-black">
                                                            ₺{parseFloat(expense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                        {expense.notes && (
                                                            <p className="text-[11px] text-gray-400 mt-0.5 max-w-[120px] truncate">{expense.notes}</p>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── Tab: Üyeler ──────────────────────────────── */}
                {activeTab === "members" && (
                    <div>
                        {/* Add Member button */}
                        <div className="flex justify-end mb-5">
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="flex items-center gap-2 text-sm font-bold text-[#00d186] hover:text-[#00b070] transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Üye Ekle
                            </button>
                        </div>

                        {members.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-400 text-sm font-medium">Henüz üye yok.</p>
                                <p className="text-gray-300 text-xs mt-1">Üye eklemek için yukarıdaki butonu kullan.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 py-3.5">
                                        <div className="w-10 h-10 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#00d186] font-bold text-sm shrink-0">
                                            {member.name?.charAt(0).toUpperCase() ?? "?"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-black">{member.username ?? "—"}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">@{member.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
                </div>{/* end Slide 1 */}

                {/* ── Slide 2: Expense Detail ───────── */}
                <div className="w-full shrink-0">
                    <main className="max-w-5xl mx-auto px-6 pt-8 pb-12">

                        {/* Back */}
                        <button
                            onClick={closePanel}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-semibold mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Geri Dön
                        </button>

                        {detailLoading ? (
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-6 w-48 bg-gray-100 rounded-full animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
                                    </div>
                                </div>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : selectedExpense ? (
                            <div>
                                {/* Amount hero */}
                                {(() => {
                                    const mySplit = selectedExpense.splits.find((s) => s.user_id === currentUserId);
                                    const myOwed = mySplit ? parseFloat(mySplit.owed_amount) : 0;
                                    const myPaid = mySplit ? parseFloat(mySplit.paid_amount) : 0;
                                    const mySettled = myOwed > 0 && myPaid >= myOwed;
                                    const myPaying = mySplit ? payingIds.has(mySplit.id) : false;

                                    const handleMyPay = async () => {
                                        if (!mySplit || myPaying || mySettled) return;
                                        setPayingIds((prev) => new Set(prev).add(mySplit.id));
                                        try {
                                            const updated = await expenseApi.paySplit(selectedExpense.id, mySplit.id);
                                            setSelectedExpense((prev) =>
                                                prev
                                                    ? { ...prev, splits: prev.splits.map((s) => s.id === mySplit.id ? updated : s) }
                                                    : prev,
                                            );
                                        } finally {
                                            setPayingIds((prev) => { const n = new Set(prev); n.delete(mySplit.id); return n; });
                                        }
                                    };

                                    return (
                                        <div className="flex items-center justify-between gap-4 mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] flex items-center justify-center text-[#00d186] shrink-0">
                                                    <Receipt className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-extrabold text-black tracking-tight">
                                                        ₺{parseFloat(selectedExpense.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-sm text-gray-400 font-medium mt-0.5">{selectedExpense.title}</p>
                                                </div>
                                            </div>
                                            {mySplit && myOwed > 0 && (
                                                mySettled ? (
                                                    <span className="shrink-0 text-sm font-bold text-[#00d186] bg-[#f0fdf4] px-4 py-2 rounded-xl">
                                                        Borç Ödendi
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={handleMyPay}
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
                                <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 mb-8">
                                    <div className="flex items-center gap-3 px-4 py-3.5">
                                        <Wallet className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="text-sm text-gray-500 font-medium w-28 shrink-0">Ödeyen</span>
                                        <span className="text-sm font-bold text-black truncate">
                                            {(() => {
                                                const p = members.find((m) => m.user_id === selectedExpense.paid_by);
                                                return p?.name ?? p?.username ?? selectedExpense.paid_by;
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3.5">
                                        <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="text-sm text-gray-500 font-medium w-28 shrink-0">Tarih</span>
                                        <span className="text-sm font-bold text-black">{selectedExpense.expense_date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 px-4 py-3.5">
                                        <span className="w-4 h-4 text-gray-400 text-xs font-black flex items-center justify-center shrink-0">₺</span>
                                        <span className="text-sm text-gray-500 font-medium w-28 shrink-0">Para Birimi</span>
                                        <span className="text-sm font-bold text-black">{selectedExpense.currency}</span>
                                    </div>
                                    {selectedExpense.notes && (
                                        <div className="flex items-start gap-3 px-4 py-3.5">
                                            <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-500 font-medium w-28 shrink-0">Not</span>
                                            <span className="text-sm font-medium text-gray-700">{selectedExpense.notes}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Splits */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Paylaşım</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                                        {selectedExpense.splits.map((split) => {
                                            const member = members.find((m) => m.user_id === split.user_id);
                                            const name = member?.name ?? member?.username ?? split.user_id;
                                            const owed = parseFloat(split.owed_amount);
                                            const paid = parseFloat(split.paid_amount);
                                            const settled = paid >= owed;

                                            return (
                                                <div key={split.id} className="flex items-center gap-3 px-4 py-3.5">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="flex-1 text-sm font-semibold text-black truncate">{name}</span>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-bold text-black">
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
                </div>{/* end Slide 2 */}

                </div>{/* end flex */}
            </div>{/* end overflow-hidden */}

            <BottomNav />
        </div>
    );
};
