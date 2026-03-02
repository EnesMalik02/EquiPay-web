"use client";

import { Navbar } from "@/widgets/navbar/ui/Navbar";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { ArrowUpRight, MoreHorizontal, Plus, Utensils, ShoppingBag } from "lucide-react";

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

                {/* Active Groups Section */}
                <div className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-black">Aktif Gruplar</h3>
                        <button className="text-[#00d186] font-semibold text-sm hover:underline">Tümünü Yönet</button>
                    </div>

                    {/* Cards Scroll Container */}
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">

                        {/* Card 1 */}
                        <div className="min-w-[280px] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-xl">
                                    🏠
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div>
                                <h4 className="font-bold text-black pb-2">Ev Masrafları</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-[#f0fdf4] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#00d186]">+2</div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">4 Üye</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bakiyen</p>
                                <p className="text-[#00d186] font-bold text-lg">₺450,00 Alacak</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="min-w-[280px] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-xl">
                                    🍕
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div>
                                <h4 className="font-bold text-black pb-2">Kampüs Yemek</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">2 Üye</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bakiyen</p>
                                <p className="text-red-500 font-bold text-lg">₺120,50 Borç</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="min-w-[280px] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all cursor-pointer">
                            <div className="flex items-start justify-between mb-8">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
                                    ✈️
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div>
                                <h4 className="font-bold text-black pb-2">Antalya Tatili</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white"></div>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">3 Üye</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Bakiyen</p>
                                <p className="text-[#00d186] font-bold text-lg">₺800,00 Alacak</p>
                            </div>
                        </div>

                        {/* New Group Card */}
                        <button className="min-w-[150px] bg-white border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center hover:border-gray-200 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500 flex items-center justify-center mb-3 transition-colors">
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-gray-500 transition-colors">Yeni Grup</span>
                        </button>

                    </div>
                </div>

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
