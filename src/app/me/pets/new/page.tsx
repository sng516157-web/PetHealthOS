import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { OwnedPetForm } from "@/components/OwnedPetForm";
import { getI18n } from "@/lib/i18n/server";

export default async function NewOwnedPetPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { t } = await getI18n();

  return (
    <div className="space-y-6">
      <Link
        href="/me"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand-600"
      >
        <ChevronLeft size={15} /> {t.me.backToPets}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.me.addPetTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.me.addPetSubtitle}</p>
      </div>
      <OwnedPetForm />
    </div>
  );
}
