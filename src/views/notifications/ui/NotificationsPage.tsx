"use client";

import { useEffect, useState } from "react";
import { Bell, Users, Check, X, Clock } from "lucide-react";
import { notificationApi } from "@/entities/notification/api/notificationApi";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupInvitationData, NotificationResponse } from "@/entities/notification/model/types";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return "Az önce";
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} sa önce`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return "Dün";
    if (diffDay < 7) return `${diffDay} gün önce`;
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function GroupInvitationCard({
    notification,
    onRespond,
    responding,
}: {
    notification: NotificationResponse;
    onRespond: (n: NotificationResponse, action: "accept" | "decline") => void;
    responding: string | null;
}) {
    const d = notification.data as GroupInvitationData;
    const isLoading = responding === notification.id;

    return (
        <div
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
            }}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div
                        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: "var(--primary-light)" }}
                    >
                        <Users className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p
                            className="text-[13.5px] font-medium leading-snug mb-0.5"
                            style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                        >
                            <span className="font-semibold">{d.invited_by_name || "Biri"}</span> sizi{" "}
                            <span className="font-semibold">{d.group_name}</span> grubuna davet etti.
                        </p>
                        <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                            <Clock className="w-3 h-3" />
                            <span className="text-[11px]" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                                {formatRelativeTime(notification.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        disabled={isLoading}
                        onClick={() => onRespond(notification, "decline")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-colors"
                        style={{
                            background: "var(--surface-muted)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--border)"; }}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--surface-muted)"; }}
                    >
                        <X className="w-3.5 h-3.5" />
                        Reddet
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onRespond(notification, "accept")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-colors"
                        style={{
                            background: "var(--primary)",
                            color: "#fff",
                            opacity: isLoading ? 0.5 : 1,
                            cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                        onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--primary-hover)"; }}
                        onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--primary)"; }}
                    >
                        {isLoading ? (
                            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-3.5 h-3.5" />
                        )}
                        {isLoading ? "..." : "Kabul Et"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState<string | null>(null);

    useEffect(() => {
        notificationApi.list()
            .then(setNotifications)
            .finally(() => setLoading(false));
    }, []);

    const respond = async (notification: NotificationResponse, action: "accept" | "decline") => {
        if (responding) return;
        const d = notification.data as GroupInvitationData;
        setResponding(notification.id);
        try {
            await groupApi.respondToInvitation(d.group_id, { action });
            await notificationApi.markRead(notification.id);
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        } catch {
            // keep on error
        } finally {
            setResponding(null);
        }
    };

    const invitations = notifications.filter((n) => n.type === "group_invitation");
    const others = notifications.filter((n) => n.type !== "group_invitation");

    return (
        <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            {/* Header */}
            <header className="px-4 pt-14 pb-6">
                <p
                    className="text-[10px] uppercase mb-1"
                    style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                        color: "var(--text-muted)",
                        letterSpacing: "0.08em",
                    }}
                >
                    Gelen Kutusu
                </p>
                <div className="flex items-center gap-2.5">
                    <h1
                        className="text-[24px] font-semibold"
                        style={{ letterSpacing: "-0.5px", lineHeight: 1.2 }}
                    >
                        Bildirimler
                    </h1>
                    {!loading && invitations.length > 0 && (
                        <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold"
                            style={{ background: "var(--danger)", color: "#fff" }}
                        >
                            {invitations.length}
                        </span>
                    )}
                </div>
            </header>

            <main className="px-4 pb-32">
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-[var(--radius-lg)] p-4"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                            >
                                <div className="flex gap-3">
                                    <div
                                        className="w-10 h-10 rounded-[10px] shrink-0 animate-pulse"
                                        style={{ background: "var(--surface-muted)" }}
                                    />
                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-3.5 rounded-full w-48 animate-pulse" style={{ background: "var(--surface-muted)" }} />
                                        <div className="h-3 rounded-full w-24 animate-pulse" style={{ background: "var(--surface-muted)" }} />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <div className="flex-1 h-10 rounded-[var(--radius-md)] animate-pulse" style={{ background: "var(--surface-muted)" }} />
                                    <div className="flex-1 h-10 rounded-[var(--radius-md)] animate-pulse" style={{ background: "var(--surface-muted)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div
                            className="w-14 h-14 rounded-[16px] flex items-center justify-center"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            <Bell className="w-6 h-6" style={{ color: "var(--text-placeholder)" }} />
                        </div>
                        <div className="text-center">
                            <p
                                className="text-[15px] font-medium mb-1"
                                style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                            >
                                Bildirim yok
                            </p>
                            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                                Yeni bildirimler burada görünecek.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {invitations.length > 0 && (
                            <section>
                                <p
                                    className="text-[10px] uppercase font-semibold mb-3"
                                    style={{
                                        fontFamily: "var(--font-geist-mono, monospace)",
                                        color: "var(--text-muted)",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Grup Davetleri
                                </p>
                                <div className="flex flex-col gap-3">
                                    {invitations.map((n) => (
                                        <GroupInvitationCard
                                            key={n.id}
                                            notification={n}
                                            onRespond={respond}
                                            responding={responding}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {others.length > 0 && (
                            <section>
                                <p
                                    className="text-[10px] uppercase font-semibold mb-3"
                                    style={{
                                        fontFamily: "var(--font-geist-mono, monospace)",
                                        color: "var(--text-muted)",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Diğer
                                </p>
                                <div
                                    className="rounded-[var(--radius-lg)] overflow-hidden"
                                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                                >
                                    {others.map((n, i) => (
                                        <div
                                            key={n.id}
                                            className="px-4 py-3 flex items-start gap-3"
                                            style={{
                                                borderBottom: i < others.length - 1 ? "1px solid var(--border-light)" : "none",
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ background: "var(--surface-muted)" }}
                                            >
                                                <Bell className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px]" style={{ color: "var(--foreground)" }}>
                                                    {n.type}
                                                </p>
                                                <span
                                                    className="text-[11px]"
                                                    style={{
                                                        fontFamily: "var(--font-geist-mono, monospace)",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    {formatRelativeTime(n.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
};
