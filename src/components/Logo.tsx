import { cn } from "@/lib/utils";

/** A billing cycle: an open ring with the next charge riding on it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("h-7 w-7", className)}>
      <path
        d="M16 6.5a9.5 9.5 0 1 0 9.5 9.5"
        stroke="hsl(var(--foreground))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="23.2" cy="8.8" r="2.6" fill="hsl(var(--highlight))" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight">SubTrackR</span>
    </span>
  );
}

/** Full-screen loading state: the mark breathes while we wait. */
export function BrandLoader({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex min-h-[60vh] flex-col items-center justify-center gap-4", className)}>
      <LogoMark className="h-12 w-12 animate-breathe" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
