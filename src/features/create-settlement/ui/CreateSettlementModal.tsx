"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { settlementApi } from "@/entities/settlement";
import { SettlementResponse } from "@/entities/settlement";
import { GroupMemberResponse } from "@/entities/group/model/types";

interface CreateSettlementModalProps {
    members: GroupMemberResponse[];
    groupId?: string;
    currentUserId: string;
    onClose: () => void;
    onCreated: (settlement: SettlementResponse) => void;
}

export const CreateSettlementModal = ({
    members,
    groupId,
    currentUserId,
    onClose,
    onCreated,
}: CreateSettlementModalProps) => {
    const others = members.filter((m) => m.user_id !== currentUserId);
    const [receiverId, setReceiverId] = useState(others[0]?.user_id ?? "");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!parsed || parsed <= 0) return;

        setLoading(true);
        setError("");
        try {
            const settlement = await settlementApi.create({
                group_id: groupId,
                receiver_id: receiverId,
                amount: parsed,
                note: note.trim() || undefined,
            });
            onCreated(settlement);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail || e.message || "Ödeme kaydı oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-black tracking-tight">Ödeme Gönder</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Alıcı</label>
                        <select
                            value={receiverId}
                            onChange={(e) => setReceiverId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium"
                            required
                        >
                            {others.map((m) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.display_name ?? m.username ?? m.user_id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tutar (₺) <span className="text-red-400">*</span></label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Not <span className="text-gray-400 font-normal">(isteğe bağlı)</span></label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ödeme referansı, IBAN vb."
                            maxLength={200}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium placeholder-gray-400"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !receiverId || !amount}
                            className="flex-1 py-3 px-4 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Gönderiliyor..." : "Gönder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
