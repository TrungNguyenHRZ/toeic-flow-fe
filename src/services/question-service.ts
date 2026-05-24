import { supabase } from "@/lib/supabase";

export type CorrectAnswer = "A" | "B" | "C" | "D";

export type QuestionPart = 5 | 6 | 7;

export type Question = {
  id: string;
  exam_id: string;
  question_order: number;
  part: QuestionPart;
  question_text: string | null;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: CorrectAnswer;
  explanation: string | null;
  created_at: string;
  updated_at: string;
};

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

export async function fetchQuestionsByExam(params: {
  examId: string;
}): Promise<Question[]> {
  const { examId } = params;

  const { data, error } = await supabase
    .from("questions")
    .select(questionSelect)
    .eq("exam_id", examId)
    .order("question_order", { ascending: true });

  if (error) throw error;

  return (data ?? []) as unknown as Question[];
}

export async function createQuestion(params: {
  examId: string;
  question_order: number;
  part: QuestionPart;
  question_text: string | null;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: CorrectAnswer;
  explanation: string | null;
}): Promise<Question> {
  const {
    examId,
    question_order,
    part,
    question_text,
    image_url,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
  } = params;

  const { data, error } = await supabase
    .from("questions")
    .insert({
      exam_id: examId,
      question_order,
      part,
      question_text: question_text || null,
      image_url: image_url || null,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation: explanation || null,
    })
    .select(questionSelect)
    .single();

  if (error) throw error;
  return data as unknown as Question;
}

export async function updateQuestion(params: {
  questionId: string;
  part?: QuestionPart;
  question_order?: number;
  question_text?: string | null;
  image_url?: string | null;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: CorrectAnswer;
  explanation?: string | null;
}): Promise<Question> {
  const {
    questionId,
    part,
    question_order,
    question_text,
    image_url,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
  } = params;

  const { data, error } = await supabase
    .from("questions")
    .update({
      ...(part !== undefined ? { part } : {}),
      ...(question_order !== undefined ? { question_order } : {}),
      ...(question_text !== undefined
        ? { question_text: question_text || null }
        : {}),
      ...(image_url !== undefined ? { image_url: image_url || null } : {}),
      ...(option_a !== undefined ? { option_a } : {}),
      ...(option_b !== undefined ? { option_b } : {}),
      ...(option_c !== undefined ? { option_c } : {}),
      ...(option_d !== undefined ? { option_d } : {}),
      ...(correct_answer !== undefined ? { correct_answer } : {}),
      ...(explanation !== undefined
        ? { explanation: explanation || null }
        : {}),
    })
    .eq("id", questionId)
    .select(questionSelect)
    .single();

  if (error) throw error;
  return data as unknown as Question;
}

export async function deleteQuestion(params: {
  questionId: string;
}): Promise<void> {
  const { questionId } = params;

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId);

  if (error) throw error;
}
