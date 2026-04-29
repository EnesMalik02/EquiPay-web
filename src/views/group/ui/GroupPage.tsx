"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Plus,
    Settings,
    UserPlus,
    Users,
    Check,
    Receipt,
} from "lucide-react";
import { UserAvatar, SplitExpenseItem, SkeletonSettlementItem } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupWithStatsResponse } from "@/entities/group/model/types";
import { useMySplitExpenses } from "@/entities/expense/hooks/useMySplitExpenses";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";
import { GroupSettingsModal } from "@/features/manage-group/ui/GroupSettingsModal";
import { useUser } from "@/shared/store/UserContext";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { formatMoney } from "@/shared/lib/ui";

type Tab = "expenses" | "members";
type ExpenseTab = "all" | "paid" | "unpaid";



interface GroupPageProps {
    groupId: string;
}

export const GroupPage = ({ groupId }: GroupPageProps) => {
    const router = useRouter();
    const currentUserId = useUser()?.id ?? null;
    const [group, setGroup] = useState<GroupWithStatsResponse | null>(null);
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("expenses");
    const [expenseTab, setExpenseTab] = useState<ExpenseTab>("all");
    const [showAddMember, setShowAddMember] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [pendingInviteMsg, setPendingInviteMsg] = useState<string | null>(null);

    const { data: expenses = [], isLoading: expensesLoading } = useMySplitExpenses({
        group_id: groupId,
        status: expenseTab,
        limit: 50,
    });

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

    /* ── Loading ─────────────────────────────────────── */
    if (loading) {
        return (
            <div className="min-h-screen" style={{ background: "var(--background)" }}>
                <div className="flex items-center justify-between px-4 pt-14 pb-3">
                    <div
                        className="w-9 h-9 rounded-[10px] animate-pulse"
                        style={{ background: "var(--surface-muted)" }}
                    />
                    <div
                        className="h-4 w-24 rounded-full animate-pulse"
                        style={{ background: "var(--surface-muted)" }}
                    />
                    <div
                        className="w-9 h-9 rounded-[10px] animate-pulse"
                        style={{ background: "var(--surface-muted)" }}
                    />
                </div>
                <div className="px-4">
                    <div
                        className="rounded-[var(--radius-lg)] p-5 animate-pulse"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        <div
                            className="w-14 h-14 rounded-[14px] mx-auto mb-3 animate-pulse"
                            style={{ background: "var(--surface-muted)" }}
                        />
                        <div
                            className="h-5 w-40 rounded-full mx-auto animate-pulse"
                            style={{ background: "var(--surface-muted)" }}
                        />
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    /* ── Error ───────────────────────────────────────── */
    if (error || !group) {
        return (
            <div
                className="min-h-screen flex flex-col items-center justify-center gap-4 px-6"
                style={{ background: "var(--background)" }}
            >
                <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                    {error || "Grup bulunamadı."}
                </p>
                <button
                    onClick={() => router.push("/groups")}
                    className="text-[14px] font-semibold cursor-pointer"
                    style={{ color: "var(--primary)" }}
                >
                    Gruplara Dön
                </button>
            </div>
        );
    }

    const totalSpend = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const currencySymbol = getCurrencySymbol(group.currency_code);

    const tabs: { id: Tab; label: string; count: number }[] = [
        { id: "expenses", label: "Harcamalar", count: expenses.length },
        { id: "members", label: "Üyeler", count: members.length },
    ];

    /* ── Render ──────────────────────────────────────── */
    return (
        <div
            className="min-h-screen"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
            {pendingInviteMsg && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4">
                    <div
                        className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
                        style={{ background: "var(--primary-light)", color: "var(--primary-ink)", border: "1px solid var(--primary-border)" }}
                    >
                        <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                        <span>{pendingInviteMsg}</span>
                    </div>
                </div>
            )}
            {showAddMember && (
                <AddMemberModal
                    groupId={groupId}
                    onClose={() => setShowAddMember(false)}
                    onAdded={(member) => {
                        if (member.status === "pending") {
                            setPendingInviteMsg(`Davet gönderildi. ${member.display_name || member.username || "Kullanıcı"} daveti onayladığında gruba katılacak.`);
                            setTimeout(() => setPendingInviteMsg(null), 5000);
                        } else {
                            setMembers((prev) => [...prev, member]);
                        }
                        setShowAddMember(false);
                    }}
                />
            )}

            {showSettings &&
                (() => {
                    const me = members.find((m) => m.user_id === currentUserId);
                    return (
                        <GroupSettingsModal
                            groupId={groupId}
                            groupName={group.name}
                            groupDescription={group.description}
                            isAdmin={me?.role === "admin"}
                            currentUserId={currentUserId}
                            members={members}
                            onClose={() => setShowSettings(false)}
                            onUpdated={(updated) => setGroup((prev) => prev ? { ...prev, ...updated } : null)}
                        />
                    );
                })()}

            {/* ── Nav bar ──────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3">
                <button
                    onClick={() => router.push("/groups")}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                    }}
                    aria-label="Gruplara dön"
                >
                    <ChevronLeft
                        className="w-4 h-4"
                        style={{ color: "var(--text-secondary)" }}
                    />
                </button>

                <span
                    className="text-[13px] font-medium"
                    style={{ color: "var(--foreground)" }}
                >
                    Grup Detayı
                </span>

                <button
                    onClick={() => setShowSettings(true)}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                    }}
                    aria-label="Ayarlar"
                >
                    <Settings
                        className="w-4 h-4"
                        style={{ color: "var(--text-secondary)" }}
                    />
                </button>
            </div>

            <main className="px-4 pb-32">
                {/* ── Group header card ─────────────────────── */}
                <div
                    className="rounded-[var(--radius-lg)] p-5 text-center mb-3"
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <div
                        className="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                        style={{ background: "var(--primary)", color: "#fff" }}
                    >
                        <Users className="w-6 h-6" />
                    </div>
                    <h1
                        className="text-[20px] font-semibold mb-1"
                        style={{ color: "var(--foreground)", letterSpacing: "-0.4px" }}
                    >
                        {group.name}
                    </h1>
                    {group.description && (
                        <p
                            className="text-[12px] mb-2"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {group.description}
                        </p>
                    )}
                    <p
                        className="text-[12px] mb-3"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {members.length} üye
                    </p>
                    {/* Avatar stack */}
                    <div className="flex justify-center -space-x-2">
                        {members.slice(0, 5).map((m) => (
                            <UserAvatar
                                key={m.user_id}
                                name={m.display_name ?? m.username ?? "?"}
                                size="xs"
                                ring
                                bg="#e8e8e3"
                                color="#3e4540"
                            />
                        ))}
                        {members.length > 5 && (
                            <div
                                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-semibold"
                                style={{
                                    background: "var(--surface-muted)",
                                    color: "var(--text-muted)",
                                    borderColor: "var(--surface)",
                                }}
                            >
                                +{members.length - 5}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Stats ────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div
                        className="rounded-[var(--radius-lg)] p-4"
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <p
                            className="text-[10px] uppercase mb-2"
                            style={{
                                fontFamily: "var(--font-geist-mono, monospace)",
                                color: "var(--text-muted)",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Toplam
                        </p>
                        <p
                            className="text-[18px] font-semibold"
                            style={{
                                fontFamily: "var(--font-geist-mono, monospace)",
                                color: "var(--foreground)",
                            }}
                        >
                            {formatMoney(totalSpend, currencySymbol)}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                        className="rounded-[var(--radius-lg)] p-4 text-left cursor-pointer active:scale-95 transition-transform"
                        style={{
                            background: "var(--primary-light)",
                            border: "1px solid var(--primary-border)",
                        }}
                    >
                        <p
                            className="text-[10px] uppercase mb-2"
                            style={{
                                fontFamily: "var(--font-geist-mono, monospace)",
                                color: "var(--primary-ink)",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Yeni
                        </p>
                        <div
                            className="flex items-center gap-1.5 text-[14px] font-semibold"
                            style={{ color: "var(--primary)" }}
                        >
                            <Plus className="w-4 h-4" />
                            Harcama Ekle
                        </div>
                    </button>
                </div>

                {/* ── Tabs ─────────────────────────────────── */}
                <div
                    className="flex gap-1 mb-3"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-4 py-3 relative cursor-pointer transition-colors"
                            style={{
                                color:
                                    activeTab === tab.id
                                        ? "var(--foreground)"
                                        : "var(--text-muted)",
                                fontWeight: activeTab === tab.id ? 500 : 400,
                                fontSize: "13px",
                            }}
                        >
                            {tab.label}
                            <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    background:
                                        activeTab === tab.id
                                            ? "var(--foreground)"
                                            : "var(--surface-muted)",
                                    color:
                                        activeTab === tab.id
                                            ? "#fff"
                                            : "var(--text-muted)",
                                }}
                            >
                                {tab.count}
                            </span>
                            {activeTab === tab.id && (
                                <span
                                    className="absolute left-0 right-0 bottom-[-1px] h-[2px] rounded-t-full"
                                    style={{ background: "var(--foreground)" }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Expenses tab ─────────────────────────── */}
                {activeTab === "expenses" && (
                    <>
                        {/* Expense filter tabs */}
                        <div
                            className="flex gap-1 p-1 rounded-[var(--radius-lg)] mb-4"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            {(
                                [
                                    { id: "all", label: "Hepsi" },
                                    { id: "unpaid", label: "Ödemediklerim" },
                                    { id: "paid", label: "Ödediklerim" },
                                ] as { id: ExpenseTab; label: string }[]
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setExpenseTab(tab.id)}
                                    className="flex-1 py-2 rounded-[var(--radius-md)] text-[12px] font-semibold transition-all cursor-pointer"
                                    style={{
                                        background: expenseTab === tab.id ? "var(--background)" : "transparent",
                                        color: expenseTab === tab.id ? "var(--foreground)" : "var(--text-muted)",
                                        boxShadow: expenseTab === tab.id ? "var(--shadow-sm)" : "none",
                                        border: expenseTab === tab.id ? "1px solid var(--border)" : "1px solid transparent",
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {expensesLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <SkeletonSettlementItem key={i} />
                                ))}
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="py-14 text-center">
                                <Receipt
                                    className="w-8 h-8 mx-auto mb-3"
                                    style={{ color: "var(--text-placeholder)" }}
                                />
                                <p
                                    className="text-[14px] font-medium mb-1"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Henüz harcama yok.
                                </p>
                                <p
                                    className="text-[12px]"
                                    style={{ color: "var(--text-placeholder)" }}
                                >
                                    Yukarıdaki butonu kullanarak ilk harcamayı ekle.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {expenses.map((exp) => (
                                    <SplitExpenseItem key={exp.id} expense={exp} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Members tab ──────────────────────────── */}
                {activeTab === "members" && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h3
                                className="text-[14px] font-semibold"
                                style={{ color: "var(--foreground)" }}
                            >
                                Grup Üyeleri
                            </h3>
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer"
                                style={{ color: "var(--primary)" }}
                            >
                                <UserPlus className="w-4 h-4" />
                                Üye Ekle
                            </button>
                        </div>

                        {members.length === 0 ? (
                            <div className="py-10 text-center">
                                <p
                                    className="text-[14px]"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Henüz üye yok.
                                </p>
                            </div>
                        ) : (
                            <div
                                className="rounded-[var(--radius-lg)] overflow-hidden"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                }}
                            >
                                {members.map((member, i) => (
                                    <div
                                        key={member.user_id}
                                        className="flex items-center gap-4 px-5 py-3.5"
                                        style={{
                                            borderBottom:
                                                i < members.length - 1
                                                    ? "1px solid var(--border-light)"
                                                    : "none",
                                        }}
                                    >
                                        <UserAvatar
                                            name={
                                                member.display_name ??
                                                member.username ??
                                                "?"
                                            }
                                            size="md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="font-medium text-[13.5px]"
                                                style={{
                                                    color: "var(--foreground)",
                                                    letterSpacing: "-0.2px",
                                                }}
                                            >
                                                {member.display_name ??
                                                    member.username ??
                                                    "—"}
                                            </p>
                                            {member.username && (
                                                <p
                                                    className="text-[11px] mt-0.5"
                                                    style={{
                                                        fontFamily:
                                                            "var(--font-geist-mono, monospace)",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    @{member.username}
                                                </p>
                                            )}
                                        </div>
                                        {member.role === "admin" && (
                                            <span
                                                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                                style={{
                                                    background: "var(--primary-light)",
                                                    color: "var(--primary-ink)",
                                                }}
                                            >
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
};
