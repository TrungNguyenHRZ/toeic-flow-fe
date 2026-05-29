import { useEffect, useState } from "react";
import { toast } from "sonner";

import { fetchAccounts, type AdminAccount } from "@/services/admin-service";

export function AdminAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const rows = await fetchAccounts();
        if (!mounted) return;
        setAccounts(rows);
      } catch (e) {
        if (!mounted) return;
        toast.error("Failed to load accounts.");
        setAccounts([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900">Accounts</h1>
          <p className="text-sm text-slate-600">
            Lightweight list of teacher/admin accounts.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          {loading ? (
            <div className="text-sm text-slate-600">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-sm text-slate-600">No accounts found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-800">
                        {acc.email ?? <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            acc.role === "admin"
                              ? "bg-emerald-50 text-emerald-700"
                              : acc.role === "teacher"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-slate-50 text-slate-500",
                          ].join(" ")}
                        >
                          {acc.role ?? "unknown"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(acc.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
