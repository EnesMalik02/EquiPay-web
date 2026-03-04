"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, LogOut, Trash2, AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse } from "@/entities/group/model/types";

type Step = "idle" | "confirm-leave" | "confirm-delete" | "assign-admin";

interface GroupSettingsModalProps {
    groupId: string;
    groupName: string;
    isAdmin: boolean;
    currentUserId: string | null;
    members: GroupMemberResponse[];
    onClose: () => void;
}

export const GroupSettingsModal = ({
    groupId,
    groupName,
    isAdmin,
    currentUserId,
    members,
    onClose,
}: GroupSettingsModalProps) => {
    const router = useRouter();
    const [step, setStep] = useState<Step>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const otherMembers = members.filter((m) => m.user_id !== currentUserId && !m.left_at);

    const handleLeave = async () => {
        setLoading(true);
        setError("");
        try {
            await groupApi.leave(groupId);
            router.push("/groups");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail ?? e.message ?? "");
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError("");
        try {
            await groupApi.remove(groupId);
            router.push("/groups");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail ?? e.message ?? "");
            setLoading(false);
        }
    };

    const handleAssignAdmin = async (userId: string) => {
        setLoading(true);
        setError("");
        try {
            await groupApi.updateMemberRole(groupId, userId, { role: "admin" });
            setStep("confirm-leave");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; message?: string };
            setError(e.response?.data?.detail ?? e.message ?? "");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep("idle");
        setError("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-black tracking-tight">Grup Ayarları</h2>
                        <p className="text-sm text-gray-400 font-medium mt-0.5 truncate max-w-[220px]">{groupName}</p>
                    </div>
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

                {/* ── IDLE ── */}
                {step === "idle" && (
                    <div className="space-y-2">
                        {/* Admin ata — sadece adminde ve başka üye varsa */}
                        {isAdmin && otherMembers.length > 0 && (
                            <button
                                onClick={() => setStep("assign-admin")}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#f0fdf4] hover:bg-green-100 transition-colors group text-left"
                            >
                                <div className="w-9 h-9 rounded-xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center text-[#00d186] shrink-0 transition-colors">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#00a066]">Admin Ata</p>
                                    <p className="text-xs text-green-400 mt-0.5">Başka bir üyeye admin yetkisi ver</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-green-300 group-hover:text-green-400 transition-colors" />
                            </button>
                        )}

                        {/* Gruptan Çık */}
                        <button
                            onClick={() => setStep("confirm-leave")}
                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-colors group text-left"
                        >
                            <div className="w-9 h-9 rounded-xl bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center text-orange-500 shrink-0 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-orange-600">Gruptan Çık</p>
                                <p className="text-xs text-orange-400 mt-0.5">Bu grupla bağlantını kes</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-orange-300 group-hover:text-orange-400 transition-colors" />
                        </button>

                        {/* Grubu Sil — sadece admin */}
                        {isAdmin && (
                            <button
                                onClick={() => setStep("confirm-delete")}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors group text-left"
                            >
                                <div className="w-9 h-9 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-red-500 shrink-0 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-red-600">Grubu Sil</p>
                                    <p className="text-xs text-red-400 mt-0.5">Tüm veriler kalıcı olarak silinir</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-red-400 transition-colors" />
                            </button>
                        )}
                    </div>
                )}

                {/* ── ASSIGN ADMIN ── */}
                {step === "assign-admin" && (
                    <div>
                        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Yeni Admin Seç</p>
                        <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100 mb-5 max-h-60 overflow-y-auto">
                            {otherMembers.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => handleAssignAdmin(m.user_id)}
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                                        {(m.name ?? m.username ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-black truncate">{m.name ?? m.username}</p>
                                        {m.username && <p className="text-xs text-gray-400">@{m.username}</p>}
                                    </div>
                                    {m.role === "admin" && (
                                        <span className="text-[10px] font-bold text-[#00d186] bg-[#f0fdf4] px-2 py-0.5 rounded-full">Admin</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={reset}
                            disabled={loading}
                            className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-50"
                        >
                            Vazgeç
                        </button>
                    </div>
                )}

                {/* ── CONFIRM LEAVE ── */}
                {step === "confirm-leave" && (
                    <div>
                        <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-orange-700 mb-1">Gruptan çıkmak istediğine emin misin?</p>
                                <ul className="text-xs text-orange-500 space-y-1 list-disc list-inside">
                                    <li>Net bakiyen sıfır olmalıdır.</li>
                                    <li>Gruba erişimin sona erecek.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={reset}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleLeave}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Çıkılıyor..." : "Evet, Çık"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── CONFIRM DELETE ── */}
                {step === "confirm-delete" && (
                    <div>
                        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-red-700 mb-1">Grubu silmek istediğine emin misin?</p>
                                <ul className="text-xs text-red-500 space-y-1 list-disc list-inside">
                                    <li>Gruptaki tüm bakiyelerin sıfır olması gerekir.</li>
                                    <li>Bu işlem geri alınamaz.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={reset}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-[0_4px_14px_rgba(239,68,68,0.35)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Siliniyor..." : "Evet, Sil"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
