export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Recovery and moderation tools will appear here.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        Admin tools (coming soon). This page is currently a placeholder for
        admin-only functionality.
      </div>
    </div>
  );
}
