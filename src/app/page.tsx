"use client";

import Link from "next/link";
import { Receipt, Users, Zap, ArrowRight, TrendingUp, Wallet, Split } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

// ── Mock data ────────────────────────────────────────────
const monthlyData = [
  { month: "Oca", amount: 450 },
  { month: "Şub", amount: 680 },
  { month: "Mar", amount: 320 },
  { month: "Nis", amount: 890 },
  { month: "May", amount: 560 },
  { month: "Haz", amount: 740 },
];

const groups = [
  { name: "Ev Arkadaşları", total: 1240, members: 4, you: 310, color: "var(--primary)" },
  { name: "Tatil Grubu",    total: 3800, members: 6, you: 633, color: "#6c63ff" },
  { name: "Kampüs",         total: 580,  members: 3, you: 193, color: "#f59e0b" },
];

const stats = [
  { label: "Toplam Harcama",  value: 5620, suffix: "₺", icon: Wallet },
  { label: "Aktif Grup",      value: 3,    suffix: "",  icon: Users  },
  { label: "Kişi Başı Tasarruf", value: 420, suffix: "₺", icon: Split  },
];

const features = [
  { icon: Users,   label: "Grup Harcamaları", desc: "Arkadaş grupları oluştur, harcamaları kolayca böl." },
  { icon: Receipt, label: "Anlık Takip",       desc: "Kimin ne kadar borçlu olduğunu anında gör." },
  { icon: Zap,     label: "Hızlı Hesaplama",   desc: "Karmaşık bölüşmeler saniyeler içinde çözülür." },
];

const maxAmount = Math.max(...monthlyData.map((d) => d.amount));

// ── Animated counter ─────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return ctrl.stop;
  }, [inView, value]);

  return <span ref={ref}>{display.toLocaleString("tr-TR")}</span>;
}

// ── Page ─────────────────────────────────────────────────
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
      className="relative overflow-hidden flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 w-[320px] h-[320px] rounded-full opacity-[0.18] animate-blob"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-[55%] -left-28 w-[300px] h-[300px] rounded-full opacity-[0.10] animate-blob"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)", animationDelay: "3s" }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5 animate-scale-in" style={{ animationDelay: "0ms" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)", boxShadow: "0 4px 14px rgba(0,209,134,0.40)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="M8 12h8" /><path d="M12 8v8" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
            Paylaş
          </span>
        </div>

        <nav className="flex items-center gap-2 animate-scale-in" style={{ animationDelay: "60ms" }}>
          {isAuthenticated ? (
            <Link
              href="/home"
              className="text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
              style={{ background: "var(--primary)", color: "#fff", boxShadow: "0 2px 10px rgba(0,209,134,0.35)" }}
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
                style={{ background: "var(--primary)", color: "#fff", boxShadow: "0 2px 10px rgba(0,209,134,0.35)" }}
              >
                Başla
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-14 pb-6 max-w-5xl mx-auto w-full">

        {/* Floating logo */}
        <div className="animate-scale-in animate-float mb-7" style={{ animationDelay: "80ms" }}>
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
              <path d="M8 12h8" /><path d="M12 8v8" />
            </svg>
          </div>
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
          className="text-base sm:text-lg text-center max-w-md leading-relaxed mb-9 animate-slide-up"
          style={{ animationDelay: "280ms", color: "var(--text-secondary)" }}
        >
          Arkadaşlarınla hesaplaşmanın en akıllı yolu. Grup oluştur, harcama ekle, bakiyeni gör.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm animate-slide-up" style={{ animationDelay: "320ms" }}>
          {isAuthenticated ? (
            <Link
              href="/home"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer group"
              style={{ background: "var(--primary)", color: "#fff", boxShadow: "0 4px 20px rgba(0,209,134,0.40)" }}
            >
              Hesabıma Git
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/register"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer group"
                style={{ background: "var(--primary)", color: "#fff", boxShadow: "0 4px 20px rgba(0,209,134,0.40)" }}
              >
                Hesap Oluştur
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login"
                className="flex-1 flex items-center justify-center py-3.5 px-6 font-bold rounded-2xl transition-all active:scale-95 cursor-pointer"
                style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
              >
                Giriş Yap
              </Link>
            </>
          )}
        </div>
      </main>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 pt-14 pb-4 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, suffix, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-2xl p-4 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: "var(--primary-light)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--primary)" }} />
              </div>
              <p className="text-xl sm:text-2xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>
                <AnimatedNumber value={value} />{suffix}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Dashboard Preview ──────────────────────────────── */}
      <section className="relative z-10 px-6 pt-10 pb-6 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-black mb-1.5" style={{ color: "var(--foreground)" }}>
            Harcamalarını Görsel Takip Et
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Aylık grafikler ve grup bakiyeleri tek ekranda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Bar Chart Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Aylık Harcamalar</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Son 6 ay · Haz en yüksek</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}
              >
                <TrendingUp className="w-3 h-3" />
                +32%
              </motion.div>
            </div>

            {/* Bars */}
            <div className="flex items-end gap-2" style={{ height: "140px" }}>
              {monthlyData.map(({ month, amount }, i) => {
                const heightPct = (amount / maxAmount) * 100;
                const isActive = i === 3; // Nisan - en yüksek
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5" style={{ height: "100%" }}>
                    <div className="flex-1 flex items-end w-full">
                      <div className="w-full relative" style={{ height: `${heightPct}%` }}>
                        <motion.div
                          className="w-full h-full rounded-t-lg"
                          style={{
                            background: isActive ? "var(--primary)" : "var(--primary-light)",
                            transformOrigin: "bottom",
                          }}
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.55, delay: 0.25 + i * 0.07, ease: "easeOut" }}
                        />
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-md"
                            style={{ background: "var(--primary)", color: "#fff" }}
                          >
                            {amount}₺
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{month}</span>
                  </div>
                );
              })}
            </div>

            {/* Chart footer */}
            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Bu ay toplam</p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="text-sm font-black"
                style={{ color: "var(--foreground)" }}
              >
                740 ₺
              </motion.p>
            </div>
          </motion.div>

          {/* Group Cards */}
          <div className="flex flex-col gap-3">
            {groups.map(({ name, total, members, you, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
                className="rounded-2xl p-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}22` }}
                    >
                      <Users className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{name}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{members} kişi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                      {total.toLocaleString("tr-TR")} ₺
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>toplam</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-light)" }}>
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${(you / total) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Senin payın: <span className="font-semibold" style={{ color }}>{you} ₺</span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────── */}
      <section className="relative z-10 px-6 pt-10 pb-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "var(--primary-light)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--primary)" }} />
              </div>
              <p className="text-sm font-extrabold mb-1" style={{ color: "var(--foreground)" }}>{label}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 text-center pt-8 pb-10">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          © 2025 Paylaş · Kampüs harcamalarını yönetmenin en kolay yolu
        </p>
      </footer>
    </div>
  );
}
