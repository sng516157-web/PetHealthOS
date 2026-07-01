"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload } from "lucide-react";
import { submitDataImport } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";
import { Button, Modal } from "@/components/pawsure";
import { Card } from "@/components/ui";
import { MotionPop } from "./DashboardMotion";

type PendingImport = {
  submittedAt: string;
};

export function DashboardDataImport({
  pendingImport,
  preview,
  className,
}: {
  pendingImport?: PendingImport | null;
  preview?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const csvRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [csvName, setCsvName] = useState<string | null>(null);
  const [pdfCount, setPdfCount] = useState(0);

  if (preview) return null;

  const di = t.dataImport;

  function errMsg(code: string) {
    const map = di.errors as Record<string, string | undefined>;
    return map[code] ?? di.errors.generic;
  }

  function resetForm() {
    setCsvName(null);
    setPdfCount(0);
    setError(null);
    if (csvRef.current) csvRef.current.value = "";
    if (pdfRef.current) pdfRef.current.value = "";
  }

  function closeModal() {
    setOpen(false);
    if (done) router.refresh();
    setDone(false);
    resetForm();
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await submitDataImport(fd);
      if (res?.error) {
        setError(errMsg(res.error));
        return;
      }
      setDone(true);
      resetForm();
    });
  }

  if (pendingImport) {
    return (
      <MotionPop index={0} className={className}>
        <Card className="border-brand-200 bg-brand-50/40 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft">
              <FileUp size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-forest">{di.pendingTitle}</h2>
              <p className="mt-1 text-sm text-muted">{di.pendingDesc}</p>
            </div>
          </div>
        </Card>
      </MotionPop>
    );
  }

  return (
    <>
      <MotionPop index={0} className={className}>
        <Card className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FileUp size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-forest">{di.cardTitle}</h2>
                <p className="mt-1 text-sm text-muted">{di.cardDesc}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full shrink-0 sm:w-auto"
              leftIcon={<Upload size={16} />}
              onClick={() => {
                setDone(false);
                setError(null);
                setOpen(true);
              }}
            >
              {di.button}
            </Button>
          </div>
        </Card>
      </MotionPop>

      <Modal
        open={open}
        onClose={closeModal}
        title={done ? di.successTitle : di.modalTitle}
        description={done ? di.successDesc : di.modalDesc}
        className="max-w-lg"
        footer={
          done ? (
            <Button type="button" onClick={closeModal}>
              {di.close}
            </Button>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={closeModal}>
                {di.cancel}
              </Button>
              <Button type="submit" form="data-import-form" loading={pending}>
                {di.submit}
              </Button>
            </>
          )
        }
      >
        {done ? null : (
          <form id="data-import-form" onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-forest" htmlFor="import-csv">
                {di.csvLabel}
              </label>
              <p className="mt-0.5 text-xs text-muted">{di.csvHint}</p>
              <input
                ref={csvRef}
                id="import-csv"
                name="csv"
                type="file"
                accept=".csv,text/csv"
                required
                className="mt-2 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
                onChange={(e) => setCsvName(e.target.files?.[0]?.name ?? null)}
              />
              {csvName ? (
                <p className="mt-1 text-xs text-muted">{di.selectedFile(csvName)}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-forest" htmlFor="import-pdfs">
                {di.pdfsLabel}
              </label>
              <p className="mt-0.5 text-xs text-muted">{di.pdfsHint}</p>
              <input
                ref={pdfRef}
                id="import-pdfs"
                name="pdfs"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="mt-2 block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
                onChange={(e) => setPdfCount(e.target.files?.length ?? 0)}
              />
              {pdfCount > 0 ? (
                <p className="mt-1 text-xs text-muted">{di.selectedCount(pdfCount)}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-forest" htmlFor="import-note">
                {di.noteLabel}
              </label>
              <textarea
                id="import-note"
                name="note"
                rows={3}
                maxLength={2000}
                placeholder={di.notePlaceholder}
                className="mt-2 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-foreground outline-none ring-brand-300 focus:ring-2"
              />
            </div>

            <p className="text-xs text-muted">{di.slaNote}</p>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </form>
        )}
      </Modal>
    </>
  );
}
