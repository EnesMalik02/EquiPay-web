"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { GroupList } from "@/widgets/group-list/ui/GroupList";
import { ArrowUpRight, Utensils, ShoppingBag } from "lucide-react";
import { CreateGroupModal } from "@/features/create-group";
import { GroupResponse } from "@/entities/group/model/types";

export const HomePage = () => {
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);

    const handleCreated = (group: GroupResponse) => {
        setShowCreate(false);
        router.push(`/groups/${group.id}`);
    };

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
                    <div className="flex items-end gap-3 mb-3">
                        <h1 className="text-5xl font-extrabold tracking-tight"
                            style={{ color: "var(--foreground)" }}>
                            ₺1.250,40
                        </h1>
                        <div
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5"
                            style={{
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                                border: "1px solid var(--primary-border)",
                            }}
                        >
                            <ArrowUpRight className="w-3 h-3" />
                            Alacaklısın
                        </div>
                    </div>
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
