"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Settings, ShoppingCart, Zap, Utensils, Sparkles, ChevronRight, UserPlus } from "lucide-react";
import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupResponse } from "@/entities/group/model/types";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";

type Tab = "expenses" | "members";

// Placeholder — expense API entegrasyonu gelince doldurulacak
interface Expense {
    id: string;
    title: string;
    paidBy: string;
    date: string;
    amount: number;
    userShare: number | null;
    shareType: "debt" | "credit" | "paid";
    icon: "cart" | "bolt" | "food" | "clean";
}
interface ExpenseGroup {
    label: string;
    items: Expense[];
}

const PLACEHOLDER_EXPENSES: ExpenseGroup[] = [];

const CategoryIcon = ({ icon }: { icon: Expense["icon"] }) => {
    const cls = "w-5 h-5";
    switch (icon) {
        case "cart":  return <ShoppingCart className={cls} />;
        case "bolt":  return <Zap className={cls} />;
        case "food":  return <Utensils className={cls} />;
        case "clean": return <Sparkles className={cls} />;
    }
};

interface GroupPageProps {
    groupId: string;
}

export const GroupPage = ({ groupId }: GroupPageProps) => {
    const router = useRouter();
    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("expenses");
    const [showAddMember, setShowAddMember] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupData, membersData] = await Promise.all([
                    groupApi.get(groupId),
                    groupApi.listMembers(groupId),
                ]);
                setGroup(groupData);
                setMembers(membersData);
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
        <div className="min-h-screen bg-white text-gray-900 font-sans pb-32">
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
            <Navbar />

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
                        <button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
                            <Plus className="w-4 h-4" />
                            Harcama Ekle
                        </button>
                        <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
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
                        {PLACEHOLDER_EXPENSES.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-400 text-sm font-medium">Henüz harcama yok.</p>
                                <p className="text-gray-300 text-xs mt-1">
                                    İlk harcamayı eklemek için yukarıdaki butonu kullan.
                                </p>
                            </div>
                        ) : (
                            PLACEHOLDER_EXPENSES.map((expenseGroup) => (
                                <div key={expenseGroup.label} className="mb-8">
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-4">
                                        {expenseGroup.label}
                                    </p>
                                    <div className="divide-y divide-gray-50">
                                        {expenseGroup.items.map((expense) => (
                                            <div
                                                key={expense.id}
                                                className="flex items-center gap-4 py-3.5 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                    <CategoryIcon icon={expense.icon} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-black truncate">
                                                        {expense.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {expense.paidBy} ödedi • {expense.date}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-sm text-black">
                                                        ₺{expense.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                    </p>
                                                    {expense.shareType === "debt" && expense.userShare !== null && (
                                                        <p className="text-[11px] font-bold text-red-500 mt-0.5">
                                                            Payın: ₺{expense.userShare.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    )}
                                                    {expense.shareType === "credit" && expense.userShare !== null && (
                                                        <p className="text-[11px] font-bold text-[#00d186] mt-0.5">
                                                            Alacağın: ₺{expense.userShare.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                                        </p>
                                                    )}
                                                    {expense.shareType === "paid" && (
                                                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">Ödendi</p>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0" />
                                            </div>
                                        ))}
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

            <BottomNav />
        </div>
    );
};
