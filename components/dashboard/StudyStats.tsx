"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen, Layers, Clock, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { format, subDays, startOfDay, isAfter, isSameDay } from "date-fns";
import { StatsSkeleton } from "@/components/ui/Skeleton";

interface DayActivity {
  date: string;
  count: number;
}

interface StatsData {
  streak: number;
  totalDecks: number;
  totalCards: number;
  dueToday: number;
  reviewedThisWeek: number;
  heatmap: DayActivity[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudyStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 29).toISOString();
      const sevenDaysAgo = subDays(today, 6).toISOString();

      const [profileRes, decksRes, sessionsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("streak_count, last_study_date")
          .eq("id", userId)
          .single(),
        supabase
          .from("decks")
          .select("id, card_count")
          .eq("user_id", userId),
        supabase
          .from("study_sessions")
          .select("cards_reviewed, studied_at")
          .eq("user_id", userId)
          .gte("studied_at", thirtyDaysAgo),
      ]);

      const profile = profileRes.data;
      const decks = decksRes.data ?? [];
      const sessions = sessionsRes.data ?? [];

      const totalDecks = decks.length;
      const totalCards = decks.reduce((sum: number, d: any) => sum + (d.card_count ?? 0), 0);

      const todayStr = today.toISOString().split("T")[0];
      let dueToday = 0;
      for (const deck of decks) {
        const { data: cards } = await supabase
          .from("cards")
          .select("id, review_history!left(next_review_date)")
          .eq("deck_id", deck.id);

        (cards ?? []).forEach((card: any) => {
          const review = Array.isArray(card.review_history)
            ? card.review_history[0]
            : card.review_history;
          const nextReview = review?.next_review_date ?? null;
          if (!nextReview || nextReview <= todayStr) {
            dueToday++;
          }
        });
      }

      const reviewedThisWeek = sessions
        .filter((s: any) => isAfter(new Date(s.studied_at), new Date(sevenDaysAgo)))
        .reduce((sum: number, s: any) => sum + (s.cards_reviewed ?? 0), 0);

      const heatmap: DayActivity[] = [];
      for (let i = 29; i >= 0; i--) {
        const day = subDays(today, i);
        const dayStart = startOfDay(day);
        const count = sessions
          .filter((s: any) => isSameDay(new Date(s.studied_at), dayStart))
          .reduce((sum: number, s: any) => sum + (s.cards_reviewed ?? 0), 0);
        heatmap.push({
          date: format(day, "MMM d"),
          count,
        });
      }

      setStats({
        streak: profile?.streak_count ?? 0,
        totalDecks,
        totalCards,
        dueToday,
        reviewedThisWeek,
        heatmap,
      });
    }

    fetchStats();
  }, []);

  if (!stats) return <StatsSkeleton />;

  const statItems = [
    { icon: Flame, label: "Day Streak", value: stats.streak, color: "text-warning" },
    { icon: BookOpen, label: "Total Decks", value: stats.totalDecks, color: "text-primary" },
    { icon: Layers, label: "Total Cards", value: stats.totalCards, color: "text-accent" },
    { icon: Clock, label: "Due Today", value: stats.dueToday, color: "text-danger" },
    { icon: CheckCircle2, label: "This Week", value: stats.reviewedThisWeek, color: "text-success" },
  ];

  const maxCount = Math.max(1, ...stats.heatmap.map((d) => d.count));

  function getHeatColor(count: number): string {
    if (count === 0) return "bg-text-secondary/10 dark:bg-dark-border/50";
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "bg-primary/20";
    if (intensity <= 0.5) return "bg-primary/40";
    if (intensity <= 0.75) return "bg-primary/60";
    return "bg-primary";
  }

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statItems.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-4 shadow-sm dark:bg-dark-card dark:border dark:border-dark-border"
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <span className="text-2xl font-bold text-text-primary dark:text-dark-text">
              {stat.value}
            </span>
            <span className="text-[11px] font-medium text-text-secondary dark:text-dark-text-secondary">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl bg-card p-5 shadow-sm dark:bg-dark-card dark:border dark:border-dark-border"
      >
        <p className="mb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider dark:text-dark-text-secondary">
          Last 30 Days
        </p>
        <div className="relative flex flex-wrap gap-1.5">
          {stats.heatmap.map((day, i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded-[4px] transition-all cursor-pointer hover:scale-125 ${getHeatColor(day.count)}`}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>
        {hoveredDay && (
          <p className="mt-2 text-xs text-text-secondary dark:text-dark-text-secondary">
            {hoveredDay.date}: {hoveredDay.count} card{hoveredDay.count !== 1 ? "s" : ""} reviewed
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
