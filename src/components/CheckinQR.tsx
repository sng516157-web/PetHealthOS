"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { QrCode, Hospital, Check } from "lucide-react";
import { ensureStayToken, releasePet } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export type ActiveStay = { id: string; orgName: string };

export function CheckinQR({
  petId,
  activeStays,
}: {
  petId: string;
  activeStays: ActiveStay[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!qr) {
      setLoading(true);
      const res = await ensureStayToken(petId);
      if ("token" in res && res.token) {
        try {
          const url = await QRCode.toDataURL(res.token, { margin: 1, width: 240 });
          setQr(url);
        } catch {
          /* ignore */
        }
      }
      setLoading(false);
    }
  }

  function takeBack() {
    setNotice(null);
    startTransition(async () => {
      const res = await releasePet(petId);
      if (res?.ok) {
        setNotice(t.me.takenBack);
        setQr(null); // token rotated — force regeneration next open
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Hospital size={16} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-foreground">{t.me.checkinTitle}</h3>
      </div>
      <p className="mt-1 text-xs text-muted">{t.me.checkinDesc}</p>

      <button
        onClick={toggle}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
      >
        <QrCode size={14} /> {open ? t.me.hideQr : t.me.showQr}
      </button>

      {open && (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4">
          {loading || !qr ? (
            <div className="h-40 w-40 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="check-in QR" className="h-44 w-44 rounded-lg" />
          )}
          <p className="text-center text-[11px] text-muted">{t.me.qrHint}</p>
        </div>
      )}

      {/* Currently shared with */}
      <div className="mt-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {t.me.currentlyAt}
        </div>
        {activeStays.length === 0 ? (
          <p className="mt-1 text-xs text-muted">{t.me.noActiveStays}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {activeStays.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm text-foreground"
              >
                <Hospital size={13} className="shrink-0 text-brand-500" />
                <span className="truncate">{s.orgName}</span>
              </li>
            ))}
          </ul>
        )}

        {activeStays.length > 0 && (
          <button
            onClick={takeBack}
            disabled={pending}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            <Check size={14} /> {pending ? t.me.takingBack : t.me.takeBack}
          </button>
        )}
        {notice && <p className="mt-2 text-xs text-emerald-700">{notice}</p>}
      </div>
    </div>
  );
}
