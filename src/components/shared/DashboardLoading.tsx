import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-slate-200" />
          <Skeleton className="h-8 w-20 bg-slate-200" />
          <Skeleton className="h-3 w-16 bg-slate-200" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <Skeleton className="h-4 w-44 bg-slate-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-64 w-full bg-slate-200" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <Skeleton className="h-4 w-52 bg-slate-200" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full bg-slate-200" />
        <Skeleton className="h-10 w-full bg-slate-200" />
        <Skeleton className="h-10 w-full bg-slate-200" />
        <Skeleton className="h-10 w-full bg-slate-200" />
      </CardContent>
    </Card>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32 bg-slate-200" />
        <Skeleton className="h-8 w-72 bg-slate-200" />
        <Skeleton className="h-4 w-[min(100%,520px)] bg-slate-200" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <TableSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
