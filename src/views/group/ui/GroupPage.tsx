"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Settings, UserPlus } from "lucide-react";
import { UserAvatar, ExpenseListItem, PrimaryButton, SkeletonListItem, Skeleton } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupResponse } from "@/entities/group/model/types";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { ExpenseResponse } from "@/entities/expense/model/types";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";
import { GroupSettingsModal } from "@/features/manage-group/ui/GroupSettingsModal";
import { useUser } from "@/shared/store/UserContext";

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
    const currentUserId = useUser()?.id ?? null;
    const [group, setGroup] = useState<GroupResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("expenses");
    const [showAddMember, setShowAddMember] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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
            <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
                <main className="max-w-5xl mx-auto px-6 pt-8">
                    <Skeleton className="h-5 w-32 mb-8" rounded="full" />
                    <div className="flex items-center gap-5 mb-10">
                        <Skeleton className="w-16 h-16 shrink-0" rounded="lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-32" rounded="full" />
                        </div>
                        <Skeleton className="h-9 w-36" />
                    </div>
                    <div className="flex gap-6 border-b mb-8" style={{ borderColor: "var(--border-light)" }}>
                        <Skeleton className="h-4 w-24 mb-4" rounded="full" />
                        <Skeleton className="h-4 w-16 mb-4" rounded="full" />
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonListItem key={i} />
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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: "var(--background)" }}>
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
        <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>

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
                        currentUserId={currentUserId}
                        members={members}
                        onClose={() => setShowSettings(false)}
                    />
                );
            })()}
            <main className="max-w-5xl mx-auto px-6 pt-8">

                {/* Back */}
                <button
                    onClick={() => router.push("/groups")}
                    className="flex items-center gap-2 text-sm font-semibold mb-8 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Gruplara Dön
                </button>

                {/* ── Group Header ─────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-5">
                        {/* Icon */}
                        <div className="w-20 h-20 rounded-3xl bg-[#f0fdf4] flex items-center justify-center text-[#00d186] shrink-0">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="7" height="7" x="3"  y="3"  rx="1" />
                                <rect width="7" height="7" x="14" y="3"  rx="1" />
                                <rect width="7" height="7" x="3"  y="14" rx="1" />
                                <rect width="7" height="7" x="14" y="14" rx="1" />
                            </svg>
                        </div>

                        {/* Name + meta */}
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight leading-tight" style={{ color: "var(--foreground)" }}>
                                {group.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {/* Mini avatars */}
                                <div className="flex -space-x-2">
                                    {members.slice(0, 3).map((m) => (
                                        <UserAvatar
                                            key={m.id}
                                            name={m.display_name ?? m.username ?? "?"}
                                            size="xs"
                                            ring
                                            bg="#e5e7eb"
                                            color="#4b5563"
                                        />
                                    ))}
                                    {members.length > 3 && (
                                        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold"
                                             style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                                            +{members.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{members.length} Üye</span>
                                {group.description && (
                                    <>
                                        <span style={{ color: "var(--border)" }}>•</span>
                                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>{group.description}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                        <PrimaryButton
                            onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Harcama Ekle
                        </PrimaryButton>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                            style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Tabs ─────────────────────────────────────── */}
                <div className="flex gap-6 border-b mb-8" style={{ borderColor: "var(--border-light)" }}>
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
                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Henüz harcama yok.</p>
                                <p className="text-xs mt-1" style={{ color: "var(--text-placeholder)" }}>
                                    İlk harcamayı eklemek için yukarıdaki butonu kullan.
                                </p>
                            </div>
                        ) : (() => {
                            const unpaid = expenses.filter((e) => !e.is_fully_paid);
                            const paid = expenses.filter((e) => e.is_fully_paid);
                            const renderGroup = (items: ExpenseResponse[]) =>
                                groupExpensesByMonth(items).map((group) => (
                                    <div key={group.label} className="mb-8">
                                        <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
                                            {group.label}
                                        </p>
                                        <div className="divide-y divide-gray-100">
                                            {group.items.map((expense) => {
                                                const payer = members.find((m) => m.user_id === expense.paid_by);
                                                const payerName = payer?.display_name ?? payer?.username ?? "Bilinmeyen";
                                                return (
                                                    <ExpenseListItem
                                                        key={expense.id}
                                                        expense={expense}
                                                        payerName={payerName}
                                                        onClick={() => router.push(`/groups/${groupId}/expenses/${expense.id}`)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            return (
                                <>
                                    {renderGroup(unpaid)}
                                    {paid.length > 0 && (
                                        <>
                                            <div className="flex items-center gap-3 my-6">
                                                <div className="h-px flex-1" style={{ background: "var(--border-light)" }} />
                                                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--text-placeholder)" }}>
                                                    Ödenenler
                                                </span>
                                                <div className="h-px flex-1" style={{ background: "var(--border-light)" }} />
                                            </div>
                                            {renderGroup(paid)}
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* ── Tab: Üyeler ──────────────────────────────── */}
                {activeTab === "members" && (
                    <div>
                        {/* Add Member button */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Grup Üyeleri</h3>
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
                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Henüz üye yok.</p>
                                <p className="text-xs mt-1" style={{ color: "var(--text-placeholder)" }}>Üye eklemek için yukarıdaki butonu kullan.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 py-3.5">
                                        <UserAvatar
                                            name={member.display_name ?? member.username ?? "?"}
                                            size="md"
                                        />
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{member.display_name ?? member.username ?? "—"}</p>
                                            {member.username && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>@{member.username}</p>}
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
