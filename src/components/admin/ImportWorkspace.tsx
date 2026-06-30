"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  PawPrint,
  SkipForward,
} from "lucide-react";
import { ATTACHMENT_KINDS, ATTACHMENT_KIND_META } from "@/lib/constants";
import type {
  DataImportProcessingState,
  ImportMappedField,
  ImportPetMapped,
  ImportRowState,
} from "@/lib/data-import-plan";
import type { ImportWorkspacePayload } from "@/lib/data-import-workspace";
import type { AttachmentKind } from "@/lib/data-import-apply";
import {
  applyImportDocumentAction,
  applyImportRowAction,
  completeImportFromWorkspace,
  saveImportWorkspaceState,
  skipImportRowAction,
} from "@/app/admin/imports/actions";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/pawsure";

const MAPPED_FIELDS: ImportMappedField[] = [
  "name",
  "species",
  "sex",
  "breed",
  "color",
  "birthDate",
  "intakeAt",
  "weightKg",
  "microchip",
  "notes",
  "sireName",
  "damName",
  "lastVaccineDate",
  "lastVaccineNotes",
  "lastDewormDate",
];

type Tab = "roster" | "documents" | "audit";

function petOptions(
  workspace: ImportWorkspacePayload,
  state: DataImportProcessingState,
): { id: string; label: string }[] {
  const fromRows = state.rows
    .filter((r) => r.petId)
    .map((r) => ({ id: r.petId!, label: `${r.mapped.name} (imported)` }));
  const existing = workspace.existingPets.map((p) => ({
    id: p.id,
    label: `${p.name}${p.breed ? ` · ${p.breed}` : ""}`,
  }));
  const seen = new Set<string>();
  return [...fromRows, ...existing].filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

function RowEditor({
  row,
  onChange,
}: {
  row: ImportRowState;
  onChange: (mapped: ImportPetMapped, suggestedLogs: ImportRowState["suggestedLogs"]) => void;
}) {
  const m = row.mapped;
  const set = (key: keyof ImportPetMapped, value: string) => {
    const next = { ...m, [key]: value };
    if (key === "weightKg") next.weightKg = Number.parseFloat(value) || 1;
    onChange(next, row.suggestedLogs);
  };

  return (
    <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {(
        [
          ["name", m.name],
          ["species", m.species],
          ["sex", m.sex],
          ["breed", m.breed],
          ["color", m.color],
          ["birthDate", m.birthDate ?? ""],
          ["intakeAt", m.intakeAt ?? ""],
          ["weightKg", String(m.weightKg)],
          ["microchip", m.microchip ?? ""],
          ["lastVaccineDate", m.lastVaccineDate ?? ""],
          ["lastVaccineNotes", m.lastVaccineNotes ?? ""],
          ["lastDewormDate", m.lastDewormDate ?? ""],
        ] as const
      ).map(([key, val]) => (
        <label key={key} className="block text-xs">
          <span className="font-medium text-forest">{key}</span>
          <input
            className="mt-0.5 w-full min-w-0 rounded-lg border border-border px-2 py-1.5 text-sm"
            value={val}
            onChange={(e) => set(key, e.target.value)}
          />
        </label>
      ))}
      <label className="block text-xs sm:col-span-2 lg:col-span-3">
        <span className="font-medium text-forest">notes</span>
        <textarea
          className="mt-0.5 w-full min-w-0 resize-y rounded-lg border border-border px-2 py-1.5 text-sm"
          rows={2}
          value={m.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </label>
    </div>
  );
}

export function ImportWorkspace({ workspace }: { workspace: ImportWorkspacePayload }) {
  const { t } = useI18n();
  const w = t.admin.importWorkspace;
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("roster");
  const [state, setState] = useState(workspace.state);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    setState(workspace.state);
  }, [workspace.id, workspace.state.applied.length, workspace.status]);

  const pets = useMemo(() => petOptions(workspace, state), [workspace, state]);

  const persist = useCallback(
    (next: DataImportProcessingState) => {
      setState(next);
      start(async () => {
        await saveImportWorkspaceState(workspace.id, next);
      });
    },
    [workspace.id],
  );

  function updateRow(rowId: string, patch: Partial<ImportRowState>) {
    persist({
      ...state,
      rows: state.rows.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)),
    });
  }

  function updateDoc(fileIndex: number, patch: Partial<(typeof state.documents)[0]>) {
    persist({
      ...state,
      documents: state.documents.map((d) =>
        d.fileIndex === fileIndex ? { ...d, ...patch } : d,
      ),
    });
  }

  function applyRow(rowId: string) {
    setError(null);
    start(async () => {
      await saveImportWorkspaceState(workspace.id, state);
      const res = await applyImportRowAction(workspace.id, rowId, {
        includeLogs: true,
        includeWeight: true,
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function skipRow(rowId: string) {
    setError(null);
    start(async () => {
      const res = await skipImportRowAction(workspace.id, rowId);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function applyDoc(fileIndex: number) {
    setError(null);
    start(async () => {
      await saveImportWorkspaceState(workspace.id, state);
      const res = await applyImportDocumentAction(workspace.id, fileIndex);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function markComplete() {
    setError(null);
    start(async () => {
      const res = await completeImportFromWorkspace(workspace.id, adminNote);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.push("/admin");
    });
  }

  const tabCls = (id: Tab) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      tab === id ? "bg-brand-50 text-brand-700" : "text-muted hover:text-forest"
    }`;

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] md:px-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-forest"
      >
        <ArrowLeft size={14} /> {w.backAdmin}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-forest">{w.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {workspace.submitterName}
            {workspace.submitterEmail ? ` · ${workspace.submitterEmail}` : ""}
            {workspace.orgName ? ` · ${workspace.orgName}` : ""}
          </p>
          <p className="text-xs text-muted">
            {w.accountType(workspace.accountType)} · {workspace.status}
          </p>
          {workspace.note && (
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium">{w.userNote}: </span>
              {workspace.note}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {workspace.fileNames.map((name, i) => (
            <a
              key={name}
              href={`/api/admin/data-import/${workspace.id}/file/${i}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <ExternalLink size={12} />
              {name}
            </a>
          ))}
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        <button type="button" className={tabCls("roster")} onClick={() => setTab("roster")}>
          {w.tabRoster} ({state.rows.length})
        </button>
        <button type="button" className={tabCls("documents")} onClick={() => setTab("documents")}>
          {w.tabDocuments} ({state.documents.length})
        </button>
        <button type="button" className={tabCls("audit")} onClick={() => setTab("audit")}>
          {w.tabAudit} ({state.applied.length})
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      {tab === "roster" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">{w.rosterHint}</p>

          {Object.keys(state.columnMapping).length > 0 && (
            <details className="rounded-2xl border border-border bg-surface p-4">
              <summary className="cursor-pointer text-sm font-semibold text-forest">
                {w.columnMapping}
              </summary>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(state.columnMapping).map(([header, field]) => (
                  <div key={header} className="flex items-center gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate font-mono text-muted">{header}</span>
                    <span className="text-muted">→</span>
                    <span className="font-medium text-forest">{field ?? w.unmapped}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {state.rows.map((row) => (
            <div
              key={row.rowId}
              className="rounded-2xl border border-border bg-surface p-4 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PawPrint size={16} className="text-brand-600" />
                  <span className="font-semibold text-forest">{row.mapped.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      row.status === "applied"
                        ? "bg-emerald-100 text-emerald-700"
                        : row.status === "skipped"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {row.status}
                  </span>
                  {row.petId && (
                    <Link
                      href={
                        workspace.accountType === "shop"
                          ? `/app/pets/${row.petId}`
                          : `/me/pets/${row.petId}`
                      }
                      className="text-xs font-medium text-brand-600 hover:underline"
                      target="_blank"
                    >
                      {w.viewPet}
                    </Link>
                  )}
                </div>
                {row.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={pending}
                      leftIcon={<SkipForward size={14} />}
                      onClick={() => skipRow(row.rowId)}
                    >
                      {w.skip}
                    </Button>
                    <Button
                      size="sm"
                      loading={pending}
                      leftIcon={<Check size={14} />}
                      onClick={() => applyRow(row.rowId)}
                    >
                      {w.applyRow}
                    </Button>
                  </div>
                )}
              </div>

              <RowEditor
                row={row}
                onChange={(mapped, suggestedLogs) =>
                  updateRow(row.rowId, { mapped, suggestedLogs })
                }
              />

              {row.suggestedLogs.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-xs font-semibold text-forest">{w.suggestedLogs}</p>
                  <ul className="mt-2 space-y-1">
                    {row.suggestedLogs.map((log) => (
                      <li key={log.id} className="flex items-start gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={log.selected}
                          disabled={row.status !== "pending"}
                          onChange={(e) =>
                            updateRow(row.rowId, {
                              suggestedLogs: row.suggestedLogs.map((l) =>
                                l.id === log.id ? { ...l, selected: e.target.checked } : l,
                              ),
                            })
                          }
                        />
                        <span>
                          <span className="font-medium">{log.title}</span>
                          {log.occurredAt ? ` · ${log.occurredAt}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "documents" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">{w.documentsHint}</p>
          {state.documents.length === 0 ? (
            <p className="text-sm text-muted">{w.noDocuments}</p>
          ) : (
            state.documents.map((doc) => (
              <div
                key={doc.fileIndex}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <FileText size={16} className="text-brand-600" />
                  <span className="font-medium text-forest">{doc.fileName}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {doc.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="block text-xs">
                    <span className="font-medium text-forest">{w.assignPet}</span>
                    <select
                      className="mt-1 w-full min-w-0 rounded-lg border border-border px-2 py-1.5 text-sm"
                      value={doc.petId ?? ""}
                      disabled={doc.status !== "pending"}
                      onChange={(e) =>
                        updateDoc(doc.fileIndex, {
                          petId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">{w.selectPet}</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs">
                    <span className="font-medium text-forest">{w.docKind}</span>
                    <select
                      className="mt-1 w-full min-w-0 rounded-lg border border-border px-2 py-1.5 text-sm"
                      value={doc.kind}
                      disabled={doc.status !== "pending"}
                      onChange={(e) =>
                        updateDoc(doc.fileIndex, {
                          kind: e.target.value as AttachmentKind,
                        })
                      }
                    >
                      {ATTACHMENT_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {ATTACHMENT_KIND_META[k].emoji} {ATTACHMENT_KIND_META[k].label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs">
                    <span className="font-medium text-forest">{w.docLabel}</span>
                    <input
                      className="mt-1 w-full min-w-0 rounded-lg border border-border px-2 py-1.5 text-sm"
                      value={doc.label}
                      disabled={doc.status !== "pending"}
                      onChange={(e) => updateDoc(doc.fileIndex, { label: e.target.value })}
                    />
                  </label>
                </div>
                {doc.status === "pending" && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      loading={pending}
                      disabled={!doc.petId}
                      onClick={() => applyDoc(doc.fileIndex)}
                    >
                      {w.applyDocument}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "audit" && (
        <div className="mt-6">
          {state.applied.length === 0 ? (
            <p className="text-sm text-muted">{w.noApplied}</p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {state.applied.map((a) => (
                <li key={a.id} className="px-4 py-3 text-sm">
                  <span className="font-medium text-forest">{a.summary}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {a.kind} · {new Date(a.at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {workspace.status === "PENDING" && (
        <div className="mt-10 rounded-2xl border border-border bg-brand-50/30 p-5">
          <h2 className="text-sm font-semibold text-forest">{w.completeTitle}</h2>
          <p className="mt-1 text-xs text-muted">{w.completeHint}</p>
          <textarea
            className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm"
            rows={2}
            placeholder={w.completeNotePlaceholder}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
          <Button className="mt-3" loading={pending} onClick={markComplete}>
            {w.markComplete}
          </Button>
        </div>
      )}
    </div>
  );
}
