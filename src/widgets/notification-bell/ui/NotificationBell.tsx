"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { notificationApi } from "@/entities/notification/api/notificationApi";
import { NotificationResponse } from "@/entities/notification/model/types";

export const NotificationBell = ({ expanded, active }: { expanded: boolean; active?: boolean }) => {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationApi.list();
            setNotifications(data);
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, []);

    const count = notifications.filter((n) => n.type === "group_invitation").length;

    return (
        <button
            onClick={() => router.push("/notifications")}
            title={!expanded ? "Bildirimler" : undefined}
            className="flex items-center w-full cursor-pointer rounded-[var(--radius-sm)] relative transition-colors"
            style={{
                height: 36,
                gap: 10,
                padding: expanded ? "0 10px" : "0",
                justifyContent: expanded ? "flex-start" : "center",
                background: active ? "var(--primary-light)" : "transparent",
                boxShadow: active && expanded ? "inset 2px 0 0 var(--primary)" : "none",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--surface-muted)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
        >
            <span style={{ color: active ? "var(--primary)" : "var(--text-muted)", display: "flex", position: "relative" }}>
                <Bell className="w-[17px] h-[17px] shrink-0" />
                {count > 0 && (
                    <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: "var(--danger)", color: "#fff" }}
                    >
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </span>
            <span
                className="text-[13px] whitespace-nowrap overflow-hidden"
                style={{
                    color: "var(--text-secondary)",
                    fontWeight: 400,
                    letterSpacing: "-0.1px",
                    maxWidth: expanded ? 140 : 0,
                    opacity: expanded ? 1 : 0,
                    transition: "max-width 200ms cubic-bezier(0.4,0,0.2,1), opacity 150ms",
                }}
            >
                Bildirimler
            </span>
        </button>
    );
};
