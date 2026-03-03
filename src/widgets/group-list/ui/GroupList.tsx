"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { groupApi, GroupResponse, GroupCard } from "@/entities/group";
import { CreateGroupModal } from "@/features/create-group";

export const GroupList = () => {
    const router = useRouter();
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

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
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-black">Aktif Gruplar</h3>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-[#00d186] font-semibold text-sm hover:underline"
                    >
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
                        <div className="flex flex-col items-center justify-center w-full py-12 text-center">
                            <p className="text-gray-400 text-sm font-medium mb-4">Henüz grup yok.</p>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                onClick={() => router.push(`/groups/${group.id}`)}
                            />
                        ))
                    )}

                    {/* New Group Card */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="min-w-[150px] bg-white border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center hover:border-[#00d186]/40 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 group-hover:bg-[#f0fdf4] group-hover:text-[#00d186] flex items-center justify-center mb-3 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 group-hover:text-[#00d186] transition-colors">
                            Yeni Grup
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};
