import { create } from "zustand";
import { toast } from "sonner";

import {
  type CorrectAnswer,
  type Question,
  createQuestion,
  deleteQuestion,
  fetchQuestionsByExam,
  updateQuestion,
} from "@/services/question-service";

type QuestionStoreState = {
  questions: Question[];
  loading: boolean;
  errorMessage: string | null;

  fetchQuestions: (params: { examId: string }) => Promise<void>;
  createQuestion: (params: {
    examId: string;
    question_order: number;
    part: 5;
    question_text: string | null;
    image_url: string | null;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: CorrectAnswer;
    explanation: string | null;
  }) => Promise<void>;
  updateQuestion: (params: {
    questionId: string;
    part?: 5;
    question_order?: number;
    question_text?: string | null;
    image_url?: string | null;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_answer?: CorrectAnswer;
    explanation?: string | null;
  }) => Promise<void>;
  deleteQuestion: (params: { questionId: string }) => Promise<void>;

  clearError: () => void;
};

export const useQuestionStore = create<QuestionStoreState>((set) => ({
  questions: [],
  loading: false,
  errorMessage: null,

  clearError: () => set({ errorMessage: null }),

  fetchQuestions: async ({ examId }) => {
    set({ loading: true, errorMessage: null });
    try {
      const questions = await fetchQuestionsByExam({ examId });
      set({ questions });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load questions.";
      set({ errorMessage: message, questions: [] });
    } finally {
      set({ loading: false });
    }
  },

  createQuestion: async (params) => {
    set({ loading: true, errorMessage: null });
    try {
      const created = await createQuestion(params);
      set((state) => {
        // Immediate update: insert and re-sort by question_order.
        const next = [created, ...state.questions];
        next.sort((a, b) => a.question_order - b.question_order);
        return { questions: next };
      });
      toast.success("Question created successfully");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to create question.";
      set({ errorMessage: message });
      toast.error("Failed to create question");
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  updateQuestion: async (params) => {
    set({ loading: true, errorMessage: null });
    try {
      const updated = await updateQuestion(params);
      set((state) => {
        const next = state.questions.map((q) =>
          q.id === updated.id ? updated : q,
        );
        next.sort((a, b) => a.question_order - b.question_order);
        return { questions: next };
      });
      toast.success("Question updated successfully");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to update question.";
      set({ errorMessage: message });
      toast.error("Failed to update question");
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  deleteQuestion: async ({ questionId }) => {
    set({ loading: true, errorMessage: null });
    try {
      await deleteQuestion({ questionId });
      set((state) => ({
        questions: state.questions.filter((q) => q.id !== questionId),
      }));
      toast.success("Question deleted successfully");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to delete question.";
      set({ errorMessage: message });
      toast.error("Failed to delete question");
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));
