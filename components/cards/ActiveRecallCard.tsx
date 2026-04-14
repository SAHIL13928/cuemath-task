"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CircleDot,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export interface GradeResult {
  score: number;
  grade: "excellent" | "good" | "partial" | "incorrect";
  feedback: string;
  keyPointsMissed: string[];
}

interface CardData {
  id: string;
  front: string;
  back: string;
  card_type: string;
  difficulty: string;
}

interface ActiveRecallCardProps {
  card: CardData;
  deckId: string;
  onNext: (result: GradeResult) => void;
  onAskTutor: () => void;
}

type Phase = "input" | "grading" | "result";

function scoreColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#f43f5e";
}

function gradeLabel(grade: string) {
  switch (grade) {
    case "excellent": return "Excellent ✓";
    case "good":      return "Good ✓";
    case "partial":   return "Partial ◑";
    default:          return "Needs Work ✗";
  }
}

function GradeIcon({ grade }: { grade: string }) {
  const cls = "h-5 w-5";
  switch (grade) {
    case "excellent": return <CheckCircle2 className={cls} style={{ color: "#10b981" }} />;
    case "good":      return <CheckCircle2 className={cls} style={{ color: "#f59e0b" }} />;
    case "partial":   return <CircleDot    className={cls} style={{ color: "#f97316" }} />;
    default:          return <XCircle      className={cls} style={{ color: "#f43f5e" }} />;
  }
}

export default function ActiveRecallCard({
  card,
  deckId: _deckId,
  onNext,
  onAskTutor,
}: ActiveRecallCardProps) {
  const [phase, setPhase] = useState<Phase>("input");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit() {
    if (!answer.trim() || phase !== "input") return;
    setPhase("grading");
    try {
      const res = await fetch("/api/grade-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, userAnswer: answer.trim() }),
      });
      if (!res.ok) throw new Error();
      const data: GradeResult = await res.json();
      setResult(data);
      setPhase("result");
    } catch {
      toast.error("Failed to grade your answer. Please try again.");
      setPhase("input");
    }
  }

  function handleSkip() {
    const skip: GradeResult = {
      score: 0,
      grade: "incorrect",
      feedback: "You skipped this card. Review the correct answer and try again next time!",
      keyPointsMissed: [],
    };
    setResult(skip);
    setPhase("result");
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); handleSubmit(); }
  }

  const cardSurface =
    "rounded-2xl border border-slate-200 bg-white shadow-sm";

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">

        {/* ── INPUT ──────────────────────────────────────── */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-4"
          >
            {/* Question card */}
            <div className={`${cardSurface} p-6`}
                 style={{ background: "linear-gradient(140deg, #eef2ff 0%, #fff 60%)", borderColor: "#e0e7ff" }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Question
              </p>
              <p className="text-xl font-semibold leading-snug text-slate-900">{card.front}</p>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type your answer from memory…"
                rows={5}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <p className="text-center text-xs text-slate-400">
                Try to recall fully before submitting — this is where real learning happens
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                whileTap={{ scale: 0.97 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit Answer <ArrowRight className="h-4 w-4" />
              </motion.button>
              <button
                onClick={handleSkip}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
              >
                Skip
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400">Ctrl+Enter to submit</p>
          </motion.div>
        )}

        {/* ── GRADING ────────────────────────────────────── */}
        {phase === "grading" && (
          <motion.div
            key="grading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1.5 text-xs font-semibold text-slate-400">Your answer</p>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{answer}</p>
            </div>
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-slate-500">Grading your answer…</p>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ─────────────────────────────────────── */}
        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-4"
          >
            {/* Score + grade */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, type: "spring", stiffness: 220, damping: 18 }}
              className={`${cardSurface} flex items-center gap-5 p-5`}
            >
              <div
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md"
                style={{ backgroundColor: scoreColor(result.score) }}
              >
                {result.score}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <GradeIcon grade={result.grade} />
                  <span className="text-xl font-bold text-slate-900">{gradeLabel(result.grade)}</span>
                </div>
                <p className="text-xs text-slate-400">out of 100 points</p>
              </div>
            </motion.div>

            {/* Correct answer */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Correct Answer
              </p>
              <p className="text-sm font-medium leading-relaxed text-slate-800">{card.back}</p>
            </motion.div>

            {/* AI Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.25 }}
              className="rounded-2xl border-l-4 border-indigo-400 bg-indigo-50 p-4"
              style={{ borderLeftWidth: "4px", borderLeftColor: "#6366f1" }}
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Tutor Feedback
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{result.feedback}</p>

                  {result.keyPointsMissed.length > 0 && (
                    <div className="mt-1">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        <p className="text-xs font-semibold text-amber-700">Key points you missed:</p>
                      </div>
                      <ul className="flex flex-col gap-1">
                        {result.keyPointsMissed.map((pt, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <span className="mt-0.5 text-slate-400">•</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.22 }}
              className="flex gap-3"
            >
              <motion.button
                onClick={() => onNext(result)}
                whileTap={{ scale: 0.97 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
              >
                Next Card <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={onAskTutor}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                Ask AI Tutor
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
