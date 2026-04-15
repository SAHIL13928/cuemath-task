"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronRight, BookOpen, ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import UploadZone from "@/components/dashboard/UploadZone";
import StudyStats from "@/components/dashboard/StudyStats";
import DeckCard from "@/components/deck/DeckCard";
import { DeckCardSkeleton } from "@/components/ui/Skeleton";

interface Deck {
  id: string;
  title: string;
  description: string;
  card_count: number;
  source_filename: string;
  created_at: string;
  last_studied_at: string | null;
  last_opened_at: string | null;
  dueCount: number;
  masteredCount: number;
}

type FilterType = "all" | "new" | "in_progress" | "mastered" | "needs_review";
type SortType = "last_opened" | "recently_created" | "alphabetical" | "mastery_asc" | "mastery_desc";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "All",
  in_progress: "In Progress",
  mastered: "Mastered",
  new: "New",
  needs_review: "Needs Review",
};

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "last_opened",      label: "Last Opened" },
  { value: "recently_created", label: "Recently Created" },
  { value: "alphabetical",     label: "Alphabetical" },
  { value: "mastery_asc",      label: "Mastery: Low to High" },
  { value: "mastery_desc",     label: "Mastery: High to Low" },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function mastery(deck: Deck) {
  return deck.card_count > 0 ? deck.masteredCount / deck.card_count : 0;
}

function applyFilter(decks: Deck[], filter: FilterType): Deck[] {
  if (filter === "all") return decks;
  return decks.filter((d) => {
    const m = mastery(d) * 100;
    switch (filter) {
      case "new":         return !d.last_studied_at;
      case "in_progress": return !!d.last_studied_at && m < 80;
      case "mastered":    return m >= 80;
      case "needs_review": return d.dueCount > 0;
    }
  });
}

function applySort(decks: Deck[], sort: SortType): Deck[] {
  return [...decks].sort((a, b) => {
    switch (sort) {
      case "last_opened": {
        const ta = a.last_opened_at ?? a.created_at;
        const tb = b.last_opened_at ?? b.created_at;
        return tb > ta ? 1 : -1;
      }
      case "recently_created":
        return b.created_at > a.created_at ? 1 : -1;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "mastery_asc":
        return mastery(a) - mastery(b);
      case "mastery_desc":
        return mastery(b) - mastery(a);
    }
  });
}

// ── Animated empty-state illustration ───────────────────────────────────────

