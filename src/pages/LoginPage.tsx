import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const roleLoading = useAuthStore((s) => s.roleLoading);

  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);

  const redirectedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    // Avoid flicker: only redirect after auth initialization + role fetch completes.
    if (!initialized || !user || roleLoading) return;

    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const nextPath = role === "admin" ? "/admin" : "/teacher";
    navigate(nextPath, { replace: true });
  }, [initialized, role, roleLoading, navigate, user]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      toast.success("Logged in successfully");
      // Navigation is handled by the effect once roleLoading resolves.
    } catch {
      toast.error("Email hoặc mật khẩu không chính xác");
      redirectedRef.current = false;
    }
  };

  if (initialized && user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-600">
        Redirecting...
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] px-4">
      <div className="mx-auto max-w-md pt-10 sm:pt-16">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center">
            <Button asChild variant="link" className="h-auto p-0 text-sm">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Teacher Login
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your email and password.
          </p>
        </div>

        <form
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="teacher@example.com"
              {...register("email")}
            />
            {errors.email?.message ? (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password?.message ? (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-xs text-slate-500">
            Only teacher/admin accounts can access the dashboard.
          </p>
        </form>
      </div>
    </div>
  );
}
