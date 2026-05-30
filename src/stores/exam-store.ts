import { create } from "zustand";
import { toast } from "sonner";

import {
  fetchExams,
  createExam,
  softDeleteExam,
  updateExamPublishStatus,
  type Exam,
} from "@/services/exam-service";

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
  softDeleteExam: (params: { examId: string }) => Promise<void>;
  togglePublishExam: (params: {
    examId: string;
    isPublished: boolean;
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
      toast.success("Exam created successfully");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create exam.";
      set({ errorMessage: message });
      toast.error("Failed to create exam");
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  softDeleteExam: async ({ examId }) => {
    set({ loading: true, errorMessage: null });
    try {
      await softDeleteExam({ examId });

      // Immediate UI removal (soft delete)
      set((state) => ({
        exams: state.exams.filter((e) => e.id !== examId),
      }));

      toast.success("Exam deleted successfully");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete exam.";
      set({ errorMessage: message });
      toast.error("Failed to delete exam");
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  togglePublishExam: async ({ examId, isPublished }) => {
    set({ loading: true, errorMessage: null });
    try {
      const updated = await updateExamPublishStatus({ examId, isPublished });

      // Immediate update: preserve exam list; only update the edited row.
      set((state) => ({
        exams: state.exams.map((e) => (e.id === updated.id ? updated : e)),
      }));

      if (isPublished) {
        toast.success("Exam published successfully");
      } else {
        toast.success("Exam unpublished successfully");
      }
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Failed to update exam publish status.";
      set({ errorMessage: message });

      if (isPublished) {
        toast.error("Failed to publish exam");
      } else {
        toast.error("Failed to unpublish exam");
      }
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));
