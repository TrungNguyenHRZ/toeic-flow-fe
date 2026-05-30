import type { PublicQuestionRow } from "@/components/exam/types";

import type { CorrectAnswer } from "@/services/question-service";

export function ExamReviewCard(props: {
  question: PublicQuestionRow;
  questionIndex: number;
  selectedAnswer: CorrectAnswer | undefined;
}) {
  const q = props.question;

  const selected = props.selectedAnswer;

  const questionNumber = props.questionIndex + 1;

  const answeredCorrectly =
    selected !== undefined && selected === q.correct_answer;

  const statusBadge =
    selected === undefined
      ? {
          text: "Unanswered",
          className: "border-slate-200 bg-slate-50 text-slate-700",
        }
      : answeredCorrectly
        ? {
            text: "Correct",
            className: "border-emerald-300 bg-emerald-50 text-emerald-800",
          }
        : {
            text: "Incorrect",
            className: "border-rose-300 bg-rose-50 text-rose-800",
          };

  const yourAnswerText = selected === undefined ? "Not Answered" : selected;

  const correctAnswerText = q.correct_answer;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Question {questionNumber}
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {q.question_text ?? "No question text"}
          </div>
        </div>

        <div
          className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
        >
          {statusBadge.text}
        </div>
      </div>

      {q.image_url ? (
        <div className="mt-3">
          <img
            src={q.image_url}
            alt="Question"
            className="max-h-72 w-full rounded-md border border-slate-200 object-contain bg-white"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
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
          const isYourAnswer = selected === value;
          const isCorrect = value === q.correct_answer;

          let optionBorder = "border-slate-200 bg-white";
          if (isCorrect) optionBorder = "border-emerald-300 bg-emerald-50";
          if (isYourAnswer && !isCorrect)
            optionBorder = "border-rose-300 bg-rose-50";

          return (
            <div
              key={label}
              className={`rounded-lg border p-3 ${optionBorder}`}
            >
              <div className="text-sm font-semibold text-slate-900">
                {label}
              </div>
              <div className="text-sm text-slate-700 truncate">{text}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-sm font-semibold text-slate-900">
          Your Answer:{" "}
          <span className="font-bold text-slate-900">{yourAnswerText}</span>
        </div>

        <div className="text-sm font-semibold text-slate-900">
          Correct Answer:{" "}
          <span className="font-bold text-slate-900">{correctAnswerText}</span>
        </div>

        {(() => {
          const normalized = q.explanation?.trim?.() ?? q.explanation ?? "";

          if (!normalized) return null;

          return (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="text-sm font-semibold text-amber-900">
                <span className="mr-2">💡</span>
                Explanation
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-amber-900/90">
                {normalized}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
