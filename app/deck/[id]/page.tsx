"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCountUp } from "@/lib/hooks/useCountUp";
import MasteryModal from "@/components/deck/MasteryModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Calendar,
  Layers,
  MessageCircle,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react";
import ProgressRing from "@/components/ui/ProgressRing";
import { CardListSkeleton } from "@/components/ui/Skeleton";
import TutorChat from "@/components/tutor/TutorChat";
import { toast } from "sonner";

interface Card {
  id: string;
  front: string;
  back: string;
  card_type: string;
  difficulty: string;
  concept_tag: string | null;
  next_review_date: string | null;
  repetitions: number;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  card_count: number;
  source_filename: string;
  created_at: string;
  last_studied_at: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  concept:      "bg-indigo-50 text-indigo-600",
  conceptual:   "bg-indigo-50 text-indigo-600",
  definition:   "bg-cyan-50 text-cyan-600",
  relationship: "bg-amber-50 text-amber-600",
  comparison:   "bg-purple-50 text-purple-600",
  application:  "bg-emerald-50 text-emerald-600",
  edge_case:    "bg-rose-50 text-rose-600",
  example:      "bg-violet-50 text-violet-600",
};

const TYPE_LABEL: Record<string, string> = {
  concept:      "Concept",
  conceptual:   "Conceptual",
  definition:   "Definition",
  relationship: "Relationship",
  comparison:   "Comparison",
  application:  "Application",
  edge_case:    "Edge Case",
  example:      "Example",
};

// Deterministic color helpers for concept tags
const CONCEPT_DOT_PALETTE = [
  "#6366f1", "#06b6d4", "#8b5cf6", "#f59e0b",
  "#10b981", "#f43f5e", "#3b82f6", "#ec4899",
];
const CONCEPT_TAG_PALETTE = [
  "bg-violet-50 text-violet-600",
  "bg-sky-50 text-sky-600",
  "bg-teal-50 text-teal-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
  "bg-pink-50 text-pink-600",
  "bg-indigo-50 text-indigo-600",
  "bg-orange-50 text-orange-600",
];

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xfffffff;
  return h;
}

function conceptDotColor(tag: string): string {
  if (!tag || tag === "Uncategorized") return "#94a3b8";
  return CONCEPT_DOT_PALETTE[strHash(tag) % CONCEPT_DOT_PALETTE.length];
}

function conceptTagColor(tag: string): string {
  return CONCEPT_TAG_PALETTE[strHash(tag) % CONCEPT_TAG_PALETTE.length];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard:   "bg-rose-50 text-rose-600",
};

