"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, LogOut, Trash2, AlertTriangle, ChevronRight, ShieldCheck, Pencil } from "lucide-react";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupMemberResponse, GroupResponse } from "@/entities/group/model/types";

type Step = "idle" | "edit-info" | "confirm-leave" | "confirm-delete" | "assign-admin";

interface GroupSettingsModalProps {
    groupId: string;
    groupName: string;
    groupDescription?: string | null;
    isAdmin: boolean;
    currentUserId: string | null;
    members: GroupMemberResponse[];
    onClose: () => void;
    onUpdated?: (updated: GroupResponse) => void;
}

export const GroupSettingsModal = ({
    groupId,
    groupName,
    groupDescription,
    isAdmin,
    currentUserId,
    members,
    onClose,
    onUpdated,
}: GroupSettingsModalProps) => {
    const router = useRouter();
    const [step, setStep] = useState<Step>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [editName, setEditName] = useState(groupName);
    const [editDescription, setEditDescription] = useState(groupDescription ?? "");

    const otherMembers = members.filter((m) => m.user_id !== currentUserId);

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

    const handleSaveInfo = async () => {
        if (!editName.trim()) {
            setError("Grup adı boş olamaz.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const updated = await groupApi.update(groupId, {
                name: editName.trim(),
                description: editDescription.trim() || undefined,
            });
            onUpdated?.(updated);
            onClose();
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.4)" }}
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-md rounded-3xl shadow-2xl p-6"
                style={{ background: "var(--background)" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2
                            className="text-[18px] font-semibold"
                            style={{ color: "var(--foreground)", letterSpacing: "-0.4px" }}
                        >
                            Grup Ayarları
                        </h2>
                        <p
                            className="text-[12px] mt-0.5 truncate max-w-[220px]"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {groupName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div
                        className="px-4 py-3 rounded-2xl mb-4 text-[13px] font-medium"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "var(--danger)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* ── IDLE ── */}
                {step === "idle" && (
                    <div className="space-y-2">
                        {isAdmin && (
                            <ActionRow
                                icon={<Pencil className="w-4 h-4" />}
                                label="Grubu Düzenle"
                                sub="Ad ve açıklamayı güncelle"
                                iconColor="var(--primary)"
                                iconBg="var(--primary-light)"
                                onClick={() => setStep("edit-info")}
                            />
                        )}

                        {isAdmin && otherMembers.length > 0 && (
                            <ActionRow
                                icon={<ShieldCheck className="w-4 h-4" />}
                                label="Admin Ata"
                                sub="Başka bir üyeye admin yetkisi ver"
                                iconColor="var(--primary)"
                                iconBg="var(--primary-light)"
                                onClick={() => setStep("assign-admin")}
                            />
                        )}

                        <ActionRow
                            icon={<LogOut className="w-4 h-4" />}
                            label="Gruptan Çık"
                            sub="Bu grupla bağlantını kes"
                            iconColor="#f97316"
                            iconBg="rgba(249,115,22,0.1)"
                            onClick={() => setStep("confirm-leave")}
                        />

                        {isAdmin && (
                            <ActionRow
                                icon={<Trash2 className="w-4 h-4" />}
                                label="Grubu Sil"
                                sub="Tüm veriler kalıcı olarak silinir"
                                iconColor="var(--danger)"
                                iconBg="rgba(239,68,68,0.08)"
                                onClick={() => setStep("confirm-delete")}
                            />
                        )}
                    </div>
                )}

                {/* ── EDIT INFO ── */}
                {step === "edit-info" && (
                    <div className="space-y-4">
                        <div>
                            <label
                                className="block text-[10px] uppercase font-semibold mb-1.5"
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    color: "var(--text-muted)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Grup Adı
                            </label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={255}
                                placeholder="Grup adını girin"
                                className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none transition-colors"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        </div>
                        <div>
                            <label
                                className="block text-[10px] uppercase font-semibold mb-1.5"
                                style={{
                                    fontFamily: "var(--font-geist-mono, monospace)",
                                    color: "var(--text-muted)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                Açıklama
                            </label>
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                placeholder="Kısa bir açıklama ekleyin (isteğe bağlı)"
                                className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none transition-colors resize-none"
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={reset}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-colors disabled:opacity-50"
                                style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleSaveInfo}
                                disabled={loading || !editName.trim()}
                                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "var(--primary)", color: "#000" }}
                            >
                                {loading ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── ASSIGN ADMIN ── */}
                {step === "assign-admin" && (
                    <div>
                        <p
                            className="text-[10px] uppercase font-semibold mb-3"
                            style={{
                                fontFamily: "var(--font-geist-mono, monospace)",
                                color: "var(--text-muted)",
                                letterSpacing: "0.08em",
                            }}
                        >
                            Yeni Admin Seç
                        </p>
                        <div
                            className="rounded-2xl overflow-hidden mb-4 max-h-60 overflow-y-auto"
                            style={{ border: "1px solid var(--border)" }}
                        >
                            {otherMembers.map((m, i) => (
                                <button
                                    key={m.user_id}
                                    onClick={() => handleAssignAdmin(m.user_id)}
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50 active:bg-[var(--surface-alt)]"
                                    style={{
                                        background: "var(--surface)",
                                        borderBottom: i < otherMembers.length - 1 ? "1px solid var(--border-light)" : "none",
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                                        style={{
                                            background: "var(--surface-muted)",
                                            color: "var(--text-secondary)",
                                            border: "1px solid var(--border)",
                                        }}
                                    >
                                        {(m.display_name ?? m.username ?? "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-[13px] font-semibold truncate"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            {m.display_name ?? m.username}
                                        </p>
                                        {m.username && (
                                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                                @{m.username}
                                            </p>
                                        )}
                                    </div>
                                    {m.role === "admin" && (
                                        <span
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                                        >
                                            Admin
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={reset}
                            disabled={loading}
                            className="w-full py-3 rounded-2xl text-[14px] font-semibold transition-colors disabled:opacity-50"
                            style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                        >
                            Vazgeç
                        </button>
                    </div>
                )}

                {/* ── CONFIRM LEAVE ── */}
                {step === "confirm-leave" && (
                    <div>
                        <div
                            className="flex items-start gap-3 rounded-2xl p-4 mb-5"
                            style={{
                                background: "rgba(249,115,22,0.08)",
                                border: "1px solid rgba(249,115,22,0.18)",
                            }}
                        >
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#f97316" }} />
                            <div>
                                <p className="text-[13px] font-semibold mb-1" style={{ color: "#c2410c" }}>
                                    Gruptan çıkmak istediğine emin misin?
                                </p>
                                <ul className="text-[12px] space-y-1 list-disc list-inside" style={{ color: "#ea580c" }}>
                                    <li>Net bakiyen sıfır olmalıdır.</li>
                                    <li>Gruba erişimin sona erecek.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={reset}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-colors disabled:opacity-50"
                                style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleLeave}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "#f97316", color: "#fff" }}
                            >
                                {loading ? "Çıkılıyor..." : "Evet, Çık"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── CONFIRM DELETE ── */}
                {step === "confirm-delete" && (
                    <div>
                        <div
                            className="flex items-start gap-3 rounded-2xl p-4 mb-5"
                            style={{
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.18)",
                            }}
                        >
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
                            <div>
                                <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--danger)" }}>
                                    Grubu silmek istediğine emin misin?
                                </p>
                                <ul className="text-[12px] space-y-1 list-disc list-inside" style={{ color: "var(--danger)" }}>
                                    <li>Gruptaki tüm bakiyelerin sıfır olması gerekir.</li>
                                    <li>Bu işlem geri alınamaz.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={reset}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-colors disabled:opacity-50"
                                style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 py-3 rounded-2xl text-[14px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "var(--danger)", color: "#fff" }}
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

function ActionRow({
    icon,
    label,
    sub,
    iconColor,
    iconBg,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    sub: string;
    iconColor: string;
    iconBg: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-colors active:opacity-80"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
            <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ background: iconBg, color: iconColor }}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-[13.5px] font-semibold" style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}>
                    {label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {sub}
                </p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-placeholder)" }} />
        </button>
    );
}
