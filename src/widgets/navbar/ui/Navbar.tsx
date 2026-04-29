"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    User,
    Settings,
    PanelLeft,
} from "lucide-react";
import { useUser } from "@/shared/store/UserContext";
import { NotificationBell } from "@/widgets/notification-bell/ui/NotificationBell";

const STORAGE_KEY = "equipay-sidebar-open";

const NAV_ITEMS = [
    { href: "/home",        label: "Panel",      icon: LayoutDashboard },
    { href: "/groups",      label: "Gruplar",    icon: Users },
    { href: "/settlements", label: "Hareketler", icon: CreditCard },
    { href: "/profile",     label: "Profil",     icon: User },
];

function getInitial(name?: string, email?: string): string {
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "?";
}

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const user = useUser();

    const [open, setOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [brandHovered, setBrandHovered] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) setOpen(stored === "true");
        setMounted(true);
    }, []);

    const toggle = () => {
        const next = !open;
        setOpen(next);
        localStorage.setItem(STORAGE_KEY, String(next));
    };

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    const displayName = user?.display_name ?? user?.username ?? "Kullanıcı";
    const email = user?.email ?? "";
    const initial = getInitial(user?.display_name ?? user?.username, email);

    const expanded = !mounted ? true : open;

    return (
        <aside
            className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen"
            style={{
                width: expanded ? 240 : 64,
                background: "var(--surface)",
                borderRight: "1px solid var(--border)",
                transition: "width 220ms cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden",
                boxShadow: "1px 0 0 var(--border-light)",
            }}
        >
            {/* ── Brand row ───────────────────────────── */}
            <div
                className="flex items-center shrink-0 relative"
                style={{
                    height: 60,
                    padding: expanded ? "0 12px 0 14px" : "0 12px",
                    justifyContent: expanded ? "space-between" : "center",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                {/* Expanded: logo + wordmark */}
                <div
                    className="flex items-center gap-2.5 overflow-hidden"
                    style={{ opacity: expanded ? 1 : 0, transition: "opacity 150ms", minWidth: 0, pointerEvents: expanded ? "auto" : "none" }}
                >
                    <Image
                        src="/logo.png"
                        alt="EquiPay"
                        width={30}
                        height={30}
                        style={{ borderRadius: 8, flexShrink: 0 }}
                    />
                    <span
                        className="text-[15px] font-bold whitespace-nowrap"
                        style={{ color: "var(--foreground)", letterSpacing: "-0.4px" }}
                    >
                        EquiPay
                    </span>
                </div>

                {/* Collapsed: logo (fade out on hover) + expand button (fade in on hover) */}
                {!expanded && (
                    <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onMouseEnter={() => setBrandHovered(true)}
                        onMouseLeave={() => setBrandHovered(false)}
                        onClick={toggle}
                        aria-label="Genişlet"
                        role="button"
                    >
                        {/* Logo */}
                        <div style={{
                            position: "absolute",
                            opacity: brandHovered ? 0 : 1,
                            transition: "opacity 180ms ease",
                        }}>
                            <Image
                                src="/logo.png"
                                alt="EquiPay"
                                width={30}
                                height={30}
                                style={{ borderRadius: 8, display: "block" }}
                            />
                        </div>
                        {/* Expand icon */}
                        <div
                            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                            style={{
                                opacity: brandHovered ? 1 : 0,
                                transition: "opacity 180ms ease",
                                background: "var(--background)",
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            <PanelLeft className="w-[15px] h-[15px]" />
                        </div>
                    </div>
                )}

                {/* Expanded collapse button */}
                <button
                    onClick={toggle}
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center cursor-pointer shrink-0"
                    style={{
                        color: "var(--text-secondary)",
                        opacity: expanded ? 1 : 0,
                        pointerEvents: expanded ? "auto" : "none",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-sm)",
                        transition: "opacity 150ms, background 150ms, border-color 150ms",
                    }}
                    aria-label="Kapat"
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "var(--surface-muted)";
                        e.currentTarget.style.borderColor = "var(--border)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "var(--background)";
                        e.currentTarget.style.borderColor = "var(--border)";
                    }}
                >
                    <PanelLeft className="w-[15px] h-[15px]" />
                </button>
            </div>

            {/* ── Nav section ─────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ padding: "8px 0" }}>

                {/* Section label */}
                {expanded && (
                    <div style={{ height: 28, display: "flex", alignItems: "center", padding: "0 16px" }}>
                        <span
                            className="text-[10px] uppercase font-semibold tracking-widest whitespace-nowrap"
                            style={{
                                color: "var(--text-placeholder)",
                                fontFamily: "var(--font-geist-mono, monospace)",
                            }}
                        >
                            Menü
                        </span>
                    </div>
                )}

                {/* Nav items */}
                <nav className="flex flex-col" style={{ gap: 2, padding: expanded ? "0 8px" : "0 6px" }}>
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <NavItem
                                key={item.href}
                                active={active}
                                expanded={expanded}
                                label={item.label}
                                icon={<Icon className="w-[17px] h-[17px] shrink-0" />}
                                onClick={() => router.push(item.href)}
                            />
                        );
                    })}
                </nav>

                <div className="flex-1" />

                {/* Notifications */}
                <div style={{ padding: "0 8px 8px" }}>
                    <NotificationBell expanded={expanded} active={isActive("/notifications")} />
                </div>
            </div>

            {/* ── User row ────────────────────────────── */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "8px" }}>
                <button
                    onClick={() => router.push("/profile")}
                    title={!expanded ? displayName : undefined}
                    className="flex items-center rounded-[var(--radius-md)] cursor-pointer w-full text-left transition-colors"
                    style={{
                        gap: expanded ? 10 : 0,
                        padding: expanded ? "7px 8px" : "7px 0",
                        justifyContent: expanded ? "flex-start" : "center",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                    <div
                        className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 text-[12px] font-semibold"
                        style={{ background: "var(--primary)", color: "#fff" }}
                    >
                        {initial}
                    </div>
                    <div
                        className="flex-1 min-w-0 overflow-hidden"
                        style={{ opacity: expanded ? 1 : 0, transition: "opacity 150ms" }}
                    >
                        <p
                            className="text-[12px] font-medium truncate leading-tight"
                            style={{ color: "var(--foreground)" }}
                        >
                            {displayName}
                        </p>
                        <p
                            className="text-[10px] truncate leading-tight mt-0.5"
                            style={{
                                fontFamily: "var(--font-geist-mono, monospace)",
                                color: "var(--text-muted)",
                            }}
                        >
                            {email}
                        </p>
                    </div>
                    {expanded && (
                        <Settings
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: "var(--text-placeholder)" }}
                        />
                    )}
                </button>
            </div>
        </aside>
    );
};

