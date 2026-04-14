"use client";

import { useRef } from "react";
import Link from "next/link";
import { Play, ArrowRight, Upload, FileText, Brain, Zap, Flame, MessageSquare } from "lucide-react";

import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { Marquee } from "@/components/magicui/marquee";
import { Meteors } from "@/components/magicui/meteors";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WordRotate } from "@/components/magicui/word-rotate";
import { Particles } from "@/components/magicui/particles";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

/* ─── colors ─── */
const BG      = "#0a0a0f";
const SURFACE = "#13131a";
const BORDER  = "rgba(255,255,255,0.07)";
const INDIGO  = "#6366f1";
const VIOLET  = "#8b5cf6";

/* ─── sample marquee cards ─── */
const MARQUEE_CARDS = [
  { subject: "Chemistry",  q: "What is Le Chatelier's Principle?", a: "System shifts to oppose imposed change" },
  { subject: "History",    q: "What ended WWI?", a: "Armistice of 11 Nov 1918" },
  { subject: "Math",       q: "Pythagorean theorem?", a: "a² + b² = c²" },
  { subject: "CS",         q: "What is Big-O notation?", a: "Upper bound on algorithm growth rate" },
  { subject: "Biology",    q: "What is ATP?", a: "Adenosine triphosphate — cellular energy currency" },
  { subject: "Physics",    q: "Newton's 2nd law?", a: "F = ma" },
  { subject: "Economics",  q: "Define opportunity cost", a: "Value of the next-best forgone alternative" },
  { subject: "Psychology", q: "What is cognitive dissonance?", a: "Discomfort from holding conflicting beliefs" },
];

const SUBJECT_COLORS: Record<string, string> = {
  Chemistry: "#10b981", History: "#f59e0b", Math: INDIGO,
  CS: VIOLET, Biology: "#06b6d4", Physics: "#f43f5e",
  Economics: "#f97316", Psychology: "#ec4899",
};

