"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

export default ChartCard;
