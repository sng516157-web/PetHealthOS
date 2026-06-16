"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plus, Scale, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { DEMO_WEIGHTS } from "@/components/demo/pet-nav-demo-data";
import type { SerializedWeight } from "@/components/WeightPanel";
import { formatDate, type FormatOpts } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function PetNavWeightDemo() {
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const [weights, setWeights] = useState(DEMO_WEIGHTS);
  const [openAdd, setOpenAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const chrono = useMemo(
    () => [...weights].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)),
    [weights],
  );
  const recent = useMemo(() => [...chrono].reverse(), [chrono]);
  const latest = chrono[chrono.length - 1];
  const prev = chrono[chrono.length - 2];
  const delta = latest && prev ? latest.weightKg - prev.weightKg : 0;

  function addWeight(form: { weightKg: string; measuredAt: string; note: string }) {
    const kg = parseFloat(form.weightKg);
    if (!kg || kg <= 0) return;
    setWeights((w) => [
      ...w,
      {
        id: `w-${Date.now()}`,
        weightKg: kg,
        measuredAt: new Date(form.measuredAt).toISOString(),
        note: form.note.trim() || null,
      },
    ]);
    setOpenAdd(false);
  }

  function remove(id: string) {
    if (!confirm(t.weight.deleteConfirm)) return;
    setWeights((w) => w.filter((x) => x.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <PetNavDemoChrome>
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Scale size={18} className="text-brand-500" />
          <h2 className="text-sm font-semibold text-forest">{t.weight.title}</h2>
          {latest && (
            <span className="text-sm text-muted">
              · {t.weight.current}: <strong className="text-foreground">{latest.weightKg} kg</strong>
            </span>
          )}
          {prev && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-muted",
              )}
            >
              {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : null}
              {delta > 0 ? "+" : ""}
              {delta.toFixed(2)} kg
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpenAdd((v) => !v)}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
          >
            <Plus size={13} /> {t.common.add}
          </button>
        </div>

        {openAdd && (
          <AddWeightForm
            onSubmit={addWeight}
            onCancel={() => setOpenAdd(false)}
          />
        )}

        {chrono.length < 2 ? (
          <p className="mt-4 text-sm text-muted">{t.weight.none}</p>
        ) : (
          <WeightLineChart weights={chrono} fmt={fmt} />
        )}
      </Card>

      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50/80"
        >
          <div>
            <p className="text-sm font-semibold text-forest">{t.weight.historyTitle}</p>
            <p className="text-xs text-muted">{t.weight.historyDesc(recent.length)}</p>
          </div>
          <ChevronDown
            size={18}
            className={cn("shrink-0 text-muted transition", listOpen && "rotate-180")}
          />
        </button>

        {listOpen && (
          <ul className="divide-y divide-border border-t border-border">
            {recent.map((w) => (
              <WeightLogRow
                key={w.id}
                entry={w}
                fmt={fmt}
                expanded={expandedId === w.id}
                onToggle={() => setExpandedId((id) => (id === w.id ? null : w.id))}
                onDelete={() => remove(w.id)}
              />
            ))}
          </ul>
        )}
      </Card>
    </PetNavDemoChrome>
  );
}

function WeightLineChart({
  weights,
  fmt,
}: {
  weights: SerializedWeight[];
  fmt: FormatOpts;
}) {
  const { t } = useI18n();
  const pad = { top: 12, right: 8, bottom: 28, left: 36 };
  const w = 560;
  const h = 180;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const minKg = Math.min(...weights.map((x) => x.weightKg));
  const maxKg = Math.max(...weights.map((x) => x.weightKg));
  const yPad = Math.max(0.3, (maxKg - minKg) * 0.15);
  const yMin = minKg - yPad;
  const yMax = maxKg + yPad;
  const yRange = yMax - yMin || 1;

  const points = weights.map((entry, i) => {
    const x = pad.left + (weights.length === 1 ? innerW / 2 : (i / (weights.length - 1)) * innerW);
    const y = pad.top + innerH - ((entry.weightKg - yMin) / yRange) * innerH;
    return { x, y, entry };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`;

  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-medium text-muted">{t.weight.trendChart}</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-background p-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full min-w-[280px]" role="img" aria-label={t.weight.trendChart}>
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
          <path d={linePath} fill="none" stroke="rgb(22 163 74)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {points.map(({ x, y, entry }) => (
            <g key={entry.id}>
              <circle cx={x} cy={y} r={4} fill="white" stroke="rgb(22 163 74)" strokeWidth={2} />
              <title>{`${entry.weightKg} kg · ${formatDate(entry.measuredAt, fmt)}`}</title>
            </g>
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

function WeightLogRow({
  entry,
  fmt,
  expanded,
  onToggle,
  onDelete,
}: {
  entry: SerializedWeight;
  fmt: FormatOpts;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50/80"
      >
        <span className="text-sm font-semibold text-forest">{entry.weightKg} kg</span>
        <span className="text-xs text-muted">{formatDate(entry.measuredAt, fmt)}</span>
        {entry.note && !expanded && (
          <span className="truncate text-xs text-slate-400">{entry.note}</span>
        )}
        <ChevronDown
          size={16}
          className={cn("ml-auto shrink-0 text-muted transition", expanded && "rotate-180")}
        />
      </button>
      {expanded && (
        <div className="border-t border-border bg-background px-5 py-3">
          {entry.note ? (
            <p className="text-sm text-slate-600">{entry.note}</p>
          ) : (
            <p className="text-sm text-muted">{t.weight.noNote}</p>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={13} /> {t.weight.deleteEntry}
          </button>
        </div>
      )}
    </li>
  );
}

function AddWeightForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: { weightKg: string; measuredAt: string; note: string }) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [weightKg, setWeightKg] = useState("");
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  return (
    <div className="mt-4 space-y-2 rounded-xl bg-background p-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-[11px] font-medium text-muted">
          {t.weight.weightKg}
          <input
            type="number"
            step="0.01"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className={`${inputCls} mt-1`}
            placeholder="11.4"
          />
        </label>
        <label className="block text-[11px] font-medium text-muted">
          {t.weight.date}
          <input
            type="date"
            value={measuredAt}
            onChange={(e) => setMeasuredAt(e.target.value)}
            className={`${inputCls} mt-1`}
          />
        </label>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t.weight.note}
        className={inputCls}
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600">
          {t.common.cancel}
        </button>
        <button
          type="button"
          onClick={() => onSubmit({ weightKg, measuredAt, note })}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          {t.weight.save}
        </button>
      </div>
    </div>
  );
}
