import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { useAuthStore, type UserRole } from "@/stores/auth-store";

export function RoleProtectedRoute(props: {
  allowRoles: UserRole[];
  children: React.ReactNode;
}) {
  const { allowRoles, children } = props;

  const location = useLocation();
  const initAuth = useAuthStore((s) => s.initAuth);
  const initialized = useAuthStore((s) => s.initialized);
  const authLoading = useAuthStore((s) => s.loading);

  const role = useAuthStore((s) => s.role);
  const roleLoading = useAuthStore((s) => s.roleLoading);

  useEffect(() => {
    void initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized || authLoading || roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!useAuthStore.getState().user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!role || !allowRoles.includes(role)) {
    // Safe redirect:
    // - admin: should not happen because allowRoles check failed
    // - teacher: redirect away to teacher dashboard
    // - unknown: redirect to login to avoid blank/crash
    return <Navigate to={role === "teacher" ? "/teacher" : "/login"} replace />;
  }

  return <>{children}</>;
}
