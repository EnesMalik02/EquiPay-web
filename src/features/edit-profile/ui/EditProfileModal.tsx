"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { userApi } from "@/features/auth/api/userApi";
import { User } from "@/features/auth/model/types";

interface EditProfileModalProps {
    user: User;
    onClose: () => void;
}

export const EditProfileModal = ({ user, onClose }: EditProfileModalProps) => {
    const router = useRouter();
    const [form, setForm] = useState({
        display_name: user.display_name ?? "",
        email: user.email ?? "",
        username: user.username ?? "",
        phone: user.phone ?? "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload: Record<string, string> = {};
        if (form.display_name !== (user.display_name ?? "")) payload.display_name = form.display_name;
        if (form.email !== (user.email ?? "")) payload.email = form.email;
        if (form.username !== (user.username ?? "")) payload.username = form.username;
        if (form.phone !== (user.phone ?? "")) payload.phone = form.phone;

        if (Object.keys(payload).length === 0) {
            onClose();
            return;
        }

        try {
            await userApi.updateProfile(payload);
            router.refresh();
            onClose();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setError(msg ?? "Güncelleme başarısız oldu.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div
                className="w-full max-w-md rounded-2xl border p-6"
                style={{ background: "var(--surface)", borderColor: "var(--border-light)" }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                        Kişisel Bilgiler
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity">
                        <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                            Ad Soyad
                        </label>
                        <input
                            type="text"
                            value={form.display_name}
                            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                            placeholder="Ad Soyad"
                            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                            E-posta
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="ornek@mail.com"
                            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/\s/g, "") }))}
                            placeholder="kullaniciadi"
                            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                            Telefon
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            placeholder="+90 555 555 55 55"
                            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-medium" style={{ color: "var(--error, #ef4444)" }}>
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-opacity hover:opacity-70"
                            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-60"
                            style={{ background: "var(--primary)" }}
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
