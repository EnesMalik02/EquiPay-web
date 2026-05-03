"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { friendApi } from "@/entities/friend";

interface SendFriendRequestModalProps {
    onClose: () => void;
    onSent: () => void;
}

export const SendFriendRequestModal = ({ onClose, onSent }: SendFriendRequestModalProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await friendApi.send({ email: email.trim() });
            onSent();
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
            const detail = e.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(", "));
            } else {
                setError((detail as string | undefined) || e.message || "İstek gönderilemedi.");
            }
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = loading || !email.trim();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-black tracking-tight">Arkadaş Ekle</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="friend-email">
                            Email Adresi <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="friend-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="arkadas@email.com"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 outline-none transition-all text-black font-medium placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Eklemek istediğin kişinin kayıtlı email adresini gir.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="flex-1 py-3 px-4 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Gönderiliyor..." : "İstek Gönder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
