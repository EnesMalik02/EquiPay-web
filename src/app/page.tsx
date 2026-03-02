"use client";

import Link from "next/link";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-gray-900 px-4">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 bg-[#00d186] rounded-xl flex items-center justify-center text-white font-bold text-3xl leading-none">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>
          <span className="text-4xl font-extrabold text-black tracking-tight">Paylaş</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-black">
          Harcamalarını Kolayca Böl
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto md:text-lg">
          Arkadaşlarınla hesaplaşmanın en kolay yolu. Hemen katıl, kampüs genelinde ödemeleri anında yönet.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/auth/register"
          className="w-full py-3 px-6 bg-[#00d186] hover:bg-[#00c07c] text-white text-center font-bold rounded-xl shadow-[0_4px_14px_rgba(0,209,134,0.39)] transform transition-transform active:scale-95"
        >
          Hesap Oluştur
        </Link>
        <Link
          href="/auth/login"
          className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-black border border-gray-200 text-center font-bold rounded-xl shadow-sm transform transition-transform active:scale-95"
        >
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}
