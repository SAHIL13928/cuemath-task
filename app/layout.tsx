import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/layout/Providers";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FlashGenius - AI-Powered Flashcards",
  description:
    "Turn any PDF into smart flashcards with AI-powered generation and spaced repetition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} ${bricolage.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-[#faf9f7] text-[#1a1814]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
        <Providers>
          <Navbar />
          <main className="w-full flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
