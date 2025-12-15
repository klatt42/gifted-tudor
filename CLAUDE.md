# GiftedTudor CLAUDE.md

**Last Updated**: 2024-12-14
**Project Status**: Phase 1 - MVP Development
**Domain**: giftedtudor.com

---

## Project Overview

**GiftedTudor** is an AI-powered adaptive learning platform for homeschool parents of gifted K-12 students. The platform combines intelligent curriculum generation, personalized AI tutoring, and adaptive learning paths.

### Key Value Proposition
- 81% reduction in curriculum planning time
- Personalized learning paths adapting to each child
- Standards alignment (MD/VA/DC, Common Core)
- 24/7 AI tutor (Claude-powered)

### Target Users
- **Primary**: Homeschool parents of gifted children
- **Secondary**: Parents supplementing school gifted programs
- **Tertiary**: Tutoring centers (future B2B)

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15 (App Router) |
| Language | TypeScript | 5.x |
| React | React | 19 |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui | Latest |
| State | Zustand | 5.x |
| Database | Supabase (PostgreSQL) | Latest |
| AI | Anthropic Claude | claude-3-5-sonnet |
| Auth | Supabase Auth | Built-in |
| Hosting | Netlify | (planned) |

---

## Project Structure

```
gifted-tudor/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Home (Parent Dashboard)
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── api/                 # API routes (to be created)
│   │       ├── curriculum/      # AI curriculum generation
│   │       ├── tutor/           # AI tutor chat
│   │       └── progress/        # Progress tracking
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── dashboard/           # Parent dashboard components
│   │   ├── student/             # Student interface components
│   │   ├── curriculum/          # Curriculum builder components
│   │   ├── tutor/               # AI tutor chat components
│   │   └── common/              # Shared components
│   └── lib/
│       ├── types/               # TypeScript types
│       ├── store/               # Zustand stores
│       ├── supabase/            # Supabase clients
│       ├── ai/                  # AI integrations
│       ├── hooks/               # Custom React hooks
│       └── db/                  # Database operations
├── docs/
│   └── PRD.md                   # Product Requirements Document
├── public/                      # Static assets
├── env.example                  # Environment template
└── CLAUDE.md                    # This file
```

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Database (when Supabase is set up)
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push # Push schema changes
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Anthropic
ANTHROPIC_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GiftedTudor
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page (Parent Dashboard) |
| `src/components/dashboard/ParentDashboard.tsx` | Main dashboard component |
| `src/lib/types/index.ts` | All TypeScript interfaces |
| `src/lib/store/student-store.ts` | Student state management |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `docs/PRD.md` | Full product requirements |

---

## Development Phases

### Phase 1: MVP (Current - Weeks 1-8)
- [x] Project setup, Next.js 15, TypeScript
- [x] shadcn/ui components installed
- [x] Parent dashboard UI (demo data)
- [x] Zustand state management
- [x] Supabase client setup
- [ ] **Supabase project creation** (needs user action)
- [ ] Database schema implementation
- [ ] User authentication
- [ ] AI curriculum generator
- [ ] AI tutor chat (streaming)
- [ ] Basic progress tracking

### Phase 2: Enhancement (Weeks 9-14)
- [ ] Adaptive difficulty engine
- [ ] Mastery visualization
- [ ] Assessment builder
- [ ] PWA setup
- [ ] Standards mapping

### Phase 3: Growth (Weeks 15-20)
- [ ] Stripe payments
- [ ] Full achievement system
- [ ] Analytics dashboard
- [ ] Compliance reports

---

## Database Schema (Planned)

Core tables to create in Supabase:

```sql
-- families, users, students
-- subjects, topics, lessons, activities
-- progress, mastery, streaks
-- tutor_sessions, tutor_messages
-- achievements, student_achievements
-- assessments, assessment_results
```

Full schema in `docs/PRD.md` Section 5.2.

---

## AI Integration

### Curriculum Generation
- Endpoint: `/api/curriculum/generate`
- Model: Claude 3.5 Sonnet
- Input: Grade, subject, topics, difficulty
- Output: Structured lesson plan with activities

### AI Tutor
- Endpoint: `/api/tutor/chat`
- Model: Claude 3.5 Sonnet (streaming)
- Features: Socratic method, age-appropriate, hints

---

## Current Status

**Completed**:
- Project initialized with Next.js 15
- shadcn/ui components installed (button, card, input, dialog, etc.)
- Parent dashboard with demo data
- TypeScript types defined
- Zustand store for student state
- Supabase client files created

**Next Steps**:
1. Create Supabase project at supabase.com
2. Add environment variables to `.env.local`
3. Create database schema
4. Implement authentication
5. Build AI curriculum generator API

---

## Important Notes

- **Demo Mode**: Dashboard currently uses demo data. Real data will come from Supabase.
- **No Auth Yet**: Authentication will use Supabase Auth (magic link + OAuth)
- **Port**: Development server runs on port 3000 by default

---

## Git Workflow

```bash
# Feature branches
git checkout -b feature/curriculum-generator
git checkout -b feature/ai-tutor

# Commit convention
[FEATURE] GT-001: Add curriculum generation API
[FIX] GT-002: Fix dashboard loading state
[DOCS] Update CLAUDE.md with new endpoints
```

---

## Contacts & Resources

- **Domain**: giftedtudor.com
- **PRD**: `/docs/PRD.md`
- **Supabase Docs**: https://supabase.com/docs
- **Claude API**: https://docs.anthropic.com
- **shadcn/ui**: https://ui.shadcn.com

---

**GiftedTudor**: Empowering parents to provide world-class gifted education.
