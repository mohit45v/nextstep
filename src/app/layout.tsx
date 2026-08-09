import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NextStep — AI Placement & Career Development Engine",
    template: "%s · NextStep",
  },
  description:
    "Integrated placement preparation platform for engineering students with aptitude practice, AI skill-gap analysis, ATS resume builder, and company test series.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Dark palette applied once here. Previously the body was light
          (#F8F9FD) and every page overrode it, which flashed on navigation. */}
      <body className="min-h-full flex flex-col font-sans bg-[#0B0F17] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
