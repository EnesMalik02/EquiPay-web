"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    User,
    Settings,
    Shield,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useUser } from "@/shared/store/UserContext";

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
                width: expanded ? 232 : 60,
                background: "var(--surface)",
                borderRight: "1px solid var(--border)",
                transition: "width 200ms cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden",
            }}
        >
            {/* ── Brand row ───────────────────────────── */}
            <div
                className="flex items-center shrink-0"
                style={{
                    height: 56,
                    padding: expanded ? "0 12px 0 16px" : "0 12px",
                    justifyContent: expanded ? "space-between" : "center",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <div
                    className="flex items-center gap-2.5 overflow-hidden"
                    style={{ opacity: expanded ? 1 : 0, transition: "opacity 150ms", minWidth: 0 }}
                >
                    <LogoMark />
                    <span
                        className="text-[15px] font-semibold whitespace-nowrap"
                        style={{ color: "var(--foreground)", letterSpacing: "-0.3px" }}
                    >
                        EquiPay
                    </span>
                </div>

                {!expanded && (
                    <div style={{ position: "absolute" }}>
                        <LogoMark />
                    </div>
                )}

                <button
                    onClick={toggle}
                    className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    style={{
                        color: "var(--text-muted)",
                        marginLeft: expanded ? 0 : "auto",
                        marginRight: expanded ? 0 : "auto",
                        position: expanded ? "relative" : "absolute",
                        right: expanded ? "auto" : 16,
                        opacity: expanded ? 1 : 0,
                        pointerEvents: expanded ? "auto" : "none",
                        transition: "opacity 150ms, background 150ms",
                    }}
                    aria-label={expanded ? "Kapat" : "Aç"}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Collapsed toggle */}
                {!expanded && (
                    <button
                        onClick={toggle}
                        className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer transition-colors shrink-0 absolute"
                        style={{ right: 10, color: "var(--text-muted)" }}
                        aria-label="Aç"
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-muted)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* ── Nav section ─────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar" style={{ padding: "8px 0" }}>

                {/* Section label */}
                <div style={{ height: 28, display: "flex", alignItems: "center", padding: expanded ? "0 16px" : "0 12px" }}>
                    <span
                        className="text-[10px] uppercase font-semibold tracking-widest whitespace-nowrap"
                        style={{
                            color: "var(--text-placeholder)",
                            opacity: expanded ? 1 : 0,
                            transition: "opacity 150ms",
                            fontFamily: "var(--font-geist-mono, monospace)",
                        }}
                    >
                        Menü
                    </span>
                    {!expanded && (
                        <div style={{ width: 28, height: 1, background: "var(--border)", margin: "0 auto" }} />
                    )}
                </div>

                {/* Nav items */}
                <nav className="flex flex-col" style={{ gap: 2, padding: "0 8px" }}>
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
            className="flex items-center w-full cursor-pointer rounded-[var(--radius-sm)] relative transition-colors group"
            style={{
                height: 36,
                gap: 10,
                padding: expanded ? "0 10px" : "0",
                justifyContent: expanded ? "flex-start" : "center",
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
            {/* Collapsed active dot */}
            {!expanded && active && (
                <div
                    style={{
                        position: "absolute",
                        left: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 3,
                        height: 16,
                        borderRadius: 2,
                        background: "var(--primary)",
                    }}
                />
            )}

            <span style={{ color: active ? "var(--primary)" : "var(--text-muted)", display: "flex" }}>
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

/* ── LogoMark ─────────────────────────────────────── */
function LogoMark() {
    return (
        <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 relative"
            style={{ background: "var(--primary)" }}
        >
            <div className="w-2.5 h-2.5 rounded-full" style={{ border: "1.5px solid #fff" }} />
            <div className="absolute right-[4px] top-[4px] w-1.5 h-1.5 rounded-full bg-white" />
        </div>
    );
}
