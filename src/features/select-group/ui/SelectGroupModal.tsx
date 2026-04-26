"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users, ChevronRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { groupApi } from "@/entities/group/api/groupApi";
import { GroupWithStatsResponse } from "@/entities/group/model/types";

interface SelectGroupModalProps {
    onClose: () => void;
}

export const SelectGroupModal = ({ onClose }: SelectGroupModalProps) => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupWithStatsResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        groupApi
            .list()
            .then(setGroups)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const close = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSelect = (group: GroupWithStatsResponse) => {
        setVisible(false);
        setTimeout(() => {
            onClose();
            router.push(`/groups/${group.id}/expenses/new`);
        }, 250);
    };

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={close}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="relative w-full max-w-lg rounded-t-3xl shadow-2xl overflow-hidden"
                        style={{ background: "var(--background)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 380, damping: 38, mass: 1 }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div
                                className="w-9 h-1 rounded-full"
                                style={{ background: "var(--border)" }}
                            />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <div>
                                <p
                                    className="text-[10px] uppercase mb-0.5"
                                    style={{
                                        fontFamily: "var(--font-geist-mono, monospace)",
                                        color: "var(--text-muted)",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Harcama ekle
                                </p>
                                <h2
                                    className="text-[17px] font-semibold"
                                    style={{ color: "var(--foreground)", letterSpacing: "-0.3px" }}
                                >
                                    Grup seç
                                </h2>
                            </div>
                            <button
                                onClick={close}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Group list */}
                        <div className="overflow-y-auto flex-1 px-4 pb-8">
                            {loading ? (
                                <div className="space-y-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-[60px] rounded-2xl animate-pulse"
                                            style={{ background: "var(--surface-muted)" }}
                                        />
                                    ))}
                                </div>
                            ) : groups.length === 0 ? (
                                <div className="py-12 flex flex-col items-center gap-3 text-center">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ background: "var(--surface-muted)" }}
                                    >
                                        <Users className="w-5 h-5" style={{ color: "var(--text-placeholder)" }} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-[14px] font-semibold mb-1"
                                            style={{ color: "var(--foreground)" }}
                                        >
                                            Henüz grup yok
                                        </p>
                                        <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                                            Harcama eklemek için önce bir grup oluştur.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { close(); router.push("/groups"); }}
                                        className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-transform active:scale-95"
                                        style={{ background: "var(--primary)", color: "#000" }}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Grup oluştur
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="rounded-2xl overflow-hidden"
                                    style={{ border: "1px solid var(--border)" }}
                                >
                                    {groups.map((group, i) => (
                                        <button
                                            key={group.id}
                                            onClick={() => handleSelect(group)}
                                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-[var(--surface-alt)] cursor-pointer"
                                            style={{
                                                background: "var(--surface)",
                                                borderBottom: i < groups.length - 1 ? "1px solid var(--border-light)" : "none",
                                            }}
                                        >
                                            <div
                                                className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                                                style={{
                                                    background: "var(--primary-light)",
                                                    color: "var(--primary)",
                                                }}
                                            >
                                                <Users className="w-[15px] h-[15px]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-[14px] font-medium truncate"
                                                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                                                >
                                                    {group.name}
                                                </p>
                                                {group.member_count !== undefined && (
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                        {group.member_count} üye
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
