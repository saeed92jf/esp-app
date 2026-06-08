// src/components/aparat/AparatSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Full-page skeleton for the Aparat screen.
 * Mirrors the real layout: header (avatar + name + search),
 * left column (player + random cards), right column (playlist).
 * Used INSTEAD of the spinner loading screen until content is ready.
 */
export function AparatSkeleton() {
  return (
    <div className="bg-background flex min-h-screen flex-col lg:h-screen lg:overflow-hidden">
      {/* Header skeleton: avatar + channel name + search box */}
      <header className="border-border bg-background/95 shrink-0 border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          {/* Search box placeholder pushed to the right */}
          <Skeleton className="ml-auto h-9 w-full max-w-md rounded-md" />
        </div>
      </header>

      {/* Body grid */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Left column: player + random cards */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Player placeholder */}
          <Skeleton
            className="w-full rounded-lg"
            style={{ height: 'calc(50vh - 100px)' }}
          />

          {/* Random cards placeholder grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column: playlist placeholder */}
        <div className="lg:col-span-1">
          <div className="space-y-3 rounded-lg border p-3">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-28 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
