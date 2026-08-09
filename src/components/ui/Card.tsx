import { cn } from "@/lib/cn";

/**
 * The standard white panel. `interactive` adds hover affordance — only use it
 * when the whole card is actually clickable.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface",
        interactive &&
          "transition-colors duration-150 hover:border-accent-line hover:bg-accent-soft/30",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("border-b border-line px-5 py-4", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return <h3 className={cn("text-base font-semibold text-ink", className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}
