"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  Loader2,
  PartyPopper,
  BrainCircuit,
  LayoutList,
  ArrowRight,
  XCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import FlashCard from "@/components/cards/FlashCard";
import ActiveRecallCard, { type GradeResult } from "@/components/cards/ActiveRecallCard";
import TutorChat from "@/components/tutor/TutorChat";
import Confetti from "@/components/ui/Confetti";
import { previewIntervals, type Rating } from "@/lib/sm2";
import { playSound, getMutedPref, setMutedPref } from "@/lib/sounds";

interface Card {
  id: string;
  front: string;
  back: string;
  card_type: string;
  difficulty: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
}

interface DeckInfo {
  id: string;
  title: string;
}

interface RecallResult {
  card: Card;
  score: number;
  grade: string;
}

type PracticeMode = "flip" | "recall";

function getStoredMode(): PracticeMode {
  if (typeof window === "undefined") return "flip";
  return (localStorage.getItem("practice_mode_preference") as PracticeMode) || "flip";
}

/* ─── shared pill button style ─── */
const pillBase =
  "flex w-28 flex-col items-center gap-1 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.97]";

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();

  const [deck, setDeck] = useState<DeckInfo | null>(null);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [practiceCards, setPracticeCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(getStoredMode);

  // Flip-mode
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const [flipStats, setFlipStats] = useState({ easy: 0, hard: 0, forgot: 0 });

  // Recall-mode
  const [arResults, setArResults] = useState<RecallResult[]>([]);
  const [weakCards, setWeakCards] = useState<Card[]>([]);

  // TutorChat
  const [tutorOpen, setTutorOpen] = useState(false);

  // Sound + milestone
  const [muted, setMuted] = useState<boolean>(() => getMutedPref());
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedPref(next);
  }

  function getMilestone(nextIndex: number): string | null {
    if (nextIndex === 5)  return "Nicely done! You're warming up 🧠";
    if (nextIndex === 10) return "Halfway there — focus is a superpower ⚡";
    return null;
  }

  function advanceWithMilestone(nextIndex: number, afterAdvance: () => void) {
    const msg = getMilestone(nextIndex);
    if (msg) {
      setMilestoneMessage(msg);
      setTimeout(() => {
        setMilestoneMessage(null);
        afterAdvance();
      }, 2000);
    } else {
      afterAdvance();
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [decksRes, cardsRes] = await Promise.all([
          fetch("/api/decks"),
          fetch(`/api/cards?deckId=${params.id}&due=true`),
        ]);
        const [decksData, cardsData] = await Promise.all([decksRes.json(), cardsRes.json()]);

        if (decksRes.ok && decksData.decks) {
          const found = decksData.decks.find((d: DeckInfo) => d.id === params.id);
          if (found) setDeck(found);
        }
        if (cardsRes.ok && cardsData.cards) {
          setAllCards(cardsData.cards);
          setPracticeCards(cardsData.cards);
        }
      } catch (err) {
        console.error("Failed to fetch practice data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  function changeMode(mode: PracticeMode) {
    if (mode === practiceMode) return;
    setPracticeMode(mode);
    localStorage.setItem("practice_mode_preference", mode);
    setCurrentIndex(0);
    setFinished(false);
    setIsFlipped(false);
    setFlipStats({ easy: 0, hard: 0, forgot: 0 });
    setArResults([]);
    setPracticeCards(allCards);
    startTimeRef.current = Date.now();
  }

  const currentCard = practiceCards[currentIndex];

  // ── Flip mode ──────────────────────────────────────────────────────────────

  const previews = useMemo(() => {
    if (!currentCard) return { forgot: 1, hard: 1, easy: 1 };
    return previewIntervals(
      currentCard.ease_factor ?? 2.5,
      currentCard.interval ?? 0,
      currentCard.repetitions ?? 0,
    );
  }, [currentCard]);

  const handleFlip = useCallback(() => {
    playSound("flip", muted);
    setIsFlipped(true);
  }, [muted]);

  const handleRate = useCallback(
    async (rating: Rating) => {
      if (submitting || !currentCard) return;
      setSubmitting(true);
      setFlipStats((p) => ({ ...p, [rating]: p[rating] + 1 }));

      // Sound feedback per rating
      if (rating === "easy")   playSound("correct", muted);
      else if (rating === "hard") playSound("hard", muted);

      fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: currentCard.id, rating }),
      }).catch(console.error);

      await new Promise((r) => setTimeout(r, 150));

      const nextIndex = currentIndex + 1;
      if (nextIndex < practiceCards.length) {
        advanceWithMilestone(nextIndex, () => {
          setCurrentIndex(nextIndex);
          setIsFlipped(false);
        });
      } else {
        setFinished(true);
      }
      setSubmitting(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submitting, currentCard, currentIndex, practiceCards.length, muted],
  );

  // ── Recall mode ────────────────────────────────────────────────────────────

  function handleRecallNext(result: GradeResult) {
    if (!currentCard) return;
    const newResults = [...arResults, { card: currentCard, score: result.score, grade: result.grade }];
    setArResults(newResults);
    const nextIndex = currentIndex + 1;
    if (nextIndex < practiceCards.length) {
      advanceWithMilestone(nextIndex, () => setCurrentIndex(nextIndex));
    } else {
      setWeakCards(newResults.filter((r) => r.score < 60).map((r) => r.card));
      setFinished(true);
    }
  }

  function restartWithWeakCards() {
    setPracticeCards(weakCards);
    setCurrentIndex(0);
    setFinished(false);
    setArResults([]);
    setWeakCards([]);
    startTimeRef.current = Date.now();
  }

  // ── Keyboard (flip only) ───────────────────────────────────────────────────

  useEffect(() => {
    if (practiceMode !== "flip") return;
    function onKey(e: KeyboardEvent) {
      if (finished || loading || practiceCards.length === 0) return;
      if (e.code === "Space") { e.preventDefault(); if (!isFlipped) handleFlip(); }
      else if (isFlipped) {
        if (e.key === "1") handleRate("forgot");
        else if (e.key === "2") handleRate("hard");
        else if (e.key === "3") handleRate("easy");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFlipped, finished, loading, practiceCards.length, handleFlip, handleRate, practiceMode]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500">Loading practice session…</p>
      </div>
    );
  }

  // ── No cards ───────────────────────────────────────────────────────────────

  if (practiceCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <PartyPopper className="h-10 w-10 text-emerald-500" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">All caught up!</h1>
          <p className="mt-2 max-w-sm text-slate-500">
            No cards are due for review right now. Come back later to keep your streak going.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
        >
          Back to Dashboard
        </Link>
      </motion.div>
    );
  }

  // ── Flip-mode session complete ─────────────────────────────────────────────

  if (finished && practiceMode === "flip") {
    // Update streak (fire-and-forget)
    fetch("/api/streaks", { method: "POST" }).catch(() => {});

    const total = flipStats.easy + flipStats.hard + flipStats.forgot;
    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center gap-8 overflow-hidden px-4">
        <Confetti count={50} />

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <PartyPopper className="h-10 w-10 text-emerald-500" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="text-3xl font-bold text-slate-900">
          Session Complete!
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap justify-center gap-5">
          {[
            { value: total,                      label: "Reviewed",  color: "bg-indigo-100 text-indigo-600" },
            { value: flipStats.easy + flipStats.hard, label: "Correct",  color: "bg-emerald-100 text-emerald-600" },
            { value: flipStats.forgot,            label: "Forgot",   color: "bg-rose-100 text-rose-600" },
            { value: `${elapsed}m`,               label: "Time",     color: "bg-amber-100 text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${s.color}`}>
                {s.value}
              </div>
              <span className="text-xs font-medium text-slate-400">{s.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.push(`/deck/${params.id}`); router.refresh(); }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/40 hover:text-primary">
            <RotateCcw className="h-4 w-4" /> Back to Deck
          </button>
          <Link href="/dashboard"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600">
            Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Recall-mode session complete ───────────────────────────────────────────

  if (finished && practiceMode === "recall") {
    const total = arResults.length;
    const counts = {
      excellent: arResults.filter((r) => r.grade === "excellent").length,
      good:      arResults.filter((r) => r.grade === "good").length,
      partial:   arResults.filter((r) => r.grade === "partial").length,
      incorrect: arResults.filter((r) => r.grade === "incorrect").length,
    };
    const avgScore = total > 0
      ? Math.round(arResults.reduce((a, r) => a + r.score, 0) / total)
      : 0;

    return (
      <div className="relative flex min-h-[70vh] flex-col items-center gap-8 overflow-hidden py-10 px-4">
        {avgScore >= 70 && <Confetti count={40} />}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg flex flex-col gap-5">

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Session Complete 🎉</h1>
            <p className="mt-1 text-sm text-slate-500">{deck?.title}</p>
          </div>

          {/* Score card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-around">
              {[
                { value: avgScore, label: "Avg Score",
                  style: { color: avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#f59e0b" : "#f43f5e" } },
                { value: total,    label: "Cards" },
                { value: counts.excellent + counts.good, label: "Strong",
                  style: { color: "#10b981" } },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold" style={s.style ?? { color: "#0f172a" }}>
                    {s.value}
                  </span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Grade bars */}
            <div className="flex flex-col gap-2">
              {([
                { label: "Excellent", count: counts.excellent, color: "#10b981" },
                { label: "Good",      count: counts.good,      color: "#f59e0b" },
                { label: "Partial",   count: counts.partial,   color: "#f97316" },
                { label: "Needs Work",count: counts.incorrect, color: "#f43f5e" },
              ] as const).map((g) => (
                <div key={g.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-right text-xs font-medium text-slate-400">
                    {g.label}
                  </span>
                  <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: total > 0 ? `${(g.count / total) * 100}%` : "0%" }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: g.color }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-xs text-slate-400">{g.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak cards */}
          {weakCards.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">
                  Cards to Review ({weakCards.length})
                </p>
              </div>
              <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
                {weakCards.map((c) => (
                  <div key={c.id} className="rounded-xl border border-amber-100 bg-white px-3 py-2">
                    <p className="text-xs font-medium text-slate-700 leading-snug">{c.front}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Score: {arResults.find((r) => r.card.id === c.id)?.score ?? 0}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={restartWithWeakCards}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <RotateCcw className="h-4 w-4" />
                Practice Weak Cards
              </button>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { router.push(`/deck/${params.id}`); router.refresh(); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/40 hover:text-primary">
              <RotateCcw className="h-4 w-4" /> Back to Deck
            </button>
            <Link href="/dashboard"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600">
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main practice UI ───────────────────────────────────────────────────────

  const progress = ((currentIndex + 1) / practiceCards.length) * 100;

  return (
    <>
      <motion.div
        className="mx-auto flex min-h-[80vh] w-full max-w-2xl flex-col px-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between py-4">
          <Link
            href={`/deck/${params.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-indigo-300 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <span className="text-sm font-semibold text-slate-700 truncate max-w-[160px]">
            {deck?.title}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">
              {currentIndex + 1} / {practiceCards.length}
            </span>
            <button
              onClick={toggleMute}
              title={muted ? "Unmute sounds" : "Mute sounds"}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              {muted
                ? <VolumeX className="h-4 w-4" />
                : <Volume2 className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* ── Mode toggle ── */}
        <div className="mt-4 flex justify-center">
          <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            {(["flip", "recall"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  practiceMode === mode
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {mode === "flip"
                  ? <><LayoutList className="h-3.5 w-3.5" /> Flip Cards</>
                  : <><BrainCircuit className="h-3.5 w-3.5" /> Active Recall</>
                }
              </button>
            ))}
          </div>
        </div>

        {/* ── Card area ── */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {milestoneMessage ? (
              <motion.div
                key="milestone"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                className="flex min-h-[260px] sm:min-h-[310px] flex-col items-center justify-center gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 text-center"
              >
                <p className="text-3xl font-bold text-slate-900">{milestoneMessage}</p>
                <p className="text-sm text-slate-500">Keep going…</p>
              </motion.div>
            ) : (
            <motion.div
              key={`${currentIndex}-${practiceMode}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.25 }}
            >
              {practiceMode === "flip" ? (
                <FlashCard
                  front={currentCard.front}
                  back={currentCard.back}
                  isFlipped={isFlipped}
                  onFlip={handleFlip}
                  cardType={currentCard.card_type}
                  difficulty={currentCard.difficulty}
                  cardId={currentCard.id}
                />
              ) : (
                <ActiveRecallCard
                  card={currentCard}
                  deckId={String(params.id)}
                  onNext={handleRecallNext}
                  onAskTutor={() => setTutorOpen(true)}
                />
              )}
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Flip-mode action buttons ── */}
        {practiceMode === "flip" && (
          <div className="mt-6 pb-8">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="show"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-2"
                >
                  <button
                    onClick={handleFlip}
                    className="w-full rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-md sm:w-auto"
                  >
                    Show Answer
                  </button>
                  <span className="text-[11px] text-slate-400">or press Space</span>
                </motion.div>
              ) : (
                <motion.div
                  key="rate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.4, duration: 0.25 }}
                  className="flex flex-col items-center gap-3"
                >
                  <p className="text-xs font-medium text-slate-400">How well did you know this?</p>
                  <div className="flex w-full justify-center gap-3">
                    <motion.button
                      onClick={() => handleRate("forgot")}
                      disabled={submitting}
                      whileTap={{ scale: 0.96 }}
                      className={`${pillBase} bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50`}
                    >
                      <span className="text-sm font-semibold">Forgot</span>
                      <span className="text-xs opacity-70">Again soon</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleRate("hard")}
                      disabled={submitting}
                      whileTap={{ scale: 0.96 }}
                      className={`${pillBase} bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50`}
                    >
                      <span className="text-sm font-semibold">Hard</span>
                      <span className="text-xs opacity-70">
                        {previews.hard === 1 ? "1 day" : `${previews.hard}d`}
                      </span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleRate("easy")}
                      disabled={submitting}
                      whileTap={{ scale: 0.96 }}
                      className={`${pillBase} bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50`}
                    >
                      <span className="text-sm font-semibold">Easy</span>
                      <span className="text-xs opacity-70">
                        {previews.easy === 1 ? "1 day" : `${previews.easy}d`}
                      </span>
                    </motion.button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Keyboard: 1 = Forgot · 2 = Hard · 3 = Easy
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* TutorChat (recall mode) */}
      {currentCard && (
        <TutorChat
          cardId={currentCard.id}
          cardFront={currentCard.front}
          cardBack={currentCard.back}
          isOpen={tutorOpen}
          onClose={() => setTutorOpen(false)}
        />
      )}
    </>
  );
}
