import { Navbar } from "@/widgets/navbar/ui/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
            <Navbar />
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}
