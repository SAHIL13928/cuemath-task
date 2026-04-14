import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

/** POST /api/decks/[id]/open — stamps last_opened_at on the deck. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase
    .from("decks")
    .update({ last_opened_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", session.user.id);

  return NextResponse.json({ success: true });
}
