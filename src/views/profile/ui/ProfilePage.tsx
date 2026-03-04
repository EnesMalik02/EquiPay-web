"use client";

import { useUser } from "@/shared/store/UserContext";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { logoutAction } from "@/features/auth/actions/authActions";

import {
    User,
    Phone,
    AtSign,
    LogOut,
    ChevronRight,
    Bell,
    Shield,
    HelpCircle,
    Fingerprint,
} from "lucide-react";

export const ProfilePage = () => {
    const user = useUser();

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    const handleLogout = async () => {
        await logoutAction();
    };

    const settingsGroups: {
        title: string;
        items: { icon: React.ElementType; label: string; onClick?: () => void; danger?: boolean }[];
    }[] = [
        {
            title: "Hesap",
            items: [
                { icon: Bell,        label: "Bildirimler" },
                { icon: Shield,      label: "Gizlilik" },
                { icon: Fingerprint, label: "Güvenlik" },
            ],
        },
        {
            title: "Destek",
            items: [
                { icon: HelpCircle, label: "Yardım & SSS" },
            ],
        },
        {
            title: "Oturum",
            items: [
                {
                    icon: LogOut,
                    label: "Çıkış Yap",
                    onClick: handleLogout,
                    danger: true,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
            <main className="max-w-5xl mx-auto px-6 pt-10">

                {/* ── Header ───────────────────────────────────── */}
                <p
                    className="text-[11px] font-bold tracking-widest uppercase mb-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    Hesabım
                </p>
                <h1
                    className="text-3xl font-extrabold tracking-tight mb-8"
                    style={{ color: "var(--foreground)" }}
                >
                    Profil
                </h1>

                {/* ── Avatar card ──────────────────────────────── */}
                <div
                    className="flex items-center gap-5 p-5 rounded-2xl border mb-6"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border-light)",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >
                    {/* Avatar circle */}
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold shrink-0"
                        style={{
                            background: "var(--primary-light)",
                            color: "var(--primary)",
                        }}
                    >
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p
                            className="text-lg font-extrabold truncate"
                            style={{ color: "var(--foreground)" }}
                        >
                            {user?.name ?? "—"}
                        </p>
                        {user?.username && (
                            <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                                @{user.username}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Info fields ──────────────────────────────── */}
                <div
                    className="rounded-2xl border divide-y overflow-hidden mb-6"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border-light)",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >
                    <InfoRow icon={User}    label="Ad Soyad" value={user?.name ?? "—"} />
                    <InfoRow icon={Phone}   label="Telefon"  value={user?.phone ?? "—"} />
                    <InfoRow icon={AtSign}  label="Kullanıcı adı"  value={user?.username ? `@${user.username}` : "—"} />
                </div>

                {/* ── Settings ─────────────────────────────────── */}
                {settingsGroups.map((group) => (
                    <div key={group.title} className="mb-4">
                        <p
                            className="text-[11px] font-bold tracking-widest uppercase px-1 mb-2"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {group.title}
                        </p>
                        <div
                            className="rounded-2xl border divide-y overflow-hidden"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border-light)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            {group.items.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-3.5 px-4 py-3.5 transition-colors text-left"
                                    style={item.danger ? { color: "var(--danger)" } : { color: "var(--foreground)" }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "var(--surface-hover)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "transparent")
                                    }
                                >
                                    <item.icon className="w-4.5 h-4.5 shrink-0 w-5 h-5" />
                                    <span className="flex-1 text-sm font-semibold">{item.label}</span>
                                    {!item.danger && (
                                        <ChevronRight
                                            className="w-4 h-4 shrink-0"
                                            style={{ color: "var(--text-muted)" }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </main>

            <BottomNav />
        </div>
    );
};

/* ── Helper ──────────────────────────────────────────────────── */
function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3.5 px-4 py-3.5">
            <Icon className="w-5 h-5 shrink-0" style={{ color: "var(--text-muted)" }} />
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {label}
                </p>
                <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: "var(--foreground)" }}>
                    {value}
                </p>
            </div>
        </div>
    );
}
