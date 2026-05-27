import { supabase } from "@/lib/supabase";

export type ExamQuestionSummary = {
  5: number;
  6: number;
  7: number;
};

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  question_summary: ExamQuestionSummary;
};

export async function fetchExams(params: {
  createdBy?: string;
}): Promise<Exam[]> {
  const { createdBy } = params;

  let query = supabase
    .from("exams")
    .select(
      "id,title,description,duration_minutes,is_published,created_by,created_at,updated_at,deleted_at",
    )
    .order("created_at", { ascending: false });

  // Single-teacher mode for V1, but keep created_by filtering ready for future.
  if (createdBy) query = query.eq("created_by", createdBy);

  // Soft-delete: only show active exams
  query = query.is("deleted_at", null);

  const { data, error } = await query;
  if (error) throw error;

  const exams = (data ?? []) as Omit<Exam, "question_summary">[];

  // Lightweight question summary (single query; no full question payload)
  if (exams.length === 0) {
    return exams.map((e) => ({
      ...e,
      question_summary: { 5: 0, 6: 0, 7: 0 },
    }));
  }

  const examIds = exams.map((e) => e.id);

  const { data: qRows, error: qError } = await supabase
    .from("questions")
    .select("exam_id,part")
    .in("exam_id", examIds);

  if (qError) throw qError;

  const summaryByExamId = new Map<string, ExamQuestionSummary>();
  for (const id of examIds) {
    summaryByExamId.set(id, { 5: 0, 6: 0, 7: 0 });
  }

  for (const row of qRows ?? []) {
    const examId = row.exam_id as string;
    const part = row.part as 5 | 6 | 7;
    const curr = summaryByExamId.get(examId) ?? { 5: 0, 6: 0, 7: 0 };
    curr[part] = (curr[part] ?? 0) + 1;
    summaryByExamId.set(examId, curr);
  }

  return exams.map((e) => ({
    ...e,
    question_summary: summaryByExamId.get(e.id) ?? { 5: 0, 6: 0, 7: 0 },
  }));
}

export async function createExam(params: {
  title: string;
  description: string;
  duration_minutes: number;
  is_published?: boolean;
  createdBy: string;
}): Promise<Exam> {
  const { title, description, duration_minutes, is_published, createdBy } =
    params;

  const { data, error } = await supabase
    .from("exams")
    .insert({
      title,
      description,
      duration_minutes,
      is_published: is_published ?? false,
      created_by: createdBy,
    })
    .select(
      "id,title,description,duration_minutes,is_published,created_by,created_at,updated_at,deleted_at",
    )
    .single();

  if (error) throw error;

  return data as Exam;
}

export async function softDeleteExam(params: {
  examId: string;
}): Promise<void> {
  const { examId } = params;

  const { error } = await supabase
    .from("exams")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", examId);

  if (error) throw error;
}

export async function updateExamPublishStatus(params: {
  examId: string;
  isPublished: boolean;
}): Promise<Exam> {
  const { examId, isPublished } = params;

  const { data, error } = await supabase
    .from("exams")
    .update({ is_published: isPublished })
    .eq("id", examId)
    .select(
      "id,title,description,duration_minutes,is_published,created_by,created_at,updated_at,deleted_at",
    )
    .single();

  if (error) throw error;

  return data as Exam;
}
