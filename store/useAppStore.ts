import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppStep, ResumeData, TemplateId } from "@/types";
import { generateSessionId } from "@/lib/utils";

interface AppStore {
  step: AppStep;
  rawCvText: string;
  jobDescription: string;
  resumeData: ResumeData | null;
  selectedTemplate: TemplateId;
  paymentReference: string | null;
  sessionId: string;
  isGenerating: boolean;
  generatingStep: string;
  error: string | null;

  setStep: (step: AppStep) => void;
  setRawCvText: (text: string) => void;
  setJobDescription: (jd: string) => void;
  setResumeData: (data: ResumeData) => void;
  completeGeneration: (data: ResumeData) => void;
  setSelectedTemplate: (template: TemplateId) => void;
  setPaymentReference: (ref: string) => void;
  setIsGenerating: (state: boolean) => void;
  setGeneratingStep: (step: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: "upload" as AppStep,
  rawCvText: "",
  jobDescription: "",
  resumeData: null,
  selectedTemplate: "minimal-ats" as TemplateId,
  paymentReference: null,
  sessionId: generateSessionId(),
  isGenerating: false,
  generatingStep: "",
  error: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setRawCvText: (rawCvText) => set({ rawCvText }),
      setJobDescription: (jobDescription) => set({ jobDescription }),
      setResumeData: (resumeData) => set({ resumeData }),
      completeGeneration: (resumeData) => set({ resumeData, step: "result" }),
      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
      setPaymentReference: (paymentReference) => set({ paymentReference }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGeneratingStep: (generatingStep) => set({ generatingStep }),
      setError: (error) => set({ error }),

      reset: () =>
        set({
          ...initialState,
          sessionId: generateSessionId(),
        }),
    }),
    {
      name: "atsresume-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        rawCvText: state.rawCvText,
        jobDescription: state.jobDescription,
        resumeData: state.resumeData,
        selectedTemplate: state.selectedTemplate,
        sessionId: state.sessionId,
        step: state.step,
      }),
    }
  )
);
