"use client";

import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { GroupList } from "@/widgets/group-list/ui/GroupList";
import { ArrowUpRight, Utensils, ShoppingBag } from "lucide-react";

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#ffffff] text-gray-900 font-sans pb-32">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 pt-12">
                {/* Balance Section */}
                <div className="mb-14">
                    <h2 className="text-gray-400 font-medium text-xs tracking-widest uppercase mb-2">Net Durumun</h2>
                    <div className="flex items-center gap-4">
                        <h1 className="text-6xl font-extrabold tracking-tight text-black">₺1.250,40</h1>
                        <div className="flex items-center gap-1 bg-[#f0fdf4] text-[#00d186] px-3 py-1.5 rounded-full font-semibold text-xs border border-[#dcfce7]">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            ALACAKLISIN
                        </div>
                    </div>
                    <p className="text-gray-500 mt-4 text-sm leading-relaxed max-w-sm">
                        Şu anda kampüs genelinde <span className="font-semibold text-black">4 aktif grupta</span> toplam bakiyen bulunuyor.
                    </p>
                </div>

                {/* Active Groups */}
                <GroupList />

                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-black">Son Hareketler</h3>
                        <button className="text-gray-400 font-bold text-[10px] tracking-widest uppercase hover:text-gray-600 transition-colors">Tümünü Gör</button>
                    </div>

                    <div className="space-y-4">
                        {/* Transaction 1 */}
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#f0fdf4] flex items-center justify-center text-[#00d186]">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-black">Burger King</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">Dün, 20:45 • Yemek Takımı</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-black">₺240,00</p>
                                <p className="text-[10px] font-bold text-[#00d186] uppercase tracking-wider mt-0.5">Sen Ödedin</p>
                            </div>
                        </div>

                        {/* Transaction 2 */}
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-black">Market Alışverişi</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">2 gün önce • Ev Masrafları</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm text-black">₺560,00</p>
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">Payın: ₺140,00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};
