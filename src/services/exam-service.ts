import { supabase } from "@/lib/supabase";

export type Exam = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchExams(params: {
  createdBy?: string;
}): Promise<Exam[]> {
  const { createdBy } = params;

  let query = supabase
    .from("exams")
    .select(
      "id,title,description,duration_minutes,is_published,created_by,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  // Single-teacher mode for V1, but keep created_by filtering ready for future.
  if (createdBy) query = query.eq("created_by", createdBy);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as Exam[];
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
      "id,title,description,duration_minutes,is_published,created_by,created_at,updated_at",
    )
    .single();

  if (error) throw error;

  return data as Exam;
}
