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

type SearchMode = "phone" | "email" | "username";

const MODES: { id: SearchMode; label: string }[] = [
    { id: "phone", label: "Telefon" },
    { id: "email", label: "Email" },
    { id: "username", label: "Kullanıcı Adı" },
];

export const AddMemberModal = ({ groupId, onClose, onAdded }: AddMemberModalProps) => {
    const [mode, setMode] = useState<SearchMode>("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentValue = mode === "phone" ? phone.trim() : mode === "email" ? email.trim() : username.trim();
    const isDisabled = loading || !currentValue;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentValue) return;

        setLoading(true);
        setError("");

        try {
            const payload =
                mode === "phone" ? { phone: currentValue } :
                mode === "email" ? { email: currentValue } :
                { username: currentValue };

            const member = await groupApi.addMember(groupId, payload);
            onAdded(member);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
            const detail = e.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(", "));
            } else {
                setError((detail as string | undefined) || e.message || "Üye eklenirken bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = (m: SearchMode) => {
        setMode(m);
        setError("");
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: "rgba(18,21,18,0.3)" }}
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-sm p-5 animate-fade-in-up"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[16px] font-semibold" style={{ color: "var(--foreground)" }}>
                        Üye Ekle
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                        style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Mode toggle */}
                <div
                    className="flex p-1 rounded-[var(--radius-md)] mb-4 gap-1"
                    style={{ background: "var(--surface-muted)" }}
                >
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => handleModeChange(m.id)}
                            className="flex-1 py-2 text-[12px] font-medium transition-all"
                            style={{
                                borderRadius: "var(--radius-sm)",
                                background: mode === m.id ? "var(--surface)" : "transparent",
                                color: mode === m.id ? "var(--foreground)" : "var(--text-muted)",
                                boxShadow: mode === m.id ? "var(--shadow-xs)" : "none",
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <p
                        className="text-[13px] px-3 py-2.5 rounded-[var(--radius-md)] mb-4"
                        style={{ background: "var(--danger-light)", color: "var(--danger)" }}
                    >
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "phone" && (
                        <div>
                            <label
                                className="block text-[12px] font-medium mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                                htmlFor="member-phone"
                            >
                                Telefon Numarası
                            </label>
                            <PhoneInput
                                id="member-phone"
                                defaultCountry="TR"
                                value={phone}
                                onChange={(val) => setPhone(val || "")}
                                className="w-full px-3.5 py-2.5 text-[13.5px] [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none [&_.PhoneInputCountry]:mr-2.5 [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-4"
                                style={{
                                    background: "var(--surface-muted)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--foreground)",
                                } as React.CSSProperties}
                                placeholder="(505) 123 45 67"
                            />
                        </div>
                    )}

                    {mode === "email" && (
                        <div>
                            <label
                                className="block text-[12px] font-medium mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                                htmlFor="member-email"
                            >
                                Email Adresi
                            </label>
                            <input
                                id="member-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-[13.5px] outline-none"
                                style={{
                                    background: "var(--surface-muted)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-md)",
                                    color: "var(--foreground)",
                                }}
                                placeholder="ornek@email.com"
                            />
                        </div>
                    )}

                    {mode === "username" && (
                        <div>
                            <label
                                className="block text-[12px] font-medium mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                                htmlFor="member-username"
                            >
                                Kullanıcı Adı
                            </label>
                            <div className="relative">
                                <span
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px]"
                                    style={{ color: "var(--text-placeholder)" }}
                                >
                                    @
                                </span>
                                <input
                                    id="member-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                                    className="w-full pl-8 pr-3.5 py-2.5 text-[13.5px] outline-none"
                                    style={{
                                        background: "var(--surface-muted)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-md)",
                                        color: "var(--foreground)",
                                        fontFamily: "var(--font-geist-mono, monospace)",
                                    }}
                                    placeholder="kullanici_adi"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-[13px] font-medium transition-colors"
                            style={{
                                background: "var(--surface-muted)",
                                borderRadius: "var(--radius-md)",
                                color: "var(--text-secondary)",
                            }}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="flex-1 py-2.5 text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "var(--primary)",
                                borderRadius: "var(--radius-md)",
                                color: "#fff",
                            }}
                        >
                            {loading ? "Ekleniyor..." : "Ekle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
