"use client";

import type React from "react";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        "--normal-bg": "#ffffff",
        "--normal-text": "#0f172a",
        "--normal-border": "#e2e8f0",
        "--border-radius": "14px",
      } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast: "cn-toast border border-slate-200 bg-white text-slate-800 shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
