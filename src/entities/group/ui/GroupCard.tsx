"use client";

import { GroupResponse } from "../model/types";

interface GroupCardProps {
    group: GroupResponse;
    onClick: () => void;
}

export const GroupCard = ({ group, onClick }: GroupCardProps) => {
    return (
        <div
            onClick={onClick}
            className="min-w-[280px] bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all cursor-pointer"
        >
            <div>
                <h4 className="font-bold text-black pb-1">{group.name}</h4>
                {group.description && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">{group.description}</p>
                )}
                {group.member_count !== undefined && (
                    <span className="text-xs text-gray-400 font-medium">
                        {group.member_count} Üye
                    </span>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {new Date(group.created_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </div>
        </div>
    );
};
