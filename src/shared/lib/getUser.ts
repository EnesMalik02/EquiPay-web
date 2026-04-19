import { cache } from "react";
import { User } from "@/features/auth/model/types";
import { serverApiClient } from "@/shared/api/serverApiClient";

export const getUser = cache(async (): Promise<User | null> => {
    try {
        return await serverApiClient.get<User>("/auth/me");
    } catch {
        return null;
    }
});
