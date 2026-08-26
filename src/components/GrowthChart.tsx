"use client";

import { formatCompact, formatFull } from "@/lib/utils";
import type { YearPoint } from "@/lib/simulate";

interface GrowthChartProps {
  points: YearPoint[];
  years: number;
}

const WIDTH = 600;
const HEIGHT = 280;
const PAD_LEFT = 50;
const PAD_RIGHT = 14;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;
const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;

function tickStepFor(years: number): number {
  if (years <= 10) return 2;
  if (years <= 30) return 5;
  return 10;
}

export default function GrowthChart({ points, years }: GrowthChartProps) {
  const maxValue = Math.max(1, ...points.map((p) => p.holdValue)) * 1.08;

  const x = (year: number) => PAD_LEFT + (year / years) * PLOT_W;
  const y = (value: number) => PAD_TOP + PLOT_H - (value / maxValue) * PLOT_H;

  const holdPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${y(p.holdValue)}`).join(" ");
  const activePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${y(p.activeValue)}`).join(" ");

  const areaPath =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year)} ${y(p.holdValue)}`).join(" ") +
    " " +
    [...points]
      .reverse()
      .map((p) => `L ${x(p.year)} ${y(p.activeValue)}`)
      .join(" ") +
    " Z";

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const tickStep = tickStepFor(years);
  const xTicks: number[] = [];
  for (let yr = 0; yr <= years; yr += tickStep) xTicks.push(yr);
  if (xTicks[xTicks.length - 1] !== years) xTicks.push(years);

  const last = points[points.length - 1];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Chart comparing holding investments versus selling and rebuying them over time">
        {gridLines.map((g) => {
          const value = g * maxValue;
          const gy = y(value);
          return (
            <g key={g}>
              <line x1={PAD_LEFT} y1={gy} x2={WIDTH - PAD_RIGHT} y2={gy} stroke="#DCE7D8" strokeWidth={1} />
              <text x={PAD_LEFT - 8} y={gy + 3} textAnchor="end" fontSize="9" fill="#8CA98E">
                {formatCompact(value)}
              </text>
            </g>
          );
        })}

        {xTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={HEIGHT - 8} textAnchor="middle" fontSize="9" fill="#8CA98E">
            {yr === 0 ? "Start" : `Yr ${yr}`}
          </text>
        ))}

        <path d={areaPath} fill="#C1652E" fillOpacity={0.1} stroke="none" />

        <path d={holdPath} fill="none" stroke="#275B2D" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <path d={activePath} fill="none" stroke="#C1652E" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="5 4" />

        <circle cx={x(last.year)} cy={y(last.holdValue)} r={3.5} fill="#275B2D" />
        <circle cx={x(last.year)} cy={y(last.activeValue)} r={3.5} fill="#C1652E" />

        <text x={x(last.year) - 4} y={Math.max(PAD_TOP + 9, y(last.holdValue) - 9)} textAnchor="end" fontSize="12" fontWeight={700} fill="#275B2D">
          {formatFull(last.holdValue)}
        </text>
        <text x={x(last.year) - 4} y={Math.min(HEIGHT - PAD_BOTTOM - 4, y(last.activeValue) + 15)} textAnchor="end" fontSize="12" fontWeight={700} fill="#C1652E">
          {formatFull(last.activeValue)}
        </text>
      </svg>

      <div className="flex items-center gap-5 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-[3px] rounded-full bg-brand inline-block" />
          <span className="text-xs text-ink-muted">Hold, never sell</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-[3px] rounded-full bg-accent inline-block"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, #C1652E 0 3px, transparent 3px 6px)" }}
          />
          <span className="text-xs text-ink-muted">Sell &amp; rebuy a few times a year</span>
        </div>
      </div>
    </div>
  );
}
