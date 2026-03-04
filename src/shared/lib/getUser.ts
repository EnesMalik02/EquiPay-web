import { User } from "@/features/auth/model/types";
import { serverApiClient } from "@/shared/api/serverApiClient";

export async function getUser(): Promise<User | null> {
    try {
        return await serverApiClient.get<User>("/auth/me");
    } catch {
        return null;
    }
}
