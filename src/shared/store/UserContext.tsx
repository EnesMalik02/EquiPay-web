"use client";

import { createContext, useContext } from "react";
import { User } from "@/features/auth/model/types";

const UserContext = createContext<User | null>(null);

export const UserProvider = ({
    user,
    children,
}: {
    user: User | null;
    children: React.ReactNode;
}) => {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = (): User | null => {
    return useContext(UserContext);
};
