import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_study_date")
    .eq("id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const lastStudy: string | null = profile?.last_study_date ?? null;
  const storedStreak: number = profile?.streak_count ?? 0;

  let daysSince = Infinity;
  if (lastStudy) {
    const diffMs = new Date(today).getTime() - new Date(lastStudy).getTime();
    daysSince = Math.floor(diffMs / 86_400_000);
  }

  // If more than 1 day has passed without studying, streak is broken
  const activeStreak = daysSince <= 1 ? storedStreak : 0;

  return NextResponse.json({
    streak: activeStreak,
    lastStudyDate: lastStudy,
    daysSinceStudy: daysSince === Infinity ? null : daysSince,
  });
}

export async function POST() {
  const cookieStore = await cookies();
  const supabase: any = createServerComponentClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_study_date")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const lastStudy: string | null = profile.last_study_date ?? null;
  let newStreak: number = profile.streak_count ?? 0;

  if (lastStudy === today) {
    // Already updated today — no change
    return NextResponse.json({ streak: newStreak });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (!lastStudy || lastStudy < yesterdayStr) {
    newStreak = 1; // Streak broken (or first study ever)
  } else {
    newStreak += 1; // Consecutive day
  }

  await supabase
    .from("profiles")
    .update({ streak_count: newStreak, last_study_date: today })
    .eq("id", user.id);

  return NextResponse.json({ streak: newStreak, isNew: !lastStudy || lastStudy < yesterdayStr });
}
