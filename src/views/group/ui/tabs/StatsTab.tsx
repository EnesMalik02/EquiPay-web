"use client";

import { useEffect, useState } from "react";
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
import { BarChart3, ChevronLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { UserAvatar } from "@/shared/ui";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupStatsResponse } from "@/entities/group/model/types";
import { getCurrencySymbol } from "@/shared/lib/currency";
import { formatMoney } from "@/shared/lib/ui";
import { getCategoryMeta, CATEGORY_META } from "@/shared/lib/categoryIcons";

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

/* ── Category donut chart ────────────────────────────────── */

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
                outerRadius={(outerRadius as number) + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0 0 12px ${fill}88)` }}
            />
        );
    };

    const CX = 140;
    const CY = 140;

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

            {/* Full-width centered donut */}
            <div className="flex justify-center mb-4">
                <PieChart width={280} height={280}>
                    <Pie
                        data={items}
                        cx={CX}
                        cy={CY}
                        innerRadius={80}
                        outerRadius={115}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                        {...(activeIndex !== undefined ? { activeIndex } : {})}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, i) => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {items.map((item, i) => (
                            <Cell key={i} fill={item.color} stroke="var(--surface)" strokeWidth={3} />
                        ))}
                        <Label
                            content={({ viewBox }) => {
                                const vb = viewBox as { cx?: number; cy?: number };
                                const cx = vb?.cx ?? CX;
                                const cy = vb?.cy ?? CY;
                                return (
                                    <text textAnchor="middle" dominantBaseline="middle">
                                        <tspan
                                            x={cx}
                                            y={cy - 12}
                                            style={{
                                                fontSize: activeItem ? 22 : 18,
                                                fontWeight: 700,
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
                                            y={cy + 12}
                                            style={{
                                                fontSize: 12,
                                                fill: activeItem ? activeItem.color : "var(--text-muted)",
                                                fontFamily: "var(--font-geist-mono, monospace)",
                                            }}
                                        >
                                            {activeItem
                                                ? activeItem.name
                                                : `${breakdown.reduce((s, c) => s + c.count, 0)} harcama`}
                                        </tspan>
                                        {activeItem && (
                                            <tspan
                                                x={cx}
                                                y={cy + 30}
                                                style={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-geist-mono, monospace)" }}
                                            >
                                                {formatMoney(activeItem.value, currency)}
                                            </tspan>
                                        )}
                                    </text>
                                );
                            }}
                        />
                    </Pie>
                </PieChart>
            </div>

            {/* Legend grid */}
            <div className="grid grid-cols-2 gap-1.5">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 cursor-pointer transition-all"
                        style={{
                            background: activeIndex === i ? item.bg : "var(--background)",
                            border: `1px solid ${activeIndex === i ? item.color + "40" : "var(--border-light)"}`,
                            opacity: activeIndex === undefined || activeIndex === i ? 1 : 0.45,
                        }}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate" style={{ color: "var(--foreground)" }}>
                                {item.name}
                            </p>
                            <p className="text-[10px]" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)" }}>
                                {formatMoney(item.value, currency)}
                            </p>
                        </div>
                        <span
                            className="text-[11px] font-bold shrink-0"
                            style={{ fontFamily: "var(--font-geist-mono, monospace)", color: item.color }}
                        >
                            {item.pct.toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Member leaderboard ──────────────────────────────────── */

const LEADERBOARD_INITIAL = 6;

function MemberLeaderboard({
    members,
    currency,
}: {
    members: GroupStatsResponse["member_stats"];
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
                            <div className="flex items-center gap-2 min-w-0">
                                <UserAvatar name={m.name} size="xs" />
                                <span className="text-[12px] font-medium truncate" style={{ color: "var(--foreground)" }}>
                                    {m.name}
                                </span>
                            </div>

                            <div className="rounded-[6px] px-2 py-1 text-center" style={{ background: netBg }}>
                                <span
                                    className="text-[13px] font-bold"
                                    style={{ fontFamily: "var(--font-geist-mono, monospace)", color: netColor, letterSpacing: "-0.3px" }}
                                >
                                    {isPositive ? "+" : ""}{formatMoney(net, currency)}
                                </span>
                            </div>

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
                    className="w-full mt-2 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer rounded-[var(--radius-md)]"
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

/* ── StatsTab ────────────────────────────────────────────── */

interface StatsTabProps {
    groupId: string;
}

export function StatsTab({ groupId }: StatsTabProps) {
    const [stats, setStats] = useState<GroupStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        groupApi.getStats(groupId)
            .then(setStats)
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, [groupId]);

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-[var(--radius-lg)] p-4 animate-pulse"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", height: 72 }}
                    />
                ))}
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="py-14 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-placeholder)" }} />
                <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                    İstatistikler yüklenemedi.
                </p>
            </div>
        );
    }

    const currency = getCurrencySymbol(stats.currency);
    const totalAmount = parseFloat(stats.total_amount);

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
                <div
                    className="rounded-[var(--radius-lg)] p-4"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                    <p className="text-[10px] uppercase mb-1.5" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                        Toplam Harcama
                    </p>
                    <p className="text-[20px] font-semibold" style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--foreground)", letterSpacing: "-0.5px" }}>
                        {formatMoney(totalAmount, currency)}
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

            <MemberLeaderboard members={stats.member_stats} currency={currency} />

            {stats.category_breakdown.length > 0 && (
                <CategoryDonutChart
                    breakdown={stats.category_breakdown}
                    totalAmount={totalAmount}
                    currency={currency}
                />
            )}

            {stats.monthly_trend && stats.monthly_trend.length > 0 && (
                <MonthlyTrendChart trend={stats.monthly_trend} currency={currency} />
            )}
        </div>
    );
}
