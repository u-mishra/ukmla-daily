# UKMLA Daily

A free daily UKMLA practice question delivered straight to medical students' inboxes every morning at 7am.

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Supabase** for PostgreSQL database
- **Resend** for transactional email
- **Notion API** (read-only) for reading clinical content
- **Anthropic API** (Claude) for question generation
- **Tailwind CSS** for styling
- **Vercel** for hosting and cron jobs

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project
- A Resend account with verified domain
- Notion API key (read-only integration)
- Anthropic API key

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `RESEND_API_KEY` | Resend API key |
| `NOTION_API_KEY` | Notion integration token (read-only) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ADMIN_PASSWORD` | Password for the /admin panel |
| `CRON_SECRET` | Secret for cron job authentication |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (e.g., https://ukmladaily.co.uk) |

### 3. Set up the database

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and run it in your Supabase project's SQL editor
```

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables in Vercel's dashboard
4. Deploy — Vercel will automatically set up the cron jobs from `vercel.json`

### Resend Domain Verification

1. Go to [Resend Dashboard](https://resend.com) → Domains
2. Add `ukmladaily.co.uk`
3. Add the DNS records (MX, TXT, DKIM) to your domain registrar
4. Wait for verification (usually a few minutes)
5. Set the from address to `question@ukmladaily.co.uk`

## Generating Questions

1. Set up a Notion integration with read-only access
2. Share the parent page (ID: `304c4f38-3608-809f-90cb-f08a88eed078`) with your integration
3. Each child page should contain clinical content about a condition
4. Go to `/admin`, log in, and click "Generate Questions"
5. Review and approve/reject generated questions

The weekly cron job also auto-generates questions when the approved queue drops below 30.

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── globals.css                 # Global styles and animations
│   ├── answer/[id]/
│   │   ├── page.tsx                # Answer page (server component)
│   │   └── AnswerClient.tsx        # Answer page (client interactivity)
│   ├── admin/page.tsx              # Admin dashboard
│   ├── unsubscribe/page.tsx        # One-click unsubscribe
│   ├── privacy/page.tsx            # Privacy policy
│   └── api/
│       ├── subscribe/route.ts      # POST: email subscription
│       ├── send-daily/route.ts     # POST/GET: send daily email (cron)
│       ├── generate/route.ts       # POST/GET: generate questions from Notion+AI
│       ├── track-click/route.ts    # POST: log answer clicks
│       └── admin/
│           ├── stats/route.ts      # POST: dashboard statistics
│           ├── questions/route.ts  # POST: list questions by status
│           └── approve/route.ts    # POST: approve/reject questions
├── components/
│   ├── DarkModeToggle.tsx          # Dark mode switch
│   ├── SubscribeForm.tsx           # Reusable email signup form
│   ├── SampleQuestion.tsx          # Interactive sample question
│   └── EmailMockup.tsx             # Animated inbox mockup
└── lib/
    ├── supabase.ts                 # Supabase client
    ├── rate-limit.ts               # In-memory rate limiting
    ├── email-templates.ts          # HTML email templates
    └── reference-values.ts         # Normal clinical values by specialty

supabase/migrations/
└── 001_initial_schema.sql          # Database schema

vercel.json                         # Cron job configuration
```

## Cron Jobs

| Schedule | Endpoint | Purpose |
|---|---|---|
| Daily 7:00 AM UTC | `/api/send-daily` | Send the daily question email |
| Weekly Monday 9:00 AM UTC | `/api/generate?auto=true` | Auto-generate questions if queue < 30 |

## Security

- All API keys stored in environment variables
- `.env` and `.env.local` in `.gitignore`
- Admin panel password-protected
- Cron endpoints require `CRON_SECRET`
- Rate limiting on subscribe endpoint (50/hour per IP)
- Supabase Row Level Security enabled
- Input validation on all endpoints