function getStatusBadge(reps: number) {
  if (reps === 0)  return { label: "New",      cls: "bg-slate-100 text-slate-500" };
  if (reps < 2)   return { label: "Learning",  cls: "bg-amber-50 text-amber-600" };
  return               { label: "Mastered",  cls: "bg-emerald-50 text-emerald-600" };
}

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newType, setNewType] = useState("concept");
  const [newDifficulty, setNewDifficulty] = useState("medium");
  const [tutorCard, setTutorCard] = useState<Card | null>(null);
  const [weakCardIds, setWeakCardIds] = useState<Set<string>>(new Set());
  const [collapsedConcepts, setCollapsedConcepts] = useState<Set<string>>(new Set());
  const [showMasteryModal, setShowMasteryModal] = useState(false);
  const masteryCheckedRef = useRef(false);

  async function fetchData() {
    try {
      const [decksRes, cardsRes, statsRes] = await Promise.all([
        fetch("/api/decks"),
        fetch(`/api/cards?deckId=${params.id}`),
        fetch(`/api/active-recall-stats?deckId=${params.id}`),
      ]);
      const [decksData, cardsData] = await Promise.all([decksRes.json(), cardsRes.json()]);

      if (decksRes.ok && decksData.decks) {
        const found = decksData.decks.find((d: Deck) => d.id === params.id);
        if (found) setDeck(found);
      }
      if (cardsRes.ok && cardsData.cards) {
        const fetchedCards: Card[] = cardsData.cards;
        setCards(fetchedCards);

        // Check for 100% mastery (show modal once per deck per browser session)
        if (!masteryCheckedRef.current && fetchedCards.length > 0) {
          masteryCheckedRef.current = true;
          const mastered = fetchedCards.filter((c) => c.repetitions >= 2).length;
          const pct = Math.round((mastered / fetchedCards.length) * 100);
          if (pct === 100) {
            const key = `mastery_celebrated_${params.id}`;
            if (!localStorage.getItem(key)) {
              localStorage.setItem(key, "1");
              setShowMasteryModal(true);
            }
          }
        }
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setWeakCardIds(new Set(statsData.weakCardIds ?? []));
      }
    } catch (err) {
      console.error("Failed to fetch deck data:", err);
      toast.error("Failed to load deck");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // Stamp last_opened_at on this deck
    fetch(`/api/decks/${params.id}/open`, { method: "POST" }).catch(() => {});
    // Re-fetch when the user navigates back to this tab/page
    function onVisible() {
      if (document.visibilityState === "visible") fetchData();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [params.id]);

  if (loading) {
    return (
      <motion.div className="flex flex-col gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-4">
          <div className="skeleton h-10 w-10 !rounded-xl" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
        <CardListSkeleton />
      </motion.div>
    );
  }

  if (!deck) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-slate-900">Deck not found</p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const dueCount = cards.filter((c) => !c.next_review_date || c.next_review_date <= today).length;
  const masteredCount = cards.filter((c) => c.repetitions >= 2).length;
  const learningCount = cards.filter((c) => c.repetitions >= 1 && c.repetitions < 2).length;
  const newCount = cards.filter((c) => c.repetitions === 0).length;
  const mastery = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  // Animated count-up for stat numbers
  const animTotal    = useCountUp(cards.length);
  const animMastered = useCountUp(masteredCount);
  const animLearning = useCountUp(learningCount);
  const animNew      = useCountUp(newCount);

  // Type distribution — count per card_type, sorted by frequency
  const typeCounts = cards.reduce<Record<string, number>>((acc, c) => {
    if (c.card_type) acc[c.card_type] = (acc[c.card_type] || 0) + 1;
    return acc;
  }, {});
  const typeCountEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  // Concept groups — group cards by concept_tag for collapsible sections
  const groupMap = new Map<string, Card[]>();
  for (const card of cards) {
    const key = card.concept_tag?.trim() || "Uncategorized";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(card);
  }
  const conceptGroups: [string, Card[]][] = [...groupMap.entries()].sort(([a], [b]) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });
  const namedGroupCount = conceptGroups.filter(([k]) => k !== "Uncategorized").length;
  const showConceptHeaders =
    namedGroupCount >= 2 || (namedGroupCount === 1 && groupMap.has("Uncategorized"));

  function toggleConcept(key: string) {
    setCollapsedConcepts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function handleEditSave(cardId: string) {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: editFront, back: editBack }),
      });
      if (res.ok) { toast.success("Card updated"); setEditingCard(null); fetchData(); }
      else toast.error("Failed to update card");
    } catch { toast.error("Failed to update card"); }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Card deleted"); setDeleteConfirm(null); fetchData(); }
      else toast.error("Failed to delete card");
    } catch { toast.error("Failed to delete card"); }
  }

  async function handleAddCard() {
    if (!newFront.trim() || !newBack.trim()) { toast.error("Front and back are required"); return; }
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck_id: params.id, front: newFront, back: newBack, type: newType, difficulty: newDifficulty }),
      });
      if (res.ok) { toast.success("Card added"); setNewFront(""); setNewBack(""); setShowAddCard(false); fetchData(); }
      else toast.error("Failed to add card");
    } catch { toast.error("Failed to add card"); }
  }

  const inputCls = "w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all";
  const selectCls = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard"
            className="mt-1 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{deck.title}</h1>
            {deck.description && (
              <p className="mt-1 text-sm text-slate-500">{deck.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {deck.source_filename && (
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{deck.source_filename}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {new Date(deck.created_at).toLocaleDateString()}
              </span>
              <span>{cards.length} cards</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/practice/${params.id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cyan-600 hover:shadow-md active:scale-[0.98]"
          >
            <Play className="h-4 w-4" />
            {dueCount > 0 ? `Study Now (${dueCount} due)` : "Study Now"}
          </Link>
          <Link
            href={`/practice/${params.id}`}
            onClick={() => localStorage.setItem("practice_mode_preference", "recall")}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md active:scale-[0.98]"
          >
            <BrainCircuit className="h-4 w-4" />
            Active Recall
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total",    value: animTotal,    color: "text-slate-900" },
          { label: "Mastered", value: animMastered,  color: "text-emerald-600" },
          { label: "Learning", value: animLearning,  color: "text-amber-600" },
          { label: "New",      value: animNew,       color: "text-slate-400" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-[11px] font-medium text-slate-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Mastery ring ── */}
      <div className="flex items-center justify-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ProgressRing percentage={mastery} size={80} strokeWidth={7} />
        <div>
          <p className="text-lg font-bold text-slate-900">{mastery}% Mastery</p>
          <p className="text-sm text-slate-500">{masteredCount} of {cards.length} cards mastered</p>
        </div>
      </div>

      {/* ── Type distribution ── */}
      {typeCountEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
          <span className="shrink-0 text-xs font-semibold text-slate-400">Card types:</span>
          {typeCountEntries.map(([type, count]) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TYPE_COLORS[type] ?? "bg-slate-100 text-slate-500"}`}
            >
              {count} {TYPE_LABEL[type] ?? type.replace("_", " ")}
            </span>
          ))}
        </div>
      )}

      {/* ── Cards header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Cards</h2>
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Add Card
        </button>
      </div>

      {/* ── Add card form ── */}
      <AnimatePresence>
        {showAddCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">New Card</h3>
                <button onClick={() => setShowAddCard(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <textarea placeholder="Front (question)" value={newFront} onChange={(e) => setNewFront(e.target.value)} className={inputCls} rows={3} />
                <textarea placeholder="Back (answer)"   value={newBack}  onChange={(e) => setNewBack(e.target.value)}  className={inputCls} rows={3} />
                <div className="flex flex-wrap gap-3">
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} className={selectCls}>
                    <option value="concept">Concept</option>
                    <option value="definition">Definition</option>
                    <option value="relationship">Relationship</option>
                    <option value="application">Application</option>
                    <option value="example">Example</option>
                  </select>
                  <select value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value)} className={selectCls}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <button onClick={handleAddCard} className="self-end rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors">
                  Add Card
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {cards.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">No cards yet</p>
            <p className="mt-1 text-sm text-slate-500">Add your first flashcard to get started</p>
          </div>
          <button onClick={() => setShowAddCard(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors">
            <Plus className="h-4 w-4" />Add First Card
          </button>
        </motion.div>
      )}

      {/* ── Card groups ── */}
      {cards.length > 0 && (
        <div className="flex flex-col gap-6">
          {conceptGroups.map(([groupName, groupCards]) => {
            const isCollapsed = collapsedConcepts.has(groupName);
            return (
              <div key={groupName}>
                {/* Group header — only shown when there are multiple named concepts */}
                {showConceptHeaders && (
                  <button
                    onClick={() => toggleConcept(groupName)}
                    className="mb-3 flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: conceptDotColor(groupName) }}
                    />
                    <span className="flex-1 text-sm font-semibold text-slate-700">{groupName}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      {groupCards.length} card{groupCards.length !== 1 ? "s" : ""}
                    </span>
                    {isCollapsed
                      ? <ChevronDown className="h-4 w-4 text-slate-400" />
                      : <ChevronUp   className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                )}

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key="cards"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <motion.div className="grid gap-4 md:grid-cols-2" initial="hidden" animate="visible" variants={stagger}>
                        {groupCards.map((card) => {
                          const isExpanded = expandedCard === card.id;
                          const isEditing  = editingCard  === card.id;
                          const status     = getStatusBadge(card.repetitions);

                          return (
                            <motion.div
                              key={card.id}
                              variants={fadeUp}
                              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-100"
                            >
                              {/* Card badges + action buttons */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {card.card_type && (
                                    <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold capitalize ${TYPE_COLORS[card.card_type] ?? "bg-slate-100 text-slate-500"}`}>
                                      {TYPE_LABEL[card.card_type] ?? card.card_type.replace("_", " ")}
                                    </span>
                                  )}
                                  {card.difficulty && (
                                    <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold capitalize ${DIFFICULTY_COLORS[card.difficulty] ?? "bg-slate-100 text-slate-500"}`}>
                                      {card.difficulty}
                                    </span>
                                  )}
                                  <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${status.cls}`}>
                                    {status.label}
                                  </span>
                                  {weakCardIds.has(card.id) && (
                                    <span className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      Weak
                                    </span>
                                  )}
                                  {card.concept_tag && (
                                    <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${conceptTagColor(card.concept_tag)}`}>
                                      {card.concept_tag}
                                    </span>
                                  )}
                                </div>

                                <div className="flex shrink-0 gap-1">
                                  <button
                                    onClick={() => setTutorCard(card)}
                                    title="Ask AI Tutor"
                                    className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-indigo-50 hover:text-primary"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (isEditing) { setEditingCard(null); }
                                      else { setEditingCard(card.id); setEditFront(card.front); setEditBack(card.back); }
                                    }}
                                    className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-primary"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(card.id)}
                                    className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-danger"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              {isEditing ? (
                                <div className="flex flex-col gap-3 mt-2">
                                  <textarea value={editFront} onChange={(e) => setEditFront(e.target.value)} className={inputCls} rows={3} placeholder="Front" />
                                  <textarea value={editBack}  onChange={(e) => setEditBack(e.target.value)}  className={inputCls} rows={3} placeholder="Back" />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setEditingCard(null)} className="rounded-xl px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition-colors">
                                      Cancel
                                    </button>
                                    <button onClick={() => handleEditSave(card.id)} className="rounded-xl bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors">
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-medium leading-relaxed text-slate-800">{card.front}</p>

                                  <button
                                    onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                                    className="mt-3 flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-indigo-700"
                                  >
                                    {isExpanded
                                      ? <><ChevronUp className="h-3.5 w-3.5" /> Hide answer</>
                                      : <><ChevronDown className="h-3.5 w-3.5" /> Show answer</>
                                    }
                                  </button>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                                          <p className="text-sm leading-relaxed text-slate-800">{card.back}</p>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Mastery celebration ── */}
      {showMasteryModal && deck && (
        <MasteryModal
          deckTitle={deck.title}
          cardCount={cards.length}
          onClose={() => setShowMasteryModal(false)}
        />
      )}

      {/* ── Tutor chat ── */}
      {tutorCard && (
        <TutorChat
          cardId={tutorCard.id}
          cardFront={tutorCard.front}
          cardBack={tutorCard.back}
          isOpen={!!tutorCard}
          onClose={() => setTutorCard(null)}
        />
      )}

      {/* ── Delete confirmation ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">Delete this card?</h3>
            <p className="mt-2 text-sm text-slate-500">This cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCard(deleteConfirm)}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
    </div>
  );
}
