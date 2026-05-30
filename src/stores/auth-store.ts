import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { signInWithEmailPassword, signOut } from "@/services/auth-service";
import type { User } from "@supabase/supabase-js";

export type UserRole = "teacher" | "admin";

type AuthState = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  roleLoading: boolean;
  initialized: boolean;
  errorMessage: string | null;

  initAuth: () => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setRoleLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  loading: false,
  roleLoading: false,
  initialized: false,
  errorMessage: null,

  setUser: (user) => {
    set({ user, errorMessage: null });
  },

  setRole: (role) => {
    set({ role });
  },

  setRoleLoading: (loading) => {
    set({ roleLoading: loading });
  },

  initAuth: async () => {
    const { initialized, loading } = get();
    if (initialized || loading) return;

    set({
      initialized: true,
      loading: true,
      errorMessage: null,
      roleLoading: false,
      role: null,
    });

    const fetchRoleForUser = async (userId: string) => {
      try {
        set({ roleLoading: true });

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error || !data?.role) {
          set({ role: null });
          return;
        }

        if (data.role === "teacher" || data.role === "admin") {
          const nextRole = data.role;
          set({ role: nextRole });
        } else {
          set({ role: null });
        }
      } catch {
        set({ role: null });
      } finally {
        set({ roleLoading: false });
      }
    };

    try {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      set({ user: sessionUser });

      if (sessionUser?.id) {
        void fetchRoleForUser(sessionUser.id);
      }

      // Subscribe for future auth changes (singleton store lifetime in V1).
      const { data: sub } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          const nextUser = session?.user ?? null;
          set({ user: nextUser, role: null });

          if (nextUser?.id) {
            void fetchRoleForUser(nextUser.id);
          } else {
            set({ roleLoading: false });
          }
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      void sub;
    } catch (e) {
      set({
        user: null,
        role: null,
        errorMessage:
          e instanceof Error ? e.message : "Auth initialization failed.",
      });
    } finally {
      // Critical: always resolve initialization, even when no active session exists.
      set({ loading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, errorMessage: null, role: null, roleLoading: false });
    try {
      const signedInUser = await signInWithEmailPassword({
        email,
        password,
      });

      set({ user: signedInUser, errorMessage: null });

      if (signedInUser?.id) {
        // Fetch role immediately to avoid admin route flicker after login.
        set({ roleLoading: true });
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", signedInUser.id)
          .single();

        if (!error && (data?.role === "teacher" || data?.role === "admin")) {
          const nextRole = data.role;
          set({ role: nextRole, roleLoading: false });
        } else {
          set({ role: null, roleLoading: false });
        }
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Login failed. Please try again.";
      set({ user: null, role: null, errorMessage: message });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, errorMessage: null, role: null, roleLoading: false });
    try {
      await signOut();
      set({ user: null, role: null });
    } catch {
      set({ errorMessage: "Logout failed. Please try again." });
    } finally {
      set({ loading: false, roleLoading: false });
    }
  },
}));
