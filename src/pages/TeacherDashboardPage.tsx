import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useExamStore } from "@/stores/exam-store";

const createExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration_minutes: z
    .number()
    .int("Duration must be an integer")
    .positive("Duration must be greater than 0"),
});

type CreateExamValues = z.infer<typeof createExamSchema>;

function DeleteExamInline(props: {
  examId: string;
  onDelete: () => Promise<void>;
}) {
  const { examId: _examId, onDelete } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = "Delete this exam?";
  const description =
    "This is a soft delete. The exam will be removed from the list immediately.";

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        Delete Exam
      </Button>

      <AlertDialog
        open={open}
        title={title}
        description={description}
        confirmText="Delete"
        cancelText="Cancel"
        loading={loading}
        onCancel={() => {
          if (loading) return;
          setOpen(false);
        }}
        onConfirm={async () => {
          try {
            setLoading(true);
            await onDelete();
            setOpen(false);
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
}

export function TeacherDashboardPage() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const authLoading = useAuthStore((s) => s.loading);

  const {
    exams,
    loading: examsLoading,
    errorMessage,
    fetchExams,
    createExam,
    softDeleteExam,
    togglePublishExam,
  } = useExamStore();

  useEffect(() => {
    if (!user?.id) return;
    fetchExams({ createdBy: user.id });
  }, [fetchExams, user?.id]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: "",
      description: "",
      duration_minutes: 60,
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const onSubmit = async (values: CreateExamValues) => {
    if (!user?.id) return;

    await createExam({
      title: values.title,
      description: values.description,
      duration_minutes: values.duration_minutes,
      createdBy: user.id,
      is_published: false,
    });

    reset();
  };

  const isCreating = isSubmitting || examsLoading;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3  border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
          disabled={authLoading}
          className="w-full sm:w-auto"
        >
          {authLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>

      {/* Create exam */}
      <div className="flex flex-col gap-4   mx-auto w-full max-w-6xl ">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Exam
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a new TOEIC exam. Questions editor comes later.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="title"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. TOEIC Mock Test 1"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                {...register("title")}
              />
              {errors.title?.message ? (
                <p className="text-xs text-red-600">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Short description for students..."
                rows={4}
                className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                {...register("description")}
              />
              {errors.description?.message ? (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="duration_minutes"
              >
                Duration (minutes)
              </label>
              <input
                id="duration_minutes"
                type="number"
                inputMode="numeric"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                {...register("duration_minutes", { valueAsNumber: true })}
              />
              {errors.duration_minutes?.message ? (
                <p className="text-xs text-red-600">
                  {errors.duration_minutes.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? "Creating..." : "Create Exam"}
            </Button>

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </form>
        </div>

        {/* Exams list */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your Exams</h2>
            <Button
              type="button"
              variant="secondary"
              disabled={!user?.id || examsLoading}
              onClick={() => user?.id && fetchExams({ createdBy: user.id })}
            >
              {examsLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>

          {examsLoading ? (
            <div className="py-6 text-sm text-slate-600">Loading exams...</div>
          ) : exams.length === 0 ? (
            <div className="py-6 text-sm text-slate-600">
              No exams yet. Create your first exam above.
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {exam.title}
                      </p>
                      <p className="text-sm text-slate-600">
                        {exam.duration_minutes} minutes
                      </p>

                      <span
                        className={
                          exam.is_published
                            ? "mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                            : "mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                        }
                      >
                        {exam.is_published ? "Published" : "Unpublished"}
                      </span>

                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <div>
                          Part 5:{" "}
                          <span className="font-medium text-slate-800">
                            {exam.question_summary?.[5] ?? 0}
                          </span>{" "}
                          questions
                        </div>
                        <div>
                          Part 6:{" "}
                          <span className="font-medium text-slate-800">
                            {exam.question_summary?.[6] ?? 0}
                          </span>{" "}
                          questions
                        </div>
                        <div>
                          Part 7:{" "}
                          <span className="font-medium text-slate-800">
                            {exam.question_summary?.[7] ?? 0}
                          </span>{" "}
                          questions
                        </div>
                      </div>
                    </div>
                  </div>

                  {exam.description ? (
                    <p className="mt-2 text-sm text-slate-600">
                      {exam.description}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto sm:flex-1"
                      onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                    >
                      Manage Questions
                    </Button>

                    <div className="flex flex-wrap w-full gap-2 sm:w-auto">
                      {exam.is_published ? (
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          disabled={examsLoading}
                          onClick={() => {
                            void togglePublishExam({
                              examId: exam.id,
                              isPublished: false,
                            });
                          }}
                        >
                          Unpublish
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full sm:w-auto"
                          disabled={examsLoading}
                          onClick={() => {
                            void togglePublishExam({
                              examId: exam.id,
                              isPublished: true,
                            });
                          }}
                        >
                          Publish
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        disabled={!exam.is_published || examsLoading}
                        title={
                          exam.is_published
                            ? "Copy exam share link"
                            : "Publish exam first"
                        }
                        onClick={async () => {
                          if (!exam.is_published) return;

                          const url = `${window.location.origin}/exam/${exam.id}`;
                          try {
                            await navigator.clipboard.writeText(url);
                            toast.success("Exam link copied successfully");
                          } catch {
                            toast.error("Failed to copy exam link");
                          }
                        }}
                      >
                        Share Exam
                      </Button>

                      <DeleteExamInline
                        examId={exam.id}
                        onDelete={async () => {
                          await softDeleteExam({ examId: exam.id });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
