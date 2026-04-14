"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Zap, BarChart3, Sparkles, Shield } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  return (
    <div className="-mx-6 -mt-8 flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 dark:from-primary/5 dark:via-dark-bg dark:to-accent/5" />
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl dark:bg-primary/10"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl dark:bg-accent/10"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary dark:border-primary/30 dark:bg-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Powered by AI
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-extrabold leading-tight tracking-tight text-text-primary dark:text-dark-text sm:text-5xl md:text-6xl"
          >
            Turn any PDF into{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              smart flashcards
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-base leading-relaxed text-text-secondary dark:text-dark-text-secondary sm:text-lg"
          >
            AI-powered flashcard generation with spaced repetition for long-term
            retention. Upload a PDF, and let our engine create study-ready cards
            in seconds.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-4 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-text-secondary/20 px-8 py-3.5 text-base font-semibold text-text-primary transition-all hover:border-primary/40 hover:bg-card dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-card"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center gap-16 bg-card px-6 py-24 dark:bg-dark-card">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-col items-center gap-4"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-text-primary dark:text-dark-text"
          >
            How it works
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="max-w-lg text-center text-text-secondary dark:text-dark-text-secondary"
          >
            Three simple steps to transform your study materials into an
            effective learning system.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid max-w-4xl gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {[
            {
              icon: BookOpen,
              title: "Upload a PDF",
              description:
                "Drag and drop any PDF document — lecture notes, textbooks, research papers.",
            },
            {
              icon: Brain,
              title: "AI generates cards",
              description:
                "Our AI extracts key concepts and creates clear question-answer pairs automatically.",
            },
            {
              icon: Zap,
              title: "Study smarter",
              description:
                "Spaced repetition schedules reviews at the optimal time for long-term retention.",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary dark:text-dark-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why FlashGenius section */}
      <section className="flex flex-col items-center gap-16 px-6 py-24 dark:bg-dark-bg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="flex flex-col items-center gap-4"
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-text-primary dark:text-dark-text"
          >
            Why FlashGenius?
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {[
            {
              icon: Sparkles,
              title: "AI Generation",
              description:
                "Advanced AI reads your PDFs and creates high-quality flashcards that test real understanding.",
              color: "text-primary",
              bg: "bg-primary/10 dark:bg-primary/20",
            },
            {
              icon: BarChart3,
              title: "Spaced Repetition",
              description:
                "SM-2 algorithm schedules reviews at scientifically optimal intervals for maximum retention.",
              color: "text-accent",
              bg: "bg-accent/10 dark:bg-accent/20",
            },
            {
              icon: Shield,
              title: "Progress Tracking",
              description:
                "Visual stats, streaks, and heatmaps so you always know where you stand and what needs work.",
              color: "text-success",
              bg: "bg-success/10 dark:bg-success/20",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="flex flex-col gap-4 rounded-2xl border border-secondary/10 bg-card p-6 shadow-sm transition-all hover:shadow-md dark:border-dark-border dark:bg-dark-card"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary dark:text-dark-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center gap-6 bg-gradient-to-r from-primary to-accent px-6 py-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white"
        >
          Ready to study smarter?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-md text-white/80"
        >
          Join thousands of students who learn more effectively with AI-powered flashcards.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
