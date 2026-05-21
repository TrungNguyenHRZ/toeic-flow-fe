import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export async function signInWithEmailPassword(params: {
  email: string;
  password: string;
}): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) {
    throw new Error(error.message ?? "Login failed");
  }

  if (!data.user) {
    throw new Error("Login failed");
  }

  return data.user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
