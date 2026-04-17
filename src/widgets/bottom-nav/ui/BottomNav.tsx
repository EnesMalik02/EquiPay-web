"use client";

import { LayoutDashboard, Users, Plus, User, CreditCard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CreateGroupModal } from "@/features/create-group";
import { GroupResponse } from "@/entities/group/model/types";

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    const navItems = [
        { href: "/home",        label: "Panel",    icon: LayoutDashboard },
        { href: "/groups",      label: "Gruplar",  icon: Users },
        { href: "/settlements", label: "Ödemeler", icon: CreditCard },
        { href: "/profile",     label: "Profil",   icon: User },
    ];

    const handleCreated = (group: GroupResponse) => {
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    return (
        <>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            <div className="h-28" aria-hidden />

            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 px-4 pointer-events-none">
                <nav
                    className="
                        pointer-events-auto
                        flex items-center justify-center gap-1
                        bg-white/90 backdrop-blur-md
                        border border-[var(--border-light)]
                        rounded-[var(--radius-xl)]
                        shadow-[var(--shadow-lg)]
                        px-3 py-2
                        w-full max-w-sm
                    "
                >
                    {navItems.slice(0, 2).map((item) => (
                        <NavButton
                            key={item.href}
                            label={item.label}
                            icon={item.icon}
                            active={isActive(item.href)}
                            onClick={() => router.push(item.href)}
                        />
                    ))}

                    {/* Center FAB */}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="
                            mx-1 w-12 h-12 shrink-0
                            bg-[var(--foreground)] hover:bg-[#222]
                            text-white rounded-full
                            flex items-center justify-center
                            shadow-lg active:scale-90
                            transition-all duration-150
                        "
                        aria-label="Yeni grup oluştur"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    {navItems.slice(2).map((item) => (
                        <NavButton
                            key={item.href}
                            label={item.label}
                            icon={item.icon}
                            active={isActive(item.href)}
                            onClick={() => router.push(item.href)}
                        />
                    ))}
                </nav>
            </div>
        </>
    );
};

/* ── Helper ─────────────────────────────────────────────────── */
function NavButton({
    label,
    icon: Icon,
    active,
    onClick,
}: {
    label: string;
    icon: React.ElementType;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center gap-1
                flex-1 min-w-0 py-2 rounded-[var(--radius-md)]
                transition-all duration-150 active:scale-95
                ${active ? "text-[var(--primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}
            `}
        >
            <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider truncate w-full text-center ${active ? "" : "font-semibold"}`}>
                {label}
            </span>
        </button>
    );
}
