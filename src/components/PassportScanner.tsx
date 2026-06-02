"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff, ScanLine, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

// Accepts a full passport URL, a /passport/<token> path, or a bare token.
function extractToken(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const m = s.match(/passport\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{4,}$/.test(s)) return s;
  return null;
}

const REGION_ID = "passport-scan-region";

export function PassportScanner() {
  const { t } = useI18n();
  const s = t.landing.scan;
  const router = useRouter();
  // html5-qrcode instance — typed loosely to avoid pulling the type into SSR.
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [paste, setPaste] = useState("");

  useEffect(() => {
    return () => {
      const sc = scannerRef.current;
      scannerRef.current = null;
      if (sc) sc.stop().then(() => sc.clear()).catch(() => {});
    };
  }, []);

  function go(token: string) {
    setOk(true);
    stop();
    router.push(`/passport/${token}`);
  }

  async function start() {
    setError(null);
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
          if (token) go(token);
        },
        () => {},
      );
    } catch {
      setError(s.cameraError);
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
      setError(s.invalid);
      return;
    }
    go(token);
  }

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-ink/5"
        style={{ minHeight: active ? 260 : 0 }}
      >
        <div id={REGION_ID} className="[&_video]:rounded-2xl" />
        {!active && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ScanLine size={22} />
            </span>
            <p className="text-xs text-muted">{s.permissionHint}</p>
          </div>
        )}
      </div>

      {ok && <p className="text-center text-sm font-medium text-forest">{s.detected}</p>}
      {error && <p className="text-center text-xs text-[#b4503b]">{error}</p>}

      {!active ? (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Camera size={15} /> {busy ? s.starting : s.start}
        </button>
      ) : (
        <button
          type="button"
          onClick={stop}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300"
        >
          <CameraOff size={15} /> {s.stop}
        </button>
      )}

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wide text-muted">{s.orDivider}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">{s.pasteLabel}</label>
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
            placeholder={s.pastePlaceholder}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={submitPaste}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-forest px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
