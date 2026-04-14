"use client";

import { motion } from "framer-motion";
import { Trophy, X, Share2 } from "lucide-react";
import { toast } from "sonner";
import Confetti from "@/components/ui/Confetti";

interface MasteryModalProps {
  deckTitle: string;
  cardCount: number;
  onClose: () => void;
}

export default function MasteryModal({ deckTitle, cardCount, onClose }: MasteryModalProps) {
  function handleShare() {
    const text = `I just mastered "${deckTitle}" on FlashGenius! 🎓 ${cardCount} cards down.`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Achievement copied to clipboard!");
    }).catch(() => {
      toast.error("Could not copy to clipboard");
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Confetti count={60} />
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="relative z-10 mx-4 w-full max-w-sm rounded-3xl border border-amber-200 bg-white p-8 shadow-2xl text-center"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 15 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100"
          >
            <Trophy className="h-10 w-10 text-amber-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-2xl font-bold text-slate-900">Deck Mastered! 🎉</p>
            <p className="mt-2 text-base font-semibold text-primary">{deckTitle}</p>
            <p className="mt-1 text-sm text-slate-500">
              All {cardCount} card{cardCount !== 1 ? "s" : ""} mastered
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-6 flex flex-col gap-2"
          >
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
            >
              <Share2 className="h-4 w-4" />
              Share Achievement
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100"
            >
              Continue Studying
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
