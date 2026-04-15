Create a comprehensive README.md in the project root with the following content:

# FlashGenius 🧠

AI-powered flashcard app that turns any PDF into a smart study deck. Built to solve the core problem with traditional flashcard apps — passive learning. FlashGenius forces active recall, grades your answers semantically, and provides a personal AI tutor for every card.

Live demo: [your-vercel-url]

---

## Features

### 📄 PDF to Smart Deck (90 seconds)
Upload any PDF — lecture notes, textbooks, research papers. The AI does a two-pass extraction:
- First pass identifies core concepts, relationships, definitions, and edge cases
- Second pass generates cards with real variety — not just shallow bullet points
- Cards are tagged by type (concept, definition, application, comparison, edge case) and difficulty (easy, medium, hard)

### 🧠 Active Recall Mode
The single biggest leap from flashcard toy to real learning tool.
- Instead of passively flipping cards, you type your answer from memory
- AI grades semantically — not keyword matching. Writing "a² + b² = c²" scores correctly for "What is the Pythagorean theorem?" even if worded differently
- Get a score (0-100), grade (Excellent/Good/Partial/Needs Work), and specific feedback on what you missed
- Session summary at the end shows grade distribution and flags weak cards (score < 60) for focused review

### 🃏 Flip Card Mode
Classic spaced repetition with Easy / Medium / Hard rating buttons. Your ratings feed into mastery tracking per card.

### 💬 AI Tutor Per Card
Every card has an "Ask Tutor" button. The tutor has full context — the card, the deck, and your study history.
- "Explain this differently" — gets a new analogy
- "Give me an example" — gets a concrete real-world example  
- "Why is this true?" — gets the underlying reasoning
- "Break it down step by step" — gets a simplified walkthrough

### 📊 Mastery Tracking
- Per-deck mastery percentage based on card ratings
- Cards categorized as New / Learning / Mastered
- Weak card detection: cards with average recall score < 60 across last 3 attempts are flagged with a ⚠ badge

### 🔥 Streak Tracking
- Tracks consecutive days studied
- Streak counter visible in navbar
- Toast notification when you maintain or break a streak

### 🗂 Deck Management
- Search decks by title, description, or source filename
- Filter by status: All / In Progress / Mastered / New / Needs Review
- Sort by: Last Opened / Recently Created / Alphabetical / Mastery
- "Continue Studying" banner shows your most recently opened deck

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI / LLM | Groq (llama-3.3-70b-versatile) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| UI Components | shadcn/ui + 21st.dev |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- A Groq API key (free tier works for development)

### Installation

1. Clone the repo
git clone https://github.com/yourusername/flashcard-engine.git
cd flashcard-engine

2. Install dependencies
npm install

3. Copy the environment variables file
cp .env.example .env.local

4. Fill in your environment variables in .env.local (see Environment Variables section below)

5. Set up the database (run these in Supabase SQL Editor)
-- Cards table columns
ALTER TABLE cards ADD COLUMN IF NOT EXISTS concept_tag text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS mastery_level integer DEFAULT 0;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;

-- Active recall attempts table
CREATE TABLE IF NOT EXISTS active_recall_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES cards(id) ON DELETE CASCADE,
  deck_id uuid REFERENCES decks(id) ON DELETE CASCADE,
  user_answer text,
  score integer,
  grade text,
  created_at timestamptz DEFAULT now()
);

6. Run the development server
npm run dev

Open http://localhost:3000

---

## Environment Variables

Create a .env.local file in the root with:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key

| Variable | Where to get it |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Dashboard → Project Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Dashboard → Project Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard → Project Settings → API |
| GROQ_API_KEY | console.groq.com → API Keys |

---

## How It Works

1. User uploads a PDF
2. Server extracts text from the PDF
3. First Groq call analyzes the content and extracts a structured concept outline
4. Second Groq call generates typed, difficulty-tagged flashcards from the outline
5. Cards are saved to Supabase and linked to the user's account
6. User studies via flip mode or active recall mode
7. Ratings and recall scores update mastery levels per card
8. AI tutor is available on any card with full deck context

---

## Project Structure

flashcard-engine/
├── app/
│   ├── api/                  # API routes
│   │   ├── generate/         # PDF → flashcard generation
│   │   ├── grade-answer/     # Active recall AI grading
│   │   ├── tutor-chat/       # AI tutor per card
│   │   ├── decks/            # Deck CRUD
│   │   └── cards/            # Card CRUD
│   ├── dashboard/            # Deck management page
│   ├── deck/[id]/            # Deck view + practice mode
│   └── page.tsx              # Landing page
├── components/
│   ├── cards/                # FlashCard, ActiveRecallCard
│   ├── deck/                 # DeckCard, DeckStats, DeckProgress
│   ├── practice/             # PracticeMode, RatingButtons
│   ├── tutor/                # TutorChat, TutorMessage
│   ├── dashboard/            # SearchBar, FilterBar, ContinueBanner
│   ├── ui/                   # Reusable UI primitives
│   └── layout/               # Navbar, PageWrapper
├── lib/
│   └── supabase/             # Supabase client helpers
└── .env.example

---

## Deployment

The app is deployed on Vercel. To deploy your own:

1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy

Make sure GROQ_API_KEY is set for all environments (Production, Preview, Development).

---

## Known Limitations

- PDF generation uses Groq free tier which has token rate limits — large PDFs may need a retry
- Active recall grading works best in English
- Maximum ~15 cards generated per PDF to stay within token limits

---

## License

MIT
