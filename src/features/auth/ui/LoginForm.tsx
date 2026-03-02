"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api/authApi";
import Link from "next/link";

export const LoginForm = () => {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check if user is already logged in (This should ideally be handled by middleware or server component now)
    // For now we can do a quick check by hitting /me API on mount if needed, or rely on Server Actions/Middleware.
    // Client-side cookie reading is impossible if HttpOnly!

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await authApi.login(phone);

            // Fetch me to verify token
            await authApi.me();

            router.push("/home"); // Redirect to Dashboard
        } catch (err: any) { // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError(err.response?.data?.detail || err.message || "Giriş yapılırken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">
                Giriş Yap
            </h1>
            <p className="text-gray-500 text-sm mb-6">Devam etmek için telefon numaranı gir.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="phone">
                        Telefon Numarası
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium"
                        placeholder="555 123 4567"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? "Giriş yapılıyor..." : "Devam Et"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400 font-medium">
                Hesabın yok mu?{" "}
                <Link href="/auth/register" className="text-[#00d186] font-bold hover:text-[#00b070] transition-colors">
                    Kayıt Ol
                </Link>
            </p>
        </div>
    );
};
