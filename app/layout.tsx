import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextStep - AI Placement & Career Development Engine",
  description: "Integrated placement preparation platform for engineering students with aptitude practice, AI skill-gap analysis, ATS resume builder, and company test series.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F8F9FD] text-[#1E1B4B]">
        {children}
      </body>
    </html>
  );
}
