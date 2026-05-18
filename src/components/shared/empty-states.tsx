"use client";

import type React from "react";
import { FolderX, ClipboardList, ChartNoAxesCombined, MessageSquareOff, ArrowRight, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateTone = "blue" | "slate" | "emerald" | "amber";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  tone?: EmptyStateTone;
  className?: string;
};

const toneStyles: Record<EmptyStateTone, { iconBg: string; iconText: string; accent: string }> = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    accent: "border-blue-200 bg-blue-50/70",
  },
  slate: {
    iconBg: "bg-slate-100",
    iconText: "text-slate-700",
    accent: "border-slate-200 bg-slate-50",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    accent: "border-emerald-200 bg-emerald-50/70",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    accent: "border-amber-200 bg-amber-50/70",
  },
};

function EmptyStateBase({
  title,
  description,
  icon: Icon,
  action,
  secondaryAction,
  tone = "blue",
  className,
}: EmptyStateProps) {
  const colors = toneStyles[tone];

  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:p-8", className)}>
      <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border", colors.accent, colors.iconBg)}>
        <Icon className={cn("h-6 w-6", colors.iconText)} aria-hidden="true" />
      </div>
      <div className="mx-auto mt-5 max-w-xl text-center">
        <h3 className="text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>

      {(action || secondaryAction) ? (
        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {action ? (
            <Button onClick={action.onClick} className="bg-blue-600 text-white hover:bg-blue-700">
              {action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button variant="outline" onClick={secondaryAction.onClick} className="border-slate-200 bg-white text-slate-800 hover:bg-slate-50">
              {secondaryAction.label}
              <RefreshCcw className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function NoGoalsEmptyState(props: Omit<EmptyStateProps, "icon" | "tone">) {
  return (
    <EmptyStateBase
      {...props}
      tone="blue"
      icon={FolderX}
      title={props.title || "No goals created"}
      description={props.description || "Start a planning cycle by creating the first goal for this quarter."}
    />
  );
}

export function NoApprovalsEmptyState(props: Omit<EmptyStateProps, "icon" | "tone">) {
  return (
    <EmptyStateBase
      {...props}
      tone="slate"
      icon={ClipboardList}
      title={props.title || "No pending approvals"}
      description={props.description || "All submitted goals are already reviewed, approved, or waiting on new submissions."}
    />
  );
}

export function NoAnalyticsEmptyState(props: Omit<EmptyStateProps, "icon" | "tone">) {
  return (
    <EmptyStateBase
      {...props}
      tone="emerald"
      icon={ChartNoAxesCombined}
      title={props.title || "No analytics available"}
      description={props.description || "Add goals, check-ins, or approvals to populate the dashboard with live performance trends."}
    />
  );
}

export function NoCheckInsEmptyState(props: Omit<EmptyStateProps, "icon" | "tone">) {
  return (
    <EmptyStateBase
      {...props}
      tone="amber"
      icon={MessageSquareOff}
      title={props.title || "No check-ins yet"}
      description={props.description || "Quarterly check-ins will appear here once employees submit their progress updates."}
    />
  );
}

export function SearchEmptyState(props: Omit<EmptyStateProps, "icon" | "tone">) {
  return (
    <EmptyStateBase
      {...props}
      tone="slate"
      icon={Search}
      title={props.title || "No results found"}
      description={props.description || "Try broadening your search or clearing filters to see more records."}
    />
  );
}

export { EmptyStateBase };
