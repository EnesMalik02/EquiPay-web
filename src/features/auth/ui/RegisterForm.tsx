"use client";

import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { registerAction } from "../actions/authActions";
import Link from "next/link";

const DEFAULT_COUNTRY: Country = "TR";

export const RegisterForm = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) {
            setError("Telefon numarası zorunludur.");
            return;
        }
        setLoading(true);
        setError("");

        const result = await registerAction({
            email,
            password,
            phone: phone.trim(),
            username: username.trim(),
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
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="username">
                        Kullanıcı Adı <span className="text-red-400">*</span>
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium"
                        placeholder="Örn. ahmet42"
                        required
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
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="phone">
                        Telefon Numarası <span className="text-red-400">*</span>
                    </label>
                    <PhoneInput
                        id="phone"
                        defaultCountry={DEFAULT_COUNTRY}
                        international
                        countryCallingCodeEditable={false}
                        value={phone}
                        onChange={(val) => setPhone(val ?? "")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:bg-white focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#00d186]/20 transition-all text-black font-medium [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none [&_.PhoneInputCountry]:mr-3 [&_.PhoneInputInput]:placeholder-gray-400 [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4"
                        placeholder="555 123 45 67"
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
