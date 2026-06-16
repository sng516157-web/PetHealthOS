"use client";

import { formatDate, type FormatOpts } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import type { SerializedWeight } from "@/components/WeightPanel";

export function WeightLineChart({
  weights,
  fmt,
}: {
  weights: SerializedWeight[];
  fmt: FormatOpts;
}) {
  const { t } = useI18n();
  if (weights.length < 2) return null;

  const chrono = [...weights].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  const pad = { top: 12, right: 8, bottom: 28, left: 36 };
  const w = 560;
  const h = 180;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const minKg = Math.min(...chrono.map((x) => x.weightKg));
  const maxKg = Math.max(...chrono.map((x) => x.weightKg));
  const yPad = Math.max(0.3, (maxKg - minKg) * 0.15);
  const yMin = minKg - yPad;
  const yMax = maxKg + yPad;
  const yRange = yMax - yMin || 1;

  const points = chrono.map((entry, i) => {
    const x =
      pad.left + (chrono.length === 1 ? innerW / 2 : (i / (chrono.length - 1)) * innerW);
    const y = pad.top + innerH - ((entry.weightKg - yMin) / yRange) * innerH;
    return { x, y, entry };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-muted">{t.weight.trendChart}</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-background p-2">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto w-full min-w-[280px]"
          role="img"
          aria-label={t.weight.trendChart}
        >
          {yTicks.map((tick, i) => {
            const y = pad.top + innerH - ((tick - yMin) / yRange) * innerH;
            return (
              <g key={i}>
                <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#e2e8f0" strokeWidth={1} />
                <text x={pad.left - 6} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}
          <path d={areaPath} fill="rgb(34 197 94 / 0.08)" />
          <path
            d={linePath}
            fill="none"
            stroke="rgb(22 163 74)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map(({ x, y, entry }) => (
            <circle
              key={entry.id}
              cx={x}
              cy={y}
              r={4}
              fill="white"
              stroke="rgb(22 163 74)"
              strokeWidth={2}
            >
              <title>{`${entry.weightKg} kg · ${formatDate(entry.measuredAt, fmt)}`}</title>
            </circle>
          ))}
          {[points[0], points[points.length - 1]].map(({ x, entry }, i) => (
            <text
              key={i}
              x={x}
              y={h - 6}
              textAnchor={i === 0 ? "start" : "end"}
              className="fill-slate-500 text-[9px]"
            >
              {formatDate(entry.measuredAt, fmt)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
