import type { CorrectAnswer } from "@/services/question-service";

import type { PublicQuestionRow } from "@/components/exam/types";

type ExamQuestionCardProps = {
  question: PublicQuestionRow;
  questionIndex: number;
  selectedAnswer: CorrectAnswer | undefined;
  submitting: boolean;
  onPick: (questionId: string, value: CorrectAnswer) => void;
};

export function ExamQuestionCard(props: ExamQuestionCardProps) {
  const q = props.question;
  const selected = props.selectedAnswer;

  const questionNumber = props.questionIndex + 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                disabled={props.submitting}
                onChange={() => props.onPick(q.id, value)}
                className="h-4 w-4"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  {label}
                </div>
                <div className="text-sm text-slate-700 truncate">{text}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
