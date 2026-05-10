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
  unlockToken: string | null;
  sessionId: string;
  isUnlocked: boolean;
  isGenerating: boolean;
  generatingStep: string;
  error: string | null;

  setStep: (step: AppStep) => void;
  setRawCvText: (text: string) => void;
  setJobDescription: (jd: string) => void;
  setResumeData: (data: ResumeData) => void;
  setSelectedTemplate: (template: TemplateId) => void;
  setPaymentReference: (ref: string) => void;
  setUnlockToken: (token: string) => void;
  setIsGenerating: (state: boolean) => void;
  setGeneratingStep: (step: string) => void;
  setError: (error: string | null) => void;
  unlock: (token: string) => void;
  reset: () => void;
}

const initialState = {
  step: "upload" as AppStep,
  rawCvText: "",
  jobDescription: "",
  resumeData: null,
  selectedTemplate: "minimal-ats" as TemplateId,
  paymentReference: null,
  unlockToken: null,
  sessionId: generateSessionId(),
  isUnlocked: false,
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
      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
      setPaymentReference: (paymentReference) => set({ paymentReference }),
      setUnlockToken: (unlockToken) => set({ unlockToken }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setGeneratingStep: (generatingStep) => set({ generatingStep }),
      setError: (error) => set({ error }),

      unlock: (token) =>
        set({
          unlockToken: token,
          isUnlocked: true,
          step: "unlocked",
        }),

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
        unlockToken: state.unlockToken,
        isUnlocked: state.isUnlocked,
        step: state.step,
      }),
    }
  )
);
