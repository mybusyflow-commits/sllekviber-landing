import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui";

// Magic UI Interactive Hover Button; MIT /credits/MAGIC-UI-LICENSE.txt.
// Adapted palette, single accessible label and fixed bounds; no magnetic drag.
export function InteractiveHoverButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("interactive-hover-button", className)} {...props}>
    <span className="hover-button-fill" aria-hidden="true" />
    <span className="hover-button-label">{children}</span>
    <ArrowUpRight className="hover-button-arrow" size={19} aria-hidden="true" />
  </button>;
}
