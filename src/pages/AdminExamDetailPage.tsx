import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import {
  fetchAdminExamDetail,
  restoreDeletedExam,
  type AdminExamDetail,
  type AdminQuestionRow,
} from "@/services/admin-service";
import { Button } from "@/components/ui/button";

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

function QuestionCard(props: { q: AdminQuestionRow }) {
  const { q } = props;

  const correctLabel = useMemo(() => {
    // The question-service uses correct_answer type "A"|"B"|"C"|"D"
    return q.correct_answer;
  }, [q.correct_answer]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone="slate">Part {q.part}</Badge>
            {q.question_order > 0 ? (
              <span className="text-xs text-slate-500">
                Question {q.question_order}
              </span>
            ) : null}
          </div>
          <div className="mt-3 whitespace-pre-wrap text-sm text-slate-900">
            {q.question_text ?? "(No question text)"}
          </div>

          {q.image_url ? (
            <div className="mt-3">
              <img
                src={q.image_url}
                alt="Question media"
                className="max-h-64 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
                loading="lazy"
                onError={(e) => {
                  // prevent broken image icon and avoid layout issues
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs font-medium text-slate-600">Options</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["A", q.option_a],
              ["B", q.option_b],
              ["C", q.option_c],
              ["D", q.option_d],
            ] as const
          ).map(([label, text]) => {
            const isCorrect = correctLabel === label;
            return (
              <div
                key={label}
                className={[
                  "rounded-lg border px-3 py-2 text-sm",
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white",
                ].join(" ")}
              >
                <div className="flex items-baseline gap-2">
                  <div className="font-semibold text-slate-900">{label}.</div>
                  <div className="text-slate-800">{text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {q.explanation ? (
        <div className="mt-4">
          <div className="text-xs font-medium text-slate-600">Explanation</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-900">
            {q.explanation}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminExamDetailPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<AdminExamDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    if (!examId) {
      setLoading(false);
      setErrorMessage("Invalid exam id.");
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const detail = await fetchAdminExamDetail(examId);
        if (!mounted) return;
        setExam(detail);
      } catch (e) {
        if (!mounted) return;
        setExam(null);
        setErrorMessage("Failed to load exam detail.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [examId]);

  const isDeleted = exam?.deleted_at != null;
  const questions = exam?.questions ?? [];

  const handleRestore = async () => {
    if (!examId) return;

    try {
      setRestoreLoading(true);
      await restoreDeletedExam({ examId });
      toast.success("Exam restored successfully");
      setRestoreOpen(false);
      navigate("/admin/exams");
    } catch {
      toast.error("Failed to restore exam");
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="text-sm text-slate-600">Loading exam detail...</div>
        ) : errorMessage ? (
          <div className="text-sm text-rose-700">{errorMessage}</div>
        ) : !exam ? (
          <div className="text-sm text-slate-600">Exam not found.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <h1 className="text-lg font-semibold text-slate-900">
                  {exam.title}
                </h1>
                {exam.description ? (
                  <p className="text-sm text-slate-600">{exam.description}</p>
                ) : (
                  <p className="text-sm text-slate-500">No description.</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={exam.is_published ? "emerald" : "slate"}>
                  {exam.is_published ? "Published" : "Unpublished"}
                </Badge>
                <Badge tone={isDeleted ? "rose" : "slate"}>
                  {isDeleted ? "Deleted" : "Active"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-600">
                  Duration
                </div>
                <div className="mt-1 text-sm text-slate-900">
                  {exam.duration_minutes} minutes
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-medium text-slate-600">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-900">
                  {new Date(exam.created_at).toLocaleString()}
                </div>
              </div>
              {exam.deleted_at ? (
                <div className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <div className="text-xs font-medium text-rose-800">
                    Deleted At
                  </div>
                  <div className="mt-1 text-sm text-rose-900">
                    {new Date(exam.deleted_at).toLocaleString()}
                  </div>
                </div>
              ) : null}
            </div>

            {isDeleted ? (
              <div className="flex justify-start">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRestoreOpen(true)}
                >
                  Restore Exam
                </Button>

                <AlertDialog
                  open={restoreOpen}
                  title="Restore this exam?"
                  description="This will mark the exam as active again (deleted_at set to null). It will not change its publish state."
                  confirmText={restoreLoading ? "Restoring..." : "Restore"}
                  cancelText="Cancel"
                  loading={restoreLoading}
                  onConfirm={() => {
                    void handleRestore();
                  }}
                  onCancel={() => setRestoreOpen(false)}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Questions</h2>
          <p className="text-sm text-slate-600">Read-only inspection UI.</p>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-slate-600">
            Loading questions...
          </div>
        ) : exam && questions.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600">
            No questions found for this exam.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {questions.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500">
        <button
          type="button"
          className="underline underline-offset-4 hover:text-slate-700"
          onClick={() => navigate("/admin/exams")}
        >
          Back to Exams
        </button>
      </div>
    </div>
  );
}
