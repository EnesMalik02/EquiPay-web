import { create } from "zustand";
import { authApi } from "@/features/auth/api/authApi";
import { User } from "@/features/auth/model/types";

interface AuthState {
    user: User | null;
    loading: boolean;
    /** Fetches /auth/me only if user is not already in the store. */
    fetchUser: () => Promise<User | null>;
    setUser: (user: User | null) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    loading: false,

    setUser: (user) => set({ user }),

    clearUser: () => set({ user: null }),

    fetchUser: async () => {
        const existing = get().user;
        if (existing) return existing;

        set({ loading: true });
        try {
            const user = await authApi.me();
            set({ user, loading: false });
            return user;
        } catch {
            set({ loading: false });
            return null;
        }
    },
}));
