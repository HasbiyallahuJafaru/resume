# ResumeForge

AI-assisted resume and cover letter refinement engine. Upload your CV, paste a job description, and get a recruiter-grade, ATS-optimized resume in under a minute.

No hallucinations. No fabricated experience. Just your real background, expressed better.

---

## What it does

ResumeForge takes your existing resume and a target job description, then rewrites your content the way a senior recruiter would edit it:

- Clearer, stronger phrasing
- ATS keyword alignment (only where it honestly applies)
- Reorganized structure for maximum impact
- A tailored cover letter in your voice
- PDF and DOCX export in three template styles

The AI never invents achievements, metrics, certifications, or experience. It only improves what you already have.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Database | Neon PostgreSQL via Prisma ORM |
| AI | Pollinations.ai (OpenAI model, no key required) |
| Payments | Paystack Inline |
| PDF generation | @react-pdf/renderer (client-side) |
| DOCX generation | docx (client-side) |
| File parsing | pdfjs-dist + mammoth |
| State | Zustand + sessionStorage |
| Validation | Zod |
| Hosting | Vercel |

---

## User flow

```
Landing page
    |
    v
Upload CV  (PDF, DOCX, or paste text)
    |
    v
Paste job description
    |
    v
AI analyzes and rewrites  (~30-60 seconds)
    |
    v
Preview results  (partial, with blur gate)
    |
    v
Pay via Paystack  (server-verified, one-time)
    |
    v
Unlock full resume + cover letter
    |
    v
Download PDF and DOCX instantly
```

---

## Getting started

### Prerequisites

- Node.js 18 or later
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Paystack](https://paystack.com) account

### 1. Clone and install

```bash
git clone https://github.com/your-username/atsresume.git
cd atsresume
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Paystack
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxxxxxxxxxx"

# Payment amount in kobo (500000 = N5,000)
NEXT_PUBLIC_PAYMENT_AMOUNT=500000
NEXT_PUBLIC_PAYMENT_CURRENCY="NGN"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="ResumeForge"
```

### 3. Set up the database

```bash
npm run db:push
npm run db:generate
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
atsresume/
|
+-- app/
|   +-- api/
|   |   +-- generate/          AI generation route (rate limited)
|   |   +-- payment/
|   |   |   +-- verify/        Server-side Paystack verification
|   |   |   +-- webhook/       Paystack webhook receiver
|   |   +-- unlock/validate/   Token validation
|   +-- app/                   Main application page
|   +-- layout.tsx             Root layout + font + Paystack script
|   +-- page.tsx               Landing page
|   +-- globals.css
|
+-- components/
|   +-- analyzing/             AI loading animation
|   +-- job/                   Job description form
|   +-- layout/                Header, step indicator
|   +-- payment/               Payment gate with email input
|   +-- preview/               Resume preview + export buttons
|   +-- ui/                    Button, Card primitives
|   +-- upload/                File upload + paste mode
|
+-- lib/
|   +-- ai/
|   |   +-- pollinations.ts    Pollinations.ai client
|   |   +-- prompts.ts         System prompt (strict no-hallucination rules)
|   +-- generators/
|   |   +-- pdf-generator.tsx  Client-side PDF generation
|   |   +-- docx-generator.ts  Client-side DOCX generation
|   +-- parsers/
|   |   +-- pdf-parser.ts      pdfjs-dist browser parser
|   |   +-- docx-parser.ts     mammoth browser parser
|   |   +-- index.ts           Unified file parser
|   +-- prisma.ts              Prisma client singleton
|   +-- rate-limit.ts          IP-based rate limiting via DB
|   +-- schemas.ts             Zod validation schemas
|   +-- utils.ts               Shared utilities
|
+-- templates/
|   +-- pdf/
|       +-- MinimalATSPDF.tsx  Clean single-column ATS layout
|       +-- ExecutivePDF.tsx   Serif executive style
|       +-- ModernPDF.tsx      Dark-header modern layout
|
+-- store/
|   +-- useAppStore.ts         Zustand store with session persistence
|
+-- hooks/
|   +-- useGenerate.ts         AI generation hook with step animation
|   +-- usePaystack.ts         Paystack inline hook
|   +-- useExport.ts           PDF/DOCX export hook
|
+-- types/
|   +-- index.ts               All TypeScript interfaces
|
+-- prisma/
|   +-- schema.prisma          Payment, Generation, RateLimit models
|
+-- .env.example
+-- vercel.json
+-- SETUP.md
```

---

## AI system design

The AI pipeline follows a strict no-fabrication policy enforced at the prompt level:

**What the AI does:**
- Extracts facts from the original resume exactly as stated
- Analyzes what the job description is looking for
- Identifies genuine matches between the two
- Rewrites bullets with stronger action verbs and clearer structure
- Aligns terminology with the job description where it honestly applies
- Generates a grounded, tailored cover letter

**What the AI never does:**
- Invent job titles, companies, dates, or locations
- Add metrics or percentages not in the original
- Add technologies or tools not mentioned
- Add certifications not listed
- Use generic filler phrases ("results-driven", "dynamic", "synergized")

The model is `openai` via Pollinations.ai, called with `temperature: 0.3` for consistency. Output is enforced as structured JSON matching the resume schema.

---

## Payment security

The payment flow is designed so the frontend cannot bypass verification:

```
1. User pays via Paystack Inline
2. Frontend receives payment reference (not a token)
3. Frontend sends reference to /api/payment/verify
4. Backend calls Paystack API to verify amount and status
5. Backend generates a signed unlock token on success
6. Frontend receives the token and unlocks the UI
```

The unlock token is stored in the database and validated on each export action. The frontend never receives a token unless the backend confirms payment success with Paystack directly.

---

## Database models

```prisma
model Payment {
  id          String        @id @default(cuid())
  reference   String        @unique
  email       String?
  amount      Int
  status      PaymentStatus
  verified    Boolean
  unlockToken String?       @unique
  ...
}

model Generation {
  id        String           @id @default(cuid())
  sessionId String
  template  String
  status    GenerationStatus
  outputData Json?
  ...
}

model RateLimit {
  id          String @id @default(cuid())
  identifier  String @unique
  count       Int
  windowStart DateTime
  ...
}
```

---

## Resume templates

Three PDF templates, all ATS-safe (single column, no tables, no graphics):

| Template | Style | Font |
|---|---|---|
| Minimal ATS | Clean, spacious, modern | Helvetica |
| Executive | Serif, formal, traditional | Times New Roman |
| Modern Professional | Dark header, contemporary | Helvetica |

All templates also include a second page for the cover letter.

---

## Rate limiting

Generation requests are rate-limited per IP address using the database:

- Default: 5 requests per 60 seconds
- Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`
- Returns 429 with `X-RateLimit-Reset` header when exceeded

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel --prod
```

Add all environment variables in the Vercel dashboard. The `vercel.json` sets:
- `maxDuration: 90` on the AI generation route (AI calls can take 30-60 seconds)
- `maxDuration: 30` on the payment verification route
- Prisma client generation as part of the build command

### Paystack webhook (recommended)

Add a webhook in your Paystack dashboard pointing to:

```
https://atsresume.xyz/api/payment/webhook
```

The webhook provides a backup confirmation path in case the client loses connection after payment.

---

## Available scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

---

## License

MIT
