import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | FlashGenius",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
