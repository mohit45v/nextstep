import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names, with later Tailwind utilities beating earlier ones.
 *
 * Plain string concatenation would leave both `px-4` and `px-6` in the class
 * list and let source order in the stylesheet decide — which is why component
 * overrides silently fail to apply. `twMerge` resolves the conflict properly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
