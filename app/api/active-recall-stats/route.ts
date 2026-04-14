import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase: any = createServerComponentClient(cookieStore);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deckId = request.nextUrl.searchParams.get("deckId");
    if (!deckId) {
      return NextResponse.json({ error: "deckId required" }, { status: 400 });
    }

    // Fetch all attempts for this deck+user, ordered newest first
    const { data, error } = await supabase
      .from("active_recall_attempts")
      .select("card_id, score, created_at")
      .eq("deck_id", deckId)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      // Table may not exist yet — return empty
      return NextResponse.json({ weakCardIds: [] });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ weakCardIds: [] });
    }

    // Group by card_id, keep last 3 attempts, compute avg
    const byCard = new Map<string, number[]>();
    for (const row of data) {
      if (!byCard.has(row.card_id)) byCard.set(row.card_id, []);
      const arr = byCard.get(row.card_id)!;
      if (arr.length < 3) arr.push(row.score);
    }

    const weakCardIds: string[] = [];
    for (const [cardId, scores] of byCard.entries()) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 60) weakCardIds.push(cardId);
    }

    return NextResponse.json({ weakCardIds });
  } catch {
    return NextResponse.json({ weakCardIds: [] });
  }
}
