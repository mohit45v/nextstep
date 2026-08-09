"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { NavDrawer } from "./NavDrawer";
import { AptitudeSessionProvider } from "@/components/aptitude/AptitudeSessionProvider";

/**
 * Client half of the protected layout: owns the drawer open/close state and
 * wraps every page in the aptitude session provider.
 *
 * `accountSlot` is rendered on the server (it contains the sign-out server
 * action) and passed through as a prop, which keeps this component client-side
 * without dragging the auth code into the browser bundle.
 */
export function AppShell({
  children,
  accountSlot,
  readinessScore,
  streakDays,
}: {
  children: React.ReactNode;
  accountSlot?: React.ReactNode;
  readinessScore?: number;
  streakDays?: number;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <AptitudeSessionProvider>
      <div className="min-h-screen bg-[#0B0F17] text-[#F8FAFC] flex flex-col font-sans">
        <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        <Navbar
          onToggleDrawer={() => setIsDrawerOpen((open) => !open)}
          readinessScore={readinessScore}
          streakDays={streakDays}
          accountSlot={accountSlot}
        />

        <main className="flex-1 w-full mx-auto lg:pl-72">{children}</main>

        <footer className="bg-[#131927] border-t border-[#262F40] py-6 mt-12 text-center text-xs text-slate-400 lg:pl-72">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">NextStep Engine</span>
              <span>•</span>
              <span>AI Placement &amp; Career Development Platform</span>
            </div>
            <p>© {new Date().getFullYear()} NextStep · Terna Engineering College</p>
          </div>
        </footer>
      </div>
    </AptitudeSessionProvider>
  );
}
