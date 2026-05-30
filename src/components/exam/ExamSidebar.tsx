import type { PublicQuestionRow } from "@/components/exam/types";

import { Button } from "@/components/ui/button";
import type { CorrectAnswer } from "@/services/question-service";

type AnswersByQuestionId = Record<string, CorrectAnswer | undefined>;

type ExamSidebarProps = {
  submitted: boolean;

  remainingSeconds: number;
  answeredCount: number;
  questionsLength: number;

  timeUsedSeconds: number;
  completionRatePercent: number;

  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;

  questions: PublicQuestionRow[];
  answers: AnswersByQuestionId;
  onGoToQuestion: (questionId: string) => void;
};

function formatMMSS(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function ExamSidebar(props: ExamSidebarProps) {
  return (
    <div className="space-y-4">
      {!props.submitted ? (
        <>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Time Remaining
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {formatMMSS(props.remainingSeconds)}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Progress</div>
            <div className="mt-1 text-sm text-slate-700">
              {props.answeredCount} / {props.questionsLength} answered
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Result Summary
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Time Used</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {formatMMSS(props.timeUsedSeconds)}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Completion</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {props.answeredCount} / {props.questionsLength} answered
                </div>
                <div className="mt-1 text-xs font-semibold text-emerald-800">
                  {props.completionRatePercent}%
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div>
        <div className="text-sm font-semibold text-slate-900">
          Question Palette
        </div>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {props.questions.map((q, idx) => {
            const number = idx + 1;
            const selected = props.answers[q.id];

            const isUnanswered = !selected;
            const isCorrect =
              selected !== undefined && selected === q.correct_answer;
            const isIncorrect =
              selected !== undefined && selected !== q.correct_answer;

            let paletteClass =
              "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

            if (props.submitted) {
              if (isCorrect)
                paletteClass =
                  "border-emerald-300 bg-emerald-50 text-emerald-800";
              else if (isIncorrect)
                paletteClass = "border-rose-300 bg-rose-50 text-rose-800";
              else if (isUnanswered)
                paletteClass = "border-slate-200 bg-slate-50 text-slate-700";
            } else {
              const answered = !!props.answers[q.id];
              paletteClass = answered
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => props.onGoToQuestion(q.id)}
                className={`rounded border px-1 py-1 text-xs font-semibold transition-colors ${paletteClass}`}
                aria-label={`Go to question ${number}`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {!props.submitted ? (
        <div className="pt-2">
          <Button
            type="button"
            onClick={props.onSubmit}
            disabled={!props.canSubmit || props.submitting}
            className="w-full"
          >
            {props.submitting ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
