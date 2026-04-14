import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deck | FlashGenius",
};

export default function DeckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
