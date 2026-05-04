"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Settings, Users, Check } from "lucide-react";
import { UserAvatar } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupWithStatsResponse } from "@/entities/group/model/types";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";
import { GroupSettingsModal } from "@/features/manage-group/ui/GroupSettingsModal";
import { useUser } from "@/shared/store/UserContext";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { formatMoney } from "@/shared/lib/ui";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { MembersTab } from "./tabs/MembersTab";
import { StatsTab } from "./tabs/StatsTab";

type Tab = "expenses" | "members" | "stats";

const TABS: { id: Tab; label: string }[] = [
    { id: "expenses", label: "Harcamalar" },
    { id: "members", label: "Üyeler" },
    { id: "stats", label: "İstatistikler" },
];

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
    const [showAddMember, setShowAddMember] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [pendingInviteMsg, setPendingInviteMsg] = useState<string | null>(null);

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
                    <div className="w-9 h-9 rounded-[10px] animate-pulse" style={{ background: "var(--surface-muted)" }} />
                    <div className="h-4 w-24 rounded-full animate-pulse" style={{ background: "var(--surface-muted)" }} />
                    <div className="w-9 h-9 rounded-[10px] animate-pulse" style={{ background: "var(--surface-muted)" }} />
                </div>
                <div className="px-4">
                    <div
                        className="rounded-[var(--radius-lg)] p-5 animate-pulse"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        <div className="w-14 h-14 rounded-[14px] mx-auto mb-3 animate-pulse" style={{ background: "var(--surface-muted)" }} />
                        <div className="h-5 w-40 rounded-full mx-auto animate-pulse" style={{ background: "var(--surface-muted)" }} />
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

    const currencySymbol = getCurrencySymbol(group.currency_code);
    const me = members.find((m) => m.user_id === currentUserId);

    return (
        <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            {/* ── Toast ──────────────────────────────────── */}
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

            {/* ── Modals ─────────────────────────────────── */}
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

            {showSettings && (
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
            )}

            {/* ── Nav bar ──────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-14 pb-3">
                <button
                    onClick={() => router.push("/groups")}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    aria-label="Gruplara dön"
                >
                    <ChevronLeft className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
                <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                    Grup Detayı
                </span>
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    aria-label="Ayarlar"
                >
                    <Settings className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
            </div>

            <main className="px-4 pb-32">
                {/* ── Group header card ─────────────────────── */}
                <div
                    className="rounded-[var(--radius-lg)] p-5 text-center mb-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
                        <p className="text-[12px] mb-2" style={{ color: "var(--text-muted)" }}>
                            {group.description}
                        </p>
                    )}
                    <p className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>
                        {members.length} üye
                    </p>
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
                                style={{ background: "var(--surface-muted)", color: "var(--text-muted)", borderColor: "var(--surface)" }}
                            >
                                +{members.length - 5}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick stats + add button ──────────────── */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div
                        className="rounded-[var(--radius-lg)] p-4"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        <p
                            className="text-[10px] uppercase mb-2"
                            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.08em" }}
                        >
                            Para Birimi
                        </p>
                        <p
                            className="text-[18px] font-semibold"
                            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--foreground)" }}
                        >
                            {formatMoney(0, currencySymbol).replace("0", "—")}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/groups/${groupId}/expenses/new`)}
                        className="rounded-[var(--radius-lg)] p-4 text-left cursor-pointer active:scale-95 transition-transform"
                        style={{ background: "var(--primary-light)", border: "1px solid var(--primary-border)" }}
                    >
                        <p
                            className="text-[10px] uppercase mb-2"
                            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--primary-ink)", letterSpacing: "0.08em" }}
                        >
                            Yeni
                        </p>
                        <div className="flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--primary)" }}>
                            <Plus className="w-4 h-4" />
                            Harcama Ekle
                        </div>
                    </button>
                </div>

                {/* ── Tab navigation ───────────────────────── */}
                <div className="flex gap-1 mb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-4 py-3 relative cursor-pointer transition-colors"
                            style={{
                                color: activeTab === tab.id ? "var(--foreground)" : "var(--text-muted)",
                                fontWeight: activeTab === tab.id ? 500 : 400,
                                fontSize: "13px",
                            }}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span
                                    className="absolute left-0 right-0 bottom-[-1px] h-[2px] rounded-t-full"
                                    style={{ background: "var(--foreground)" }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab content ──────────────────────────── */}
                {activeTab === "expenses" && (
                    <ExpensesTab groupId={groupId} currencySymbol={currencySymbol} />
                )}
                {activeTab === "members" && (
                    <MembersTab
                        members={members}
                        onAddMember={() => setShowAddMember(true)}
                    />
                )}
                {activeTab === "stats" && (
                    <StatsTab groupId={groupId} />
                )}
            </main>

            <BottomNav />
        </div>
    );
};
