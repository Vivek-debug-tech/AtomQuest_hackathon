import type React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoaderProps = {
  className?: string;
};

type TableLoaderProps = LoaderProps & {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
};

type ChartLoaderProps = LoaderProps & {
  showLegend?: boolean;
};

function LoaderShell({ className, children }: React.PropsWithChildren<LoaderProps>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardLoader({ className }: LoaderProps) {
  return (
    <LoaderShell className={className}>
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-24 bg-slate-200/90" />
            <Skeleton className="h-8 w-20 bg-slate-200/90" />
            <Skeleton className="h-3 w-32 bg-slate-200/90" />
          </div>
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200/90" />
        </CardContent>
      </Card>
    </LoaderShell>
  );
}

export function TableLoader({ rows = 5, columns = 4, showHeader = true, className }: TableLoaderProps) {
  return (
    <LoaderShell className={className}>
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-3">
          {showHeader ? <Skeleton className="h-4 w-48 bg-slate-200/90" /> : null}
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-64 bg-slate-200/90" />
            <Skeleton className="h-10 w-28 bg-slate-200/90" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={`header-${index}`} className="h-4 bg-slate-200/90" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns }).map((_, columnIndex) => (
                  <Skeleton key={`cell-${rowIndex}-${columnIndex}`} className="h-4 bg-slate-200/90" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </LoaderShell>
  );
}

export function ChartLoader({ className, showLegend = true }: ChartLoaderProps) {
  return (
    <LoaderShell className={className}>
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-3 pb-4">
          <Skeleton className="h-4 w-44 bg-slate-200/90" />
          {showLegend ? (
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-3 w-20 bg-slate-200/90" />
              <Skeleton className="h-3 w-20 bg-slate-200/90" />
              <Skeleton className="h-3 w-20 bg-slate-200/90" />
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <Skeleton className="h-64 w-full bg-slate-200/90 sm:h-72" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-16 rounded-2xl bg-slate-200/90" />
            <Skeleton className="h-16 rounded-2xl bg-slate-200/90" />
            <Skeleton className="h-16 rounded-2xl bg-slate-200/90" />
          </div>
        </CardContent>
      </Card>
    </LoaderShell>
  );
}

export function PageLoader() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 bg-slate-200/90" />
        <Skeleton className="h-8 w-80 bg-slate-200/90" />
        <Skeleton className="h-4 w-[min(100%,560px)] bg-slate-200/90" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardLoader />
        <CardLoader />
        <CardLoader />
        <CardLoader />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartLoader />
        <ChartLoader />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <TableLoader />
        <ChartLoader showLegend={false} />
      </div>
    </div>
  );
}
