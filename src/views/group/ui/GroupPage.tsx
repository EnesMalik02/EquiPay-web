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
    ArrowDownLeft,
    ArrowUpRight,
} from "lucide-react";
import { UserAvatar } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupResponse } from "@/entities/group/model/types";
import { expenseApi } from "@/entities/expense/api/expenseApi";
import { ExpenseResponse } from "@/entities/expense/model/types";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";
import { GroupSettingsModal } from "@/features/manage-group/ui/GroupSettingsModal";
import { useUser } from "@/shared/store/UserContext";

type Tab = "expenses" | "members";

interface MonthGroup {
    label: string;
    items: ExpenseResponse[];
    total: number;
}

function groupByMonth(expenses: ExpenseResponse[]): MonthGroup[] {
    const map = new Map<string, ExpenseResponse[]>();
    for (const exp of expenses) {
        const [year, month] = exp.expense_date.split("-");
        const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("tr-TR", {
            month: "long",
            year: "numeric",
        });
        if (!map.has(label)) map.set(label, []);
        map.get(label)!.push(exp);
    }
    return Array.from(map.entries()).map(([label, items]) => ({
        label,
        items,
        total: items.reduce((s, e) => s + parseFloat(e.amount), 0),
    }));
}

function formatMoney(val: number | string): string {
    const n = typeof val === "string" ? parseFloat(val) : val;
    return `₺${Math.abs(n).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
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

    const tabs: { id: Tab; label: string; count: number }[] = [
        { id: "expenses", label: "Harcamalar", count: expenses.length },
        { id: "members", label: "Üyeler", count: members.length },
    ];

    const renderExpenseRows = (items: ExpenseResponse[]) =>
        groupByMonth(items).map((mg, mi) => (
            <div key={mg.label}>
                {/* Month header */}
                <div
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{
                        background: "var(--surface-alt)",
                        borderBottom: "1px solid var(--border-light)",
                        borderTop: mi > 0 ? "1px solid var(--border-light)" : "none",
                    }}
                >
                    <span
                        className="text-[10px] uppercase font-medium"
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            color: "var(--text-muted)",
                            letterSpacing: "0.08em",
                        }}
                    >
                        {mg.label}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
                    <span
                        style={{
                            fontFamily: "var(--font-geist-mono, monospace)",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                        }}
                    >
                        {mg.items.length} harcama · {formatMoney(mg.total)}
                    </span>
                </div>

                {/* Expense rows */}
                {mg.items.map((expense, i) => {
                    const payer = members.find((m) => m.user_id === expense.paid_by);
                    const payerName = payer?.display_name ?? payer?.username ?? "Bilinmeyen";
                    const isPayer = expense.paid_by === currentUserId;
                    const mySplit = expense.splits?.find(
                        (sp) => sp.user_id === currentUserId
                    );
                    const myOwed = mySplit ? parseFloat(mySplit.owed_amount) : 0;

                    return (
                        <div
                            key={expense.id}
                            onClick={() =>
                                router.push(`/groups/${groupId}/expenses/${expense.id}`)
                            }
                            className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors active:bg-[var(--surface-alt)]"
                            style={{
                                borderBottom:
                                    i < mg.items.length - 1
                                        ? "1px solid var(--border-light)"
                                        : "none",
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                                style={{
                                    background: "var(--surface-alt)",
                                    border: "1px solid var(--border)",
                                    color: expense.is_fully_paid
                                        ? "var(--text-muted)"
                                        : isPayer
                                        ? "var(--primary)"
                                        : "var(--danger)",
                                }}
                            >
                                {expense.is_fully_paid ? (
                                    <Check className="w-[14px] h-[14px]" />
                                ) : isPayer ? (
                                    <ArrowDownLeft className="w-[14px] h-[14px]" />
                                ) : (
                                    <ArrowUpRight className="w-[14px] h-[14px]" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className="font-medium text-[13.5px] truncate"
                                    style={{
                                        color: "var(--foreground)",
                                        letterSpacing: "-0.2px",
                                    }}
                                >
                                    {expense.title}
                                </p>
                                <p
                                    className="text-[12px] mt-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {isPayer ? "Sen" : payerName} ödedi
                                    <span
                                        className="mx-1.5"
                                        style={{ color: "var(--text-placeholder)" }}
                                    >
                                        ·
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-geist-mono, monospace)",
                                            fontSize: "11px",
                                        }}
                                    >
                                        {expense.expense_date.slice(5).replace("-", "/")}
                                    </span>
                                </p>
                            </div>

                            {/* Amounts */}
                            <div className="text-right shrink-0">
                                <p
                                    className="text-[13px] font-medium"
                                    style={{
                                        fontFamily: "var(--font-geist-mono, monospace)",
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    {formatMoney(expense.amount)}
                                </p>
                                {expense.is_fully_paid ? (
                                    <span
                                        className="inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-0.5"
                                        style={{
                                            background: "var(--surface-muted)",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        Ödendi
                                    </span>
                                ) : mySplit ? (
                                    <p
                                        className="text-[11px] mt-0.5 font-medium"
                                        style={{
                                            fontFamily: "var(--font-geist-mono, monospace)",
                                            color: isPayer ? "var(--primary)" : "var(--danger)",
                                        }}
                                    >
                                        {isPayer ? "+" : "−"}{formatMoney(myOwed)}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        ));

    /* ── Render ──────────────────────────────────────── */
    return (
        <div
            className="min-h-screen"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
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
                            onUpdated={(updated) => setGroup(updated)}
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
                                key={m.id}
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
                            {formatMoney(totalSpend)}
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
                        {expenses.length === 0 ? (
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
                            (() => {
                                const unpaid = expenses.filter((e) => !e.is_fully_paid);
                                const paid = expenses.filter((e) => e.is_fully_paid);
                                return (
                                    <>
                                        {unpaid.length > 0 && (
                                            <div
                                                className="rounded-[var(--radius-lg)] overflow-hidden mb-4"
                                                style={{
                                                    background: "var(--surface)",
                                                    border: "1px solid var(--border)",
                                                }}
                                            >
                                                {renderExpenseRows(unpaid)}
                                            </div>
                                        )}

                                        {paid.length > 0 && (
                                            <>
                                                <div className="flex items-center gap-3 my-4">
                                                    <div
                                                        className="h-px flex-1"
                                                        style={{ background: "var(--border)" }}
                                                    />
                                                    <span
                                                        className="text-[10px] uppercase"
                                                        style={{
                                                            fontFamily:
                                                                "var(--font-geist-mono, monospace)",
                                                            color: "var(--text-muted)",
                                                            letterSpacing: "0.08em",
                                                        }}
                                                    >
                                                        Ödenenler
                                                    </span>
                                                    <div
                                                        className="h-px flex-1"
                                                        style={{ background: "var(--border)" }}
                                                    />
                                                </div>
                                                <div
                                                    className="rounded-[var(--radius-lg)] overflow-hidden"
                                                    style={{
                                                        background: "var(--surface)",
                                                        border: "1px solid var(--border)",
                                                    }}
                                                >
                                                    {renderExpenseRows(paid)}
                                                </div>
                                            </>
                                        )}
                                    </>
                                );
                            })()
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
                                        key={member.id}
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
