import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";
import { calculateSM2, type Rating } from "@/lib/sm2";

const VALID_RATINGS: Rating[] = ["forgot", "hard", "easy"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cardId, rating } = body;

  if (!cardId || !rating) {
    return NextResponse.json(
      { error: "cardId and rating are required" },
      { status: 400 }
    );
  }

  if (!VALID_RATINGS.includes(rating)) {
    return NextResponse.json(
      { error: "rating must be 'forgot', 'hard', or 'easy'" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch current review_history for this card + user
  const { data: review, error: fetchError } = await supabase
    .from("review_history")
    .select("*")
    .eq("card_id", cardId)
    .eq("user_id", userId)
    .single();

  // Use defaults if no review_history row exists yet
  const currentEase = review?.ease_factor ?? 2.5;
  const currentInterval = review?.interval ?? 0;
  const currentReps = review?.repetitions ?? 0;

  // Calculate next review using SM-2
  const result = calculateSM2(currentEase, currentInterval, currentReps, rating);

  const now = new Date().toISOString();
  const nextReview = result.nextReviewDate.toISOString().split("T")[0];

  if (review) {
    // Update existing review_history row
    const { error: updateError } = await supabase
      .from("review_history")
      .update({
        ease_factor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        next_review_date: nextReview,
        last_reviewed_at: now,
        last_rating: rating,
      })
      .eq("id", review.id);

    if (updateError) {
      console.error("[review] update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    // Create review_history row if it doesn't exist
    const { error: insertError } = await supabase
      .from("review_history")
      .insert({
        card_id: cardId,
        user_id: userId,
        ease_factor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        next_review_date: nextReview,
        last_reviewed_at: now,
        last_rating: rating,
      });

    if (insertError) {
      console.error("[review] insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  // Update deck's last_studied_at (best effort)
  const { data: card } = await supabase
    .from("cards")
    .select("deck_id")
    .eq("id", cardId)
    .single();

  if (card?.deck_id) {
    await supabase
      .from("decks")
      .update({ last_studied_at: now })
      .eq("id", card.deck_id);
  }

  return NextResponse.json({
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReviewDate: nextReview,
  });
}
