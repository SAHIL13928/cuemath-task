import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { extractTextFromPDF } from "@/lib/pdf";
import { generateFlashcards } from "@/lib/groq";
import { createServerComponentClient } from "@/lib/supabase";

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

    const userId = user.id;

    // Parse file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 20MB" },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF" },
        { status: 422 }
      );
    }

    // Generate flashcards with Gemini
    const generated = await generateFlashcards(text);

    if (!generated.cards?.length) {
      return NextResponse.json(
        { error: "AI could not generate flashcards from this content" },
        { status: 422 }
      );
    }

    // Create deck in Supabase
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .insert({
        user_id: userId,
        title: generated.deck_title || file.name.replace(/\.pdf$/i, ""),
        description: generated.deck_description || "",
        source_filename: file.name,
        card_count: generated.cards.length,
      })
      .select()
      .single();

    if (deckError) {
      console.error("Deck creation error:", deckError);
      return NextResponse.json(
        { error: "Failed to save deck" },
        { status: 500 }
      );
    }

    // Create card rows
    const cardRows = generated.cards.map((card) => ({
      deck_id: deck.id,
      front: card.front,
      back: card.back,
      card_type: card.card_type || "definition",
      difficulty: card.difficulty || "medium",
      concept_tag: card.concept_tag || null,
    }));

    const { data: insertedCards, error: cardsError } = await supabase
      .from("cards")
      .insert(cardRows)
      .select("id");

    if (cardsError) {
      console.error("Cards creation error:", cardsError);
      // Clean up the deck if cards failed
      await supabase.from("decks").delete().eq("id", deck.id);
      return NextResponse.json(
        { error: "Failed to save flashcards" },
        { status: 500 }
      );
    }

    // Create review_history rows for each card
    const today = new Date().toISOString().split("T")[0];
    const reviewRows = insertedCards.map((card: any) => ({
      card_id: card.id,
      user_id: userId,
      ease_factor: 2.5,
      interval: 0,
      repetitions: 0,
      next_review_date: today,
    }));

    const { error: reviewError } = await supabase
      .from("review_history")
      .insert(reviewRows);

    if (reviewError) {
      console.error("Review history creation error:", reviewError);
      // Non-fatal — deck and cards are saved, reviews can be created later
    }

    return NextResponse.json({
      deckId: deck.id,
      title: deck.title,
      cardCount: generated.cards.length,
    });
  } catch (error: any) {
    console.error("Generate error:", error);
    const msg = error?.message?.toLowerCase() || "";

    if (msg.includes("pdf") || msg.includes("parse") || msg.includes("extract") || msg.includes("read")) {
      return NextResponse.json(
        { error: "Could not read this PDF. Try a different file." },
        { status: 422 }
      );
    }

    if (msg.includes("groq") || msg.includes("api") || msg.includes("generate") || msg.includes("model") || msg.includes("rate")) {
      return NextResponse.json(
        { error: "AI generation failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while generating flashcards" },
      { status: 500 }
    );
  }
}
