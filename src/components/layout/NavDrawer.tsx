"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Binary,
  Building2,
  ChartBar,
  ClipboardCheck,
  Compass,
  History,
  LayoutDashboard,
  Sigma,
  Terminal,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";
import { navSectionsFor } from "./nav-items";

const ICONS = {
  LayoutDashboard,
  Compass,
  BookOpen,
  Building2,
  Sigma,
  ChartBar,
  Binary,
  UserRound,
  History,
  ClipboardCheck,
  Terminal,
} as const;

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Adds the editorial section. Decided on the server from the session role. */
  isAdmin?: boolean;
}

export function NavDrawer({ isOpen, onClose, isAdmin = false }: NavDrawerProps) {
  const pathname = usePathname();
  const sections = navSectionsFor(isAdmin);

  // Escape closes the drawer, and body scroll is locked while the mobile
  // overlay is covering the page.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Scrim — mobile only; on large screens the drawer is always visible. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-ink/25 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface",
          "transition-transform duration-200 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Sidebar"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <Link href="/dashboard" onClick={onClose}>
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-inset hover:text-ink lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.heading} className="mb-6 last:mb-0">
              <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-ink-subtle uppercase">
                {section.heading}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = ICONS[item.icon as keyof typeof ICONS];
                  // Exact match, except /dashboard and /dsa which have no children.
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/aptitude" && pathname.startsWith(`${item.href}/`));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-input px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent-soft text-accent"
                            : "text-ink-muted hover:bg-inset hover:text-ink",
                        )}
                      >
                        {Icon && <Icon className="h-[18px] w-[18px] shrink-0" />}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line px-5 py-4">
          <p className="text-xs leading-relaxed text-ink-subtle">
            Terna Engineering College
            <br />
            Placement preparation
          </p>
        </div>
      </aside>
    </>
  );
}

export default NavDrawer;
