# ResumeForge — Setup Guide

## Prerequisites

- Node.js 18+
- A Neon PostgreSQL account (free tier works)
- A Paystack account (live or test keys)

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

### Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key (server-side) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Your Paystack public key (client-side) |
| `NEXT_PUBLIC_PAYMENT_AMOUNT` | Amount in kobo (e.g. `500000` = ₦5,000) |
| `NEXT_PUBLIC_PAYMENT_CURRENCY` | Currency code (e.g. `NGN`) |

---

## 3. Set up the database

```bash
# Push schema to Neon
npm run db:push

# Generate Prisma client
npm run db:generate
```

---

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in the Vercel dashboard under Settings → Environment Variables.

The `vercel.json` already configures:
- `maxDuration: 90` for the AI generation route
- Prisma client generation on build

---

## 6. Configure Paystack webhook (optional)

In your Paystack dashboard, add a webhook pointing to:

```
https://atsresume.xyz/api/payment/webhook
```

This handles payment confirmation as a backup to the client-side verification.

---

## Project structure

```
/app
  /api
    /generate          → AI pipeline route (rate limited)
    /payment/verify    → Paystack server-side verification
    /payment/webhook   → Paystack webhook receiver
    /unlock/validate   → Token validation
  /app                 → Main application page
  layout.tsx           → Root layout
  page.tsx             → Landing page
  globals.css          → Global styles

/components
  /analyzing           → AI loading state
  /job                 → Job description form
  /layout              → Header, step indicator
  /payment             → Payment gate component
  /preview             → Resume preview + export
  /ui                  → Button, Card primitives
  /upload              → File upload component

/lib
  /ai                  → Pollinations.ai pipeline + prompts
  /generators          → PDF + DOCX generation
  /parsers             → PDF + DOCX parsing
  prisma.ts            → Prisma client singleton
  rate-limit.ts        → Rate limiting via DB
  schemas.ts           → Zod validation schemas
  utils.ts             → Utilities

/templates
  /pdf                 → react-pdf resume templates
    MinimalATSPDF.tsx
    ExecutivePDF.tsx
    ModernPDF.tsx

/types                 → TypeScript types
/store                 → Zustand store
/hooks                 → useGenerate, usePaystack, useExport
/prisma                → Prisma schema
```

---

## AI pipeline

The system uses Pollinations.ai (free, no key required) with the `openai` model.

The system prompt enforces:
- No hallucinations
- No invented experience
- Conservative professional rewrite only
- Structured JSON output

---

## Security notes

- Payment unlock tokens are generated server-side only
- All payment verification happens via Paystack API server-side
- Frontend only sends reference → backend verifies → returns signed token
- Rate limiting is enforced per IP via the database
- System prompts are never exposed to the client
