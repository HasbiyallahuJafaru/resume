import Link from "next/link";
import Header from "@/components/layout/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResumeForge — Recruiter-Grade Resumes, Powered by AI",
};

const features = [
  {
    title: "Recruiter-Grade Editing",
    description:
      "Your resume is rewritten the way a senior recruiter would edit it — clear, specific, and impactful.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "ATS Optimized",
    description:
      "Keywords from the job description are woven in naturally where they honestly apply — no keyword stuffing.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Zero Hallucinations",
    description:
      "We never invent experience, certifications, or achievements. Only your real background, better expressed.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Cover Letter Included",
    description:
      "A tailored cover letter written in your voice, specific to the role and company — not a template.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "PDF & DOCX Export",
    description:
      "Download professional-grade files instantly. Three template styles to choose from.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    title: "Instant Preview",
    description:
      "See your improved resume before you pay. Only unlock the full version when you're ready.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

const steps = [
  { number: "01", title: "Upload your CV", description: "PDF, DOCX, or paste your text directly." },
  { number: "02", title: "Paste the job description", description: "Any role, any industry. The more detail, the better." },
  { number: "03", title: "AI analyzes everything", description: "We extract facts, match skills, and optimize structure." },
  { number: "04", title: "Preview your resume", description: "See the results. Pay once you're satisfied." },
  { number: "05", title: "Download instantly", description: "PDF and DOCX, ready for submission." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-surface-1 border border-surface-3 rounded-full px-3 py-1 text-xs text-ink-secondary mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Recruiter-grade AI. No hallucinations.
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.05] tracking-tight text-balance mb-6">
            Your resume,
            <br />
            <span className="text-ink-tertiary">professionally rewritten.</span>
          </h1>

          <p className="text-lg sm:text-xl text-ink-secondary leading-relaxed mb-10 max-w-xl text-balance">
            Upload your CV. Paste a job description. Get a recruiter-edited,
            ATS-optimized resume and cover letter in under a minute.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 bg-ink text-white font-medium px-7 py-3.5 rounded-xl text-base hover:bg-ink-secondary transition-colors duration-150 shadow-card"
            >
              Start for free
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="inline-flex items-center justify-center text-sm text-ink-tertiary px-4">
              Preview free · Pay only to download
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface-1 border-y border-surface-3 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-ink mb-2">How it works</h2>
          <p className="text-ink-tertiary mb-12">Five steps from raw CV to professional document.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="space-y-3">
                <p className="text-4xl font-bold text-surface-3">{step.number}</p>
                <p className="text-sm font-semibold text-ink">{step.title}</p>
                <p className="text-xs text-ink-tertiary leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl font-bold text-ink mb-2">What makes this different</h2>
        <p className="text-ink-tertiary mb-12">
          Built for candidates who want quality, not hallucinations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface-1 rounded-2xl p-6 border border-surface-3 space-y-3"
            >
              <div className="h-9 w-9 rounded-xl bg-white border border-surface-3 flex items-center justify-center text-ink shadow-soft">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-ink">{feature.title}</h3>
              <p className="text-sm text-ink-tertiary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="bg-ink py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            The AI editor that respects your truth
          </h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed mb-8">
            We believe the best resume is one that&apos;s honest, clear, and strategically presented.
            No invented metrics. No fabricated experience. Just your real story, told better.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 bg-white text-ink font-medium px-7 py-3.5 rounded-xl text-sm hover:bg-surface-1 transition-colors duration-150"
          >
            Try it now — preview is free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-3 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-ink-tertiary">
            © {new Date().getFullYear()} ResumeForge
          </p>
          <p className="text-xs text-ink-tertiary">
            Payments secured by Paystack
          </p>
        </div>
      </footer>
    </div>
  );
}
