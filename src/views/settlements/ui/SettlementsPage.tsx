"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { settlementApi, SettlementResponse, SettlementStatus } from "@/entities/settlement";
import { useUser } from "@/shared/store/UserContext";
import { CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";

type Tab = "pending" | "confirmed" | "rejected";

const statusLabel: Record<SettlementStatus, string> = {
    pending: "Bekliyor",
    confirmed: "Onaylandı",
    rejected: "Reddedildi",
    cancelled: "İptal",
};

export const SettlementsPage = () => {
    const currentUser = useUser();
    const [settlements, setSettlements] = useState<SettlementResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("pending");
    const [actioningId, setActioningId] = useState<string | null>(null);

    useEffect(() => {
        settlementApi.listMine()
            .then(setSettlements)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleAction = async (id: string, status: SettlementStatus) => {
        setActioningId(id);
        try {
            const updated = await settlementApi.updateStatus(id, { status });
            setSettlements((prev) => prev.map((s) => s.id === id ? updated : s));
        } finally {
            setActioningId(null);
        }
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: "pending",   label: "Bekleyenler" },
        { id: "confirmed", label: "Onaylananlar" },
        { id: "rejected",  label: "Reddedilenler" },
    ];

    const filtered = settlements.filter((s) => s.status === activeTab);

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
            <main className="max-w-5xl mx-auto px-6 pt-10">
                <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                    Ödemeler
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ color: "var(--foreground)" }}>
                    Ödeme Kayıtları
                </h1>

                {/* Tabs */}
                <div className="flex gap-6 border-b mb-8" style={{ borderColor: "var(--border-light)" }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id
                                    ? "border-[#00d186] text-black"
                                    : "border-transparent text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                            {tab.id === "pending" && settlements.filter((s) => s.status === "pending").length > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-[#00d186] text-white rounded-full">
                                    {settlements.filter((s) => s.status === "pending").length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--surface-muted)" }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                            Bu kategoride ödeme kaydı yok.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((s) => {
                            const isOutgoing = s.payer_id === currentUser?.id;
                            const amount = `₺${parseFloat(s.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;

                            return (
                                <div
                                    key={s.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl border"
                                    style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        isOutgoing ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                                    }`}>
                                        {isOutgoing ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-black">
                                            {isOutgoing ? "Gönderilen" : "Alınan"} — {amount}
                                        </p>
                                        {s.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{s.note}</p>}
                                        {s.settled_at && (
                                            <p className="text-xs text-[#00d186] mt-0.5">
                                                {new Date(s.settled_at).toLocaleDateString("tr-TR")} tarihinde onaylandı
                                            </p>
                                        )}
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{
                                            color: s.status === "confirmed" ? "#00d186" : s.status === "rejected" ? "#ef4444" : "#9ca3af"
                                        }}>
                                            {statusLabel[s.status]}
                                        </span>

                                        {s.status === "pending" && !isOutgoing && (
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleAction(s.id, "confirmed")}
                                                    disabled={actioningId === s.id}
                                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                    title="Onayla"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(s.id, "rejected")}
                                                    disabled={actioningId === s.id}
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    title="Reddet"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {s.status === "pending" && isOutgoing && (
                                            <button
                                                onClick={() => handleAction(s.id, "cancelled")}
                                                disabled={actioningId === s.id}
                                                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <Clock className="w-3 h-3" />
                                                İptal Et
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <BottomNav />
        </div>
    );
};
