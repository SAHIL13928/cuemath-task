"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function DeckCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm dark:bg-dark-card dark:border dark:border-dark-border">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-[52px] w-[52px] !rounded-full" />
      </div>
      <Skeleton className="h-3 w-24 mt-2" />
    </div>
  );
}

export function CardListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card p-5 shadow-sm dark:bg-dark-card dark:border dark:border-dark-border">
          <div className="flex gap-1.5 mb-3">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-4 shadow-sm dark:bg-dark-card dark:border dark:border-dark-border">
          <Skeleton className="h-5 w-5 !rounded-full" />
          <Skeleton className="h-7 w-10" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}
