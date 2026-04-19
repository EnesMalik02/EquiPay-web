"use client";

import Link from "next/link";
import { Receipt, Users, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  { icon: Users,     label: "Grup Harcamaları",  desc: "Arkadaş grupları oluştur, harcamaları kolayca böl." },
  { icon: Receipt,   label: "Anlık Takip",        desc: "Kimin ne kadar borçlu olduğunu anında gör." },
  { icon: Zap,       label: "Hızlı Hesaplama",    desc: "Karmaşık bölüşmeler saniyeler içinde çözülür." },
];

const badges = ["Ücretsiz", "Kolay Kurulum", "Kampüs Dostu"];

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const hasToken = cookies.some(
      (c) => c.startsWith("access_token=") || c.startsWith("refresh_token=")
    );
    setIsAuthenticated(hasToken);
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ── Decorative blobs ───────────────────────────── */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.18] animate-blob"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full opacity-[0.12] animate-blob"
        style={{
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />

      {/* ── Grid overlay ───────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5 animate-scale-in" style={{ animationDelay: "0ms" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)", boxShadow: "0 4px 14px rgba(0,209,134,0.40)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
            Paylaş
          </span>
        </div>

        <nav
          className="flex items-center gap-2 animate-scale-in"
          style={{ animationDelay: "60ms" }}
        >
          {isAuthenticated ? (
            <Link
              href="/home"
              className="text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
              style={{
                background: "var(--primary)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(0,209,134,0.35)",
              }}
            >
              Hesabım
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                Giriş Yap
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  boxShadow: "0 2px 10px rgba(0,209,134,0.35)",
                }}
              >
                Başla
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-12 max-w-5xl mx-auto w-full">

        {/* Floating logo icon */}
        <div
          className="animate-scale-in animate-float mb-8"
          style={{ animationDelay: "80ms" }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "0 8px 32px rgba(0,209,134,0.18), var(--shadow-md)",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
          </div>
        </div>

        {/* Badge pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-slide-up" style={{ animationDelay: "120ms" }}>
          {badges.map((b) => (
            <span
              key={b}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
                border: "1px solid var(--primary-border)",
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              {b}
            </span>
          ))}
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h1
            className="text-[42px] sm:text-[58px] font-black leading-[1.08] tracking-tight mb-3 animate-slide-up"
            style={{ animationDelay: "160ms", color: "var(--foreground)" }}
          >
            Harcamaları Kolayca
          </h1>
          <h1
            className="text-[42px] sm:text-[58px] font-black leading-[1.08] tracking-tight animate-slide-up"
            style={{ animationDelay: "200ms", color: "var(--primary)" }}
          >
            Böl & Takip Et
          </h1>

          {/* Accent underline */}
          <div className="flex justify-center mt-4 animate-slide-up" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-12 rounded-full animate-draw-line" style={{ background: "var(--primary)", animationDelay: "420ms" }} />
              <div className="h-1 w-5 rounded-full animate-draw-line" style={{ background: "var(--primary-border)", animationDelay: "480ms" }} />
              <div className="h-1 w-2.5 rounded-full animate-draw-line" style={{ background: "var(--border)", animationDelay: "530ms" }} />
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg text-center max-w-md leading-relaxed mb-10 animate-slide-up"
          style={{ animationDelay: "280ms", color: "var(--text-secondary)" }}
        >
          Arkadaşlarınla hesaplaşmanın en akıllı yolu. Grup oluştur, harcama ekle, bakiyeni gör.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm animate-slide-up"
          style={{ animationDelay: "320ms" }}
        >
          {isAuthenticated ? (
            <Link
              href="/home"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer group"
              style={{
                background: "var(--primary)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(0,209,134,0.40)",
              }}
            >
              Hesabıma Git
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/register"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer group"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(0,209,134,0.40)",
                }}
              >
                Hesap Oluştur
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login"
                className="flex-1 flex items-center justify-center py-3.5 px-6 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer"
                style={{
                  background: "var(--surface)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                Giriş Yap
              </Link>
            </>
          )}
        </div>

        {/* ── Feature cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-16">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <div
              key={label}
              className="rounded-2xl p-4 animate-slide-up"
              style={{
                animationDelay: `${380 + i * 60}ms`,
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "var(--primary-light)" }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: "var(--primary)" }} />
              </div>
              <p className="text-sm font-extrabold mb-1" style={{ color: "var(--foreground)" }}>{label}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer
        className="relative z-10 text-center pb-8 animate-slide-up"
        style={{ animationDelay: "560ms" }}
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © 2025 Paylaş · Kampüs harcamalarını yönetmenin en kolay yolu
        </p>
      </footer>
    </div>
  );
}
