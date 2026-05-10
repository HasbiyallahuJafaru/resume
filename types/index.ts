export interface Candidate {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface ExperienceItem {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  highlights: string[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ResumeData {
  candidate: Candidate;
  summary: string;
  experience: ExperienceItem[];
  skills: SkillGroup[];
  education: EducationItem[];
  projects: ProjectItem[];
  coverLetter: string;
}

export type TemplateId = "executive" | "minimal-ats" | "modern-professional";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  preview?: string;
}

export type AppStep =
  | "upload"
  | "job-description"
  | "analyzing"
  | "preview"
  | "payment"
  | "unlocked";

export interface AppState {
  step: AppStep;
  rawCvText: string;
  jobDescription: string;
  resumeData: ResumeData | null;
  selectedTemplate: TemplateId;
  paymentReference: string | null;
  unlockToken: string | null;
  sessionId: string;
  isUnlocked: boolean;
}

export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  unlockToken?: string;
  message?: string;
}

export interface GenerateResumeRequest {
  cvText: string;
  jobDescription: string;
  sessionId: string;
}

export interface GenerateResumeResponse {
  success: boolean;
  data?: ResumeData;
  error?: string;
}
