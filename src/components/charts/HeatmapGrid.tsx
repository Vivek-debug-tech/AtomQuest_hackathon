"use client";

import React from "react";
import ChartCard from "./ChartCard";

type HeatmapProps = {
  title: string;
  xLabels: string[]; // columns
  yLabels: string[]; // rows
  values: number[][]; // matrix [row][col]
  colorScale?: (v: number, max: number) => string;
};

function defaultColorScale(v: number, max: number) {
  if (max === 0) return "#eff6ff";
  const ratio = Math.min(Math.max(v / max, 0), 1);
  // gradient from light blue to dark blue
  const start = [239, 246, 255];
  const end = [14, 116, 255];
  const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
  const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
  const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

export function HeatmapGrid({ title, xLabels, yLabels, values, colorScale = defaultColorScale }: HeatmapProps) {
  const flat = values.flat();
  const max = flat.length ? Math.max(...flat) : 0;
  const min = flat.length ? Math.min(...flat) : 0;

  return (
    <ChartCard title={title}>
      <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>Heat intensity</span>
        <div className="flex items-center gap-2">
          <span>{min}%</span>
          <div className="h-2 w-28 rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-blue-700" />
          <span>{max}%</span>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${xLabels.length}, minmax(44px,1fr))` }}>
            <div className="col-span-1 px-2 py-2"></div>
            {xLabels.map((x) => (
              <div key={x} className="px-2 py-2 text-center text-xs font-medium text-slate-600">
                {x}
              </div>
            ))}

            {yLabels.map((y, r) => (
              <React.Fragment key={y}>
                <div className="px-2 py-2 text-sm font-medium text-slate-700">{y}</div>
                {xLabels.map((_, c) => {
                  const v = values[r] && typeof values[r][c] === "number" ? values[r][c] : 0;
                  const bg = colorScale(v, max);
                  return (
                    <div key={`${r}-${c}`} className="flex items-center justify-center px-1 py-1">
                      <div title={`${v}%`} className="w-full rounded-md py-2 text-center text-xs font-medium text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]" style={{ background: bg }}>
                        {v || "-"}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

export default HeatmapGrid;
