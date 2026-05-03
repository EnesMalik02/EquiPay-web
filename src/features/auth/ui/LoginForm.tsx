"use client";

import { useState } from "react";
import { loginAction } from "../actions/authActions";
import Link from "next/link";
import { useTranslations } from "next-intl";

const INPUT_CLASS =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-[#00d186]/20 transition-all placeholder-gray-400 text-black font-medium";

export const LoginForm = () => {
    const t = useTranslations("LoginForm");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-black">{t("title")}</h1>
            <p className="text-gray-500 text-sm mb-6">{t("subtitle")}</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="identifier">
                        {t("labelIdentifier")}
                    </label>
                    <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className={INPUT_CLASS}
                        placeholder={t("placeholderIdentifier")}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
                        {t("labelPassword")}
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
                    {loading ? t("submitting") : t("submit")}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400 font-medium">
                {t("noAccount")}{" "}
                <Link href="/auth/register" className="text-[#00d186] font-bold hover:text-[#00b070] transition-colors">
                    {t("registerLink")}
                </Link>
            </p>
        </div>
    );
};
