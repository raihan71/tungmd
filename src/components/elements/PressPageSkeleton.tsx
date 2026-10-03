import { Skeleton } from "@/components/ui/skeleton";

export default function PressPageSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-12" aria-busy="true" aria-label="Loading your pages">
      <p className="sr-only" role="status">
        Loading your pages…
      </p>
      <div aria-hidden="true" className="motion-reduce:[&_*]:animate-none">
        <div className="flex flex-col items-center py-12 sm:py-16">
          <Skeleton className="mb-4 size-28 rounded-full sm:size-32" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <div className="mt-4 w-full max-w-[18ch] space-y-2 text-[clamp(2.5rem,6.5vw,4.5rem)]">
            <Skeleton className="h-[0.85em] w-full" />
            <Skeleton className="h-[0.85em] w-4/5" />
          </div>
          <div className="mt-4 w-full max-w-[52ch] space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="mt-6 w-full max-w-2xl">
            <Skeleton className="h-16 w-full rounded-xl border border-line" />
            <div className="mt-3 border-t border-line pt-2">
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 overflow-hidden rounded-xl border border-line bg-sheet">
          <div className="col-span-12 border-b border-line bg-paper/50 p-6 md:col-span-3 md:border-b-0 md:border-r">
            <Skeleton className="h-3 w-16" />
            <div className="mt-3 divide-y divide-line">
              {[0, 1, 2].map((item) => (
                <div key={item} className="space-y-2 py-2">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-2 w-3/5" />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 min-w-0 p-4 sm:p-6 md:col-span-9">
            <div className="mb-5 flex justify-between gap-4 border-b border-line pb-3">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-7 w-32" />
            </div>
            <div className="space-y-4 rounded-xl border border-line bg-sheet p-6 sm:p-8">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-10 w-5/6" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="mt-5">
              <Skeleton className="mb-3 h-3 w-48 max-w-full" />
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} className="aspect-square rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
