import Groq from "groq-sdk";

// ── Types ──────────────────────────────────────────────────────────────────────

export type CardType =
  | "definition"
  | "conceptual"
  | "application"
  | "comparison"
  | "edge_case"
  | "example";

export interface GeneratedCard {
  front: string;
  back: string;
  card_type: CardType;
  difficulty: "easy" | "medium" | "hard";
  concept_tag: string;
}

export interface GeneratedDeck {
  deck_title: string;
  deck_description: string;
  cards: GeneratedCard[];
}

export interface ConceptOutline {
  coreConceptsList: string[];
  keyDefinitions: { term: string; definition: string }[];
  relationships: { concept_a: string; relationship: string; concept_b: string }[];
  edgeCasesOrExceptions: string[];
  workedExamples: string[];
  commonMisconceptions: string[];
}

// ── Groq client ────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

// ── JSON parsing helper ────────────────────────────────────────────────────────

function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to salvage a JSON object or array from the response
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ── Pass 1: Extract concept outline ───────────────────────────────────────────

async function extractConceptOutline(text: string): Promise<ConceptOutline> {
  // Use up to 40k chars — large enough for most PDFs, fits within context
  const truncated = text.slice(0, 40000);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert curriculum designer. Analyze this educational material and extract:
{
  "coreConceptsList": ["concept1", "concept2"],
  "keyDefinitions": [{ "term": "string", "definition": "string" }],
  "relationships": [{ "concept_a": "string", "relationship": "string", "concept_b": "string" }],
  "edgeCasesOrExceptions": ["string"],
  "workedExamples": ["string"],
  "commonMisconceptions": ["string"]
}
Rules: coreConceptsList should have 5-10 must-know concepts. Return only valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: `Analyze this educational material and extract the concept outline:\n\n---\n${truncated}\n---`,
      },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return parseJSON<ConceptOutline>(raw);
}

// ── Pass 2: Generate cards from outline ───────────────────────────────────────

async function generateCardsFromOutline(
  outline: ConceptOutline,
  sourceTitle: string,
): Promise<{ deck_title: string; deck_description: string; cards: GeneratedCard[] }> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are a master teacher creating flashcards from a concept outline. Generate flashcards with strict type diversity:
- For each core concept: 1 definition card + 1 conceptual "why" card + 1 application card
- For each relationship: 1 comparison card
- For each edge case: 1 card (card_type: "edge_case")
- For each worked example: 1 problem-solving card — question shows the scenario, answer shows the approach/steps (card_type: "example")
- No more than 30% of cards should be pure definition/recall type
- Each answer should be 1-3 sentences max, clear and specific
- Questions should be specific enough that there is only one right answer
- Avoid questions that start with "What are some..." — every question must have a definitive answer
- concept_tag must be one of the coreConceptsList values

Return only valid JSON, no markdown:
{
  "deck_title": "string",
  "deck_description": "1-2 sentence summary",
  "cards": [
    {
      "front": "question",
      "back": "answer",
      "card_type": "definition|conceptual|application|comparison|edge_case|example",
      "difficulty": "easy|medium|hard",
      "concept_tag": "which core concept this card belongs to"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Generate flashcards from this concept outline for "${sourceTitle}":\n\n${JSON.stringify(outline, null, 2)}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return parseJSON<{ deck_title: string; deck_description: string; cards: GeneratedCard[] }>(raw);
}

// ── Pass 3: Quality filter ─────────────────────────────────────────────────────

async function filterCards(cards: GeneratedCard[]): Promise<GeneratedCard[]> {
  if (cards.length === 0) return cards;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `Review these flashcards and remove any that: (1) are duplicates or near-duplicates, (2) have vague or unanswerable questions, (3) test trivial details not worth memorizing, (4) have answers longer than 3 sentences. Return only the approved cards as a JSON array with the exact same structure as the input. No markdown, no explanation — just the JSON array.`,
      },
      {
        role: "user",
        content: `Filter these flashcards:\n\n${JSON.stringify(cards, null, 2)}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  try {
    const result = parseJSON<GeneratedCard[] | { cards: GeneratedCard[] }>(raw);
    // Handle both plain array and {cards:[...]} shapes
    const filtered = Array.isArray(result) ? result : (result as any).cards;
    return Array.isArray(filtered) && filtered.length > 0 ? filtered : cards;
  } catch {
    // Quality filter is non-fatal — return original cards if parsing fails
    return cards;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function generateFlashcards(text: string): Promise<GeneratedDeck> {
  // Pass 1 — Extract concept outline from full PDF text
  const outline = await extractConceptOutline(text);

  // Pass 2 — Generate cards from the structured outline (not raw text)
  const generated = await generateCardsFromOutline(outline, "");

  const rawCards: GeneratedCard[] = Array.isArray(generated.cards) ? generated.cards : [];

  if (rawCards.length === 0) {
    throw new Error("AI generated no cards from this content");
  }

  // Pass 3 — Quality filter (non-fatal: falls back to raw cards on error)
  const filteredCards = await filterCards(rawCards);

  return {
    deck_title: generated.deck_title || "Untitled Deck",
    deck_description: generated.deck_description || "",
    cards: filteredCards,
  };
}
