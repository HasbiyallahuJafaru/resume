import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "ResumeForge";

export const metadata: Metadata = {
  title: {
    default: `${appName} — Recruiter-Grade Resumes, Powered by AI`,
    template: `%s | ${appName}`,
  },
  description:
    "Transform your CV into an ATS-optimized, recruiter-grade resume tailored to any job description. No hallucinations. No fabrications. Just professional editing.",
  keywords: [
    "resume builder",
    "ATS resume",
    "AI resume",
    "cover letter generator",
    "job application",
    "professional resume",
  ],
  openGraph: {
    title: `${appName} — Recruiter-Grade Resumes`,
    description:
      "AI-assisted resume refinement that sounds human, not robotic.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        {children}
        {/* Paystack inline */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
