"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { groupApi, GroupResponse, GroupCard } from "@/entities/group";
import { CreateGroupModal } from "@/features/create-group";
import { PrimaryButton } from "@/shared/ui";

interface GroupListProps {
    /** When provided, called instead of opening the internal modal (e.g. parent owns the button) */
    onNewGroup?: () => void;
}

export const GroupList = ({ onNewGroup }: GroupListProps) => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const openCreate = () => {
        if (onNewGroup) {
            onNewGroup();
        } else {
            setShowCreateModal(true);
        }
    };

    useEffect(() => {
        groupApi
            .list()
            .then(setGroups)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleGroupCreated = (group: GroupResponse) => {
        setGroups((prev) => [group, ...prev]);
        setShowCreateModal(false);
        router.push(`/groups/${group.id}`);
    };

    return (
        <>
            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleGroupCreated}
                />
            )}

            <div className="mb-14">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                        Aktif Gruplar
                    </h3>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                        style={{ background: "var(--foreground)", color: "#fff" }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Yeni Grup
                    </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[280px] bg-gray-50 border border-gray-100 rounded-3xl p-6 animate-pulse h-[160px]"
                            />
                        ))
                    ) : groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center w-full py-12 text-center gap-3">
                            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                                Henüz grup yok.
                            </p>
                            <PrimaryButton
                                variant="outline"
                                size="sm"
                                icon={<Plus className="w-3.5 h-3.5" />}
                                onClick={openCreate}
                            >
                                İlk grubu oluştur
                            </PrimaryButton>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <div key={group.id} className="min-w-[240px] w-[240px] shrink-0">
                                <GroupCard
                                    group={group}
                                    onClick={() => router.push(`/groups/${group.id}`)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};
