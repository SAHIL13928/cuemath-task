"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import type { User, SupabaseClient } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    import("@/lib/supabase").then(({ createBrowserClient }) => {
      const client = createBrowserClient();
      setSupabase(client);
      client.auth.getSession().then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            const res = await fetch("/api/streaks");
            if (res.ok) {
              const data = await res.json();
              setStreak(data.streak ?? 0);
            }
          } catch {}
        }
      });
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) setStreak(null);
      });
      return () => subscription.unsubscribe();
    });
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success("Signed out");
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline">FlashGenius</span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                {streak !== null && streak > 0 && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-200">
                    🔥 {streak}
                  </span>
                )}
                <span className="text-sm text-slate-400">{displayName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-danger/40 hover:text-danger"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-lg font-bold text-primary">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2 px-4 py-4">
              {user ? (
                <>
                  <div className="mb-2 px-2 text-sm font-medium text-slate-400">
                    {displayName}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/5"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-white"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
