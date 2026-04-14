import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Providers from "@/components/layout/Providers";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans bg-background dark:bg-dark-bg text-text-primary dark:text-dark-text">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{
              className: "dark:bg-dark-card dark:text-dark-text dark:border-dark-border",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
