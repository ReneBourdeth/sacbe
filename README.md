# Sacbé — Plataforma Nacional de Transporte 🚌

> Conectando destinos, uniendo personas.

Built with **Next.js 14**, **Supabase**, deployed on **Vercel**, source on **GitHub**.

---

## Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email link) |
| Storage | Supabase Storage (QR PDFs) |
| Hosting | Vercel |
| Source | GitHub |
| Payments | Stripe (Sprint 3) |
| SMS | Twilio (Sprint 2) |

---

## Branch Strategy

```
main       ← production. Every push here goes live on sacbe-theta.vercel.app
  develop  ← testing. Everything is merged here first and checked on its Vercel preview
    sprint-2   ← current sprint's work (sprint-3, sprint-4 later)
```

**Rules**
1. **Never commit straight to `main`.** Work happens on the sprint branch.
2. When a feature works on `sprint-N`: open a Pull Request **`sprint-N` → `develop`**.
   Vercel builds a preview link for it, so you can test it like the real site.
3. When `develop` is stable: Pull Request **`develop` → `main`**. Merging it publishes the site.
4. When a sprint is finished, tag it so you can always find that version:
   `git tag -a v0.2-sprint-2 -m "Sprint 2 complete" && git push origin v0.2-sprint-2`

Sprint 1 is tagged `v0.1-sprint-1`.

## Sprints

### Sprint 1 — MVP (Week 1–3)
- [x] Project setup (GitHub + Vercel + Supabase)
- [x] Database schema
- [x] Homepage with search
- [x] Results page with seat map
- [x] Booking flow (no real payment yet)
- [x] QR generation

### Sprint 2 — Auth & Payments (Week 4–6)
- [x] Supabase Auth with email OTP (phone/WhatsApp later — paid)
- [x] User registration / login
- [ ] Stripe card payments
- [ ] PagoExpress cash flow
- [x] My tickets page
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
- [ ] AI customer support

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

### Step 5 — Daily workflow

```bash
# 1. Start from the sprint branch, up to date
git checkout sprint-2
git pull

# 2. Work, and commit small steps with clear messages (see below)
git add .
git commit -m "feat: PagoExpress cash payment reference"
git push

# 3. Feature done? On GitHub: Pull requests → New → base: develop ← compare: sprint-2
#    Check the Vercel preview link in the PR, then merge.

# 4. Release: Pull request develop → main, merge → the live site updates.
```

**Commit message prefixes**

| Prefix | Use for |
|--------|---------|
| `feat:` | a new feature |
| `fix:` | a bug fix |
| `refactor:` | reorganizing code without changing behavior |
| `style:` | look and layout |
| `docs:` | README, comments |
| `chore:` | setup, dependencies, config |

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
│   ├── app/                      # Pages (Next.js App Router: folder = URL)
│   │   ├── page.tsx              # /            Home + trip search
│   │   ├── resultados/           # /resultados  Search results + booking
│   │   │   ├── ResultadosClient  #   list, filters, layout
│   │   │   ├── TarjetaViaje      #   one trip card
│   │   │   ├── ResumenSeleccion  #   "Tu selección" price box
│   │   │   ├── ModalCompra       #   4-step booking window
│   │   │   ├── MapaAsientos      #   bus seat map
│   │   │   ├── useAsientos       #   loads seats + live updates
│   │   │   └── estilos.ts        #   shared styles
│   │   ├── entrar/               # /entrar      Email sign-in (+ /callback)
│   │   └── mis-viajes/           # /mis-viajes  My tickets
│   ├── components/               # Shared UI: SiteHeader, AuthLink, LangToggle, Simbolos (macaw + Copán drawings)
│   ├── lib/                      # Logic with no UI
│   │   ├── api.ts                #   every Supabase query/booking call
│   │   ├── supabase.ts           #   client + database types
│   │   ├── i18n.tsx              #   Spanish/English texts
│   │   ├── fecha.ts              #   Honduras time helpers
│   │   ├── terminales.ts         #   terminal codes → city names
│   │   ├── precios.ts            #   service fee
│   │   ├── qr.ts                 #   QR image generation
│   │   └── navegacion.ts         #   safe redirects
│   └── styles/globals.css        # Honduran palette, fonts, motifs, responsive layout (sb-* classes)
├── docs/
│   ├── schema.sql                # Tables, RLS policies
│   ├── sprint1-reservas.sql      # reservar_asiento() booking function
│   └── asientos-trigger.sql      # auto-create seats for new trips
└── .github/workflows/ci.yml      # Lint + build on every push
```

**Coding conventions**
- Data access only through `src/lib/api.ts` — pages never write queries.
- Anything that changes data runs as a database function (safe, atomic); the browser is never trusted with prices or user IDs.
- One component, one job. If a file grows past ~250 lines, split it.
- Every text the user sees goes in `i18n.tsx` (both `es` and `en`).
- Comments explain **why**, not what.

## Sacbé · Honduras → Centroamérica