function FloatingBookIllustration() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <svg width="160" height="130" viewBox="0 0 160 130" fill="none" aria-hidden>
        {/* Open book */}
        <path d="M20 30 Q80 18 80 65 Q80 100 20 100 Z" fill="#eef2ff" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M140 30 Q80 18 80 65 Q80 100 140 100 Z" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="80" y1="22" x2="80" y2="98" stroke="#6366f1" strokeWidth="2" />
        {/* Lines on pages */}
        <line x1="32" y1="52" x2="68" y2="48" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="34" y1="62" x2="70" y2="58" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="72" x2="70" y2="68" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="48" x2="126" y2="52" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="58" x2="126" y2="62" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="68" x2="124" y2="72" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
        {/* Sparkles */}
        <motion.g animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} style={{ transformOrigin: "16px 16px" }}>
          <circle cx="16" cy="16" r="4" fill="#f59e0b" />
          <line x1="16" y1="8"  x2="16" y2="11" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="21" x2="16" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8"  y1="16" x2="11" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="21" y1="16" x2="24" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
        <motion.g animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }} style={{ transformOrigin: "144px 20px" }}>
          <circle cx="144" cy="20" r="3" fill="#10b981" />
        </motion.g>
        <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1.4 }}>
          <circle cx="148" cy="90" r="3.5" fill="#6366f1" />
        </motion.g>
        <motion.g animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}>
          <circle cx="10" cy="80" r="2.5" fill="#a78bfa" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("last_opened");

  async function fetchDecks() {
    try {
      const res = await fetch("/api/decks");
      const data = await res.json();
      if (res.ok && data.decks) setDecks(data.decks);
    } catch (err) {
      console.error("Failed to fetch decks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDecks();

    async function init() {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const name =
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "there";
      setUserName(name);

      // Show streak toast once per browser session
      if (!sessionStorage.getItem("streak_toasted")) {
        sessionStorage.setItem("streak_toasted", "1");
        try {
          const res = await fetch("/api/streaks");
          if (res.ok) {
            const data = await res.json();
            const { streak, daysSinceStudy } = data;
            if (daysSinceStudy !== null && daysSinceStudy >= 2 && streak === 0) {
              toast("Streak reset. Start a new one today 💪");
            } else if (streak >= 3) {
              toast(`🔥 ${streak}-day streak! Keep it up`);
            }
          }
        } catch {}
      }
    }
    init();
  }, []);

  // Derived: filtered and sorted decks
  const processed = useMemo(() => {
    let result = decks;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.source_filename?.toLowerCase().includes(q),
      );
    }
    result = applyFilter(result, filter);
    result = applySort(result, sort);
    return result;
  }, [decks, search, filter, sort]);

  // "Continue Studying" — most recently opened deck
  const continueStudying = useMemo(() => {
    const sorted = [...decks]
      .filter((d) => d.last_opened_at || d.last_studied_at)
      .sort((a, b) => {
        const ta = a.last_opened_at ?? a.last_studied_at ?? "";
        const tb = b.last_opened_at ?? b.last_studied_at ?? "";
        return tb > ta ? 1 : -1;
      });
    return sorted[0] ?? null;
  }, [decks]);

  const showContinue = !!continueStudying && !search && filter === "all";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {userName || "…"}
        </p>
      </div>

      {/* Upload */}
      <UploadZone />

      {/* Stats */}
      <StudyStats />

      {/* ── Continue Studying banner ── */}
      <AnimatePresence>
        {showContinue && continueStudying && (
          <motion.div
            key="continue"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  Pick up where you left off
                </p>
                <h2 className="mt-0.5 line-clamp-1 text-lg font-bold text-slate-900">
                  {continueStudying.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {(continueStudying.last_opened_at ?? continueStudying.last_studied_at)
                    ? `Opened ${formatDistanceToNow(
                        new Date((continueStudying.last_opened_at ?? continueStudying.last_studied_at)!),
                        { addSuffix: true },
                      )}`
                    : ""}
                </p>
                {/* Mini progress */}
                <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-indigo-100">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        continueStudying.card_count > 0
                          ? Math.round((continueStudying.masteredCount / continueStudying.card_count) * 100)
                          : 0
                      }%`,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {continueStudying.card_count > 0
                    ? `${Math.round((continueStudying.masteredCount / continueStudying.card_count) * 100)}% mastered`
                    : ""}
                </p>
              </div>
              <button
                onClick={() => router.push(`/practice/${continueStudying.id}`)}
                className="shrink-0 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Decks section ── */}
      <div className="flex flex-col gap-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your Decks</h2>
          {decks.length > 0 && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {decks.length} deck{decks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search + Filter + Sort — only shown when there are decks */}
        {decks.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your decks…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter pills + sort */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Filter pills */}
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      filter === f
                        ? "bg-primary text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {FILTER_LABELS[f]}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-primary focus:outline-none transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <DeckCardSkeleton key={i} />
            ))}
          </div>
        ) : decks.length === 0 ? (
          /* ── Animated empty state (zero decks) ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm"
          >
            <FloatingBookIllustration />
            <div>
              <p className="text-xl font-bold text-slate-900">Your learning journey starts here</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Upload a PDF and we&apos;ll turn it into a smart study deck in seconds.
              </p>
            </div>
            <motion.button
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => document.querySelector<HTMLInputElement>("input[type='file']")?.click()}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-600"
            >
              Upload your first PDF
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        ) : processed.length === 0 ? (
          /* ── No search/filter results ── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">No decks match your search</p>
              <p className="mt-1 text-sm text-slate-500">Try a different keyword or filter</p>
            </div>
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          /* ── Deck grid ── */
          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <AnimatePresence>
              {processed.map((deck) => (
                <motion.div key={deck.id} variants={fadeUp} layout>
                  <DeckCard
                    id={deck.id}
                    title={deck.title}
                    description={deck.description}
                    card_count={deck.card_count}
                    source_filename={deck.source_filename}
                    dueCount={deck.dueCount}
                    masteredCount={deck.masteredCount}
                    last_studied_at={deck.last_studied_at}
                    onDeleted={fetchDecks}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
    </div>
  );
}
