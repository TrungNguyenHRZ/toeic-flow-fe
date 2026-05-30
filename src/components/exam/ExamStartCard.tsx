import type { PublicExamRow } from "@/components/exam/types";

import { Button } from "@/components/ui/button";

type ExamStartCardProps = {
  exam: PublicExamRow | null;
  studentName: string;
  studentClass: string;
  startError: string | null;
  onChangeStudentName: (value: string) => void;
  onChangeStudentClass: (value: string) => void;
  onStart: () => void;
  questionsCount: number;
};

export function ExamStartCard(props: ExamStartCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Start Exam</h2>

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
            value={props.studentName}
            onChange={(e) => props.onChangeStudentName(e.target.value)}
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
            value={props.studentClass}
            onChange={(e) => props.onChangeStudentClass(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      {props.startError ? (
        <div className="mt-3 text-sm text-red-600">{props.startError}</div>
      ) : null}

      <div className="mt-4">
        <Button type="button" onClick={props.onStart} className="w-full">
          Start Exam
        </Button>
      </div>
    </div>
  );
}
