import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const today = new Date().toISOString().split("T")[0];

  // Fetch decks
  const { data: decks, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[decks] fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For each deck, fetch due count and mastered count from review_history
  const enrichedDecks = await Promise.all(
    (decks ?? []).map(async (deck: any) => {
      // Get all cards for this deck with their review history (filtered to this user only)
      const { data: cards } = await supabase
        .from("cards")
        .select("id, review_history!left(repetitions, next_review_date)")
        .eq("deck_id", deck.id)
        .eq("review_history.user_id", userId);

      let dueCount = 0;
      let masteredCount = 0;

      (cards ?? []).forEach((card: any) => {
        const review = Array.isArray(card.review_history)
          ? card.review_history[0]
          : card.review_history;

        const reps = review?.repetitions ?? 0;
        const nextReview = review?.next_review_date ?? null;

        if (!nextReview || nextReview <= today) {
          dueCount++;
        }
        if (reps >= 2) {
          masteredCount++;
        }
      });

      return { ...deck, dueCount, masteredCount };
    })
  );

  return NextResponse.json({ decks: enrichedDecks });
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
  const { title, cards } = body;

  if (!title || !cards?.length) {
    return NextResponse.json(
      { error: "Title and cards are required" },
      { status: 400 }
    );
  }

  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .insert({ title, card_count: cards.length, user_id: user.id })
    .select()
    .single();

  if (deckError) {
    return NextResponse.json({ error: deckError.message }, { status: 500 });
  }

  const cardRows = cards.map((card: { front: string; back: string }) => ({
    deck_id: deck.id,
    front: card.front,
    back: card.back,
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
  }));

  const { error: cardsError } = await supabase.from("cards").insert(cardRows);

  if (cardsError) {
    return NextResponse.json({ error: cardsError.message }, { status: 500 });
  }

  return NextResponse.json({ deck }, { status: 201 });
}
