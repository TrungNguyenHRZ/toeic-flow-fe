import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useQuestionStore } from "@/stores/question-store";
import type { CorrectAnswer, Question } from "@/services/question-service";

const questionFormSchema = z
  .object({
    // MVP: only Part 5 is supported, but we show disabled options in the UI.
    part: z.literal(5),
    question_text: z.string().trim().default(""),
    image_url: z.string().trim().default(""),
    option_a: z.string().trim().min(1, "Option A is required"),
    option_b: z.string().trim().min(1, "Option B is required"),
    option_c: z.string().trim().min(1, "Option C is required"),
    option_d: z.string().trim().min(1, "Option D is required"),
    correct_answer: z.enum(["A", "B", "C", "D"]),
    explanation: z.string().trim().default(""),
  })
  .refine(
    (v) => {
      return v.question_text.trim().length > 0 || v.image_url.trim().length > 0;
    },
    {
      message: "Provide at least question text or an image URL.",
      path: ["question_text"],
    },
  );

type QuestionFormValues = z.infer<typeof questionFormSchema>;

function toNullable(s: string) {
  const trimmed = s.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function optionText(q: Question, label: CorrectAnswer) {
  if (label === "A") return q.option_a;
  if (label === "B") return q.option_b;
  if (label === "C") return q.option_c;
  return q.option_d;
}

function QuestionImage(props: { src: string; alt: string }) {
  const { src, alt } = props;
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="mt-2 flex min-h-48 items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
        Image failed to load
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-h-64 w-full rounded-md object-contain bg-white"
      onError={() => setHasError(true)}
    />
  );
}

