/**
 * PageSkeleton: shown during lazy route loading (Suspense fallback).
 * Provides a consistent shimmer effect to avoid layout shift.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title area */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-secondary/40 animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-secondary/25 animate-pulse" />
      </div>

      {/* Hero card */}
      <div className="h-32 rounded-xl bg-secondary/30 animate-pulse" />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-xl bg-secondary/25 animate-pulse" />
        ))}
      </div>

      {/* Content cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-56 rounded-xl bg-secondary/20 animate-pulse" />
        <div className="h-56 rounded-xl bg-secondary/20 animate-pulse" />
      </div>
    </div>
  );
}
