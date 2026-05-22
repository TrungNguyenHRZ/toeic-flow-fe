import { create } from "zustand";
import { toast } from "sonner";

import { fetchExams, createExam, type Exam } from "@/services/exam-service";

type ExamStoreState = {
  exams: Exam[];
  loading: boolean;
  errorMessage: string | null;

  fetchExams: (params: { createdBy?: string }) => Promise<void>;
  createExam: (params: {
    title: string;
    description: string;
    duration_minutes: number;
    createdBy: string;
    is_published?: boolean;
  }) => Promise<void>;
  clearError: () => void;
};

export const useExamStore = create<ExamStoreState>((set) => ({
  exams: [],
  loading: false,
  errorMessage: null,

  clearError: () => set({ errorMessage: null }),

  fetchExams: async ({ createdBy }) => {
    set({ loading: true, errorMessage: null });
    try {
      const exams = await fetchExams({ createdBy });
      set({ exams });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load exams.";
      set({ errorMessage: message, exams: [] });
    } finally {
      set({ loading: false });
    }
  },

  createExam: async ({
    title,
    description,
    duration_minutes,
    createdBy,
    is_published,
  }) => {
    set({ loading: true, errorMessage: null });
    try {
      const created = await createExam({
        title,
        description,
        duration_minutes,
        createdBy,
        is_published,
      });

      // Update UI immediately without re-fetching.
      set((state) => ({ exams: [created, ...state.exams] }));
      toast.success("Tạo bài thi thành công");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create exam.";
      set({ errorMessage: message });
      toast.error("Tạo bài thi thất bại");
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));
