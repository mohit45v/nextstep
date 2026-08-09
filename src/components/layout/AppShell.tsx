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
}: {
  children: React.ReactNode;
  accountSlot?: React.ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <AptitudeSessionProvider>
      <NavDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Drawer is fixed at 18rem and always visible from `lg` up. */}
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Navbar
          onToggleDrawer={() => setIsDrawerOpen((open) => !open)}
          accountSlot={accountSlot}
        />

        <main className="flex-1 px-4 py-8 sm:px-6">{children}</main>

        <footer className="border-t border-line px-4 py-6 sm:px-6">
          <p className="text-xs text-ink-subtle">
            NextStep · A student project for Terna Engineering College. Not an
            official college service.
          </p>
        </footer>
      </div>
    </AptitudeSessionProvider>
  );
}
