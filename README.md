# Sacbé — Plataforma Nacional de Transporte 🚌

> Conectando destinos, uniendo personas.

Built with **Next.js 14**, **Supabase**, deployed on **Vercel**, source on **GitHub**.

---

## Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (phone OTP) |
| Storage | Supabase Storage (QR PDFs) |
| Hosting | Vercel |
| Source | GitHub |
| Payments | Stripe (Sprint 3) |
| SMS | Twilio (Sprint 2) |

---

## Branch Strategy

```
main          ← production (auto-deploys to Vercel)
develop       ← integration branch
  sprint-1    ← MVP: search, seat map, booking
  sprint-2    ← Auth, OTP, payments
  sprint-3    ← Company dashboard, QR validation
  sprint-4    ← Mobile PWA, WhatsApp, reports
```

Every feature goes: `sprint-N` → PR → `develop` → PR → `main`

---

## Sprints

### Sprint 1 — MVP (Week 1–3)
- [ ] Project setup (GitHub + Vercel + Supabase)
- [ ] Database schema
- [ ] Homepage with search
- [ ] Results page with seat map
- [ ] Booking flow (no real payment yet)
- [ ] QR generation

### Sprint 2 — Auth & Payments (Week 4–6)
- [ ] Supabase Auth with phone OTP
- [ ] User registration / login
- [ ] Stripe card payments
- [ ] PagoExpress cash flow
- [ ] My tickets page
- [ ] WhatsApp notifications (Twilio)

### Sprint 3 — Company Dashboard (Week 7–9)
- [ ] Company admin panel
- [ ] Route & schedule management
- [ ] QR validation scanner
- [ ] Revenue reports
- [ ] Cancellations & refunds

### Sprint 4 — Scale (Week 10–12)
- [ ] PWA (installable app)
- [ ] Push notifications
- [ ] Guatemala / El Salvador routes
- [ ] Multi-currency
- [ ] AI customer support (Claude API)

---

## Step-by-Step Setup

### Step 1 — GitHub

```bash
# 1. Create repo at github.com/new
#    Name: sacbe
#    Private or Public, your choice
#    Add README: NO (we have ours)

# 2. Clone it locally
git clone https://github.com/YOUR_USERNAME/sacbe.git
cd sacbe

# 3. Copy all project files into this folder
# 4. Initial commit
git add .
git commit -m "chore: initial project setup"
git push origin main

# 5. Create branches
git checkout -b develop
git push origin develop

git checkout -b sprint-1
git push origin sprint-1
```

### Step 2 — Supabase

```bash
# 1. Go to supabase.com → New Project
#    Name: sacbe
#    Password: (save this, it's your DB password)
#    Region: US East (closest to Honduras)

# 2. Once created, go to SQL Editor
#    Paste the contents of /docs/schema.sql and run it

# 3. Go to Project Settings → API
#    Copy: Project URL  → NEXT_PUBLIC_SUPABASE_URL
#    Copy: anon key     → NEXT_PUBLIC_SUPABASE_ANON_KEY
#    Copy: service_role → SUPABASE_SERVICE_ROLE_KEY

# 4. Go to Authentication → Providers → Phone
#    Enable it, paste your Twilio credentials
```

### Step 3 — Vercel

```bash
# 1. Go to vercel.com → Add New Project
#    Import your GitHub repo: sacbe

# 2. Framework: Next.js (auto-detected)

# 3. Environment Variables — add all of these:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    SUPABASE_SERVICE_ROLE_KEY
#    STRIPE_SECRET_KEY          (from stripe.com)
#    NEXT_PUBLIC_STRIPE_PUB_KEY
#    TWILIO_SID
#    TWILIO_TOKEN
#    TWILIO_FROM

# 4. Deploy — Vercel auto-deploys every push to main
#    Every branch also gets its own preview URL
```

### Step 4 — Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your keys

npm run dev
# → http://localhost:3000
```

### Step 5 — Workflow for each Sprint

```bash
# Start Sprint 2 work
git checkout sprint-2
git pull origin develop

# Work, commit often
git add .
git commit -m "feat: add phone OTP registration"
git push origin sprint-2

# When sprint is done → open Pull Request on GitHub
# sprint-2 → develop → review → merge
# develop → main → auto-deploys to Vercel production
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUB_KEY=
STRIPE_SECRET_KEY=
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Project Structure

```
sacbe/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Homepage
│   │   ├── resultados/       # Search results
│   │   ├── mis-viajes/       # My tickets
│   │   └── empresas/         # Company dashboard
│   ├── components/           # Shared UI components
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── api.ts            # API helpers
│   └── styles/
│       └── globals.css       # Global styles + CSS vars
├── docs/
│   └── schema.sql            # Full database schema
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── .env.example
└── README.md
```

---

## Sacbé · Honduras → Centroamérica
