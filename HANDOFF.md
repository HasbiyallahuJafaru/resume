# Project Handoff — ATSResume / ResumeForge

## What This Project Is
A Next.js 16 web app that takes a user's CV + job description, charges them via Paystack, then uses Pollinations.ai to generate an ATS-optimised resume + cover letter. The user can download the result as PDF or DOCX.

---

## Current State (as of 2026-05-13)
The app is **working end-to-end** on the `clean-main` branch:
- Upload CV (PDF/DOCX/text paste) → Job Description → Payment (Paystack) → AI Generation → Download

### What Works
- Full flow: upload → job-description → payment → analyzing → result
- Pollinations.ai generation via `gen.pollinations.ai/v1/chat/completions`
- Paystack inline v1 payment (`callback`/`onClose`)
- PDF download — 3 templates via **jsPDF** (client-side, no server needed)
- DOCX download via `docx` package
- In-memory rate limiting (no database)
- Zustand store with sessionStorage persistence (hydration mismatch fixed)

### Known Issues / Open Items
1. **PDF layout fine-tuning** — The 3 templates work but may need spacing/typography tweaks based on user feedback. Skills section wrapping and education date display have been fixed but could be further polished.
2. **DOCX not tested recently** — Was not the focus of recent sessions; may need verification.
3. **`/api/pdf` route exists but is unused** — `app/api/pdf/route.ts` was created during debugging and is now dead code. Can be deleted.
4. **Templates in `templates/pdf/`** — `MinimalATSPDF.tsx`, `ExecutivePDF.tsx`, `ModernPDF.tsx` are dead code (leftover from the @react-pdf/renderer era). Safe to delete.
5. **Education dates** — The AI sometimes returns `"string"` as a date value. The PDF generator filters these out. The AI prompt could be improved to prevent this.
6. **`app/api/unlock/`** — May be leftover dead code from an older flow. Check if it's still referenced.

---

## Architecture

### Tech Stack
- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**
- **Zustand 5** with sessionStorage persist
- **Tailwind CSS**, **Framer Motion**
- **Paystack Inline v1** (not v2 — uses `callback`/`onClose`, not `onSuccess`/`onCancel`)
- **Pollinations.ai** — `POST gen.pollinations.ai/v1/chat/completions`, model `"openai"`
- **jsPDF 2.5** — client-side PDF generation (3 templates)
- **docx 8.5** — client-side DOCX generation
- **No database** — Prisma was fully removed

### Key Files
| File | Purpose |
|---|---|
| `app/app/page.tsx` | Main app shell — renders step components, hydration-safe |
| `store/useAppStore.ts` | Zustand store — `completeGeneration()` sets resumeData+step atomically |
| `hooks/useGenerate.ts` | Calls `/api/generate`, reads fresh state via `getState()` |
| `hooks/usePaystack.ts` | Paystack v1 — `paid` flag prevents `onClose` from overriding payment callback |
| `lib/ai/pollinations.ts` | Pollinations.ai API call + JSON parsing + validation |
| `lib/ai/prompts.ts` | System prompt + user prompt builder |
| `app/api/generate/route.ts` | AI generation endpoint with in-memory rate limiting |
| `lib/rate-limit.ts` | In-memory Map-based rate limiting |
| `lib/generators/pdf-generator.tsx` | jsPDF — 3 templates: Modern Pro, Executive, Minimal ATS |
| `lib/generators/docx-generator.ts` | DOCX generation |
| `components/preview/ResumePreview.tsx` | Result page — HTML preview + export buttons |
| `components/payment/PaymentGate.tsx` | Payment step UI |

### App Flow
```
upload → job-description → payment → analyzing → result
```
- Step transitions are managed by `useAppStore.step`
- After Paystack `callback` fires → `generate()` is called directly (no server verification)
- `completeGeneration(data)` sets both `resumeData` and `step: "result"` atomically

### PDF Templates (jsPDF)
All 3 share the same palette: navy `#0F172A`, sky-blue `#38BDF8`, sidebar `#F1F5F9`
| ID | Name | Layout |
|---|---|---|
| `modern-professional` | Modern Pro | Two-column: navy sidebar + main |
| `executive` | Executive | Single column, bold navy section bars |
| `minimal-ats` | Minimal ATS | Single column, left vertical accent bar |

---

## Environment Variables (`.env.local`)
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYMENT_AMOUNT=500000        # kobo (₦5,000)
NEXT_PUBLIC_PAYMENT_CURRENCY=NGN
NEXT_PUBLIC_APP_URL=https://atsresume.xyz
NEXT_PUBLIC_APP_NAME=ResumeForge
POLLINATIONS_API_TOKEN=                  # optional
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=5
```

---

## Git
- **Repo**: `https://github.com/HasbiyallahuJafaru/resume`
- **Working branch**: `clean-main`
- **Main branch**: `main`
- Recent commits are on `clean-main` — not yet merged to `main`

---

## What To Do Next (Suggested)
1. Test DOCX download end-to-end
2. Delete dead code: `app/api/pdf/route.ts`, `templates/pdf/`
3. Improve AI prompt to prevent `"string"` date values
4. Fine-tune PDF template spacing / typography
5. Merge `clean-main` → `main` when ready to deploy
6. Set up deployment on Vercel (connect repo, add env vars)
