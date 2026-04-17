"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, UserX, Users } from "lucide-react";
import { BottomNav } from "@/widgets/bottom-nav/ui/BottomNav";
import { friendApi, FriendResponse, FriendRequestResponse } from "@/entities/friend";
import { UserAvatar, SkeletonListItem } from "@/shared/ui";
import { SendFriendRequestModal } from "@/features/send-friend-request";

type Tab = "friends" | "requests";

export const FriendsPage = () => {
    const [activeTab, setActiveTab] = useState<Tab>("friends");
    const [friends, setFriends] = useState<FriendResponse[]>([]);
    const [requests, setRequests] = useState<FriendRequestResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [actioningId, setActioningId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [f, r] = await Promise.all([friendApi.list(), friendApi.listPending()]);
            setFriends(f);
            setRequests(r);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRespond = async (id: string, action: "accept" | "reject") => {
        setActioningId(id);
        try {
            await friendApi.respond(id, action);
            await fetchData();
        } finally {
            setActioningId(null);
        }
    };

    const handleRemove = async (id: string) => {
        setActioningId(id);
        try {
            await friendApi.remove(id);
            setFriends((prev) => prev.filter((f) => f.friendship_id !== id));
        } finally {
            setActioningId(null);
        }
    };

    const tabs = [
        { id: "friends" as Tab, label: "Arkadaşlar", count: friends.length },
        { id: "requests" as Tab, label: "İstekler", count: requests.length },
    ];

    return (
        <div className="min-h-screen font-sans" style={{ background: "var(--background)" }}>
            {showModal && (
                <SendFriendRequestModal
                    onClose={() => setShowModal(false)}
                    onSent={() => { setShowModal(false); fetchData(); }}
                />
            )}

            <main className="max-w-5xl mx-auto px-6 pt-10">
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>Sosyal</p>
                        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>Arkadaşlar</h1>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                        style={{ background: "var(--primary)", boxShadow: "0 4px 12px rgba(0,209,134,0.3)" }}
                    >
                        <UserPlus className="w-4 h-4" />
                        Ekle
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b mb-8" style={{ borderColor: "var(--border-light)" }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                                activeTab === tab.id ? "border-[#00d186] text-black" : "border-transparent text-gray-400 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                                    tab.id === "requests" ? "bg-[#00d186] text-white" : "bg-gray-100 text-gray-500"
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonListItem key={i} />
                        ))}
                    </div>
                ) : activeTab === "friends" ? (
                    friends.length === 0 ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--surface-muted)" }}>
                                <Users className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
                            </div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Henüz arkadaşın yok.</p>
                            <button onClick={() => setShowModal(true)} className="text-sm font-bold underline" style={{ color: "var(--primary)" }}>
                                İlk arkadaşını ekle
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {friends.map((f) => (
                                <div
                                    key={f.friendship_id}
                                    className="flex items-center gap-4 p-4 rounded-2xl border"
                                    style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}
                                >
                                    <UserAvatar name={f.user.display_name ?? f.user.username} imageUrl={f.user.avatar_url} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-black truncate">
                                            {f.user.display_name ?? f.user.username ?? f.user.email}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{f.user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(f.friendship_id)}
                                        disabled={actioningId === f.friendship_id}
                                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        title="Arkadaşlıktan çıkar"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    requests.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Bekleyen istek yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {requests.map((r) => (
                                <div
                                    key={r.id}
                                    className="flex items-center gap-4 p-4 rounded-2xl border"
                                    style={{ background: "var(--surface)", borderColor: "var(--border-light)", boxShadow: "var(--shadow-sm)" }}
                                >
                                    <UserAvatar name={r.requester.display_name ?? r.requester.username} imageUrl={r.requester.avatar_url} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-black truncate">
                                            {r.requester.display_name ?? r.requester.username ?? r.requester.email}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{r.requester.email}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => handleRespond(r.id, "accept")}
                                            disabled={actioningId === r.id}
                                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                            title="Onayla"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRespond(r.id, "reject")}
                                            disabled={actioningId === r.id}
                                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            title="Reddet"
                                        >
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
            <BottomNav />
        </div>
    );
};
