"use client";

import { Search, Bell } from "lucide-react";

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4">
            {/* Logo & Links */}
            <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#00d186] rounded-lg flex items-center justify-center text-white font-bold text-xl leading-none">
                        {/* Custom logo icon resembling the image */}
                        <svg
                            width="18"
                            height="18"
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
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Paylaş</span>
                </div>

                <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
                    <a href="#" className="text-[#00d186] font-semibold">
                        Paneller
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                        Arkadaşlar
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                        Geçmiş
                    </a>
                </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <div className="relative hidden md:block w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="İşlem ara..."
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-[#00d186]/20 transition-all rounded-full py-2 pl-9 pr-4 text-sm outline-none text-gray-700"
                    />
                </div>

                <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                </button>

                <button className="w-9 h-9 rounded-full bg-orange-100 ring-2 ring-white border border-orange-200 overflow-hidden flex items-center justify-center">
                    <div className="w-4 h-5 border-2 border-orange-300 rounded-sm relative">
                        <div className="w-1 h-1 bg-orange-300 rounded-full absolute top-1 left-1/2 -translate-x-1/2"></div>
                    </div>
                </button>
            </div>
        </header>
    );
};
