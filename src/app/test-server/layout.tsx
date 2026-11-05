import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Server — Internal Debug",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

