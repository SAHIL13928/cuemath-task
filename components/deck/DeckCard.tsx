"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, Play, BookOpen, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface DeckCardProps {
  id: string;
  title: string;
  description: string;
  card_count: number;
  source_filename?: string;
  dueCount: number;
  masteredCount: number;
  last_studied_at: string | null;
  onDeleted: () => void;
}

function getStatus(props: DeckCardProps) {
  const mastery = props.card_count > 0
    ? (props.masteredCount / props.card_count) * 100
    : 0;
  if (mastery >= 80) return { label: "Mastered",     cls: "bg-emerald-100 text-emerald-700" };
  if (props.dueCount > 0) return { label: "Review Due",  cls: "bg-amber-100 text-amber-700" };
  if (props.last_studied_at) return { label: "In Progress", cls: "bg-blue-100 text-blue-700" };
  return { label: "New", cls: "bg-slate-100 text-slate-600" };
}

export default function DeckCard(props: DeckCardProps) {
  const {
    id, title, description, card_count, source_filename,
    masteredCount, last_studied_at, onDeleted,
  } = props;
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mastery = card_count > 0 ? Math.round((masteredCount / card_count) * 100) : 0;
  const status = getStatus(props);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/decks/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deck deleted"); onDeleted(); }
      else toast.error("Failed to delete deck");
    } catch {
      toast.error("Failed to delete deck");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
      setMenuOpen(false);
    }
  }

  function navigate(e: React.MouseEvent, path: string) {
    e.stopPropagation();
    router.push(path);
  }

  return (
    <>
      <motion.div
        layout
        onClick={() => router.push(`/deck/${id}`)}
        className="group relative flex cursor-pointer flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
      >
        {/* ── Body ── */}
        <div className="flex flex-col gap-3 p-5">
          {/* Top row: status badge + menu */}
          <div className="flex items-center justify-between">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.cls}`}>
              {status.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Dropdown */}
          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-4 top-10 z-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <button
                onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-rose-500 transition-colors hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {/* Title */}
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-primary">
              {title}
            </h3>
            {source_filename && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                <FileText className="h-3 w-3 shrink-0" />
                {source_filename}
              </p>
            )}
            {!source_filename && description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{description}</p>
            )}
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{card_count} cards</span>
              <span className="text-[11px] font-semibold text-slate-700">{mastery}% mastered</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${mastery}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Last studied */}
          <p className="text-[11px] text-slate-400">
            {last_studied_at
              ? `Studied ${formatDistanceToNow(new Date(last_studied_at), { addSuffix: true })}`
              : "Never studied"}
          </p>
        </div>

        {/* ── Action bar ── */}
        <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
          <button
            onClick={(e) => navigate(e, `/practice/${id}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            <Play className="h-3.5 w-3.5" />
            Study Now
          </button>
          <button
            onClick={(e) => navigate(e, `/deck/${id}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            View Deck
          </button>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">Delete this deck?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This cannot be undone. All cards and study history will be permanently deleted.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
