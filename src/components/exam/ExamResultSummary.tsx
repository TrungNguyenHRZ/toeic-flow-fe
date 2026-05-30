import type { ExamResult } from "@/components/exam/types";

type ExamResultSummaryProps = {
  result: ExamResult;
  timeUsedSeconds: number;
};

function formatMMSS(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function ExamResultSummary(props: ExamResultSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Results</h2>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Correct</div>
          <div className="text-lg font-semibold text-slate-900">
            {props.result.correctCount}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Total</div>
          <div className="text-lg font-semibold text-slate-900">
            {props.result.total}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Score</div>
          <div className="text-lg font-semibold text-slate-900">
            {props.result.percentage}%
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-600">Time Used</div>
          <div className="text-lg font-semibold text-slate-900">
            {formatMMSS(props.timeUsedSeconds)}
          </div>
        </div>
      </div>
    </div>
  );
}
