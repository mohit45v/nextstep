"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { ALL_NAV_ITEMS } from "./nav-items";

/**
 * Longest matching nav href wins, so /aptitude/practice beats /aptitude.
 *
 * The streak counter and "Readiness: 78%" badge that used to live here are
 * gone — both were hardcoded constants presented as measurements.
 */
function titleForPath(pathname: string): string {
  const match = [...ALL_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return match?.label ?? "NextStep";
}

interface NavbarProps {
  onToggleDrawer: () => void;
  /** Server-rendered account controls, passed down from the layout. */
  accountSlot?: React.ReactNode;
}

export function Navbar({ onToggleDrawer, accountSlot }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleDrawer}
            aria-label="Open navigation"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:text-ink lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <h2 className="truncate text-[15px] font-semibold text-ink">
            {titleForPath(pathname)}
          </h2>
        </div>

        {accountSlot}
      </div>
    </header>
  );
}