function MarqueeCard({ q, a, subject }: { q: string; a: string; subject: string }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      borderRadius: 12, padding: "14px 18px",
      minWidth: 260, maxWidth: 280,
      display: "flex", flexDirection: "column", gap: 6,
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
        color: SUBJECT_COLORS[subject] ?? INDIGO,
        background: `${SUBJECT_COLORS[subject] ?? INDIGO}18`,
        borderRadius: 4, padding: "2px 7px", alignSelf: "flex-start",
      }}>{subject}</span>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500, lineHeight: 1.4 }}>{q}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{a}</div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ children, style = {}, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`feature-card ${className}`}
      style={{
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 20, padding: 32,
        transition: "border-color 300ms, transform 300ms",
        ...style,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${INDIGO}50`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = BORDER;
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {children}
    </div>
  );
}

/* ─── Avatar circles ─── */
const AVATAR_COLORS = [INDIGO, VIOLET, "#ec4899", "#06b6d4"];

export default function Home() {
  /* refs for AnimatedBeam */
  const beamContainer = useRef<HTMLDivElement>(null);
  const beamFrom      = useRef<HTMLDivElement>(null);
  const beamTo        = useRef<HTMLDivElement>(null);

  return (
    <div style={{ background: BG, color: "#fff", minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "120px 24px 80px", textAlign: "center" }}>
        <Particles quantity={120} color={INDIGO} size={0.5} staticity={80} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

          <BlurFade delay={0} inView>
            <AnimatedGradientText>
              ✦ Introducing Active Recall AI Grading
            </AnimatedGradientText>
          </BlurFade>

          <BlurFade delay={0.1} inView>
            <h1 style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontSize: "clamp(42px, 7vw, 76px)",
              fontWeight: 800, lineHeight: 1.05,
              color: "#fff", margin: 0,
              letterSpacing: "-0.02em",
            }}>
              The flashcard app that<br />
              actually makes you{" "}
              <span style={{
                background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
              }}>
                <WordRotate
                  words={["remember.", "understand.", "retain.", "learn."]}
                  duration={2400}
                />
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <p style={{
              fontSize: 19, color: "rgba(255,255,255,0.55)",
              maxWidth: 540, lineHeight: 1.7, margin: 0, fontWeight: 300,
            }}>
              Upload any PDF. AI builds comprehensive decks — not shallow cards.
              Type your answers. Get semantically graded. Actually learn.
            </p>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <ShimmerButton
                  background={`linear-gradient(135deg, ${INDIGO}, ${VIOLET})`}
                  shimmerColor="#c4b5fd"
                  style={{ fontSize: 15, padding: "14px 26px" }}
                >
                  Upload your first PDF <ArrowRight size={16} />
                </ShimmerButton>
              </Link>
              <button style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                color: "rgba(255,255,255,0.7)", borderRadius: 12,
                padding: "14px 22px", fontSize: 15, cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                <Play size={14} fill="currentColor" /> Watch 60s demo
              </button>
            </div>
          </BlurFade>

          {/* Social proof */}
          <BlurFade delay={0.4} inView>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {AVATAR_COLORS.map((c, i) => (
                  <div key={i} style={{
                    width: 32, height: 32, borderRadius: "50%", background: c,
                    border: `2px solid ${BG}`, marginLeft: i === 0 ? 0 : -10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#fff",
                  }}>
                    {["S","M","A","J"][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                <strong style={{ color: "rgba(255,255,255,0.85)" }}>2,400+</strong> students already studying smarter
              </span>
            </div>
          </BlurFade>

          {/* Hero app mockup */}
          <BlurFade delay={0.5} inView className="w-full" style={{ width: "100%" }}>
            <div style={{
              position: "relative",
              maxWidth: 740, margin: "24px auto 0",
              borderRadius: 20,
              border: `1px solid ${BORDER}`,
              background: SURFACE,
              boxShadow: `0 0 80px rgba(99,102,241,0.08), inset 0 0 80px rgba(99,102,241,0.03)`,
              overflow: "hidden",
              padding: "32px 28px",
              textAlign: "left",
            }}>
              <BorderBeam size={400} duration={6} colorFrom={INDIGO} colorTo={VIOLET} />

              {/* Mock practice UI */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f43f5e", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                <span style={{ marginLeft: 8 }}>FlashGenius — Practice Mode</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 11, color: INDIGO, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                    conceptual · card 7 of 24
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.5, marginBottom: 20 }}>
                    Explain how the Pythagorean theorem applies in three-dimensional space.
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                    borderRadius: 10, padding: "12px 16px",
                    fontSize: 14, color: "rgba(255,255,255,0.75)",
                    fontFamily: "monospace",
                    marginBottom: 16,
                  }}>
                    For 3D: d = √(x² + y² + z²) — the distance formula extends the theorem by adding a third squared term under the root.
                  </div>
                  {/* AI feedback */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", background: `${INDIGO}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Brain size={11} color={INDIGO} />
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                        <span style={{ color: "#10b981", fontWeight: 600 }}>Correct</span> — distance formula derivation is accurate.
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", background: `${INDIGO}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Brain size={11} color={INDIGO} />
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                        <span style={{ color: "#f59e0b", fontWeight: 600 }}>Missed</span> — could mention the vector magnitude connection.
                      </div>
                    </div>
                  </div>
                </div>
                {/* Score badge */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "conic-gradient(#10b981 0% 94%, rgba(255,255,255,0.06) 94% 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%", background: SURFACE,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>94</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Excellent ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <BlurFade delay={0} inView>
        <div style={{
          borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
          background: "rgba(255,255,255,0.025)",
          padding: "40px 24px",
        }}>
          <div style={{
            maxWidth: 900, margin: "0 auto",
            display: "flex", justifyContent: "space-around",
            flexWrap: "wrap", gap: 32,
          }}>
            {[
              { value: 2400, suffix: "+", label: "Students" },
              { value: 90,   suffix: "s", label: "PDF to Deck" },
              { value: 3,    suffix: "×", label: "Better Retention" },
              { value: 94,   suffix: "%", label: "Avg Recall Score" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-bricolage), sans-serif",
                  fontSize: 40, fontWeight: 800, lineHeight: 1,
                  background: `linear-gradient(135deg, #fff, rgba(255,255,255,0.6))`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 6,
                }}>
                  <NumberTicker value={s.value} />{s.suffix}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BlurFade>

      {/* ══════════════════════════════════════════
          FEATURES — BENTO GRID
      ══════════════════════════════════════════ */}
      <section style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <BlurFade delay={0} inView>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
              color: "#fff", margin: "0 0 14px", letterSpacing: "-0.02em",
            }}>
              Everything passive learning isn't.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: 300 }}>
              Built for students who actually want to remember what they study.
            </p>
          </div>
        </BlurFade>

        {/* Row 1: Large (60%) + Small (40%) */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }} className="bento-row">

          {/* Large — Active Recall */}
          <BlurFade delay={0.1} inView>
            <FeatureCard style={{ height: "100%" }}>
              <div style={{ fontSize: 12, color: INDIGO, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                Active Recall Grading
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
                  What is the relationship between force, mass, and acceleration?
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "10px 14px",
                  fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "monospace",
                  marginBottom: 12,
                }}>
                  F = ma — force equals mass times acceleration
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "conic-gradient(#10b981 0% 88%, rgba(255,255,255,0.06) 88% 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: SURFACE, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#10b981",
                    }}>88</div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                    <span style={{ color: "#10b981" }}>Good</span> — add units (N = kg·m/s²) for full credit
                  </div>
                </div>
              </div>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Type it. Get graded. Learn the gap.
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                AI grades semantically — partial credit, specific feedback on what you missed. Not keyword matching.
              </p>
            </FeatureCard>
          </BlurFade>

          {/* Small — Streak */}
          <BlurFade delay={0.2} inView>
            <FeatureCard style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <Flame size={20} color="#f97316" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Current streak</span>
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-bricolage), sans-serif",
                  fontSize: 80, fontWeight: 800, lineHeight: 0.9,
                  background: "linear-gradient(135deg, #f97316, #f59e0b)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 8,
                }}>12</div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginBottom: 16 }}>day streak</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 6, borderRadius: 3,
                      background: i < 5 ? "#f97316" : "rgba(255,255,255,0.08)",
                    }} />
                  ))}
                </div>
              </div>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: "24px 0 6px" }}>
                Streak Tracking
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                Daily practice builds habits. Your streak is proof.
              </p>
            </FeatureCard>
          </BlurFade>
        </div>

        {/* Row 2: Small (40%) + Large (60%) */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 16 }} className="bento-row">

          {/* Small — AI Tutor */}
          <BlurFade delay={0.3} inView>
            <FeatureCard>
              <div style={{ fontSize: 12, color: VIOLET, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                AI Tutor Per Card
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{
                  background: "rgba(255,255,255,0.05)", borderRadius: "12px 12px 4px 12px",
                  padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.6)", maxWidth: "80%", alignSelf: "flex-end",
                }}>
                  I don't get why entropy always increases?
                </div>
                <div style={{
                  background: `${VIOLET}18`, border: `1px solid ${VIOLET}30`,
                  borderRadius: "4px 12px 12px 12px",
                  padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.75)", maxWidth: "90%",
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: VIOLET, fontWeight: 600 }}>Tutor:</span> Think of it as probability — disordered states vastly outnumber ordered ones, so systems naturally drift toward them.
                </div>
              </div>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
                Stuck? Just ask.
              </h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                The tutor knows your card, your deck, and your weak spots.
              </p>
            </FeatureCard>
          </BlurFade>

          {/* Large — PDF → Deck with AnimatedBeam */}
          <BlurFade delay={0.4} inView>
            <FeatureCard>
              <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
                PDF → Smart Deck in 90s
              </div>
              <div
                ref={beamContainer as React.RefObject<HTMLDivElement>}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}
              >
                {/* PDF source */}
                <div
                  ref={beamFrom as React.RefObject<HTMLDivElement>}
                  style={{
                    width: 72, height: 88, borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>PDF</span>
                </div>

                <AnimatedBeam
                  containerRef={beamContainer}
                  fromRef={beamFrom}
                  toRef={beamTo}
                  gradientStartColor={INDIGO}
                  gradientStopColor="#10b981"
                  duration={2.5}
                  pathWidth={2}
                  curvature={-30}
                />

                {/* Generated cards */}
                <div
                  ref={beamTo as React.RefObject<HTMLDivElement>}
                  style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}
                >
                  {[
                    { label: "Definition",  color: INDIGO },
                    { label: "Conceptual",  color: VIOLET },
                    { label: "Application", color: "#10b981" },
                    { label: "Edge Case",   color: "#f43f5e" },
                  ].map((t) => (
                    <div key={t.label} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
                      borderRadius: 7, padding: "7px 10px",
                    }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%", background: t.color, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 style={{ fontFamily: "var(--font-bricolage), sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Two-pass AI extraction.
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                Concepts, relationships, edge cases, worked examples — not shallow bullet points. Generated in ~90 seconds.
              </p>
            </FeatureCard>
          </BlurFade>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE — flashcard examples
      ══════════════════════════════════════════ */}
      <BlurFade delay={0} inView>
        <div style={{ padding: "0 0 96px", overflow: "hidden" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
              Real cards generated by FlashGenius
            </p>
          </div>
          <Marquee pauseOnHover repeat={3}>
            {MARQUEE_CARDS.map((card) => (
              <MarqueeCard key={card.q} {...card} />
            ))}
          </Marquee>
        </div>
      </BlurFade>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ padding: "0 24px 96px", maxWidth: 960, margin: "0 auto" }}>
        <BlurFade delay={0} inView>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700,
              color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em",
            }}>
              From PDF to mastery in 3 steps.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", margin: 0 }}>
              No setup. No manual cards. Just upload.
            </p>
          </div>
        </BlurFade>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, position: "relative" }} className="steps-row">
          {[
            {
              num: "01",
              title: "Upload PDF",
              desc: "Drop any PDF — lecture notes, textbooks, research papers.",
              icon: <Upload size={20} color={INDIGO} />,
              delay: 0.1,
            },
            {
              num: "02",
              title: "AI Builds Your Deck",
              desc: "Two-pass extraction: concepts first, then cards. Quality-filtered output.",
              icon: <Zap size={20} color={VIOLET} />,
              delay: 0.2,
            },
            {
              num: "03",
              title: "Active Recall + Grading",
              desc: "Type answers, get AI feedback, see exactly what you're missing.",
              icon: <Brain size={20} color="#10b981" />,
              delay: 0.3,
            },
          ].map((step, i) => (
            <BlurFade key={step.num} delay={step.delay} inView style={{ flex: 1 }}>
              <div style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 16px" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20,
                  }}>
                    {step.icon}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-bricolage), sans-serif",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                    color: "rgba(255,255,255,0.2)",
                    marginBottom: 10, textTransform: "uppercase",
                  }}>STEP {step.num}</div>
                  <h3 style={{
                    fontFamily: "var(--font-bricolage), sans-serif",
                    fontSize: 18, fontWeight: 700, color: "#fff",
                    margin: "0 0 10px",
                  }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
                {i < 2 && (
                  <div style={{
                    width: 1, flexShrink: 0,
                    marginTop: 28,
                    borderLeft: `1px dashed rgba(99,102,241,0.3)`,
                    height: 40,
                    alignSelf: "flex-start",
                  }} />
                )}
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA — with Meteors
      ══════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", padding: "120px 24px", textAlign: "center" }}>
        <Meteors number={25} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <BlurFade delay={0} inView>
          <div style={{ position: "relative", zIndex: 10, maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <h2 style={{
              fontFamily: "var(--font-bricolage), sans-serif",
              fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800,
              color: "#fff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1,
            }}>
              Your next exam<br />is waiting.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", margin: 0, fontWeight: 300 }}>
              Start studying smarter in the next 90 seconds.
            </p>
            <Link href="/dashboard" style={{ textDecoration: "none", marginTop: 8 }}>
              <ShimmerButton
                background={`linear-gradient(135deg, ${INDIGO}, ${VIOLET})`}
                shimmerColor="#c4b5fd"
                style={{ fontSize: 16, padding: "16px 32px" }}
              >
                Upload a PDF — it's free
              </ShimmerButton>
            </Link>
          </div>
        </BlurFade>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "28px 48px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="5" width="11" height="7" rx="1.5" stroke="white" strokeWidth="1.3" fill="none"/>
              <path d="M4 5V3.5a2.5 2.5 0 015 0V5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          FlashGenius
        </div>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>© 2026 FlashGenius</span>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          {["Privacy", "Terms", "GitHub"].map((l) => (
            <a key={l} href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
            >{l}</a>
          ))}
        </div>
      </footer>

      {/* ── responsive ── */}
      <style>{`
        @media (max-width: 768px) {
          .bento-row { grid-template-columns: 1fr !important; }
          .steps-row { flex-direction: column !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
}
