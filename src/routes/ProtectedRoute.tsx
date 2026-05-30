import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const initAuth = useAuthStore((s) => s.initAuth);
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    void initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
