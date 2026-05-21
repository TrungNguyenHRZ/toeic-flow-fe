import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const loading = useAuthStore((s) => s.loading);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/", { replace: true });
    } catch {
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Teacher Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {user?.email ?? "Teacher"}
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="secondary"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Teacher features (create exams/assignments, review submissions) will
          be added here in V1.
        </p>
      </div>
    </div>
  );
}
