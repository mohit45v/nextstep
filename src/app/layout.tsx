import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";

/**
 * Self-hosted by next/font at build time — no external request, so it survives
 * the strict CSP and does not shift layout while loading.
 */
const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-fira-sans",
});

export const metadata: Metadata = {
  title: {
    default: "NextStep — Placement preparation for Terna Engineering College",
    template: "%s · NextStep",
  },
  description:
    "Aptitude practice, DSA problem sets and company test series for Terna Engineering College students. Sign in with your college Google account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaSans.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
