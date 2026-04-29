"use client";

import Link from "next/link";
import Image from "next/image";
import { Receipt, Users, Zap, ArrowRight, TrendingUp, Wallet, Split } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";

const maxAmount = 890;

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
  const t = useTranslations("Landing");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const months = t.raw("months") as string[];

  const monthlyData = [
    { month: months[0], amount: 450 },
    { month: months[1], amount: 680 },
    { month: months[2], amount: 320 },
    { month: months[3], amount: 890 },
    { month: months[4], amount: 560 },
    { month: months[5], amount: 740 },
  ];

  const groups = [
    { name: t("group1Name"), total: 1240, members: 4, you: 310, color: "var(--primary)" },
    { name: t("group2Name"), total: 3800, members: 6, you: 633, color: "#6c63ff" },
    { name: t("group3Name"), total: 580,  members: 3, you: 193, color: "#f59e0b" },
  ];

  const stats = [
    { label: t("statTotalExpense"), value: 5620, suffix: "₺", icon: Wallet },
    { label: t("statActiveGroup"),  value: 3,    suffix: "",  icon: Users  },
    { label: t("statSaving"),       value: 420,  suffix: "₺", icon: Split  },
  ];

  const features = [
    { icon: Users,   label: t("feat1Label"), desc: t("feat1Desc") },
    { icon: Receipt, label: t("feat2Label"), desc: t("feat2Desc") },
    { icon: Zap,     label: t("feat3Label"), desc: t("feat3Desc") },
  ];

  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* ── Scroll Navbar ─────────────────────────────────── */}
      <motion.nav
        initial={false}
        animate={scrolled ? { y: 0, opacity: 1 } : { y: -64, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(247, 247, 245, 0.92)",
          borderBottom: "1px solid var(--border-light)",
          boxShadow: "0 1px 0 var(--border), 0 4px 24px rgba(18,21,18,0.06)",
        }}
      >
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="EquiPay" width={28} height={28} style={{ borderRadius: 8 }} />
            <span className="text-base font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
              EquiPay
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link
              href="/auth/register"
              className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              style={{
                background: "var(--primary)",
                color: "#fff",
                boxShadow: "0 1px 4px rgba(31,138,76,0.25)",
              }}
            >
              {t("navbarCta")}
            </Link>
          </div>
        </div>
      </motion.nav>

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

      {/* ── Hero ──────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-20 pb-6 max-w-5xl mx-auto w-full">

        {/* Floating logo */}
        <div className="animate-scale-in animate-float mb-7" style={{ animationDelay: "80ms" }}>
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center p-2"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              boxShadow: "0 8px 32px rgba(0,209,134,0.22), var(--shadow-md)",
            }}
          >
            <Image src="/logo.png" alt="EquiPay" width={72} height={72} style={{ borderRadius: 12 }} />
          </div>
        </div>

        {/* Language switcher — top right of hero */}
        <div className="absolute top-6 right-6">
          <LocaleSwitcher />
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h1
            className="text-[42px] sm:text-[58px] font-black leading-[1.08] tracking-tight mb-3 animate-slide-up"
            style={{ animationDelay: "160ms", color: "var(--foreground)" }}
          >
            {t("heroLine1")}
          </h1>
          <h1
            className="text-[42px] sm:text-[58px] font-black leading-[1.08] tracking-tight animate-slide-up"
            style={{ animationDelay: "200ms", color: "var(--primary)" }}
          >
            {t("heroLine2")}
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
          {t("subtitle")}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-row gap-3 animate-slide-up" style={{ animationDelay: "320ms" }}>
          <Link
            href="/auth/register"
            className="flex items-center gap-2 py-3 px-7 font-semibold rounded-xl transition-all active:scale-95 cursor-pointer group text-sm"
            style={{
              background: "var(--primary)",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(31,138,76,0.30), 0 1px 3px rgba(31,138,76,0.20)",
            }}
          >
            {t("ctaRegister")}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center py-3 px-7 font-semibold rounded-xl transition-all active:scale-95 cursor-pointer text-sm"
            style={{
              background: "var(--surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 3px rgba(18,21,18,0.06)",
            }}
          >
            {t("ctaLogin")}
          </Link>
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
            {t("sectionTitle")}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {t("sectionSub")}
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
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{t("chartTitle")}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("chartSubtitle")}</p>
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
                const isActive = i === 3;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5" style={{ height: "100%" }}>
                    <div className="flex-1 flex items-end w-full">
                      <div className="w-full relative" style={{ height: `${heightPct}%` }}>
                        <motion.div
                          className="w-full h-full rounded-t-lg"
                          style={{ background: isActive ? "var(--primary)" : "var(--primary-light)", transformOrigin: "bottom" }}
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

            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("chartThisMonth")}</p>
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
                      style={{ background: `${color === "var(--primary)" ? "rgba(0,209,134,0.12)" : color + "22"}` }}
                    >
                      <Users className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{name}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {t("groupPeople", { count: members })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color: "var(--foreground)" }}>
                      {total.toLocaleString("tr-TR")} ₺
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t("groupTotal")}</p>
                  </div>
                </div>

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
                  {t("groupYourShare")} <span className="font-semibold" style={{ color }}>{you} ₺</span>
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
          {t("footer")}
        </p>
      </footer>
    </div>
  );
}
