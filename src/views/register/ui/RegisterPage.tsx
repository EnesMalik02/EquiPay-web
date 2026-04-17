import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import Link from "next/link";

export const RegisterPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
             style={{ background: "var(--background)" }}>
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-[0.08]"
                 style={{ background: "var(--primary)" }} />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-[0.06]"
                 style={{ background: "var(--primary)" }} />

            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                     style={{ background: "var(--primary)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="4" />
                        <path d="M8 12h8" />
                        <path d="M12 8v8" />
                    </svg>
                </div>
                <Link href="/" className="text-xl font-bold tracking-tight cursor-pointer" style={{ color: "var(--foreground)" }}>
                    EquiPay
                </Link>
            </div>

            <RegisterForm />
        </div>
    );
};
