"use client";

import { UserPlus } from "lucide-react";
import { UserAvatar } from "@/shared/ui";
import { GroupMemberResponse } from "@/entities/group/model/types";

interface MembersTabProps {
    members: GroupMemberResponse[];
    onAddMember: () => void;
}

export function MembersTab({ members, onAddMember }: MembersTabProps) {
    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                    Grup Üyeleri
                </h3>
                <button
                    onClick={onAddMember}
                    className="flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer"
                    style={{ color: "var(--primary)" }}
                >
                    <UserPlus className="w-4 h-4" />
                    Üye Ekle
                </button>
            </div>

            {members.length === 0 ? (
                <div className="py-10 text-center">
                    <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                        Henüz üye yok.
                    </p>
                </div>
            ) : (
                <div
                    className="rounded-[var(--radius-lg)] overflow-hidden"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                    {members.map((member, i) => (
                        <div
                            key={member.user_id}
                            className="flex items-center gap-4 px-5 py-3.5"
                            style={{
                                borderBottom: i < members.length - 1 ? "1px solid var(--border-light)" : "none",
                            }}
                        >
                            <UserAvatar
                                name={member.display_name ?? member.username ?? "?"}
                                size="md"
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="font-medium text-[13.5px]"
                                    style={{ color: "var(--foreground)", letterSpacing: "-0.2px" }}
                                >
                                    {member.display_name ?? member.username ?? "—"}
                                </p>
                                {member.username && (
                                    <p
                                        className="text-[11px] mt-0.5"
                                        style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--text-muted)" }}
                                    >
                                        @{member.username}
                                    </p>
                                )}
                            </div>
                            {member.role === "admin" && (
                                <span
                                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: "var(--primary-light)", color: "var(--primary-ink)" }}
                                >
                                    Admin
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
