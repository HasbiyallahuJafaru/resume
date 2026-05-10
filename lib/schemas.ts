import { z } from "zod";

export const GenerateResumeSchema = z.object({
  cvText: z
    .string()
    .min(100, "CV text must be at least 100 characters")
    .max(15000, "CV text must not exceed 15,000 characters"),
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters")
    .max(8000, "Job description must not exceed 8,000 characters"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export const VerifyPaymentSchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
  sessionId: z.string().min(1, "Session ID is required"),
});

export const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string(),
    customer: z
      .object({
        email: z.string().optional(),
      })
      .optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});
