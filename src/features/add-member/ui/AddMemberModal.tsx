"use client";

import { useState } from "react";
import { X } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse } from "@/entities/group/model/types";

interface AddMemberModalProps {
    groupId: string;
    onClose: () => void;
    onAdded: (member: GroupMemberResponse) => void;
}

export const AddMemberModal = ({ groupId, onClose, onAdded }: AddMemberModalProps) => {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) return;

        setLoading(true);
        setError("");

        try {
            const member = await groupApi.addMember(groupId, { phone: phone.trim() });
            onAdded(member);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail || e.message || "Üye eklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-black tracking-tight">Üye Ekle</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="member-phone">
                            Telefon Numarası <span className="text-red-400">*</span>
                        </label>
                        <PhoneInput
                            id="member-phone"
                            defaultCountry="TR"
                            value={phone}
                            onChange={(val) => setPhone(val || "")}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:bg-white focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#00d186]/20 transition-all text-black font-medium [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none [&_.PhoneInputCountry]:mr-3 [&_.PhoneInputInput]:placeholder-gray-400 [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4"
                            placeholder="(505) 123 45 67"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            Eklemek istediğin kişinin kayıtlı telefon numarasını gir.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !phone.trim()}
                            className="flex-1 py-3 px-4 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Ekleniyor..." : "Ekle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
