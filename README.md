
# FlashGenius

AI-powered flashcard app that turns any PDF into a smart study deck. Built as part of the Cuemath hiring assignment.

https://cuemath-task-kohl.vercel.app/

---

## What I Built

Most flashcard apps are passive — you flip a card, read the answer, and fool yourself into thinking you learned it. FlashGenius fixes that by forcing active recall and grading answers semantically using AI.

Core features:
- Upload any PDF and get a smart deck in ~90 seconds
- Active Recall mode: type your answer, AI grades it semantically with partial credit and feedback
- Flip Card mode with Easy / Medium / Hard spaced repetition ratings
- AI Tutor on every card — ask it to explain differently, give an example, or break it down
- Mastery tracking, weak card detection, streak counter, deck search and filtering

---

## Why I Made These Choices

**Groq over OpenAI**
Groq's inference is significantly faster — card generation feels instant rather than making the user wait 10-15 seconds. For a study app where you're generating decks frequently, speed matters for UX.

**Two-pass generation**
Most apps do a single prompt: "generate flashcards from this text." That gives you shallow cards. I split it into two calls — first extract a structured concept outline (core concepts, relationships, edge cases), then generate cards from the outline. The result is cards that cover material the way a teacher would design them, not the way a bot scrapes them.

**Semantic grading over exact match**
The hardest part was the grading. Exact match is useless for learning — "H2O" and "two hydrogen atoms bonded to one oxygen" are the same answer. I prompt the model with a rubric that explicitly instructs it to grade on understanding, not wording, and to give partial credit with specific feedback on what was missing.

**Supabase over a custom backend**
RLS policies handle authorization at the database level, which means I don't have to write auth middleware for every API route. It also gives me real-time capabilities for free if I ever want to add collaborative study features.

**Next.js App Router**
Server components let me fetch deck data without a loading state on the initial render, which makes the dashboard feel faster. API routes live in the same repo which simplifies deployment.

---

## What I'd Improve With More Time

**Smarter spaced repetition**
Right now mastery is simple — Easy/Medium/Hard ratings update a level. A proper SM-2 or FSRS algorithm would schedule each card at the optimal review interval, which is what Anki does and why it works so well for long-term retention.

**PDF quality improvements**
The two-pass generation is good but not perfect. With more time I'd add a third validation pass that checks cards against the source material and removes duplicates or cards that test trivial details. I'd also handle scanned PDFs with OCR.

**Student performance analytics**
The data is all there in Supabase — recall scores, ratings, timestamps — but I haven't built the analytics view yet. A heatmap of study activity, a graph of mastery over time, and per-concept weak point identification would make this genuinely useful for exam prep.

**Collaborative decks**
Let students share decks with a link, fork someone else's deck, or study together. The architecture already supports it — it just needs a sharing permission layer on top of the existing RLS policies.

**Mobile app**
Flashcard studying happens on the go. The web app is responsive but a native app with offline support and push notification reminders would dramatically improve daily retention habits.

---

## Tech Stack

Next.js 14 (App Router), Supabase (Postgres + Auth), Groq (llama-3.3-70b-versatile), Tailwind CSS, Framer Motion, Vercel

---

## Getting Started

1. Clone and install
   git clone https://github.com/yourusername/flashcard-engine.git
   cd flashcard-engine
   npm install

2. Copy .env.example to .env.local and fill in your keys

3. Run
   npm run dev

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Dashboard → Project Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Dashboard → Project Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard → Project Settings → API |
| GROQ_API_KEY | console.groq.com → API Keys |

---

## License

MIT