/* ── NavItem ──────────────────────────────────────── */
interface NavItemProps {
    active: boolean;
    expanded: boolean;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

function NavItem({ active, expanded, label, icon, onClick }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            title={!expanded ? label : undefined}
            className="flex items-center w-full cursor-pointer rounded-[var(--radius-sm)] relative transition-colors"
            style={{
                height: 36,
                gap: 10,
                padding: "0 10px",
                justifyContent: "flex-start",
                background: active ? "var(--primary-light)" : "transparent",
                boxShadow: active && expanded ? "inset 2px 0 0 var(--primary)" : "none",
            }}
            onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = "var(--surface-muted)";
            }}
            onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = "transparent";
            }}
        >
            {/* Icon — always at same left position */}
            <span
                className="flex items-center justify-center shrink-0"
                style={{
                    width: 20,
                    color: active ? "var(--primary)" : "var(--text-muted)",
                }}
            >
                {icon}
            </span>

            <span
                className="text-[13px] whitespace-nowrap overflow-hidden"
                style={{
                    color: active ? "var(--primary-ink)" : "var(--text-secondary)",
                    fontWeight: active ? 500 : 400,
                    letterSpacing: "-0.1px",
                    maxWidth: expanded ? 140 : 0,
                    opacity: expanded ? 1 : 0,
                    transition: "max-width 200ms cubic-bezier(0.4,0,0.2,1), opacity 150ms",
                }}
            >
                {label}
            </span>
        </button>
    );
}

