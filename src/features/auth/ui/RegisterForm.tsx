"use client";

import { useState } from "react";
import { registerAction } from "../actions/authActions";
import Link from "next/link";

export const RegisterForm = () => {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await registerAction({
            email,
            password,
            display_name: displayName.trim() || undefined,
        });
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">Hesap Oluştur</h1>
            <p className="text-gray-500 text-sm mb-6">EquiPay&apos;e katıl ve ödemelerini kolayca yönet.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="display_name">
                        Ad Soyad <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
                    </label>
                    <input
                        id="display_name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium"
                        placeholder="Örn. Ahmet Yılmaz"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">
                        Email <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium"
                        placeholder="ornek@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
                        Şifre <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400 font-medium">
                Zaten hesabın var mı?{" "}
                <Link href="/auth/login" className="text-[#00d186] font-bold hover:text-[#00b070] transition-colors">
                    Giriş Yap
                </Link>
            </p>
        </div>
    );
};
