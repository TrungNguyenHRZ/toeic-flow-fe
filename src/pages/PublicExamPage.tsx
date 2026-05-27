import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import type { CorrectAnswer } from "@/services/question-service";

import { Button } from "@/components/ui/button";

type PublicExamRow = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
};

type PublicQuestionRow = {
  id: string;
  question_order: number;
  question_text: string | null;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: CorrectAnswer;
};

type AnswersByQuestionId = Record<string, CorrectAnswer | undefined>;

type ExamResult = {
  correctCount: number;
  total: number;
  percentage: number;
};

function scoreAnswers(params: {
  questions: PublicQuestionRow[];
  answers: AnswersByQuestionId;
}): ExamResult {
  const { questions, answers } = params;

  let correctCount = 0;
  for (const q of questions) {
    const selected = answers[q.id];
    if (!selected) continue;
    if (selected === q.correct_answer) correctCount += 1;
  }

  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return { correctCount, total, percentage };
}

function formatMMSS(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function PublicExamPage() {
  const { examId } = useParams<{ examId: string }>();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<PublicExamRow | null>(null);
  const [questions, setQuestions] = useState<PublicQuestionRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [startError, setStartError] = useState<string | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const [answers, setAnswers] = useState<AnswersByQuestionId>({});
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState<ExamResult | null>(null);

  const timerRef = useRef<number | null>(null);

  const isExamUnavailable = !loading && !exam;

  const part5Count = useMemo(() => questions.length, [questions.length]);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToQuestion = (questionId: string) => {
    const el = questionRefs.current[questionId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const answeredCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      return answers[q.id] ? acc + 1 : acc;
    }, 0);
  }, [answers, questions]);

  useEffect(() => {
    if (!examId) return;

    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        setExam(null);
        setQuestions([]);
        setAnswers({});
        setStarted(false);
        setSubmitted(false);
        setRemainingSeconds(0);
        setResult(null);
        setStudentName("");
        setStudentClass("");
        setStartError(null);

        const { data: examRow, error: examError } = await supabase
          .from("exams")
          .select("id,title,description,duration_minutes,is_published")
          .eq("id", examId)
          .eq("is_published", true)
          .is("deleted_at", null)
          .single();

        if (examError) {
          if (examError.message?.toLowerCase().includes("no rows")) {
            return;
          }
          throw examError;
        }

        if (!alive) return;

        setExam(examRow as PublicExamRow);

        const { data: questionRows, error: qError } = await supabase
          .from("questions")
          .select(
            "id,question_order,question_text,image_url,option_a,option_b,option_c,option_d,correct_answer",
          )
          .eq("exam_id", examId)
          .eq("part", 5)
          .order("question_order", { ascending: true });

        if (qError) throw qError;
        if (!alive) return;

        setQuestions((questionRows ?? []) as PublicQuestionRow[]);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to load the exam.";
        if (!alive) return;

        setLoadError(message);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, [examId]);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = questions.length > 0 && !submitted && !submitting;

  const onPick = (questionId: string, value: CorrectAnswer) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const submitExam = () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const scored = scoreAnswers({ questions, answers });
      setResult(scored);
      setSubmitted(true);
      stopTimer();
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!started || submitted) return;
    if (remainingSeconds <= 0) {
      submitExam();
      return;
    }

    const current = timerRef.current;
    if (current === null) return;

    // interval already running; nothing else needed
  }, [started, remainingSeconds, submitted]);

  const onStart = () => {
    if (!exam) return;

    const name = studentName.trim();
    const klass = studentClass.trim();

    if (!name || !klass) {
      setStartError("Student name and class are required.");
      return;
    }

    if (questions.length === 0) {
      setStartError("No Part 5 questions found for this exam.");
      return;
    }

    setStartError(null);
    setSubmitted(false);
    setResult(null);
    setAnswers({});
    setStarted(true);

    const totalSeconds = Math.max(0, Math.floor(exam.duration_minutes * 60));
    setRemainingSeconds(totalSeconds);

    stopTimer();
    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-slate-600">
        Loading exam...
      </div>
    );
  }

  if (isExamUnavailable || loadError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm">
          <h1 className="text-lg font-semibold">Exam not available</h1>
          <p className="mt-2 text-sm text-slate-600">
            This exam may not be published anymore, or it may not exist.
          </p>
          {loadError ? (
            <p className="mt-3 text-xs text-red-600">{loadError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {exam?.title}
          </h1>
          {exam?.description ? (
            <p className="text-sm text-slate-600">{exam.description}</p>
          ) : null}
          <div className="text-sm text-slate-700">
            Duration: {exam?.duration_minutes} minutes
          </div>
          <div className="text-sm text-slate-700">
            Total Part 5 questions: {part5Count}
          </div>
          {started && !submitted ? (
            <div className="text-sm font-semibold text-slate-900">
              Time left: {formatMMSS(remainingSeconds)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Left: content */}
        <div className="min-w-0">
          <div className="space-y-3">
            {!started && !submitted ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Start Exam
                </h2>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label
                      className="text-sm font-medium text-slate-800"
                      htmlFor="studentName"
                    >
                      Student Name
                    </label>
                    <input
                      id="studentName"
                      type="text"
                      placeholder="e.g. Nguyen Van A"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      className="text-sm font-medium text-slate-800"
                      htmlFor="studentClass"
                    >
                      Student Class
                    </label>
                    <input
                      id="studentClass"
                      type="text"
                      placeholder="e.g. 10A"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                {startError ? (
                  <div className="mt-3 text-sm text-red-600">{startError}</div>
                ) : null}

                <div className="mt-4">
                  <Button type="button" onClick={onStart} className="w-full">
                    Start Exam
                  </Button>
                </div>
              </div>
            ) : null}

            {submitted && result ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Results
                </h2>

                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <div>
                    Student:{" "}
                    <span className="font-semibold text-slate-900">
                      {studentName}
                    </span>
                  </div>
                  <div>
                    Class:{" "}
                    <span className="font-semibold text-slate-900">
                      {studentClass}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-600">Correct</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {result.correctCount}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-600">Total</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {result.total}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs text-slate-600">Score</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {result.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {started && !submitted ? (
              <>
                {questions.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                    No Part 5 questions found for this exam.
                  </div>
                ) : (
                  <>
                    {questions.map((q, idx) => {
                      const selected = answers[q.id];
                      const questionNumber = idx + 1;

                      return (
                        <div
                          key={q.id}
                          id={`question-${q.id}`}
                          ref={(el) => {
                            questionRefs.current[q.id] = el;
                          }}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                Question {questionNumber}
                              </div>
                              <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                                {q.question_text ?? "No question text"}
                              </div>
                            </div>
                          </div>

                          {q.image_url ? (
                            <div className="mt-3">
                              <img
                                src={q.image_url}
                                alt="Question"
                                className="max-h-72 w-full rounded-md border border-slate-200 object-contain bg-white"
                                onError={(e) => {
                                  (
                                    e.currentTarget as HTMLImageElement
                                  ).style.display = "none";
                                }}
                              />
                            </div>
                          ) : null}

                          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {(
                              [
                                ["A", q.option_a],
                                ["B", q.option_b],
                                ["C", q.option_c],
                                ["D", q.option_d],
                              ] as const
                            ).map(([label, text]) => {
                              const value = label as CorrectAnswer;
                              const checked = selected === value;

                              return (
                                <label
                                  key={label}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                    checked
                                      ? "border-slate-500 bg-slate-50"
                                      : "border-slate-200 bg-white hover:bg-slate-50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    checked={checked}
                                    disabled={submitting}
                                    onChange={() => onPick(q.id, value)}
                                    className="h-4 w-4"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900">
                                      {label}
                                    </div>
                                    <div className="text-sm text-slate-700 truncate">
                                      {text}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Right: sticky sidebar */}
        {started && !submitted ? (
          <aside className="hidden lg:block lg:sticky lg:top-6 self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Time Remaining
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {formatMMSS(remainingSeconds)}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Progress
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {answeredCount} / {questions.length} answered
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Question Palette
                  </div>
                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {questions.map((q, idx) => {
                      const answered = !!answers[q.id];
                      const number = idx + 1;

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => scrollToQuestion(q.id)}
                          className={`rounded border px-1 py-1 text-xs font-semibold transition-colors ${
                            answered
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                          aria-label={`Go to question ${number}`}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => submitExam()}
                    disabled={!canSubmit || submitting}
                    className="w-full"
                  >
                    {submitting ? "Submitting..." : "Submit Exam"}
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {/* Desktop: button is inside sidebar; mobile still needs it if sidebar stacks away */}
      {started && !submitted ? (
        <div className="mt-3 lg:hidden">
          <Button
            type="button"
            onClick={() => submitExam()}
            disabled={!canSubmit || submitting}
            className="w-full"
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
