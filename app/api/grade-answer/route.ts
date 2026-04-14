import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Groq from "groq-sdk";
import { createServerComponentClient } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase: any = createServerComponentClient(cookieStore);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { cardId, userAnswer } = body;

    if (!cardId || userAnswer === undefined) {
      return NextResponse.json(
        { error: "cardId and userAnswer are required" },
        { status: 400 }
      );
    }

    // Fetch card
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("front, back, card_type, difficulty, deck_id")
      .eq("id", cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Fetch deck
    const { data: deck } = await supabase
      .from("decks")
      .select("title, description")
      .eq("id", card.deck_id)
      .single();

    const deckTitle = deck?.title ?? "Unknown Deck";

    const systemPrompt = `You are an expert educational assessor doing semantic grading — not keyword matching.

DECK: ${deckTitle}
CARD QUESTION: ${card.front}
CORRECT ANSWER: ${card.back}
CARD TYPE: ${card.card_type}
DIFFICULTY: ${card.difficulty}

Student answered: "${userAnswer}"

Evaluate semantically. The student doesn't need to match wording — they need to demonstrate understanding of the concept.

Respond ONLY with a valid JSON object, no markdown, no text outside the JSON:
{
  "score": <integer 0-100>,
  "grade": <"excellent" | "good" | "partial" | "incorrect">,
  "feedback": "<2-3 sentences: what they got right, what was missing or imprecise, encouragement>",
  "keyPointsMissed": ["<missed point>"]
}

Rubric:
- 90-100 (excellent): Core concept demonstrated correctly, wording doesn't matter
- 70-89 (good): Mostly right, minor gaps or imprecision
- 40-69 (partial): Partial understanding, missing key elements
- 0-39 (incorrect): Fundamentally wrong, off-topic, or blank

Tone: always constructive and encouraging, never harsh, even for score 0.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Grade this student answer." },
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let result: {
      score: number;
      grade: string;
      feedback: string;
      keyPointsMissed: string[];
    };

    try {
      result = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI grading response");
      }
    }

    // Clamp score
    result.score = Math.max(0, Math.min(100, Math.round(result.score)));

    // Persist attempt (best-effort — table may not exist yet)
    try {
      await supabase.from("active_recall_attempts").insert({
        user_id: userId,
        card_id: cardId,
        deck_id: card.deck_id,
        user_answer: userAnswer,
        score: result.score,
        grade: result.grade,
      });
    } catch {
      // Non-fatal if table doesn't exist yet
    }

    return NextResponse.json({
      score: result.score,
      grade: result.grade,
      feedback: result.feedback,
      keyPointsMissed: result.keyPointsMissed ?? [],
    });
  } catch (error: any) {
    console.error("Grade answer error:", error);
    return NextResponse.json(
      { error: "Failed to grade answer" },
      { status: 500 }
    );
  }
}
