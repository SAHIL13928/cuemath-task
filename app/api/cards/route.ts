import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const deckId = request.nextUrl.searchParams.get("deckId");
  const dueOnly = request.nextUrl.searchParams.get("due") === "true";

  if (!deckId) {
    return NextResponse.json({ error: "deckId is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the deck belongs to this user
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single();

  if (deckError || !deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  // Fetch cards with their review_history (filtered to this user only)
  const { data: cards, error } = await supabase
    .from("cards")
    .select(
      "*, review_history!left(ease_factor, interval, repetitions, next_review_date, last_reviewed_at, last_rating)"
    )
    .eq("deck_id", deckId)
    .eq("review_history.user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[cards] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];

  // Flatten review_history into card fields
  const enriched = (cards ?? []).map((card: any) => {
    const review = Array.isArray(card.review_history)
      ? card.review_history[0]
      : card.review_history;

    return {
      id: card.id,
      deck_id: card.deck_id,
      front: card.front,
      back: card.back,
      card_type: card.card_type,
      difficulty: card.difficulty,
      concept_tag: card.concept_tag ?? null,
      created_at: card.created_at,
      ease_factor: review?.ease_factor ?? 2.5,
      interval: review?.interval ?? 0,
      repetitions: review?.repetitions ?? 0,
      next_review_date: review?.next_review_date ?? null,
      last_reviewed_at: review?.last_reviewed_at ?? null,
      last_rating: review?.last_rating ?? null,
    };
  });

  if (dueOnly) {
    const due = enriched.filter(
      (c: any) => !c.next_review_date || c.next_review_date <= today
    );
    return NextResponse.json({ cards: due });
  }

  return NextResponse.json({ cards: enriched });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { deck_id, front, back, type, difficulty } = body;

  if (!deck_id || !front || !back) {
    return NextResponse.json(
      { error: "deck_id, front, and back are required" },
      { status: 400 }
    );
  }

  // Verify deck ownership
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id, card_count")
    .eq("id", deck_id)
    .eq("user_id", user.id)
    .single();

  if (deckError || !deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  // Insert the card
  const { data: card, error: cardError } = await supabase
    .from("cards")
    .insert({
      deck_id,
      front,
      back,
      card_type: type || "concept",
      difficulty: difficulty || "medium",
    })
    .select()
    .single();

  if (cardError) {
    return NextResponse.json({ error: cardError.message }, { status: 500 });
  }

  // Create initial review_history row
  await supabase.from("review_history").insert({
    card_id: card.id,
    user_id: user.id,
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
    next_review_date: new Date().toISOString().split("T")[0],
  });

  // Update deck card count
  await supabase
    .from("decks")
    .update({ card_count: (deck.card_count ?? 0) + 1 })
    .eq("id", deck_id);

  return NextResponse.json({ card }, { status: 201 });
}
