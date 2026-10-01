"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "./Navbar";
import { NavDrawer } from "./NavDrawer";

/**
 * Client half of the protected layout: owns the drawer open/close state.
 *
 * It used to also host an `AptitudeSessionProvider` holding the in-flight exam
 * and the last results in memory. Both now live in the database and are reached
 * by URL (/aptitude/exam/[packId], /aptitude/review/[attemptId]), so the provider
 * is gone — a refresh no longer loses a paper.
 *
 * `accountSlot` is rendered on the server (it contains the sign-out server
 * action) and passed through as a prop, which keeps this component client-side
 * without dragging the auth code into the browser bundle.
 */
export function AppShell({
  children,
  accountSlot,
  isAdmin = false,
}: {
  children: React.ReactNode;
  accountSlot?: React.ReactNode;
  /** Role is read on the server and passed down — the drawer never guesses. */
  isAdmin?: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isAdmin={isAdmin}
      />

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
            official college service.{" "}
            <Link href="/attributions" className="hover:text-accent hover:underline">
              Question sources &amp; licences
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}
