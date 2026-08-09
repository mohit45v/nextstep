import Link from "next/link";
import { buttonStyles } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="NextStep home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <a
            href="#features"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            What you get
          </a>
          <a
            href="#how"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            How it works
          </a>
        </nav>

        <Link href="/login" className={buttonStyles({ size: "sm" })}>
          Sign in
        </Link>
      </div>
    </header>
  );
}
