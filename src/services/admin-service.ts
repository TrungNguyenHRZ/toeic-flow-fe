import { supabase } from "@/lib/supabase";

export type AdminAccount = {
  id: string;
  email: string | null;
  role: "teacher" | "admin" | null;
  created_at: string;
};

export type AdminExamRow = {
  id: string;
  title: string;
  is_published: boolean;
  deleted_at: string | null;
  created_at: string;
};

export type AdminQuestionRow = {
  id: string;
  exam_id: string;
  question_order: number;
  part: 5 | 6 | 7;
  question_text: string | null;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminExamDetail = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  questions: AdminQuestionRow[];
};

export async function fetchAccounts(): Promise<AdminAccount[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as AdminAccount[];
}

export async function fetchDeletedExams(): Promise<AdminExamRow[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("id,title,is_published,deleted_at,created_at")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as AdminExamRow[];
}

const questionSelect = [
  "id",
  "exam_id",
  "question_order",
  "part",
  "question_text",
  "image_url",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_answer",
  "explanation",
  "created_at",
  "updated_at",
].join(",");

export async function fetchAdminExamDetail(
  examId: string,
): Promise<AdminExamDetail> {
  const { data: examRow, error: examError } = await supabase
    .from("exams")
    .select(
      "id,title,description,duration_minutes,is_published,deleted_at,created_at,updated_at",
    )
    .eq("id", examId)
    .single();

  if (examError) throw examError;

  const { data: qRows, error: qError } = await supabase
    .from("questions")
    .select(questionSelect)
    .eq("exam_id", examId)
    .order("question_order", { ascending: true });

  if (qError) throw qError;

  return {
    ...(examRow as Omit<AdminExamDetail, "questions">),
    questions: (qRows ?? []) as unknown as AdminQuestionRow[],
  };
}

export async function restoreDeletedExam(params: {
  examId: string;
}): Promise<void> {
  const { examId } = params;

  const { error } = await supabase
    .from("exams")
    .update({ deleted_at: null })
    .eq("id", examId);

  if (error) throw error;
}
