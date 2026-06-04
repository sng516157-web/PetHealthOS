"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  readAt: Date | string | null;
  createdAt: Date | string;
  dueAt: Date | string | null;
  pet: { id: string; name: string; species: string } | null;
};

export function NotificationList({
  notifications,
  basePetHref,
}: {
  notifications: Notif[];
  basePetHref: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const hasUnread = notifications.some((n) => !n.readAt);

  function open(n: Notif) {
    startTransition(async () => {
      if (!n.readAt) await markNotificationRead(n.id);
      if (n.pet) router.push(`${basePetHref}/${n.pet.id}`);
      else router.refresh();
    });
  }

  function readAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell size={22} />}
        title={t.notifications.emptyTitle}
        description={t.notifications.emptyDesc}
      />
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={readAll}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
          >
            <CheckCheck size={13} /> {t.notifications.markAllRead}
          </button>
        </div>
      )}
      <ul className="space-y-2">
        {notifications.map((n) => {
          const unread = !n.readAt;
          return (
            <li key={n.id}>
              <button
                onClick={() => open(n)}
                disabled={pending}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  unread
                    ? "border-brand-200 bg-brand-50/50 hover:bg-brand-50"
                    : "border-border bg-surface hover:bg-slate-50"
                }`}
              >
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    unread ? "bg-brand-500" : "bg-transparent"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`flex items-center gap-1.5 text-sm ${
                      unread ? "font-semibold text-foreground" : "text-slate-700"
                    }`}
                  >
                    {n.kind === "WATCH" && (
                      <ShieldAlert size={14} className="shrink-0 text-amber-500" />
                    )}
                    {n.title}
                  </span>
                  {n.body && (
                    <span className="mt-0.5 block text-xs text-muted">
                      {n.body}
                    </span>
                  )}
                  {n.dueAt && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted">
                      <Clock size={11} />
                      {t.notifications.due}{" "}
                      {formatDate(n.dueAt)}
                    </span>
                  )}
                </span>
                {n.pet && (
                  <span className="shrink-0 text-[11px] text-brand-600">
                    {n.pet.name} →
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="px-1 text-[11px] text-muted">{t.notifications.clickToOpen}</p>
    </div>
  );
}
