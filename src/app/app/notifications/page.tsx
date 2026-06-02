import { getOrgNotifications } from "@/lib/data";
import { NotificationList } from "@/components/NotificationList";
import { getI18n } from "@/lib/i18n/server";

export default async function NotificationsPage() {
  const { t } = await getI18n();
  const notifications = await getOrgNotifications();

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t.notifications.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{t.notifications.subtitle}</p>

      <div className="mt-6">
        <NotificationList notifications={notifications} basePetHref="/app/pets" />
      </div>
    </div>
  );
}
