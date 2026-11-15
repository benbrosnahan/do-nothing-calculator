"use client";

// The Do-Nothing Calculator's one signature element: the gap. Two lines show what each person would walk away
// with, after tax, if they sold everything that year. The wedge between them is what selling and rebuying cost,
// and a bracket at the end measures it with the same figure as the headline.
//
// Chart rules, so nobody "improves" them away later:
//   * One y-axis, starting at zero.
//   * The two series differ by stroke (solid, dashed) as well as colour.
//   * Nothing depends on hovering. The answer is in the text above, and the year-by-year table holds every value.
//   * Labels are 13px at real size: the SVG is drawn at the measured width, never scaled down.

import { useEffect, useRef, useState } from "react";
import type { YearPoint } from "@/lib/simulate";
import { formatCompact, formatFull } from "@/lib/utils";

interface GrowthChartProps {
  points: YearPoint[];
  years: number;
  /** One sentence for screen readers, with the figures in it. */
  summary: string;
}

const GREEN = "#26602D";
const ORANGE = "#C1652E";
const INK = "#275B2D";
const GRID = "#E4ECE0";
const BASE = "#BFDCB8";
const AXIS_TEXT = "#4A6E4D";
const WEDGE = "#F2CDB3";

const H = 260;
const PAD = { top: 18, bottom: 30, left: 2 };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** A round number at or above n, for the top gridline. */
function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  for (const s of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (s * mag >= n) return s * mag;
  return 10 * mag;
}

export default function GrowthChart({ points, years, summary }: GrowthChartProps) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();

  const last = points[points.length - 1];
  const gap = last.holdKeep - last.activeKeep;
  const label = formatFull(Math.abs(gap));
  // Room on the right for the bracket and its figure, sized to the figure.
  const padRight = 26 + label.length * 9;

  const yMax = niceCeil(Math.max(1, ...points.map((p) => Math.max(p.holdKeep, p.activeKeep))));
  const innerW = Math.max(0, width - PAD.left - padRight);
  const innerH = H - PAD.top - PAD.bottom;
  const x = (year: number) => PAD.left + (year / years) * innerW;
  const y = (v: number) => PAD.top + innerH - (Math.max(0, v) / yMax) * innerH;

  const line = (key: "holdKeep" | "activeKeep") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");
  const wedge =
    line("holdKeep") +
    [...points]
      .reverse()
      .map((p) => `L${x(p.year).toFixed(1)},${y(p.activeKeep).toFixed(1)}`)
      .join("") +
    "Z";

  const step = years <= 10 ? 2 : years <= 30 ? 5 : 10;
  const xTicks: number[] = [];
  // Stop short of the end, where the "N years" label sits.
  for (let yr = step; yr < years; yr += step) if (x(years) - x(yr) > 64) xTicks.push(yr);

  const endX = x(years);
  const yHold = y(last.holdKeep);
  const yActive = y(last.activeKeep);
  const top = Math.min(yHold, yActive);
  const bottom = Math.max(yHold, yActive);
  const mid = (top + bottom) / 2;
  const bx = endX + 10;

  return (
    <figure className="m-0">
      <div ref={wrapRef} className="relative overflow-hidden" style={{ height: H }}>
        {width > 0 && (
          <>
            <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} aria-hidden className="absolute inset-0 block">
              {[yMax, yMax / 2].map((t) => (
                <g key={t}>
                  <line x1={PAD.left} x2={endX} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
                  <text x={PAD.left} y={y(t) - 6} fontSize="13" fill={AXIS_TEXT} className="tnum">
                    {formatCompact(t)}
                  </text>
                </g>
              ))}
              <line x1={PAD.left} x2={endX} y1={y(0)} y2={y(0)} stroke={BASE} strokeWidth="1" />
              <text x={PAD.left} y={H - 8} fontSize="13" fill={AXIS_TEXT}>
                Now
              </text>
              {xTicks.map((yr) => (
                <g key={yr}>
                  <line x1={x(yr)} x2={x(yr)} y1={y(0)} y2={y(0) + 5} stroke={BASE} strokeWidth="1" />
                  <text x={x(yr)} y={H - 8} fontSize="13" fill={AXIS_TEXT} textAnchor="middle" className="tnum">
                    {yr}
                  </text>
                </g>
              ))}
              <text x={endX} y={H - 8} fontSize="13" fill={AXIS_TEXT} textAnchor="end" className="tnum">
                {years} years
              </text>
            </svg>

            <div className="reveal-gap absolute inset-0">
              <svg
                width={width}
                height={H}
                viewBox={`0 0 ${width} ${H}`}
                role="img"
                aria-label={`${summary} The same figures are in the year-by-year table.`}
                className="block overflow-visible"
              >
                {/* The wedge: what selling and rebuying cost. A solid tint reads even where the gap is a few pixels wide. */}
                <path d={wedge} fill={WEDGE} />
                <path
                  d={line("activeKeep")}
                  fill="none"
                  stroke={ORANGE}
                  strokeWidth="2.5"
                  strokeDasharray="6 5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path d={line("holdKeep")} fill="none" stroke={GREEN} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={endX} cy={yActive} r="4.5" fill={ORANGE} stroke="#fff" strokeWidth="2" />
                <circle cx={endX} cy={yHold} r="5" fill={GREEN} stroke="#fff" strokeWidth="2" />

                {/* The bracket that measures the gap, and the figure it measures. */}
                {bottom - top >= 3 && (
                  <path
                    d={`M${bx - 4},${top} H${bx + 2} V${bottom} H${bx - 4}`}
                    fill="none"
                    stroke={INK}
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                )}
                <text x={bx + 9} y={mid - 2} fontSize="16" fontWeight="800" fill={INK} className="figure">
                  {gap < 0 ? "-" : ""}
                  {label}
                </text>
                <text x={bx + 9} y={mid + 15} fontSize="13" fill={AXIS_TEXT}>
                  {gap < 0 ? "less" : "more"}
                </text>
              </svg>
            </div>
          </>
        )}
      </div>
    </figure>
  );
}
