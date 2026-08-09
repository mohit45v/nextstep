import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/25 disabled:hover:bg-accent",
  secondary:
    "bg-surface text-ink border border-line hover:border-line-strong hover:bg-inset disabled:hover:bg-surface",
  ghost:
    "bg-transparent text-ink-muted hover:bg-inset hover:text-ink disabled:hover:bg-transparent",
  danger:
    "bg-danger-soft text-danger border border-danger-line hover:bg-danger hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-[15px] gap-2",
  lg: "h-13 px-8 text-base gap-2",
};

/**
 * Shared button styling, exported separately so `<Link>` can wear the same look
 * without a polymorphic `as` prop — links and buttons behave differently enough
 * (prefetch, middle-click, keyboard) that faking one as the other causes bugs.
 *
 *   <Link href="/login" className={buttonStyles({ variant: "primary" })}>
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold",
    "transition-colors duration-150 cursor-pointer whitespace-nowrap",
    "disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      // Defaulting to "button" matters: an unspecified <button> inside a form
      // submits it, which has caused accidental submissions in the exam screen.
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