export function ExamDetailPage() {
  const { examId } = useParams();

  const {
    questions,
    loading,
    errorMessage,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogLoading, setDeleteDialogLoading] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const editingQuestion = useMemo(
    () => questions.find((q) => q.id === editingId) ?? null,
    [questions, editingId],
  );

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema) as unknown as never,
    defaultValues: {
      part: 5,
      question_text: "",
      image_url: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      explanation: "",
    },
  });

  const { reset, handleSubmit, register, formState, watch } = form;

  useEffect(() => {
    if (!examId) return;
    void fetchQuestions({ examId });
  }, [examId, fetchQuestions]);

  useEffect(() => {
    if (!editingQuestion) return;

    reset({
      part: 5,
      question_text: editingQuestion.question_text ?? "",
      image_url: editingQuestion.image_url ?? "",
      option_a: editingQuestion.option_a,
      option_b: editingQuestion.option_b,
      option_c: editingQuestion.option_c,
      option_d: editingQuestion.option_d,
      correct_answer: editingQuestion.correct_answer,
      explanation: editingQuestion.explanation ?? "",
    });
  }, [editingQuestion, reset]);

  const onSubmit = async (values: QuestionFormValues) => {
    if (!examId) return;

    const question_text = toNullable(values.question_text);
    const image_url = toNullable(values.image_url);
    const explanation = toNullable(values.explanation);

    const highestOrder = questions.reduce(
      (max, q) => Math.max(max, q.question_order),
      0,
    );
    const question_order = editingId
      ? (editingQuestion?.question_order ?? highestOrder + 1)
      : highestOrder + 1;

    try {
      if (editingId) {
        await updateQuestion({
          questionId: editingId,
          question_order,
          part: 5 as const,
          question_text,
          image_url,
          option_a: values.option_a,
          option_b: values.option_b,
          option_c: values.option_c,
          option_d: values.option_d,
          correct_answer: values.correct_answer,
          explanation,
        });

        setEditingId(null);
        reset();
        toast.success("Question updated successfully");
      } else {
        await createQuestion({
          examId,
          question_order,
          part: 5 as const,
          question_text,
          image_url,
          option_a: values.option_a,
          option_b: values.option_b,
          option_c: values.option_c,
          option_d: values.option_d,
          correct_answer: values.correct_answer,
          explanation,
        });

        reset();
        toast.success("Question created successfully");
      }
    } catch {
      // store/toast already handles errors
    }
  };

  const handleClearForm = () => {
    setEditingId(null);
    setDeleteQuestionId(null);
    setDeleteDialogOpen(false);
    reset({
      part: 5,
      question_text: "",
      image_url: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
      explanation: "",
    });
  };

  const requestDelete = (questionId: string) => {
    setDeleteQuestionId(questionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteQuestionId) return;

    try {
      setDeleteDialogLoading(true);
      await deleteQuestion({ questionId: deleteQuestionId });

      if (editingId === deleteQuestionId) {
        setEditingId(null);
        reset({
          part: 5,
          question_text: "",
          image_url: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "A",
          explanation: "",
        });
      }
    } catch {
      // store already handles errors
    } finally {
      setDeleteDialogLoading(false);
      setDeleteDialogOpen(false);
      setDeleteQuestionId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  if (!examId) {
    return (
      <div className="py-10 text-sm text-slate-600">Missing examId in URL.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              TOEIC Part 5 Questions
            </h1>
            <p className="mt-1 text-sm text-slate-600">Exam ID: {examId}</p>
          </div>
          <div className="text-sm text-slate-600">
            {loading ? "Loading..." : `${questions.length} questions`}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Question" : "Create Question"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Provide either question text or an image URL (or both).
          </p>

          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit as never)(e);
            }}
          >
            {/* part selector */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-800"
                htmlFor="part"
              >
                Part
              </label>

              <select
                id="part"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                {...register("part")}
                disabled
              >
                <option value="5">Part 5</option>
                <option value="6" disabled>
                  Coming soon (Part 6)
                </option>
                <option value="7" disabled>
                  Coming soon (Part 7)
                </option>
              </select>

              <p className="text-xs text-slate-500">
                MVP supports Part 5 only.
              </p>
            </div>

            {/* question_text + image_url */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor="question_text"
                >
                  Question text (optional)
                </label>
                <textarea
                  id="question_text"
                  rows={4}
                  placeholder="e.g. Choose the best word to complete the sentence..."
                  className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  {...register("question_text")}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor="image_url"
                >
                  Image URL (optional)
                </label>
                <input
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/question-image.png"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  {...register("image_url")}
                />
                {formState.errors.question_text?.message ? (
                  <p className="text-xs text-red-600">
                    {formState.errors.question_text.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* image preview */}
            {watch("image_url")?.trim() ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-sm font-medium text-slate-800">
                  Image preview
                </div>
                <img
                  src={watch("image_url")}
                  alt="Question preview"
                  className="max-h-72 w-full rounded-md object-contain bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            ) : null}

            {/* options */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  ["option_a", "Option A"],
                  ["option_b", "Option B"],
                  ["option_c", "Option C"],
                  ["option_d", "Option D"],
                ] as const
              ).map(([name, label]) => (
                <div key={name} className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-800"
                    htmlFor={name}
                  >
                    {label}
                  </label>
                  <input
                    id={name}
                    type="text"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    {...register(name)}
                  />
                  {formState.errors[name]?.message ? (
                    <p className="text-xs text-red-600">
                      {formState.errors[name]?.message}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            {/* correct_answer + explanation */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor="correct_answer"
                >
                  Correct answer
                </label>
                <select
                  id="correct_answer"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  {...register("correct_answer")}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
                {formState.errors.correct_answer?.message ? (
                  <p className="text-xs text-red-600">
                    {formState.errors.correct_answer.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-800"
                  htmlFor="explanation"
                >
                  Explanation (optional)
                </label>
                <textarea
                  id="explanation"
                  rows={3}
                  placeholder="Explain why the correct answer is correct..."
                  className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  {...register("explanation")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" className="w-full sm:w-auto">
                {editingId ? "Save Changes" : "Create"}
              </Button>

              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              ) : null}

              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleClearForm}
              >
                Clear Form
              </Button>
            </div>

            <AlertDialog
              open={deleteDialogOpen}
              title="Delete this question?"
              description="This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              loading={deleteDialogLoading}
              onCancel={() => {
                if (deleteDialogLoading) return;
                setDeleteDialogOpen(false);
                setDeleteQuestionId(null);
              }}
              onConfirm={handleConfirmDelete}
            />

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </form>
        </div>

        {/* List */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
            <div className="text-sm text-slate-600">
              {loading ? "Loading..." : `${questions.length} total`}
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-sm text-slate-600">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-6 text-sm text-slate-600">No questions yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {q.question_order}.{" "}
                        <span className="text-slate-700">
                          {q.question_text ? q.question_text : "— (image only)"}
                        </span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          Part {q.part}
                        </span>
                      </div>
                      {q.image_url ? (
                        <div className="mt-2">
                          <QuestionImage src={q.image_url} alt="Question" />
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(["A", "B", "C", "D"] as const).map((label) => {
                        const isCorrect = q.correct_answer === label;
                        return isCorrect ? (
                          <span
                            key={label}
                            className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                          >
                            Correct: {label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-700">
                    {(["A", "B", "C", "D"] as const).map((label) => {
                      const isCorrect = q.correct_answer === label;
                      return (
                        <div
                          key={label}
                          className="flex items-start justify-between gap-3 rounded-md bg-slate-50 px-2 py-1"
                        >
                          <span
                            className={
                              isCorrect
                                ? "text-sm font-semibold text-slate-900"
                                : "text-sm text-slate-600"
                            }
                          >
                            {label}.
                          </span>
                          <span
                            className={
                              isCorrect ? "font-semibold text-slate-900" : ""
                            }
                          >
                            {optionText(q, label)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation ? (
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Explanation:
                      </span>{" "}
                      {q.explanation}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={() => setEditingId(q.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={() => requestDelete(q.id)}
                    >
                      Delete
                    </Button>
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
