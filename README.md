# CopperEye — Platform v2

**AI walk-round security surveys + a Checkatrade/Bark-style marketplace for the UK security trade — in one platform.**

CopperEye connects homeowners and businesses with vetted security engineers (CCTV, intruder alarms, gate automation, access control, smart locks, commercial security, lighting, maintenance). Customers walk their property with an **AI surveyor** that guides every photo; the AI turns that walk-round into a full install brief so engineers can quote accurately **without a call-out**.

This branch is a full rebuild of the original CopperEye demo (`main`, built with Lovable) as a **Next.js 16** application with a real database, real accounts and real AI analysis. It is the new "platform v2" codebase — `main` is untouched so Lovable history stays intact.

## What's inside

### Both sides, one sign-in
- Register as a **Customer** or **Engineer** — separate dashboards, profiles and tools for each.
- Real email + password accounts (scrypt-hashed, HTTP-only session cookies, Prisma/SQLite).

### Customer side
- **Post a job** with category-aware details (CCTV, alarms, gates, access, smart, commercial, lighting, repair).
- **AI walk-round wizard** — step-by-step guided survey. Each step tells the customer what to photograph and where kit usually goes (front elevation, sides/alleyways, eaves & mounting surfaces, NVR/panel spots, router, gates…). Photos upload straight from the phone camera, compressed client-side.
- **AI surveyor brief** — after posting, the backend analyses every photo (vision model) and the notes, then writes a structured brief: recommended camera/sensor positions with heights and coverage, cable routes & power, connectivity, risks, suggested kit quantities and open questions. Engineers quote from this — no wasted quote visits.
- **Quotes inbox** — compare quotes side by side with engineer ratings, experience and verification badges; accept one and the job is awarded.
- **Reviews** — rate completed jobs; reviews build the engineer's public profile.

### Engineer side
- **Job feed** with AI-brief previews, budget, location, photo counts.
- **Full job detail** — the complete AI brief, walk-round photos with per-photo AI observations, and the customer's notes.
- **Quote builder** — amount, hours, materials, message; update before acceptance.
- **Credits (Bark-style)** — 20 free credits on signup; 3 credits unlock a job's customer contact (phone + email). Simulated credit packs (20/50/100/250) ready to wire to a real payment provider.
- **Checkatrade-style profile** — business name, headline, bio, trades covered, coverage area, experience, accreditations, verified badge, rating and review history.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui (black/copper CopperEye theme)
- Prisma ORM + SQLite (`file:./db/custom.db`)
- z-ai-web-dev-sdk (backend only) for vision photo analysis and brief generation
- Session auth with scrypt password hashing

## Run it

```bash
bun install
bun run db:push        # create tables
bun scripts/seed.ts    # optional: demo engineers, jobs, reviews
bun run dev            # http://localhost:3000
```

Demo accounts (after seeding, password `copper123`):
- Customer: `customer@demo.coppereye.uk`
- Engineers: `dave.hall@demo.coppereye.uk`, `aisha.khan@demo.coppereye.uk`, `tony.marsh@demo.coppereye.uk`, …

## Project layout

```
prisma/schema.prisma            User, EngineerProfile, Job, Survey, SurveyPhoto,
                                Quote, Unlock, CreditTransaction, Review
src/lib/coppereye/
  categories.ts                 8 categories + per-category AI walk-round steps
  auth.ts                       sessions, password hashing, guards
  ai.ts                         photo vision analysis + brief generation
  jobs.ts                       shared query helpers
src/app/api/                    auth, jobs (+ [id], analyze, unlock),
                                quotes (+ accept), credits, profile, reviews
src/components/coppereye/       Landing, AuthModal, PostJobWizard, JobDetail,
                                CustomerDash, EngineerDash, CopperEyeApp
scripts/seed.ts                 demo data
```

## Roadmap

- [x] Real accounts + separate customer/engineer dashboards
- [x] AI walk-round wizard with per-step photo upload
- [x] AI photo analysis + engineer-ready job brief
- [x] Quotes, accept/award, reviews, ratings
- [x] Credits wallet with contact unlocks (simulated payment)
- [ ] Real payments (Stripe/SumUp) for credit packs
- [ ] In-app messaging + WhatsApp tap-to-chat on jobs
- [ ] Live camera mode with real-time AI guidance during the walk-round
- [ ] Engineer-side AI help desk (app pairing, port forwarding, IP/config troubleshooting)
- [ ] Equipment catalogue (top systems, camera styles, alarm panels)
- [ ] Cloud Postgres deployment + image CDN

> Note: pushed as branch `platform-v2` so the Lovable-connected `main` branch stays untouched.
