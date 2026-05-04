"use client";

import * as React from "react";
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
    BarChart3,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Label,
    Sector,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { UserAvatar, SplitExpenseItem, SkeletonSettlementItem } from "@/shared/ui";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupStatsResponse, GroupWithStatsResponse } from "@/entities/group/model/types";
import { useMySplitExpenses } from "@/entities/expense/hooks/useMySplitExpenses";
import { AddMemberModal } from "@/features/add-member/ui/AddMemberModal";
import { GroupSettingsModal } from "@/features/manage-group/ui/GroupSettingsModal";
import { useUser } from "@/shared/store/UserContext";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { formatMoney } from "@/shared/lib/ui";
import { getCategoryMeta, CATEGORY_META } from "@/shared/lib/categoryIcons";

type Tab = "expenses" | "members" | "stats";
type ExpenseTab = "all" | "paid" | "unpaid";

/* ── Monthly trend bar chart ─────────────────────────────── */

function MonthlyTrendChart({
    trend,
    currency,
}: {
    trend: { year_month: string; total: string; count: number }[];
    currency: string;
}) {
    const data = trend.map((t) => {
        const [year, month] = t.year_month.split("-");
        const label = new Date(parseInt(year), parseInt(month) - 1, 1)
            .toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
        return { label, total: parseFloat(t.total), count: t.count };
    });

    const maxVal = Math.max(...data.map((d) => d.total), 1);

    return (
        <div
            className="rounded-[var(--radius-lg)] p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
            <p
                className="text-[11px] font-semibold uppercase mb-4"
                style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.1em" }}
            >
                Aylık Trend
            </p>
            <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data} barCategoryGap="28%" margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-geist-mono, monospace)" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-geist-mono, monospace)" }}
                        tickFormatter={(v) => `${currency}${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? "k" : ""}`}
                    />
                    <Tooltip
                        cursor={{ fill: "var(--surface-muted)", rx: 6 }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.[0]) return null;
                            const d = payload[0].payload as typeof data[0];
                            return (
                                <div
                                    className="px-3 py-2 rounded-[var(--radius-md)] text-[12px]"
                                    style={{ background: "var(--foreground)", color: "#fff", boxShadow: "var(--shadow-md)" }}
                                >
                                    <p className="font-semibold" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                                        {formatMoney(d.total, currency)}
                                    </p>
                                    <p style={{ opacity: 0.7 }}>{d.count} harcama</p>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {data.map((d, i) => (
                            <Cell
                                key={i}
                                fill={d.total === maxVal ? "var(--primary)" : "var(--surface-muted)"}
                                stroke={d.total === maxVal ? "var(--primary)" : "var(--border)"}
                                strokeWidth={1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ── Category donut chart (recharts) ─────────────────────── */

function CategoryDonutChart({
    breakdown,
    totalAmount,
    currency,
}: {
    breakdown: { category: string | null; total: string; count: number }[];
    totalAmount: number;
    currency: string;
}) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    const items = breakdown.map((cat) => {
        const meta = getCategoryMeta(cat.category) ?? CATEGORY_META["diger"];
        return {
            name: meta.label,
            value: parseFloat(cat.total),
            count: cat.count,
            color: meta.color,
            bg: meta.bg,
            pct: totalAmount > 0 ? (parseFloat(cat.total) / totalAmount) * 100 : 0,
        };
    });

    const activeItem = activeIndex !== undefined ? items[activeIndex] : null;

    const renderActiveShape = (props: PieSectorDataItem) => {
        const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill } = props;
        return (
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={(outerRadius as number) + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0 0 8px ${fill}66)` }}
            />
        );
    };

    return (
        <div
            className="rounded-[var(--radius-lg)] p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
            <p
                className="text-[11px] font-semibold uppercase mb-4"
                style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.1em" }}
            >
                Kategori Dağılımı
            </p>

            <div className="flex items-center gap-4">
                {/* Donut */}
                <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                    <PieChart width={160} height={160}>
                        <Pie
                            data={items}
                            cx={75}
                            cy={75}
                            innerRadius={48}
                            outerRadius={68}
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={2}
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                            animationBegin={0}
                            animationDuration={800}
                            animationEasing="ease-out"
                        >
                            {items.map((item, i) => (
                                <Cell key={i} fill={item.color} stroke="var(--surface)" strokeWidth={2} />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    const vb = viewBox as { cx?: number; cy?: number };
                                    const cx = vb?.cx ?? 75;
                                    const cy = vb?.cy ?? 75;
                                    return (
                                        <text textAnchor="middle" dominantBaseline="middle">
                                            <tspan
                                                x={cx}
                                                y={cy - 8}
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    fill: activeItem ? activeItem.color : "var(--foreground)",
                                                    fontFamily: "var(--font-geist-mono, monospace)",
                                                }}
                                            >
                                                {activeItem
                                                    ? `${activeItem.pct.toFixed(1)}%`
                                                    : formatMoney(totalAmount, currency)}
                                            </tspan>
                                            <tspan
                                                x={cx}
                                                y={cy + 10}
                                                style={{ fontSize: 10, fill: "var(--text-muted)" }}
                                            >
                                                {activeItem ? activeItem.name : `${breakdown.reduce((s, c) => s + c.count, 0)} harcama`}
                                            </tspan>
                                        </text>
                                    );
                                }}
                            />
                        </Pie>
                    </PieChart>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2 min-w-0">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 cursor-pointer rounded-[var(--radius-sm)] px-2 py-1 transition-all"
                            style={{
                                background: activeIndex === i ? item.bg : "transparent",
                                opacity: activeIndex === undefined || activeIndex === i ? 1 : 0.45,
                            }}
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                        >
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                            <span className="flex-1 text-[12px] truncate" style={{ color: "var(--foreground)" }}>
                                {item.name}
                            </span>
                            <span
                                className="text-[11px] font-semibold shrink-0"
                                style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)" }}
                            >
                                {item.pct.toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Member leaderboard (2-col card grid) ──────────────────── */

const LEADERBOARD_INITIAL = 6;

function MemberLeaderboard({
    members,
    totalPaid,
    currency,
}: {
    members: GroupStatsResponse["member_stats"];
    totalPaid: number;
    currency: string;
}) {
    const [expanded, setExpanded] = useState(false);
    const sorted = [...members].sort((a, b) => parseFloat(b.total_paid) - parseFloat(a.total_paid));
    const visible = expanded ? sorted : sorted.slice(0, LEADERBOARD_INITIAL);
    const hasMore = sorted.length > LEADERBOARD_INITIAL;

    return (
        <div
            className="rounded-[var(--radius-lg)] p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
            <div className="flex items-center justify-between mb-3">
                <p
                    className="text-[11px] font-semibold uppercase"
                    style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.1em" }}
                >
                    Üye Bakiyeleri
                </p>
                <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-muted)", color: "var(--text-muted)", fontFamily: "var(--font-geist-mono, monospace)" }}
                >
                    {members.length} üye
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {visible.map((m) => {
                    const net = parseFloat(m.net_balance);
                    const paid = parseFloat(m.total_paid);
                    const owed = parseFloat(m.total_owed);
                    const isPositive = net > 0;
                    const isNegative = net < 0;
                    const netColor = isPositive ? "#22c55e" : isNegative ? "#ef4444" : "var(--text-muted)";
                    const netBg = isPositive ? "rgba(34,197,94,0.08)" : isNegative ? "rgba(239,68,68,0.08)" : "var(--surface-muted)";

                    return (
                        <div
                            key={m.user_id}
                            className="rounded-[var(--radius-md)] p-3 flex flex-col gap-2"
                            style={{ background: "var(--background)", border: "1px solid var(--border-light)" }}
                        >
                            {/* Top: avatar + name */}
                            <div className="flex items-center gap-2 min-w-0">
                                <UserAvatar name={m.name} size="xs" />
                                <span className="text-[12px] font-medium truncate" style={{ color: "var(--foreground)" }}>
                                    {m.name}
                                </span>
                            </div>

                            {/* Net balance */}
                            <div
                                className="rounded-[6px] px-2 py-1 text-center"
                                style={{ background: netBg }}
                            >
                                <span
                                    className="text-[13px] font-bold"
                                    style={{ fontFamily: "var(--font-geist-mono, monospace)", color: netColor, letterSpacing: "-0.3px" }}
                                >
                                    {isPositive ? "+" : ""}{formatMoney(net, currency)}
                                </span>
                            </div>

                            {/* Paid / Owed row */}
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-[9px] uppercase mb-0.5" style={{ color: "var(--text-placeholder)", fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.06em" }}>Ödedi</p>
                                    <p className="text-[11px] font-semibold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "#22c55e" }}>
                                        {formatMoney(paid, currency)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] uppercase mb-0.5" style={{ color: "var(--text-placeholder)", fontFamily: "var(--font-geist-mono, monospace)", letterSpacing: "0.06em" }}>Borçlu</p>
                                    <p className="text-[11px] font-semibold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: owed > 0 ? "#ef4444" : "var(--text-muted)" }}>
                                        {formatMoney(owed, currency)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="w-full mt-2 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer rounded-[var(--radius-md)] transition-colors"
                    style={{ color: "var(--primary)", background: "var(--surface-muted)" }}
                >
                    <ChevronLeft
                        className="w-3 h-3"
                        style={{ transform: expanded ? "rotate(90deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
                    />
                    {expanded ? "Daha Az Göster" : `${sorted.length - LEADERBOARD_INITIAL} üye daha`}
                </button>
            )}
        </div>
    );
}



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
    const [stats, setStats] = useState<GroupStatsResponse | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

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

    useEffect(() => {
        if (activeTab !== "stats" || stats !== null || statsLoading) return;
        setStatsLoading(true);
        groupApi.getStats(groupId).then(setStats).catch(() => {}).finally(() => setStatsLoading(false));
    }, [activeTab, groupId, stats, statsLoading]);

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

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: "expenses", label: "Harcamalar", count: expenses.length },
        { id: "members", label: "Üyeler", count: members.length },
        { id: "stats", label: "İstatistikler" },
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
                            {tab.count !== undefined && (
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
                            )}
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
                            <div className="space-y-6">
                                {(() => {
                                    const groups: { key: string; label: string; items: typeof expenses }[] = [];
                                    const seen = new Map<string, typeof expenses>();
                                    for (const exp of expenses) {
                                        const raw = exp.expense_date ?? exp.created_at;
                                        const d = raw ? new Date(raw) : new Date(0);
                                        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                                        const label = d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }).toUpperCase();
                                        if (!seen.has(key)) {
                                            seen.set(key, []);
                                            groups.push({ key, label, items: seen.get(key)! });
                                        }
                                        seen.get(key)!.push(exp);
                                    }
                                    return groups.map(({ key, label, items }) => {
                                        const groupTotal = items.reduce((s, e) => s + parseFloat(e.amount), 0);
                                        return (
                                            <div key={key}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span
                                                            className="text-[11px] font-semibold tracking-widest"
                                                            style={{
                                                                fontFamily: "var(--font-geist-mono, monospace)",
                                                                color: "var(--text-muted)",
                                                                letterSpacing: "0.1em",
                                                            }}
                                                        >
                                                            {label}
                                                        </span>
                                                        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                                                    </div>
                                                    <span
                                                        className="text-[11px] ml-3 shrink-0"
                                                        style={{
                                                            fontFamily: "var(--font-geist-mono, monospace)",
                                                            color: "var(--text-muted)",
                                                        }}
                                                    >
                                                        {items.length} harcama · {formatMoney(groupTotal, currencySymbol)}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {items.map((exp) => (
                                                        <SplitExpenseItem key={exp.id} expense={exp} />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
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
                {/* ── Stats tab ────────────────────────────── */}
                {activeTab === "stats" && (
                    <>
                        {statsLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-[var(--radius-lg)] p-4 animate-pulse"
                                        style={{ background: "var(--surface)", border: "1px solid var(--border)", height: 72 }}
                                    />
                                ))}
                            </div>
                        ) : !stats ? (
                            <div className="py-14 text-center">
                                <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-placeholder)" }} />
                                <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>İstatistikler yüklenemedi.</p>
                            </div>
                        ) : (() => {
                            const statsCurrency = getCurrencySymbol(stats.currency);
                            const totalAmount = parseFloat(stats.total_amount);
                            return (
                                <div className="space-y-4">
                                    {/* Summary row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className="rounded-[var(--radius-lg)] p-4"
                                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                        >
                                            <p className="text-[10px] uppercase mb-1.5" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                                                Toplam Harcama
                                            </p>
                                            <p className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--foreground)", letterSpacing: "-0.5px" }}>
                                                {formatMoney(totalAmount, statsCurrency)}
                                            </p>
                                        </div>
                                        <div
                                            className="rounded-[var(--radius-lg)] p-4"
                                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                        >
                                            <p className="text-[10px] uppercase mb-1.5" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                                                İşlem Sayısı
                                            </p>
                                            <p className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--foreground)", letterSpacing: "-0.5px" }}>
                                                {stats.total_expense_count}
                                            </p>
                                            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>harcama</p>
                                        </div>
                                    </div>

                                    {/* Member leaderboard */}
                                    <MemberLeaderboard
                                        members={stats.member_stats}
                                        totalPaid={stats.member_stats.reduce((s, m) => s + parseFloat(m.total_paid), 0)}
                                        currency={statsCurrency}
                                    />

                                    {/* Category breakdown — donut chart */}
                                    {stats.category_breakdown.length > 0 && (
                                        <CategoryDonutChart
                                            breakdown={stats.category_breakdown}
                                            totalAmount={totalAmount}
                                            currency={statsCurrency}
                                        />
                                    )}

                                    {/* Monthly trend bar chart */}
                                    {stats.monthly_trend && stats.monthly_trend.length > 0 && (
                                        <MonthlyTrendChart
                                            trend={stats.monthly_trend}
                                            currency={statsCurrency}
                                        />
                                    )}
                                </div>
                            );
                        })()}
                    </>
                )}
            </main>

            <BottomNav />
        </div>
    );
};
