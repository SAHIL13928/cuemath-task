import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership before deleting
  const { data: deck, error: findError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (findError || !deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  // Delete the deck (cards and review_history cascade)
  const { error } = await supabase.from("decks").delete().eq("id", id);

  if (error) {
    console.error("[decks] delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
