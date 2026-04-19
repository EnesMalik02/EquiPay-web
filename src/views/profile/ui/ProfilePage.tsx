"use client";

import { useUser } from "@/shared/store/UserContext";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { logoutAction } from "@/features/auth/actions/authActions";
import {
    User, CreditCard, Bell, Globe, Moon, Shield,
    HelpCircle, ChevronRight, LogOut, CheckCircle, Star,
} from "lucide-react";

export const ProfilePage = () => {
    const user = useUser();

    const displayName = user?.display_name ?? user?.username ?? "—";

    const initials = displayName !== "—"
        ? displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const handleLogout = async () => {
        await logoutAction();
    };

    const settingsItems: {
        icon: React.ElementType;
        label: string;
        sub?: string;
        onClick?: () => void;
    }[] = [
        { icon: User,       label: "Kişisel bilgiler",  sub: "Ad, telefon, e-posta" },
        { icon: Bell,       label: "Bildirimler",        sub: "E-posta ve push" },
        { icon: Globe,      label: "Dil ve bölge",       sub: "Türkçe · TRY" },
        { icon: Moon,       label: "Görünüm",            sub: "Açık" },
        { icon: Shield,     label: "Güvenlik",           sub: "İki adımlı doğrulama açık" },
        { icon: HelpCircle, label: "Yardım merkezi" },
    ];

    const cardStyle = {
        background: "var(--surface)",
        borderColor: "var(--border-light)",
        boxShadow: "var(--shadow-sm)",
    } as React.CSSProperties;

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
            <main className="max-w-5xl mx-auto px-6 pt-10 pb-32">

                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                            HESAP
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                            Profil
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                        style={{
                            background: "var(--surface)",
                            borderColor: "var(--border)",
                            color: "var(--text-secondary)",
                            boxShadow: "var(--shadow-xs)",
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış yap
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

                    {/* ── Left column ── */}
                    <div className="space-y-5">

                        {/* Avatar card */}
                        <div className="rounded-2xl border p-5" style={cardStyle}>
                            <div className="flex items-center gap-4">
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={displayName}
                                        className="w-[72px] h-[72px] rounded-2xl object-cover shrink-0"
                                    />
                                ) : (
                                    <div
                                        className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0"
                                        style={{ background: "var(--primary)" }}
                                    >
                                        {initials}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-xl font-extrabold truncate" style={{ color: "var(--foreground)" }}>
                                        {displayName}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-sm" style={{ color: "var(--text-muted)" }}>
                                        {user?.email && <span>{user.email}</span>}
                                        {user?.phone && (
                                            <>
                                                <span>·</span>
                                                <span>{user.phone}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all shrink-0 hover:opacity-80"
                                    style={{
                                        background: "var(--surface)",
                                        borderColor: "var(--border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    Düzenle
                                </button>
                            </div>
                        </div>

                        {/* Settings list card */}
                        <div className="rounded-2xl border overflow-hidden" style={cardStyle}>
                            <p
                                className="text-xs font-bold tracking-widest uppercase px-5 pt-4 pb-2"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Hesap ayarları
                            </p>
                            {settingsItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        onClick={item.onClick}
                                        className="w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left"
                                        style={{
                                            borderTop: idx > 0 ? "1px solid var(--border-light)" : "none",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-alt)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                                        >
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                                {item.label}
                                            </p>
                                            {item.sub && (
                                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                    {item.sub}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right column ── */}
                    <div className="space-y-4">

                        {/* Bu ay stats */}
                        <div className="rounded-2xl border p-5" style={cardStyle}>
                            <p className="text-[10px] font-bold tracking-widest uppercase mb-3.5" style={{ color: "var(--text-muted)" }}>
                                BU AY
                            </p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: "var(--text-secondary)" }}>Toplam harcama</span>
                                    <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>₺2.180,50</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: "var(--text-secondary)" }}>Grup sayısı</span>
                                    <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>4,00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: "var(--text-secondary)" }}>Denk olunan</span>
                                    <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>3,00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: "var(--text-secondary)" }}>Net bakiye</span>
                                    <span className="font-bold tabular-nums" style={{ color: "var(--primary)" }}>+₺180,75</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};
