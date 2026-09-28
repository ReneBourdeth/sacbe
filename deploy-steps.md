# Sacbé — Deploy Cheatsheet
# Run these commands in order, one section at a time.

# ══════════════════════════════════════════
# STEP 1 — GITHUB (do this first)
# ══════════════════════════════════════════

# 1a. Go to github.com/new
#     Name: sacbe
#     Leave all checkboxes unchecked → Create repository

# 1b. In your terminal, inside the project folder:
git init
git add .
git commit -m "chore: initial Sacbé project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sacbe.git
git push -u origin main

# 1c. Create all branches
git checkout -b develop  && git push origin develop
git checkout -b sprint-1 && git push origin sprint-1
git checkout -b sprint-2 && git push origin sprint-2
git checkout -b sprint-3 && git push origin sprint-3
git checkout -b sprint-4 && git push origin sprint-4

# Go back to sprint-1 — this is where you work now
git checkout sprint-1


# ══════════════════════════════════════════
# STEP 2 — SUPABASE
# ══════════════════════════════════════════

# 2a. Go to supabase.com → New project
#     Name: sacbe
#     Password: save this somewhere safe
#     Region: US East 1 (best for Honduras)
#     Click "Create new project" — wait ~2 min

# 2b. Go to SQL Editor (left sidebar)
#     Paste the contents of docs/schema.sql
#     Click "Run" — all tables get created

# 2c. Go to Project Settings → API
#     Copy these three values into your .env.local:
#     - Project URL     → NEXT_PUBLIC_SUPABASE_URL
#     - anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
#     - service_role    → SUPABASE_SERVICE_ROLE_KEY

# 2d. Go to Authentication → Providers → Phone
#     Toggle ON
#     Enter your Twilio Account SID, Auth Token, and From number
#     (Get these free at twilio.com)


# ══════════════════════════════════════════
# STEP 3 — LOCAL DEVELOPMENT
# ══════════════════════════════════════════

npm install
cp .env.example .env.local
# Open .env.local and fill in your Supabase keys

npm run dev
# Open http://localhost:3000 — you should see Sacbé


# ══════════════════════════════════════════
# STEP 4 — VERCEL
# ══════════════════════════════════════════

# 4a. Go to vercel.com → Add New → Project
#     Import from GitHub → select "sacbe"
#     Framework preset: Next.js (auto-detected)

# 4b. Add Environment Variables (paste from your .env.local):
#     NEXT_PUBLIC_SUPABASE_URL
#     NEXT_PUBLIC_SUPABASE_ANON_KEY
#     SUPABASE_SERVICE_ROLE_KEY
#     NEXT_PUBLIC_STRIPE_PUB_KEY   (add later in Sprint 2)
#     STRIPE_SECRET_KEY             (add later in Sprint 2)
#     TWILIO_SID                    (add later in Sprint 2)
#     TWILIO_TOKEN
#     TWILIO_FROM

# 4c. Click Deploy
#     Vercel gives you: https://sacbe.vercel.app
#     Every push to main = auto deploy to production
#     Every branch = its own preview URL


# ══════════════════════════════════════════
# STEP 5 — GITHUB SECRETS (for CI)
# ══════════════════════════════════════════

# Go to github.com/YOUR_USERNAME/sacbe
# Settings → Secrets and variables → Actions → New secret
# Add these secrets (same values as .env.local):
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_STRIPE_PUB_KEY


# ══════════════════════════════════════════
# DAILY WORKFLOW — Sprint 1
# ══════════════════════════════════════════

# Make sure you're on sprint-1
git checkout sprint-1

# Work on the code...

# Save your work
git add .
git commit -m "feat: add seat map component"
git push origin sprint-1

# Vercel automatically creates a preview URL for sprint-1
# Share that URL to test without touching production

# When sprint-1 is DONE:
# GitHub → Pull Requests → New PR
# From: sprint-1  →  To: develop
# Review → Merge

# When develop is stable:
# New PR: develop → main
# Merge → Vercel auto-deploys to production


# ══════════════════════════════════════════
# COMMIT MESSAGE FORMAT
# ══════════════════════════════════════════

# Use these prefixes so the history is clean:
# feat:     new feature
# fix:      bug fix
# chore:    setup, dependencies, config
# style:    CSS, design changes
# refactor: code cleanup (no new features)
# docs:     README, comments

# Examples:
git commit -m "feat: add QR generation on booking confirmation"
git commit -m "fix: seat map not updating in realtime"
git commit -m "chore: add Stripe dependency"
git commit -m "style: update hero typography to Cormorant Garamond"
