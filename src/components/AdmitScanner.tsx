"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff, ScanLine, ArrowRight, QrCode } from "lucide-react";
import { admitPetByToken } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

// Pull a check-in token out of a scanned/pasted value. Accepts a raw token, a
// "/checkin/<token>" path, or a full URL containing one.
function extractToken(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const m = s.match(/checkin\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{8,}$/.test(s)) return s;
  return null;
}

const REGION_ID = "admit-scan-region";

export function AdmitScanner() {
  const { t } = useI18n();
  const router = useRouter();
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paste, setPaste] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    return () => {
      const sc = scannerRef.current;
      scannerRef.current = null;
      if (sc) sc.stop().then(() => sc.clear()).catch(() => {});
    };
  }, []);

  function admit(token: string) {
    if (handled.current) return;
    handled.current = true;
    stop();
    startTransition(async () => {
      const res = await admitPetByToken(token);
      if (res?.error) {
        setError(
          res.error === "CAPACITY_REACHED"
            ? t.facility.capacityReached
            : t.facility.admitInvalid,
        );
        handled.current = false;
        return;
      }
      if (res?.petId) {
        // Navigate to the freshly-admitted pet and invalidate cached lists
        // (dashboard / in-care) so everything reflects the scan without a manual reload.
        router.push(`/app/pets/${res.petId}`);
        router.refresh();
      }
    });
  }

  async function start() {
    setError(null);
    handled.current = false;
    setBusy(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = scanner as unknown as typeof scannerRef.current;
      setActive(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded: string) => {
          const token = extractToken(decoded);
          if (token) admit(token);
        },
        () => {},
      );
    } catch {
      setError(t.landing.scan.cameraError);
      setActive(false);
      scannerRef.current = null;
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    const sc = scannerRef.current;
    scannerRef.current = null;
    setActive(false);
    if (sc) {
      try {
        await sc.stop();
        sc.clear();
      } catch {
        /* already stopped */
      }
    }
  }

  function submitPaste() {
    const token = extractToken(paste);
    if (!token) {
      setError(t.landing.scan.invalid);
      return;
    }
    admit(token);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        <QrCode size={16} /> {t.facility.admitCta}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-foreground">{t.facility.admitTitle}</h3>
      <p className="mt-1 text-xs text-muted">{t.facility.admitDesc}</p>

      <div
        className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-ink/5"
        style={{ minHeight: active ? 260 : 0 }}
      >
        <div id={REGION_ID} className="[&_video]:rounded-2xl" />
        {!active && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ScanLine size={22} />
            </span>
            <p className="text-xs text-muted">{t.landing.scan.permissionHint}</p>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-center text-xs text-[#b4503b]">{error}</p>}

      <div className="mt-4 space-y-3">
        {!active ? (
          <button
            onClick={start}
            disabled={busy || pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            <Camera size={15} /> {busy ? t.landing.scan.starting : t.landing.scan.start}
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300"
          >
            <CameraOff size={15} /> {t.landing.scan.stop}
          </button>
        )}

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wide text-muted">{t.landing.scan.orDivider}</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-2">
          <input
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitPaste();
            }}
            placeholder={t.landing.scan.pastePlaceholder}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={submitPaste}
            disabled={pending}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-forest px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-60"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
