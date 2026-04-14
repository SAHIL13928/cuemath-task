"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import TutorChat from "@/components/tutor/TutorChat";

const TYPE_COLORS: Record<string, string> = {
  concept:      "bg-indigo-50 text-indigo-600",
  definition:   "bg-cyan-50 text-cyan-600",
  relationship: "bg-amber-50 text-amber-600",
  application:  "bg-emerald-50 text-emerald-600",
  example:      "bg-violet-50 text-violet-600",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard:   "bg-rose-50 text-rose-600",
};

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  cardType?: string;
  difficulty?: string;
  cardId?: string;
}

export default function FlashCard({
  front,
  back,
  isFlipped = false,
  onFlip,
  cardType,
  difficulty,
  cardId,
}: FlashCardProps) {
  const [tutorOpen, setTutorOpen] = useState(false);

  return (
    <>
      {/* Perspective wrapper — click only flips forward */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => !isFlipped && onFlip?.()}
      >
        {/* Height-providing shell — motion.div uses absolute inset-0 */}
        <div className="relative min-h-[260px] sm:min-h-[310px]">
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* ── FRONT ────────────────────────────────────────── */}
            <div
              className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl p-6 sm:p-8"
              style={{
                backfaceVisibility: "hidden",
                background: "linear-gradient(140deg, #eef2ff 0%, #ffffff 60%)",
                border: "1px solid #e0e7ff",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.04)",
              }}
            >
              {(cardType || difficulty) && (
                <div className="mb-4 flex items-center justify-between gap-2">
                  {cardType ? (
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${TYPE_COLORS[cardType] ?? "bg-slate-100 text-slate-600"}`}>
                      {cardType}
                    </span>
                  ) : <span />}
                  {difficulty && (
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[difficulty] ?? "bg-slate-100 text-slate-600"}`}>
                      {difficulty}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-1 items-center justify-center overflow-y-auto">
                <p className="text-center text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
                  {front}
                </p>
              </div>

              <p className="mt-4 text-center text-xs font-medium text-slate-400">
                Click to reveal answer
              </p>
            </div>

            {/* ── BACK ─────────────────────────────────────────── */}
            <div
              className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-white p-6 sm:p-8"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.04)",
              }}
            >
              {/* Answer label */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Answer
              </p>

              <div className="flex flex-1 items-center justify-center overflow-y-auto">
                <p className="text-center text-lg font-medium leading-relaxed text-slate-800 sm:text-xl">
                  {back}
                </p>
              </div>

              {/* Ask Tutor button — only when flipped, stopPropagation so it doesn't trigger parent onClick */}
              {cardId && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTutorOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Ask Tutor
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {cardId && (
        <TutorChat
          cardId={cardId}
          cardFront={front}
          cardBack={back}
          isOpen={tutorOpen}
          onClose={() => setTutorOpen(false)}
        />
      )}
    </>
  );
}
