"use client";

import { LayoutDashboard, Users, Plus, BarChart2, User } from "lucide-react";

export const BottomNav = () => {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white px-8 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center gap-8">

                <button className="flex flex-col items-center gap-1 group">
                    <LayoutDashboard className="w-6 h-6 text-[#00d186]" />
                    <span className="text-[10px] font-bold text-[#00d186] uppercase tracking-wider">Panel</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <Users className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider transition-colors">Gruplar</span>
                </button>

                <button className="w-12 h-12 bg-black hover:bg-gray-800 transition-colors rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-95">
                    <Plus className="w-6 h-6" />
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <BarChart2 className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider transition-colors">Özet</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <User className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-[10px] font-semibold text-gray-400 group-hover:text-gray-600 uppercase tracking-wider transition-colors">Profil</span>
                </button>

            </div>
        </div>
    );
};
