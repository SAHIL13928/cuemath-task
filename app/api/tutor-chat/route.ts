import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Groq from "groq-sdk";
import { createServerComponentClient } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = await cookies();
    const supabase: any = createServerComponentClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, messages } = body;

    if (!cardId || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "cardId and messages are required" },
        { status: 400 }
      );
    }

    // Fetch the card
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("front, back, card_type, difficulty, deck_id")
      .eq("id", cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Fetch the deck for context
    const { data: deck } = await supabase
      .from("decks")
      .select("title, description")
      .eq("id", card.deck_id)
      .single();

    const deckTitle = deck?.title || "Unknown Deck";
    const deckDescription = deck?.description || "No description";

    const systemPrompt = `You are a patient, encouraging AI tutor helping a student understand a specific flashcard. You explain concepts clearly, use analogies, provide examples, and adapt your explanations to the student's level.

The student is studying the following flashcard:

DECK: ${deckTitle}
DECK CONTEXT: ${deckDescription}

CARD QUESTION: ${card.front}
CARD ANSWER: ${card.back}
CARD TYPE: ${card.card_type}
DIFFICULTY: ${card.difficulty}

Your job:
- Help the student deeply understand this concept
- If they ask 'explain differently' - use a new analogy or simpler words
- If they ask 'give me an example' - provide a concrete, relatable example
- If they ask 'why is this true' - explain the underlying reasoning
- If they're confused - break it down into smaller steps
- Be warm, encouraging, and patient like a great human tutor
- Keep responses concise (3-5 sentences usually) unless they ask for more detail
- Never just repeat the card's answer verbatim - always add value`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ message: reply });
  } catch (error: any) {
    console.error("Tutor chat error:", error);
    return NextResponse.json(
      { error: "Failed to get tutor response" },
      { status: 500 }
    );
  }
}
