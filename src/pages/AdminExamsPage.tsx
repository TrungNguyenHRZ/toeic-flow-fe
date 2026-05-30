import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fetchExams, type Exam } from "@/services/exam-service";

function Badge(props: {
  tone: "emerald" | "slate" | "rose";
  children: React.ReactNode;
}) {
  const { tone, children } = props;

  const className =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      : tone === "rose"
        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
        : "bg-slate-50 text-slate-700 ring-1 ring-slate-200";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function AdminExamsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const rows = await fetchExams({});
        if (!mounted) return;
        setExams(rows);
      } catch {
        if (!mounted) return;
        toast.error("Failed to load exams.");
        setExams([]);
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
          <h1 className="text-lg font-semibold text-slate-900">Exams</h1>
          <p className="text-sm text-slate-600">
            Active exams (not soft-deleted). Read-only.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          {loading ? (
            <div className="text-sm text-slate-600">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="text-sm text-slate-600">No active exams found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 text-left font-medium text-slate-700 w-[20%]">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Title
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Deleted
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Created At
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-800">{exam.id}</td>
                      <td className="px-3 py-2 text-slate-800">{exam.title}</td>
                      <td className="px-3 py-2">
                        {exam.is_published ? (
                          <Badge tone="emerald">Published</Badge>
                        ) : (
                          <Badge tone="slate">Unpublished</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone="slate">Active</Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(exam.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigate(`/admin/exams/${exam.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
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
