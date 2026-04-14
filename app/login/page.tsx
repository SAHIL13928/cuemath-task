"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();

  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import("@/lib/supabase").then(({ createBrowserClient }) => {
      setSupabase(createBrowserClient());
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <motion.div
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-lg dark:bg-dark-card dark:border dark:border-dark-border sm:p-8">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
            {mode === "signin"
              ? "Sign in to continue studying"
              : "Start learning smarter today"}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="mb-6 flex rounded-xl bg-background p-1 dark:bg-dark-bg">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === "signin"
                ? "bg-card text-primary shadow-sm dark:bg-dark-card"
                : "text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-card text-primary shadow-sm dark:bg-dark-card"
                : "text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-text-secondary/20 bg-card py-3 text-sm font-medium text-text-primary transition-colors hover:bg-background dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-dark-bg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-text-secondary/20 dark:bg-dark-border" />
          <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
            or
          </span>
          <div className="h-px flex-1 bg-text-secondary/20 dark:bg-dark-border" />
        </div>

        {/* Email / Password form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-text-secondary/20 bg-background py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-text-secondary/60"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-text-secondary/20 bg-background py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-text-secondary/60"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-text-secondary/20 bg-background py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-dark-text-secondary/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !supabase}
            className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
