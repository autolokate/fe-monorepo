import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Shimmer placeholder while `/v1/profile` is loading — mirrors the redesigned profile layout. */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12" aria-busy="true">
      <div className="mb-6 flex gap-3 sm:mb-8 sm:gap-4">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-8 w-40 max-w-full sm:w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>

      <Card className="flex flex-col border-primary/20 bg-card/75 backdrop-blur-md sm:rounded-[1.25rem] lg:h-[min(56rem,calc(100dvh-13rem))] lg:min-h-0 lg:flex-row lg:items-stretch lg:overflow-hidden">
        <aside className="flex shrink-0 flex-col border-b border-border/60 p-4 sm:p-5 lg:h-full lg:w-[280px] lg:min-w-[220px] lg:flex-shrink-0 lg:justify-between lg:overflow-hidden lg:border-r lg:border-b-0 lg:p-6">
          <div className="flex gap-2 overflow-hidden lg:flex-col lg:space-y-2 lg:overflow-visible">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-xl lg:h-14 lg:w-full" />
            ))}
          </div>
          <Skeleton className="mt-8 hidden h-28 w-full rounded-xl lg:mt-0 lg:block" />
        </aside>
        <div className="min-h-0 min-w-0 flex-1 p-5 sm:p-8 lg:h-full lg:max-h-full lg:overflow-y-auto lg:p-10">
          <div className="space-y-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 max-w-full sm:w-40" />
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-8 sm:flex-row sm:justify-end">
              <Skeleton className="h-11 w-full rounded-xl sm:w-24" />
              <Skeleton className="h-11 w-full rounded-xl sm:w-36" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
