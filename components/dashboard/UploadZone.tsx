"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Stage = "idle" | "reading" | "analyzing" | "generating" | "done";

const STAGE_CONFIG: Record<Exclude<Stage, "idle">, { icon: any; text: string; color: string }> = {
  reading: { icon: FileText, text: "Reading your PDF...", color: "text-primary" },
  analyzing: { icon: Sparkles, text: "Analyzing content...", color: "text-secondary" },
  generating: { icon: BookOpen, text: "Generating flashcards...", color: "text-accent" },
  done: { icon: CheckCircle2, text: "Done!", color: "text-success" },
};

export default function UploadZone() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [cardCount, setCardCount] = useState(0);

  const isProcessing = stage !== "idle";

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileName(file.name);
      setStage("reading");

      const timer1 = setTimeout(() => setStage("analyzing"), 2000);
      const timer2 = setTimeout(() => setStage("generating"), 5000);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/generate", { method: "POST", body: formData });
        const data = await res.json();

        clearTimeout(timer1);
        clearTimeout(timer2);

        if (!res.ok) {
          if (data.error?.includes("extract") || data.error?.includes("read")) {
            throw new Error("Could not read this PDF. Try a different file.");
          }
          if (data.error?.includes("AI") || data.error?.includes("generate") || res.status === 422) {
            throw new Error("AI generation failed. Please try again.");
          }
          throw new Error(data.error || "Failed to generate flashcards");
        }

        setCardCount(data.cardCount);
        setStage("done");

        setTimeout(() => {
          router.push(`/deck/${data.deckId}`);
        }, 1500);
      } catch (err: any) {
        clearTimeout(timer1);
        clearTimeout(timer2);
        toast.error(err.message || "Something went wrong");
        setStage("idle");
        setFileName("");
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: isProcessing,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") {
        toast.error("File must be under 20MB");
      } else if (err?.code === "file-invalid-type") {
        toast.error("Only PDF files are supported");
      } else {
        toast.error("Invalid file");
      }
    },
  });

  const rootProps = getRootProps();

  return (
    <div {...rootProps}>
      <motion.div
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border-2 border-dashed p-8 transition-all duration-300 sm:p-10 ${
          isProcessing
            ? "pointer-events-none border-primary/40 bg-primary/5 dark:bg-primary/10"
            : isDragActive
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 dark:bg-primary/10"
            : "border-text-secondary/25 bg-card hover:border-primary/50 hover:shadow-md dark:border-dark-border dark:bg-dark-card dark:hover:border-primary/40"
        }`}
        animate={isProcessing ? { scale: 1 } : isDragActive ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
      <input {...getInputProps()} />

      {/* Subtle animated background gradient when processing */}
      {isProcessing && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />
      )}

      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            {stage !== "done" ? (
              <Loader2
                className={`h-10 w-10 animate-spin ${STAGE_CONFIG[stage].color}`}
              />
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
              >
                <CheckCircle2 className="h-10 w-10 text-success" />
              </motion.div>
            )}

            <div className="text-center">
              <p className={`text-base font-semibold ${STAGE_CONFIG[stage].color}`}>
                {stage === "done"
                  ? `Done! Created ${cardCount} cards`
                  : STAGE_CONFIG[stage].text}
              </p>
              <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
                {fileName}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <motion.div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                isDragActive
                  ? "bg-primary/10"
                  : "bg-background dark:bg-dark-bg"
              }`}
              animate={isDragActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Upload
                className={`h-8 w-8 transition-colors ${
                  isDragActive ? "text-primary" : "text-text-secondary dark:text-dark-text-secondary"
                }`}
              />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-semibold text-text-primary dark:text-dark-text">
                {isDragActive ? "Drop your PDF here" : "Drop your PDF here or click to browse"}
              </p>
              <p className="mt-1 text-sm text-text-secondary dark:text-dark-text-secondary">
                PDF files up to 20MB — we'll generate flashcards with AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
