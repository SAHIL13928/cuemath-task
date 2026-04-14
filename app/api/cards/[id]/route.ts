import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

async function getAuthenticatedSupabase() {
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { supabase, session };
}

async function verifyCardOwnership(supabase: any, cardId: string, userId: string) {
  const { data: card } = await supabase
    .from("cards")
    .select("id, deck_id, decks!inner(user_id)")
    .eq("id", cardId)
    .single();

  if (!card || card.decks?.user_id !== userId) {
    return null;
  }
  return card;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, session } = await getAuthenticatedSupabase();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await verifyCardOwnership(supabase, id, session.user.id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const body = await request.json();
  const { front, back } = body;

  if (!front && !back) {
    return NextResponse.json({ error: "front or back is required" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (front !== undefined) updates.front = front;
  if (back !== undefined) updates.back = back;

  const { data, error } = await supabase
    .from("cards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ card: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, session } = await getAuthenticatedSupabase();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const card = await verifyCardOwnership(supabase, id, session.user.id);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const { error } = await supabase.from("cards").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update the deck's card_count
  const { data: remaining } = await supabase
    .from("cards")
    .select("id", { count: "exact" })
    .eq("deck_id", card.deck_id);

  await supabase
    .from("decks")
    .update({ card_count: remaining?.length ?? 0 })
    .eq("id", card.deck_id);

  return NextResponse.json({ success: true });
}
