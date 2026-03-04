"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { GroupList } from "@/widgets/group-list/ui/GroupList";
import { Utensils, ShoppingBag } from "lucide-react";
import { CreateGroupModal } from "@/features/create-group";
import { GroupResponse } from "@/entities/group/model/types";

// TODO: replace with real API value
const NET_BALANCE = 1250.40;

export const HomePage = () => {
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);

    const handleCreated = (group: GroupResponse) => {
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

    const isPositive = NET_BALANCE >= 0;
    const balanceColor = isPositive ? "#00d186" : "#ef4444";
    const balanceFormatted = `${isPositive ? "+" : "-"}₺${Math.abs(NET_BALANCE).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            {showCreate && (
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreated}
                />
            )}

            <main className="max-w-5xl mx-auto px-6 pt-10">
                {/* Balance Section */}
                <div className="mb-10">
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-1"
                       style={{ color: "var(--text-muted)" }}>
                        Net Durumun
                    </p>
                    <h1 className="text-5xl font-extrabold tracking-tight mb-3"
                        style={{ color: balanceColor }}>
                        {balanceFormatted}
                    </h1>
                    <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
                        4 aktif grupta toplam bakiyen bulunuyor.
                    </p>
                </div>

                {/* Active Groups */}
                <GroupList onNewGroup={() => setShowCreate(true)} />

                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Son Hareketler</h3>
                        <button
                            className="text-[10px] font-bold tracking-widest uppercase"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Tümünü Gör
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {/* Transaction 1 */}
                        <div
                            className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border-light)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                            >
                                <Utensils className="w-4.5 h-4.5 w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>Burger King</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Dün, 20:45 • Yemek Takımı</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>₺240,00</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--primary)" }}>Sen Ödedin</p>
                            </div>
                        </div>

                        {/* Transaction 2 */}
                        <div
                            className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all"
                            style={{
                                background: "var(--surface)",
                                borderColor: "var(--border-light)",
                                boxShadow: "var(--shadow-sm)",
                            }}
                        >
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                            >
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>Market Alışverişi</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>2 gün önce • Ev Masrafları</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>₺560,00</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: "var(--danger)" }}>Payın: ₺140,00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};
