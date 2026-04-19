"use client";

import { useState } from "react";
import PhoneInput, { getCountryCallingCode } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { loginAction } from "../actions/authActions";
import Link from "next/link";

type InputMode = "text" | "phone";

const DEFAULT_COUNTRY: Country = "TR";

const INPUT_CLASS =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium";

export const LoginForm = () => {
    const [identifier, setIdentifier] = useState("");
    const [inputMode, setInputMode] = useState<InputMode>("text");
    const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTextChange = (value: string) => {
        if (value.length === 1 && /^[+\d]/.test(value)) {
            setInputMode("phone");
            if (/^\d$/.test(value)) {
                // Paketin getCountryCallingCode fonksiyonuyla dinamik ülke kodu al;
                // rakamı bu kodla birleştir → PhoneInput "+905" alır, "5" gösterir
                const callingCode = getCountryCallingCode(selectedCountry);
                setIdentifier(`+${callingCode}${value}`);
            } else {
                // "+" yazıldıysa kullanıcı kodu kendisi girecek
                setIdentifier("");
            }
            return;
        }
        setIdentifier(value);
    };

    const switchToEmail = () => {
        setIdentifier("");
        setInputMode("text");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await loginAction(identifier, password);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">Giriş Yap</h1>
            <p className="text-gray-500 text-sm mb-6">Devam etmek için bilgilerini gir.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-bold text-gray-700" htmlFor="identifier">
                            {inputMode === "phone" ? "Telefon Numarası" : "Email veya Telefon Numarası"}
                        </label>
                        {inputMode === "phone" && (
                            <button
                                type="button"
                                onClick={switchToEmail}
                                className="text-xs text-[#00d186] font-semibold hover:text-[#00b070] transition-colors"
                            >
                                Email ile giriş yap
                            </button>
                        )}
                    </div>

                    {inputMode === "phone" ? (
                        <PhoneInput
                            id="identifier"
                            defaultCountry={DEFAULT_COUNTRY}
                            international
                            countryCallingCodeEditable={false}
                            value={identifier}
                            onChange={(val) => setIdentifier(val ?? "")}
                            onCountryChange={(country) =>
                                setSelectedCountry(country ?? DEFAULT_COUNTRY)
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:bg-white focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#00d186]/20 transition-all text-black font-medium [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none [&_.PhoneInputCountry]:mr-3 [&_.PhoneInputInput]:placeholder-gray-400 [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-4"
                            placeholder="555 123 45 67"
                            autoFocus
                        />
                    ) : (
                        <input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="ornek@email.com veya +90 555..."
                            required
                        />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
                        Şifre
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#00d186] hover:bg-[#00c07c] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
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
