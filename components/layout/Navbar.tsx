"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import type { User, SupabaseClient } from "@supabase/supabase-js";

/* ── Logo mark (small black rounded square) ── */
function LogoMark() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 7,
      background: "#1a1814",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="2" y="7" width="11" height="6" rx="1.5" stroke="white" strokeWidth="1.3" fill="none"/>
        <path d="M5 7V5a2.5 2.5 0 015 0v2" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        <circle cx="7.5" cy="10" r="1" fill="white"/>
      </svg>
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [user, setUser] = useState<User | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    import("@/lib/supabase/browser").then(({ getSupabaseBrowserClient }) => {
      const client = getSupabaseBrowserClient();
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
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: isHome ? "1px solid rgba(255,255,255,0.06)" : "1px solid #ece9e3",
        backgroundColor: isHome ? "rgba(10,10,15,0.8)" : "rgba(250,249,247,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          height: 60,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
        }}
          className="navbar-inner"
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: 9,
              textDecoration: "none",
              fontFamily: "var(--font-bricolage), var(--font-dm-sans), sans-serif",
              fontWeight: 600, fontSize: 15,
              color: isHome ? "#fff" : "#1a1814",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: isHome
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "#1a1814",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="2" y="7" width="11" height="6" rx="1.5" stroke="white" strokeWidth="1.3" fill="none"/>
                <path d="M5 7V5a2.5 2.5 0 015 0v2" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                <circle cx="7.5" cy="10" r="1" fill="white"/>
              </svg>
            </div>
            FlashGenius
          </Link>

          {/* Desktop center — marketing links (homepage only) */}
          {isHome && (
            <div style={{ display: "flex", gap: 32 }} className="nav-marketing-links">
              {["Features", "How it works", "Pricing"].map((label) => (
                <a
                  key={label}
                  href={label === "How it works" ? "#how-it-works" : "#"}
                  style={{
                    fontSize: 14, color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          {/* Desktop right */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }} className="nav-right">
            {user ? (
              <>
                {!isHome && (
                  <Link
                    href="/dashboard"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 14, color: "#6b6760", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#1a1814")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6b6760")}
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                )}
                {streak !== null && streak > 0 && (
                  <span style={{
                    background: "#fff8f0",
                    border: "1px solid #fed7aa",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 12, fontWeight: 600, color: "#d97706",
                  }}>
                    🔥 {streak}
                  </span>
                )}
                <span style={{ fontSize: 13, color: "#9b9690" }}>{displayName}</span>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    border: "1.5px solid #ece9e3",
                    borderRadius: 10, padding: "7px 14px",
                    fontSize: 13, fontWeight: 500, color: "#6b6760",
                    background: "transparent", cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#f43f5e40"; e.currentTarget.style.color = "#f43f5e"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ece9e3"; e.currentTarget.style.color = "#6b6760"; }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {!isHome && (
                  <Link
                    href="/login"
                    style={{
                      fontSize: 14, color: "#6b6760", textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#1a1814")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6b6760")}
                  >
                    Sign in
                  </Link>
                )}
                {isHome ? (
                  <Link href="/login" style={{ textDecoration: "none" }}>
                    <button style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.8)", borderRadius: 10,
                      padding: "8px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                      transition: "background 0.15s",
                      marginRight: 8,
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    >Sign in</button>
                  </Link>
                ) : null}
                <Link href="/dashboard" style={{ textDecoration: "none" }}>
                  <button style={{
                    display: "inline-flex", alignItems: "center",
                    background: isHome
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#1a1814",
                    color: "#fff",
                    padding: "8px 16px", borderRadius: 10,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: "none",
                    transition: "opacity 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Get Started Free
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: "none", padding: 8, borderRadius: 8,
              background: "transparent", border: "none",
              color: "#6b6760", cursor: "pointer",
            }}
            className="nav-hamburger"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 60,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} />
          <div
            style={{
              position: "absolute", right: 0, top: 0,
              width: 280, height: "100%",
              background: "#faf9f7",
              display: "flex", flexDirection: "column",
              boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid #ece9e3",
              padding: "16px 20px",
            }}>
              <span style={{ fontWeight: 500, fontSize: 15, color: "#1a1814" }}>Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9b9690", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px" }}>
              {isHome && ["Features", "How it works", "Pricing"].map(label => (
                <a
                  key={label}
                  href={label === "How it works" ? "#how-it-works" : "#"}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "12px 12px", borderRadius: 10,
                    fontSize: 14, color: "#6b6760", textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              ))}
              {user ? (
                <>
                  <div style={{ padding: "8px 12px", fontSize: 12, color: "#9b9690" }}>{displayName}</div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 12px", borderRadius: 10,
                      fontSize: 14, color: "#1a1814", textDecoration: "none",
                    }}
                  >
                    <LayoutDashboard size={16} color="#6366f1" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      marginTop: "auto", display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 12px", borderRadius: 10,
                      fontSize: 14, color: "#f43f5e",
                      background: "none", border: "none", cursor: "pointer",
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#1a1814", color: "#fff",
                    padding: "12px", borderRadius: 10,
                    fontSize: 14, fontWeight: 500, textDecoration: "none",
                    marginTop: 8,
                  }}
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-marketing-links { display: none !important; }
          .nav-right { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .navbar-inner { padding: 0 20px !important; }
        }
      `}</style>
    </>
  );
}
