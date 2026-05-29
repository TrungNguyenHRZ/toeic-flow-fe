import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (user) {
    return (
      <div className="space-y-4">
        <div className="border border-slate-200 bg-white p-4 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Logged in as <span className="font-medium">{user.email}</span>
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={() => navigate("/teacher")} className="sm:w-auto">
              Go to Dashboard
            </Button>

            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={loading}
              className="sm:w-auto"
            >
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            TOEIC learning & exam features will be available in V1.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">ToeicFlow</h1>
        <p className="mt-1 text-sm text-slate-600">
          Teacher login is required for the dashboard.
        </p>

        <div className="mt-4">
          <Button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
