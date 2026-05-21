import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { signInWithEmailPassword, signOut } from "@/services/auth-service";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  errorMessage: string | null;

  initAuth: () => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  errorMessage: null,

  setUser: (user) => {
    set({ user, errorMessage: null });
  },

  initAuth: async () => {
    const { initialized, loading } = get();
    if (initialized || loading) return;

    set({ initialized: true, loading: true, errorMessage: null });

    try {
      const { data } = await supabase.auth.getSession();
      set({ user: data.session?.user ?? null });

      // Subscribe for future auth changes (singleton store lifetime in V1).
      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          set({ user: session?.user ?? null });
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void sub;
    } catch (e) {
      set({
        user: null,
        errorMessage:
          e instanceof Error ? e.message : "Auth initialization failed.",
      });
    } finally {
      // Critical: always resolve initialization, even when no active session exists.
      set({ loading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, errorMessage: null });
    try {
      const signedInUser = await signInWithEmailPassword({
        email,
        password,
      });
      set({ user: signedInUser, errorMessage: null });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Login failed. Please try again.";
      set({ user: null, errorMessage: message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, errorMessage: null });
    try {
      await signOut();
      set({ user: null });
    } catch {
      set({ errorMessage: "Logout failed. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
}));
