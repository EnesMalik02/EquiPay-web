import { LoginForm } from "@/features/auth/ui/LoginForm";
import Link from "next/link";

export const LoginPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-gray-900 px-4">
            {/* Logo Header */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00d186] rounded-lg flex items-center justify-center text-white font-bold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="4" />
                        <path d="M8 12h8" />
                        <path d="M12 8v8" />
                    </svg>
                </div>
                <Link href="/" className="text-xl font-bold text-black tracking-tight cursor-pointer">Paylaş</Link>
            </div>

            <LoginForm />
        </div>
    );
};
