import type { CorrectAnswer } from "@/services/question-service";

export type PublicExamRow = {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  is_published: boolean;
};

export type PublicQuestionRow = {
  id: string;
  question_order: number;
  question_text: string | null;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: CorrectAnswer;
  explanation: string | null;
};

export type AnswersByQuestionId = Record<string, CorrectAnswer | undefined>;

export type ExamResult = {
  correctCount: number;
  total: number;
  percentage: number;
};
